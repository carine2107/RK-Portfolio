# Installation et lancement local

## 1. Prérequis

| Outil   | Version               | Vérification       |
| ------- | --------------------- | ------------------ |
| Node.js | ≥ 20.9 (testé sur 24) | `node -v`          |
| npm     | ≥ 10                  | `npm -v`           |
| Docker  | récent                | `docker --version` |
| Git     | récent                | `git --version`    |

PostgreSQL peut être installé nativement, mais `docker compose` fournit une base
déjà configurée sur un port qui n'entre pas en conflit avec d'autres projets.

## 2. Récupération et dépendances

```bash
git clone <url-du-depot> romial-kenmogne
cd romial-kenmogne
npm install
```

## 3. Variables d'environnement

```bash
cp .env.example .env
```

Puis, dans `.env`, générer un secret unique :

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

et le coller dans `PAYLOAD_SECRET`.

Variables essentielles :

| Variable                                   | Rôle                                                  | Valeur locale                                            |
| ------------------------------------------ | ----------------------------------------------------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                     | Base des URL canoniques, hreflang, sitemap, e-mails   | `http://localhost:4313`                                  |
| `DATABASE_URI`                             | Connexion PostgreSQL                                  | `postgres://romial:romial@localhost:5437/romial_website` |
| `PAYLOAD_SECRET`                           | Signature des sessions CMS                            | chaîne aléatoire ≥ 32 caractères                         |
| `CMS_ENABLED`                              | `false` pour servir le contenu de démarrage sans base | `true`                                                   |
| `EMAIL_ENABLED`                            | Active l'envoi réel d'e-mails                         | `true` avec MailHog                                      |
| `SMTP_*`, `EMAIL_FROM`, `EMAIL_TO`         | Compte SMTP et destinataires                          | MailHog sur `localhost:1026`                             |
| `CONTACT_RATE_LIMIT`                       | Demandes maximum par IP et par fenêtre                | `50` en local, **5 en production**                       |
| `NEXT_PUBLIC_ANALYTICS_*`                  | Analytics respectueux de la vie privée                | vide = désactivé                                         |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Premier compte administrateur                         | à changer après la première connexion                    |

`.env` n'est **jamais** versionné (`.gitignore`).

## 4. Services locaux

```bash
docker compose up -d
```

| Service             | Port   | Usage                         |
| ------------------- | ------ | ----------------------------- |
| PostgreSQL 16       | `5437` | Base de données               |
| MailHog (SMTP)      | `1026` | Réception des e-mails de test |
| MailHog (interface) | `8026` | <http://localhost:8026>       |

Vérification : `docker compose ps` doit afficher les deux conteneurs _healthy_.

## 5. Amorçage du contenu

```bash
npm run seed
```

Le script est **idempotent** (relançable sans créer de doublons). Il crée :

- le premier compte administrateur (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`) ;
- 9 catégories RK Insights ;
- 8 domaines d'expertise rédigés dans les trois langues ;
- 3 fiches d'expérience **d'exemple** (organisations entre crochets, à remplacer) ;
- 3 articles RK Insights **d'exemple** ;
- la fiche du livre « Réussir son premier achat immobilier en Europe » ;
- les 5 activités de l'écosystème (RK Business Consulting, RK IMMO-FINANZ,
  Kenmogne Strategic Publishing, KAILI Institut, KAILI Event) avec des
  descriptions à compléter ;
- 5 pages légales à l'état de **trame juridique** ;
- les réglages du site, de la page d'accueil et de la page À propos.

Tout ce qui doit être validé par le commanditaire est marqué
**« Contenu d'exemple »** dans le CMS et affiché comme tel sur le site public.

### Import des visuels du client

Les photographies et la couverture du livre ne sont **pas** dans le dépôt Git
(données personnelles / visuels client) : elles vivent dans la médiathèque du
CMS et ses sauvegardes. Pour les (ré)importer dans un nouvel environnement :

```bash
npm run import:assets -- "<dossier contenant RK.jpeg, RK1.jpeg, RK2.jpeg>" "<image de couverture>"
```

Le script est idempotent : il réutilise les fichiers déjà présents, renseigne les
textes alternatifs en FR/DE/EN, associe la photo du hero, le portrait de la page
À propos et la couverture du livre, et n'écrase jamais une biographie déjà
modifiée dans le CMS. Les métadonnées EXIF (dont la géolocalisation) sont
supprimées à l'import.

## 6. Lancement

```bash
npm run dev
```

| Adresse                                    | Contenu                                  |
| ------------------------------------------ | ---------------------------------------- |
| <http://localhost:4313>                    | Redirection vers la langue du navigateur |
| <http://localhost:4313/fr> · `/de` · `/en` | Site public                              |
| <http://localhost:4313/admin>              | Administration CMS                       |
| <http://localhost:4313/sitemap.xml>        | Sitemap                                  |
| <http://localhost:8026>                    | E-mails capturés                         |

Première connexion à l'administration : identifiants du seed, puis
**changement immédiat du mot de passe** (menu compte → _Change password_).

## 7. Vérifications

```bash
npm run verify      # format + types + lint + tests unitaires
npm run test:e2e    # tests end-to-end (démarre le serveur si besoin)
```

Captures d'écran de recette (3 langues × 2 thèmes × 5 largeurs) :

```bash
node tests/visual/capture.mjs test-results/visual
```

## 8. Modifier le modèle de contenu

Après toute modification dans `src/payload/` :

```bash
npm run generate:types        # met à jour src/payload-types.ts
npm run generate:importmap    # si un composant d'admin personnalisé est ajouté
```

En développement, le schéma de base est synchronisé automatiquement
(`push: true`). En production, voir [`DEPLOIEMENT.md`](DEPLOIEMENT.md).

## 9. Problèmes fréquents

| Symptôme                                 | Cause probable                              | Solution                                                        |
| ---------------------------------------- | ------------------------------------------- | --------------------------------------------------------------- |
| `EADDRINUSE :4313`                       | Port déjà pris                              | Changer le port dans `package.json` et `NEXT_PUBLIC_SITE_URL`   |
| Le site affiche « contenu de démarrage » | Base inaccessible                           | `docker compose up -d`, vérifier `DATABASE_URI`                 |
| Aucun e-mail reçu                        | `EMAIL_ENABLED=false` ou SMTP invalide      | Vérifier les variables `SMTP_*`, consulter les logs serveur     |
| `PAYLOAD_SECRET` refusé au démarrage     | Secret manquant ou trop court en production | Générer un secret de 48 octets                                  |
| Formulaire : « Trop de demandes »        | Limitation de débit atteinte                | Attendre la fenêtre, ou augmenter `CONTACT_RATE_LIMIT` en local |
