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

Modèle complet et commenté : **`.env.production.example`** (versionné). Sur le
serveur :

```bash
cp .env.production.example .env.production
chmod 600 .env.production      # jamais versionné (.gitignore) ni copié dans l'image (.dockerignore)
```

| Variable                                            | Rôle                                                                                                              |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                              | URL publique, sans barre finale. **Inscrite dans le build** : reconstruire l'image après un changement de domaine |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Base PostgreSQL ; l'adresse de connexion de l'application en est déduite. Mot de passe en lettres et chiffres     |
| `PAYLOAD_SECRET`                                    | 48 octets aléatoires, **différent** entre staging et production                                                   |
| `EMAIL_ENABLED`, `SMTP_*`, `EMAIL_FROM`, `EMAIL_TO` | Envoi des e-mails du formulaire ; laisser `EMAIL_ENABLED=false` tant qu'un envoi réel n'a pas été testé           |
| `CONTACT_RATE_LIMIT`, `CONTACT_RATE_WINDOW_MINUTES` | Anti-abus du formulaire (5 envois / 15 min)                                                                       |
| `CONTACT_RETENTION_MONTHS`                          | Suppression automatique des demandes de contact inchangées depuis N mois (24 par défaut ; `0` = jamais)           |
| `NEXT_PUBLIC_ANALYTICS_*`                           | Mesure d'audience facultative (inscrite dans le build)                                                            |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`           | Premier administrateur, créé par `npm run seed` ; à retirer du fichier ensuite                                    |

Points de vigilance :

- L'application **refuse de démarrer** si `PAYLOAD_SECRET` est absent, trop court
  ou laissé à sa valeur d'exemple (le build, lui, n'en a pas besoin).
- Aucun secret dans le dépôt ni dans l'image : ils sont injectés au démarrage.

---

## 3. Déploiement par Docker (recommandé)

Fichiers fournis à la racine du dépôt :

| Fichier                   | Contenu                                                                                                                                 |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `Dockerfile`              | Image Node 22 en 3 étapes ; utilisateur non root ; au démarrage : **migrations de base** (`npm run migrate`) puis serveur ; healthcheck |
| `docker-compose.prod.yml` | Application + PostgreSQL 16, volumes `media` et `db`, application exposée sur `127.0.0.1` uniquement (derrière le proxy)                |
| `.dockerignore`           | Exclut secrets, médias, dépendances et résultats de tests du contexte de build                                                          |

Pour alléger les commandes, définir une fois l'alias :

```bash
alias dc='docker compose --env-file .env.production -f docker-compose.prod.yml'
```

**Première mise en ligne**

```bash
git clone git@github.com:carine2107/RK-Portfolio.git /opt/romial && cd /opt/romial
cp .env.production.example .env.production && chmod 600 .env.production   # puis le remplir
dc up -d --build          # construit l'image, crée les tables, démarre
dc exec app npm run seed  # une seule fois : contenus de départ + premier administrateur
```

Photos et couverture du livre (facultatif, une fois) : copier les fichiers sur
le serveur puis `dc exec app npm run import:assets -- "<dossier photos>" "<couverture>"`
(voir `INSTALLATION.md`). Sinon, les téléverser depuis l'administration.

**Mise à jour**

```bash
cd /opt/romial
./backup.sh               # sauvegarde avant toute mise à jour (section 7)
git pull
dc up -d --build          # les migrations en attente s'appliquent au démarrage
```

> Le volume `media` est **obligatoire** : sans lui, chaque redéploiement
> effacerait les images téléversées depuis le CMS.

L'image est construite **sans accès à la base** : les pages ne sont donc pas
pré-générées pendant le build. Chacune est rendue depuis le CMS à sa première
visite, puis servie depuis le cache (renouvelé toutes les 5 minutes). Le site
n'affiche jamais le contenu de démarrage intégré au code.

### Déploiement sans Docker

Serveur Node ≥ 20.9 et PostgreSQL 16 ; variables de la section 2 dans `.env`
(avec `NODE_ENV=production` et `DATABASE_URI`).

