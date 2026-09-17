#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Déploiement du site Romial Kenmogne (pile docker-compose.prod.yml)
#
# Appelé par GitHub Actions après la publication d'une image : la clé SSH de
# déploiement est limitée à ce script (commande forcée dans
# ~/.ssh/authorized_keys), qui reçoit la demande « deploy sha-<7 caractères> ».
# Utilisable aussi à la main :
#
#   ops/deploy.sh sha-abc1234
#
#   1. met à jour les fichiers de déploiement (git pull --ff-only)
#   2. sauvegarde la base et les fichiers (ops/backup.sh)
#   3. récupère ghcr.io/carine2107/rk-portfolio:sha-…
#   4. applique les migrations de la base avec la nouvelle image, AVANT de
#      changer d'application : en cas d'échec, le site en ligne n'est pas touché
#      et le journal de la migration apparaît dans GitHub Actions
#   5. redémarre l'application (le démarrage relance aussi les migrations, sans effet)
#   6. attend /api/health ; en cas d'échec, relance l'image précédente
#   7. retient l'image déployée dans APP_IMAGE (.env.production)
#
# Une migration de base n'est pas annulée par le retour à l'image précédente :
# si elle est en cause, restaurer la sauvegarde prise à l'étape 2 (ops/restore.sh).
# Les migrations doivent donc rester compatibles avec l'image en ligne (ajouts de
# colonnes ou de tables), puisqu'elles passent avant le changement d'application.
# ---------------------------------------------------------------------------
set -euo pipefail
umask 077

IMAGE_REPOSITORY="ghcr.io/carine2107/rk-portfolio"

log() { printf '[deploy %s] %s\n' "$(date +%H:%M:%S)" "$*"; }
fail() { printf '[deploy] ERREUR : %s\n' "$1" >&2; exit "${2:-1}"; }

main() {
  local root env_file port request tag image previous app

  root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
  env_file="$root/.env.production"
  [ -f "$env_file" ] || fail "fichier d'environnement introuvable : $env_file"
  port="$(sed -nE 's/^APP_PORT=([0-9]+)$/\1/p' "$env_file")"
  port="${port:-4313}"

  # Only "deploy sha-<7 hex>" is accepted, whatever the SSH client sends.
  request="${SSH_ORIGINAL_COMMAND:-deploy ${1:-}}"
  tag="$(printf '%s' "$request" | sed -nE 's/^deploy (sha-[0-9a-f]{7})$/\1/p')"
  [ -n "$tag" ] || fail "demande refusée. Usage : deploy sha-<7 caractères hexadécimaux>" 2
  image="$IMAGE_REPOSITORY:$tag"

  exec 9>/tmp/romial-deploy.lock
  flock -n 9 || fail "un déploiement est déjà en cours" 3

  dc() {
    docker compose --project-directory "$root" --env-file "$env_file" \
      -f "$root/docker-compose.prod.yml" "$@"
  }
  healthy() {
    local attempt
    for attempt in $(seq 1 36); do
      curl -fsS --max-time 5 "http://127.0.0.1:$port/api/health" > /dev/null 2>&1 && return 0
      sleep 5
    done
    return 1
  }

  app="$(dc ps -q app)"
  previous=""
  [ -n "$app" ] && previous="$(docker inspect --format '{{.Config.Image}}' "$app" 2> /dev/null || true)"
  log "Image en ligne : ${previous:-aucune}"
  log "Image demandée : $image"

  log "Mise à jour des fichiers de déploiement"
  git -C "$root" pull --ff-only --quiet

  log "Sauvegarde avant déploiement"
  "$root/ops/backup.sh"

  # `docker pull`, not `docker compose pull`: without a terminal (SSH from
  # GitHub), the latter kept running after the download had finished.
  log "Récupération de l'image"
  docker pull --quiet "$image" < /dev/null

  # Explicit step: a migration that only ran inside the container start-up
  # command once failed to apply without any trace in the deployment output.
  log "Migrations de la base"
  if ! APP_IMAGE="$image" dc run --rm --no-deps -T app npm run migrate < /dev/null; then
    fail "les migrations ont échoué : l'application en ligne n'a pas été modifiée"
  fi

  log "Redémarrage de l'application"
  APP_IMAGE="$image" dc up -d --no-build app < /dev/null

  if healthy; then
    sed -i "s|^APP_IMAGE=.*|APP_IMAGE=$image|" "$env_file"
    docker image prune -f > /dev/null
    log "Déployé : $image (/api/health répond)"
    exit 0
  fi

  log "ÉCHEC : /api/health ne répond pas après 3 minutes. Derniers journaux :"
  dc logs --tail=40 app || true
  if [ -n "$previous" ] && [ "$previous" != "$image" ]; then
    log "Retour à l'image précédente : $previous"
    APP_IMAGE="$previous" dc up -d --no-build app
    if healthy; then
      log "Image précédente relancée. Si une migration est en cause : ops/restore.sh"
    else
      log "L'image précédente ne répond pas non plus : intervention manuelle nécessaire"
    fi
  fi
  exit 1
}

# The whole script is read before anything runs, and main always exits: a
# `git pull` that updates this file during a deployment is harmless.
main "$@"
