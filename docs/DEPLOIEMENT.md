# Déploiement, sauvegarde et rollback

Ce document couvre les environnements **staging** et **production**, la
procédure de sauvegarde/restauration et la stratégie de retour arrière.

---

## 1. Architecture cible

L'application est un **serveur Node.js unique** qui sert à la fois :

- le site public (rendu statique + serveur) ;
- l'administration CMS (`/admin`) ;
- l'API du formulaire (`/api/contact`) et l'API du CMS (`/api/cms`).

Elle a besoin de :

| Composant                              | Rôle                                        | Remarque                                                                                                                                                   |
| -------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node.js ≥ 20.9                         | Exécution                                   | `npm start` (port 4313 par défaut)                                                                                                                         |
| PostgreSQL 16                          | Contenus, utilisateurs, demandes de contact | Sauvegarde quotidienne                                                                                                                                     |
| Volume disque persistant               | Médias (`public/media`)                     | **Indispensable** : un hébergement à système de fichiers éphémère (Vercel, Netlify) perdrait les images téléversées → utiliser un stockage objet ou un VPS |
| SMTP                                   | E-mails du formulaire                       | Fournisseur au choix                                                                                                                                       |
| Reverse proxy (Nginx / Apache / Caddy) | HTTPS, compression, cache statique          | Certificat Let's Encrypt                                                                                                                                   |

Hébergement recommandé : **VPS Linux** (2 vCPU / 4 Go) avec Docker, ou toute
plateforme supportant un serveur Node persistant et un volume.

---

## 2. Variables d'environnement de production

```env
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://romialkenmogne.com
DATABASE_URI=postgres://user:motdepasse@db:5432/romial_website
PAYLOAD_SECRET=<48 octets aléatoires, unique par environnement>
CMS_ENABLED=true

EMAIL_ENABLED=true
SMTP_HOST=smtp.fournisseur.tld
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<identifiant SMTP>
SMTP_PASSWORD=<mot de passe SMTP>
EMAIL_FROM="Romial Kenmogne <no-reply@romialkenmogne.com>"
EMAIL_TO=contact@romialkenmogne.com

CONTACT_RATE_LIMIT=5
CONTACT_RATE_WINDOW_MINUTES=15
MEDIA_STORAGE=local
```

Points de vigilance :

- `PAYLOAD_SECRET` **différent** entre staging et production. L'application
  refuse de démarrer si le secret est absent, trop court ou laissé à sa valeur
  d'exemple.
- `NEXT_PUBLIC_SITE_URL` est lu **au build** : rebuilder après changement de domaine.
- Aucun secret dans le dépôt ; utiliser les secrets du fournisseur ou un
  fichier `.env` en `chmod 600` hors du répertoire versionné.

---

## 3. Déploiement par Docker (recommandé)

`Dockerfile` :

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
EXPOSE 4313
CMD ["npm", "start"]
```

`docker-compose.prod.yml` :

```yaml
services:
  app:
    build:
      context: .
      args:
        NEXT_PUBLIC_SITE_URL: https://romialkenmogne.com
    env_file: .env.production
    depends_on: [postgres]
    ports: ['4313:4313']
    volumes:
      - media:/app/public/media
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    env_file: .env.production.db
    volumes:
      - db:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  media:
  db:
```

Mise en ligne :

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec app npm run seed   # première fois uniquement
```

> Le volume `media` est **obligatoire** : sans lui, chaque redéploiement
> effacerait les images téléversées depuis le CMS.

### Déploiement sans Docker

```bash
git pull
npm ci
npm run build
pm2 restart romial-site   # ou systemd
```

---

## 4. Schéma de base de données

- En **développement**, Payload synchronise le schéma automatiquement.
- En **production**, `push` est désactivé : générer et appliquer une migration
  après toute évolution du modèle de contenu.

```bash
npm run payload migrate:create   # sur le poste de développement, à versionner
npm run payload migrate          # sur le serveur, avant de redémarrer l'application
```

Ordre d'un déploiement avec migration :
sauvegarde → `migrate` → build → redémarrage.

---

## 5. Reverse proxy (exemple Nginx)