```bash
git pull
npm ci
npm run migrate           # applique les migrations en attente
npm run build             # la base étant joignable, les pages sont pré-générées
pm2 restart romial-site   # ou systemd
```

---

## 4. Schéma de base de données

- En **développement**, Payload synchronise le schéma automatiquement.
- En **production**, cette synchronisation est désactivée : le schéma évolue
  uniquement par **migrations versionnées** (`src/migrations/`). La première,
  `initial`, crée toutes les tables d'une base vierge.
- Le conteneur applique les migrations en attente à chaque démarrage
  (`npm run migrate`). Sans Docker, lancer `npm run migrate` avant le build.

Après toute évolution du modèle de contenu (nouveau champ, nouvelle collection) :

```bash
npm run migrate:create <nom>   # sur le poste de développement ; versionner le fichier créé
```

Ordre d'un déploiement avec migration : **sauvegarde → mise à jour du code →
migration → redémarrage** (automatique avec Docker).

> Ne jamais lancer `npm run migrate` sur la base de développement locale : elle
> est gérée par la synchronisation automatique, et Payload demanderait une
> confirmation pouvant entraîner une perte de données.

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

docker compose --env-file /opt/romial/.env.production -f /opt/romial/docker-compose.prod.yml \
  exec -T postgres pg_dump -U romial romial_website | gzip > "$DEST/db-$DATE.sql.gz"

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

Commandes lancées depuis `/opt/romial`, avec l'alias `dc` de la section 3.

```bash
# 1. Arrêter l'application (la base reste démarrée)
dc stop app

# 2. Restaurer la base
gunzip -c /var/backups/romial/db-2026-09-01.sql.gz | \
  dc exec -T postgres \
  psql -U romial -d romial_website

# 3. Restaurer les médias
tar xzf /var/backups/romial/media-2026-09-01.tar.gz \
  -C /var/lib/docker/volumes/romial_media/_data

# 4. Redémarrer
dc start app
```

Contrôles après restauration : page d'accueil dans les trois langues,
connexion à `/admin`, présence des images, envoi d'une demande de test.

---

## 9. Rollback

| Situation                               | Action                                                                                                          |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Régression applicative, schéma inchangé | `git checkout <tag-précédent>` puis `dc up -d --build` (sans Docker : `npm ci && npm run build` et redémarrage) |
| Régression après migration de schéma    | Restaurer la sauvegarde de base **prise avant la migration**, puis redéployer la version précédente             |
| Contenu supprimé par erreur             | Payload conserve les versions : ouvrir l'entrée → onglet _Versions_ → _Restore_                                 |
| Incident majeur                         | Restauration complète (section 8) puis analyse hors production                                                  |

Marquer chaque mise en production par un tag Git (`git tag -a v1.0.0`) : le
rollback consiste alors simplement à redéployer le tag précédent.

---

## 10. Supervision

| Élément                           | Mise en place                                                                                                                                                                                                          |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Point de santé**                | `GET /api/health` → `200 {"status":"ok","database":"up"}`, ou `503` si la base est injoignable. Aucune information sensible. Utilisé par le healthcheck Docker                                                         |
| **Surveillance de disponibilité** | Sonde externe sur `https://<domaine>/api/health` toutes les 1 à 5 min avec alerte e-mail : UptimeRobot ou Better Stack (offres gratuites), ou Uptime Kuma auto-hébergé sur une autre machine                           |
| **Journaux**                      | `dc logs -f app` ; le formulaire journalise le type de demande et le résultat, **jamais** le contenu ni l'adresse e-mail. Rotation : `"log-opts": {"max-size": "10m", "max-file": "5"}` dans `/etc/docker/daemon.json` |
| **Erreurs**                       | Les erreurs serveur apparaissent dans les journaux avec leur identifiant (`digest`) ; un service de suivi (Sentry, GlitchTip auto-hébergé) peut être branché via `src/instrumentation.ts`                              |
| **Tâche quotidienne**             | Suppression des demandes de contact expirées (`CONTACT_RETENTION_MONTHS`), lancée par le serveur ; manuellement : `dc exec app npm run purge:contacts`                                                                 |

---

## 11. E-mails et newsletter : délivrabilité

