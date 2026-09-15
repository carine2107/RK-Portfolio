#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Restauration du site Romial Kenmogne à partir d'une sauvegarde de ops/backup.sh
#
#   ops/restore.sh                      liste les sauvegardes disponibles
#   ops/restore.sh 2026-09-15_0300      restaure (demande de taper RESTAURER)
#   ops/restore.sh 2026-09-15_0300 --yes   sans confirmation (scripts)
#
# Étapes : vérification des empreintes → arrêt du site → base remplacée
# (pg_restore --clean, en une seule transaction) → médias et fichiers vendus
# remplacés → redémarrage (migrations en attente appliquées) → attente de
# /api/health.
#
# Restaurer avec la même version du site que celle de la sauvegarde (voir
# docs/DEPLOIEMENT.md, « Rollback »). Mêmes variables que ops/backup.sh.
# ---------------------------------------------------------------------------
set -euo pipefail
umask 077
export MSYS_NO_PATHCONV=1

# `pwd -W` (Git Bash) gives a path Docker for Windows understands; Linux falls back to `pwd`.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && { pwd -W 2>/dev/null || pwd; })"
ENV_FILE="${ENV_FILE:-$ROOT/.env.production}"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT/docker-compose.prod.yml}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/romial}"
HELPER_IMAGE="${HELPER_IMAGE:-postgres:16-alpine}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-180}"

dc() { docker compose --project-directory "$ROOT" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"; }
log() { printf '[restore %s] %s\n' "$(date +%H:%M:%S)" "$*"; }
fail() { printf '[restore] ERREUR : %s\n' "$*" >&2; exit 1; }

STAMP="${1:-}"
if [ -z "$STAMP" ]; then
  echo "Sauvegardes disponibles dans $BACKUP_DIR :"
  ls -1 "$BACKUP_DIR"/backup-*.sha256 2>/dev/null | sed -E 's#.*/backup-(.*)\.sha256#  \1#' || true
  echo "Usage : ops/restore.sh <horodatage> [--yes]"
  exit 1
fi
[[ "$STAMP" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{4}$ ]] || fail "horodatage invalide : $STAMP (attendu AAAA-MM-JJ_HHMM)"

DB_FILE="db-$STAMP.dump"
FILES_FILE="files-$STAMP.tar.gz"
SUMS_FILE="backup-$STAMP.sha256"
for file in "$DB_FILE" "$FILES_FILE" "$SUMS_FILE"; do
  [ -f "$BACKUP_DIR/$file" ] || fail "fichier manquant : $BACKUP_DIR/$file"
done
[ -f "$ENV_FILE" ] || fail "fichier d'environnement introuvable : $ENV_FILE"

log "Vérification de l'intégrité"
(cd "$BACKUP_DIR" && sha256sum --quiet -c "$SUMS_FILE") || fail "empreintes différentes : sauvegarde altérée ou incomplète"

APP="$(dc ps -a -q app)"
[ -n "$APP" ] || fail "conteneur « app » introuvable : démarrer d'abord le site (dc up -d)"
[ -n "$(dc ps -q postgres)" ] || fail "la base « postgres » n'est pas démarrée"

if [ "${2:-}" != "--yes" ]; then
  echo "La base, les médias et les fichiers vendus actuels vont être REMPLACÉS par la sauvegarde du $STAMP."
  read -r -p "Taper RESTAURER pour continuer : " answer
  [ "$answer" = "RESTAURER" ] || fail "restauration annulée"
fi

log "Arrêt du site"
dc stop app >/dev/null

log "Restauration de la base"
dc exec -T postgres sh -c \
  'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner --no-privileges --single-transaction --exit-on-error' \
  < "$BACKUP_DIR/$DB_FILE"

log "Restauration des médias et des fichiers vendus"
docker run --rm --volumes-from "$APP" -v "$BACKUP_DIR:/backup:ro" -e FILE="$FILES_FILE" \
  "$HELPER_IMAGE" sh -c 'find /app/public/media /app/private -mindepth 1 -delete && tar xzf "/backup/$FILE" -C /app'

log "Redémarrage du site"
dc start app >/dev/null

log "Attente du site (jusqu'à ${HEALTH_TIMEOUT} s)"
waited=0
until dc exec -T app wget -qO- http://127.0.0.1:4313/api/health 2>/dev/null | grep -q '"status":"ok"'; do
  sleep 3
  waited=$((waited + 3))
  [ "$waited" -lt "$HEALTH_TIMEOUT" ] || fail "le site ne répond pas après ${HEALTH_TIMEOUT} s : voir « dc logs app »"
done

log "Restauration terminée. Contrôler : accueil FR/DE/EN, connexion à /admin, images, envoi d'une demande de test."