```nginx
server {
  listen 443 ssl http2;
  server_name romialkenmogne.com;

  ssl_certificate     /etc/letsencrypt/live/romialkenmogne.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/romialkenmogne.com/privkey.pem;

  client_max_body_size 12M;   # téléversements CMS (limite applicative : 10 Mo)

  location / {
    proxy_pass http://127.0.0.1:4313;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /_next/static/ {
    proxy_pass http://127.0.0.1:4313;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }
}

server {
  listen 80;
  server_name romialkenmogne.com;
  return 301 https://$host$request_uri;
}
```

`X-Forwarded-For` est nécessaire : la limitation de débit du formulaire
s'appuie sur cet en-tête.

---

## 6. Environnement de staging

Identique à la production, avec :

- un sous-domaine (`staging.romialkenmogne.com`) ;
- **sa propre base** et son propre `PAYLOAD_SECRET` ;
- un blocage de l'indexation au niveau du proxy :

```nginx
add_header X-Robots-Tag "noindex, nofollow" always;
```

Le staging sert à la recette du commanditaire avant chaque mise en production.

---

## 7. Sauvegarde

Deux éléments à sauvegarder : **la base** et **les médias**.

```bash
#!/usr/bin/env bash
# /opt/romial/backup.sh — à programmer quotidiennement (cron 03:00)
set -euo pipefail
DATE=$(date +%F)
DEST=/var/backups/romial
mkdir -p "$DEST"

docker compose -f /opt/romial/docker-compose.prod.yml exec -T postgres \
  pg_dump -U romial romial_website | gzip > "$DEST/db-$DATE.sql.gz"

tar czf "$DEST/media-$DATE.tar.gz" -C /var/lib/docker/volumes/romial_media/_data .

find "$DEST" -name '*.gz' -mtime +30 -delete
```

| Élément         | Fréquence       | Rétention | Vérification                             |
| --------------- | --------------- | --------- | ---------------------------------------- |
| Base PostgreSQL | quotidienne     | 30 jours  | restauration testée **chaque trimestre** |
| Médias          | quotidienne     | 30 jours  | idem                                     |
| Dépôt Git       | à chaque commit | illimitée | miroir distant                           |

Copier les archives hors du serveur (stockage objet ou poste du commanditaire).

## 8. Restauration

```bash
# 1. Arrêter l'application (la base reste démarrée)
docker compose -f docker-compose.prod.yml stop app

# 2. Restaurer la base
gunzip -c /var/backups/romial/db-2026-09-01.sql.gz | \
  docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U romial -d romial_website

# 3. Restaurer les médias
tar xzf /var/backups/romial/media-2026-09-01.tar.gz \
  -C /var/lib/docker/volumes/romial_media/_data

# 4. Redémarrer
docker compose -f docker-compose.prod.yml start app
```

Contrôles après restauration : page d'accueil dans les trois langues,
connexion à `/admin`, présence des images, envoi d'une demande de test.

---

## 9. Rollback

| Situation                               | Action                                                                                                                      |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Régression applicative, schéma inchangé | `git checkout <tag-précédent> && npm ci && npm run build && redémarrage` — ou `docker compose up -d` sur l'image précédente |
| Régression après migration de schéma    | Restaurer la sauvegarde de base **prise avant la migration**, puis redéployer la version précédente                         |
| Contenu supprimé par erreur             | Payload conserve les versions : ouvrir l'entrée → onglet _Versions_ → _Restore_                                             |
| Incident majeur                         | Restauration complète (section 8) puis analyse hors production                                                              |

Marquer chaque mise en production par un tag Git (`git tag -a v1.0.0`) : le
rollback consiste alors simplement à redéployer le tag précédent.

---

## 10. Checklist de mise en ligne

- [ ] Domaine pointé, HTTPS actif, redirection `http` → `https`
- [ ] `NEXT_PUBLIC_SITE_URL` correct et build effectué **après** son réglage
- [ ] `PAYLOAD_SECRET` unique, `CONTACT_RATE_LIMIT=5`
- [ ] SMTP configuré, demande de test envoyée et **reçue**
- [ ] Mot de passe administrateur changé, comptes inutiles supprimés
- [ ] Contenus « Contenu d'exemple » remplacés ou dépubliés
- [ ] Textes juridiques validés, case « brouillon » décochée
- [ ] `sitemap.xml` et `robots.txt` accessibles ; staging en `noindex`
- [ ] Sauvegarde automatique en place **et restauration testée**
- [ ] Google Search Console : propriété vérifiée, sitemap soumis
- [ ] Accès et documentation remis au commanditaire