Le formulaire de contact et la newsletter partagent le compte SMTP (`SMTP_*`).
Pour que les e-mails arrivent en boîte de réception :

- utiliser un fournisseur transactionnel (Brevo, Postmark, Mailgun…) ; vérifier
  sa **limite d'envoi quotidienne** au regard du nombre d'abonnés ;
- publier les enregistrements DNS **SPF**, **DKIM** (fournis par le fournisseur) et
  **DMARC** (`v=DMARC1; p=none; rua=mailto:…` pour commencer) ;
- `EMAIL_FROM` sur le domaine du site (`no-reply@romialkenmogne.com`), jamais une
  adresse Gmail ;
- tester l'envoi avec mail-tester.com (score visé ≥ 9/10).

Les e-mails d'article portent les en-têtes `List-Unsubscribe` et
`List-Unsubscribe-Post` (désinscription en un clic, exigée par Gmail et Yahoo pour
les envois en nombre). Les liens de confirmation et de désinscription sont signés
avec `PAYLOAD_SECRET` : **changer ce secret invalide les liens déjà envoyés**.

---

## 12. Vente directe : Stripe et PayPal

Variables (`.env.production`) : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE` (`live` en production).
Un prestataire sans ses clés n'est pas proposé ; sans aucun prestataire, la boutique
reste fermée même cochée dans le CMS.

**Stripe** (comptes au nom du commanditaire) :

1. Dashboard → Developers → **API keys** : clé secrète (`sk_live_…`, ou `sk_test_…`
   sur le staging) — ou une clé restreinte limitée à _Checkout Sessions : write_.
2. Developers → **Webhooks** → endpoint `https://<domaine>/api/shop/stripe/webhook`,
   événements `checkout.session.completed`, `checkout.session.async_payment_succeeded`
   et `checkout.session.expired` ; copier le **signing secret** (`whsec_…`).
3. Settings → **Emails** : activer l'envoi automatique des reçus.
4. Test sur le staging avec la carte `4242 4242 4242 4242` (mode test), puis vérifier
   que la commande passe « Payée » et que les e-mails arrivent.

**PayPal** : developer.paypal.com → **Apps & Credentials** → application REST (Client
ID / Secret, en _Sandbox_ puis _Live_). Aucun webhook requis : le paiement est capturé
au retour de l'acheteur sur le site.

**Sécurité** : aucune donnée de carte ne transite par le site (pages de paiement
hébergées) ; les montants sont recalculés côté serveur à partir du CMS ; une commande
ne passe « Payée » que sur un webhook dont la signature est vérifiée ou une capture
PayPal réussie, une seule fois.

**Produits numériques et espace membres** : les fichiers vendus (e-books, ressources,
pièces jointes des leçons) sont stockés dans `/app/private/files`, monté sur le volume
Docker **`private`** — à inclure dans les sauvegardes au même titre que `media`. Ils ne
sont jamais servis publiquement. La connexion des acheteurs se fait par lien e-mail : le
SMTP doit donc fonctionner, et **changer `PAYLOAD_SECRET` déconnecte tous les membres**
et invalide les liens envoyés. Seules les commandes contenant un livre imprimé demandent
une adresse de livraison.

---

## 12 bis. Google Sheets (facultatif)

Copie automatique des **demandes de contact** et des **abonnés newsletter confirmés** dans
un tableur Google. Fonctionne avec un **compte Google gratuit**, sans carte bancaire. Sans
les trois variables ci-dessous, rien n'est envoyé à Google.

**1. Le tableur** — sur <https://sheets.google.com>, créer un tableur vide (par exemple
« RK — Contacts »). Son **identifiant** est la partie de l'adresse entre `/d/` et
`/edit` : `https://docs.google.com/spreadsheets/d/<IDENTIFIANT>/edit`.

**2. Le compte de service** — sur <https://console.cloud.google.com> avec le même compte :

1. Créer un projet (en haut à gauche → _Nouveau projet_, par exemple « rk-site »).
2. _API et services → Bibliothèque_ → rechercher **Google Sheets API** → _Activer_.
3. _API et services → Identifiants → Créer des identifiants → Compte de service_ : nom
   « rk-site-sync », aucun rôle à ajouter → _OK_.
