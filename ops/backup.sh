#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Sauvegarde du site Romial Kenmogne (pile docker-compose.prod.yml)
#
#   ops/backup.sh
#
# Produit dans BACKUP_DIR, pour un même horodatage AAAA-MM-JJ_HHMM :
#   db-<horodatage>.dump          base PostgreSQL (format personnalisé pg_dump)
#   files-<horodatage>.tar.gz     médias (public/media) et fichiers vendus (private)
#   backup-<horodatage>.sha256    empreintes pour vérifier l'intégrité
# puis supprime les sauvegardes plus anciennes que RETENTION_DAYS.
#
# À programmer chaque nuit, par exemple (crontab -e de root) :
#   0 3 * * * /opt/romial/ops/backup.sh >> /var/log/romial-backup.log 2>&1
#
# Variables facultatives :
#   BACKUP_DIR            dossier des sauvegardes      (défaut : /var/backups/romial)
#   RETENTION_DAYS        jours de conservation         (défaut : 30)
#   ENV_FILE              fichier d'environnement       (défaut : .env.production)
#   COMPOSE_FILE          fichier Compose               (défaut : docker-compose.prod.yml)
#   COMPOSE_PROJECT_NAME  projet Docker                 (défaut : nom du dossier du site)
#   HELPER_IMAGE          image utilisée pour l'archive (défaut : postgres:16-alpine)
# ---------------------------------------------------------------------------
set -euo pipefail
umask 077
# Git Bash (Windows) : ne pas réécrire les chemins passés à Docker.
export MSYS_NO_PATHCONV=1

# `pwd -W` (Git Bash) gives a path Docker for Windows understands; Linux falls back to `pwd`.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && { pwd -W 2>/dev/null || pwd; })"
ENV_FILE="${ENV_FILE:-$ROOT/.env.production}"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT/docker-compose.prod.yml}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/romial}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
HELPER_IMAGE="${HELPER_IMAGE:-postgres:16-alpine}"
STAMP="$(date +%Y-%m-%d_%H%M)"

dc() { docker compose --project-directory "$ROOT" --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"; }
log() { printf '[backup %s] %s\n' "$(date +%H:%M:%S)" "$*"; }
fail() { printf '[backup] ERREUR : %s\n' "$*" >&2; exit 1; }

[ -f "$ENV_FILE" ] || fail "fichier d'environnement introuvable : $ENV_FILE"
mkdir -p "$BACKUP_DIR"

APP="$(dc ps -a -q app)"
[ -n "$APP" ] || fail "conteneur « app » introuvable : le site a-t-il été démarré avec ce fichier Compose ?"
[ -n "$(dc ps -q postgres)" ] || fail "la base « postgres » n'est pas démarrée"

DB_FILE="db-$STAMP.dump"
FILES_FILE="files-$STAMP.tar.gz"
SUMS_FILE="backup-$STAMP.sha256"

# Écrire d'abord dans un fichier .partial : une sauvegarde interrompue ne
# ressemble jamais à une sauvegarde complète.
trap 'rm -f "$BACKUP_DIR/$DB_FILE.partial" "$BACKUP_DIR/$FILES_FILE.partial"' EXIT

log "Base de données → $DB_FILE"
dc exec -T postgres sh -c \
  'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom --no-owner --no-privileges' \
  > "$BACKUP_DIR/$DB_FILE.partial"
[ -s "$BACKUP_DIR/$DB_FILE.partial" ] || fail "le dump de la base est vide"
mv "$BACKUP_DIR/$DB_FILE.partial" "$BACKUP_DIR/$DB_FILE"

log "Médias et fichiers vendus → $FILES_FILE"
docker run --rm --volumes-from "$APP" -v "$BACKUP_DIR:/backup" -e FILE="$FILES_FILE.partial" \
  "$HELPER_IMAGE" sh -c 'tar czf "/backup/$FILE" -C /app public/media private'
mv "$BACKUP_DIR/$FILES_FILE.partial" "$BACKUP_DIR/$FILES_FILE"

(cd "$BACKUP_DIR" && sha256sum "$DB_FILE" "$FILES_FILE" > "$SUMS_FILE")

find "$BACKUP_DIR" -maxdepth 1 -type f \
  \( -name 'db-*.dump' -o -name 'files-*.tar.gz' -o -name 'backup-*.sha256' \) \
  -mtime +"$RETENTION_DAYS" -delete

log "Terminé : $(cd "$BACKUP_DIR" && du -h "$DB_FILE" "$FILES_FILE" | awk '{printf "%s %s  ", $2, $1}')"
log "Copier ces trois fichiers hors du serveur (stockage externe)."