4. Ouvrir le compte de service → onglet _Clés_ → _Ajouter une clé → Créer une clé → JSON_.
   Un fichier `.json` est téléchargé : c'est un **secret**, ne jamais l'envoyer par
   e-mail, ni le publier, ni le déposer dans le dépôt Git.

**3. Le partage** — dans le tableur : _Partager_ → coller l'adresse du compte de service
(`rk-site-sync@<projet>.iam.gserviceaccount.com`, champ `client_email` du fichier JSON)
→ rôle **Éditeur** → décocher « Envoyer une notification » → _Partager_.

**4. Les variables** (`.env` en local, `.env.production` sur le serveur) :

```bash
GOOGLE_SHEETS_SPREADSHEET_ID=<identifiant du tableur>
GOOGLE_SERVICE_ACCOUNT_EMAIL=<client_email du fichier JSON>
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="<private_key du fichier JSON, sur une ligne, avec les \n>"
```

Recopier `private_key` telle qu'elle apparaît dans le fichier JSON (elle commence par
`-----BEGIN PRIVATE KEY-----\n`), entre guillemets. Redémarrer le site, puis supprimer
le fichier JSON téléchargé.

**5. Vérifier** — dans l'admin, _Demandes de contact_ : le bloc **Google Sheets** apparaît
avec **Ouvrir le tableur** et **Tout resynchroniser**. Cliquer sur _Tout resynchroniser_ :
les onglets « Demandes de contact » et « Abonnés newsletter » sont créés et remplis. En cas
d'échec, le message rappelle l'adresse avec laquelle partager le tableur ; le détail
(code Google, jamais les données) est dans les logs du serveur (`[sheets]`).

Fonctionnement : chaque création, modification ou suppression est recopiée en arrière-plan
(une panne de Google ne bloque jamais le formulaire) ; les lignes sont retrouvées par la
colonne **ID** ; les valeurs sont écrites en texte brut (aucune formule exécutée) ; les
inscriptions non confirmées n'apparaissent pas ; les suppressions automatiques (durées de
conservation) retirent aussi les lignes. **Changer ou révoquer la clé** : _Compte de service
→ Clés_ → supprimer l'ancienne, en créer une nouvelle, mettre à jour la variable.

---

## 13. Checklist de mise en ligne

- [ ] Domaine pointé, HTTPS actif, redirection `http` → `https`
- [ ] `NEXT_PUBLIC_SITE_URL` correct et build effectué **après** son réglage
- [ ] `PAYLOAD_SECRET` unique, `CONTACT_RATE_LIMIT=5`
- [ ] SMTP configuré, demande de test envoyée et **reçue**
- [ ] Vente directe (si ouverte) : CGV et retours validés, TVA validée par le comptable, clés live Stripe/PayPal, webhook Stripe actif, achat test réel remboursé ; produits numériques : volume `private` sauvegardé, achat test → e-mail d'accès reçu, connexion et téléchargement vérifiés
- [ ] SPF, DKIM et DMARC publiés ; inscription newsletter testée de bout en bout (confirmation, article, désinscription)
- [ ] Google Sheets (si utilisé) : tableur partagé uniquement avec le compte de service, « Tout resynchroniser » réussi, fichier JSON de la clé supprimé du poste, politique de confidentialité mentionnant Google
- [ ] Mot de passe administrateur changé, comptes inutiles supprimés
- [ ] Contenus « Contenu d'exemple » remplacés ou dépubliés
- [ ] Textes juridiques validés, case « brouillon » décochée
- [ ] `sitemap.xml` et `robots.txt` accessibles ; staging en `noindex`
- [ ] Sauvegarde automatique en place **et restauration testée**
- [ ] Sonde de disponibilité sur `/api/health` avec alerte e-mail
- [ ] Durée de conservation des demandes (`CONTACT_RETENTION_MONTHS`) identique à la politique de confidentialité
- [ ] Google Search Console : propriété vérifiée, sitemap soumis
- [ ] Accès et documentation remis au commanditaire
