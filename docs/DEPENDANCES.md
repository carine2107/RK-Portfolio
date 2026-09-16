# Dépendances, licences et coûts

## 1. Principe

Toutes les briques du site sont **open source** et auto-hébergeables.
Aucune licence payante, aucun service propriétaire obligatoire, aucun
verrouillage : le projet peut être migré vers un autre hébergeur sans réécriture.

## 2. Dépendances d'exécution

| Paquet                                       | Version       | Licence                                     | Rôle                                                         |
| -------------------------------------------- | ------------- | ------------------------------------------- | ------------------------------------------------------------ |
| `next`                                       | 16.3.4        | MIT                                         | Framework applicatif (routage, rendu, optimisation d'images) |
| `react` / `react-dom`                        | 19.3.0        | MIT                                         | Bibliothèque d'interface                                     |
| `payload`                                    | 3.89.0        | MIT                                         | CMS headless (contenus, rôles, versions, médias)             |
| `@payloadcms/next`                           | 3.89.0        | MIT                                         | Intégration de l'admin CMS dans Next.js                      |
| `@payloadcms/db-postgres`                    | 3.89.0        | MIT                                         | Adaptateur PostgreSQL                                        |
| `@payloadcms/richtext-lexical`               | 3.89.0        | MIT                                         | Éditeur de texte riche + rendu                               |
| `@payloadcms/ui`, `@payloadcms/translations` | 3.89.0        | MIT                                         | Interface et traductions de l'admin                          |
| `next-intl`                                  | 4.14.2        | MIT                                         | Internationalisation FR/DE/EN                                |
| `zod`                                        | 4.6.1         | MIT                                         | Validation client et serveur                                 |
| `nodemailer`                                 | 10.0.3        | MIT                                         | Envoi SMTP                                                   |
| `sharp`                                      | 0.35.4        | Apache-2.0                                  | Traitement et compression d'images                           |
| `graphql`                                    | 16.14.2       | MIT                                         | Dépendance de Payload (API GraphQL désactivée)               |
| `server-only`                                | 0.0.1         | MIT                                         | Garde-fou serveur/client                                     |
| `d3-geo`, `topojson-client`                  | 3.1.1 / 3.1.0 | ISC                                         | Calcul côté serveur de la carte Europe–Afrique (SVG)         |
| `world-atlas`                                | 2.0.2         | ISC (données Natural Earth, domaine public) | Contours des pays (1:110 M), lus côté serveur uniquement     |
| `stripe`                                     | 22.6.2        | MIT                                         | Stripe Checkout et vérification des webhooks (vente directe) |
| `i18n-iso-countries`                         | 7.14.0        | MIT                                         | Correspondance codes pays numériques ↔ ISO alpha-2          |

## 3. Dépendances de développement

| Paquet                                    | Licence    | Rôle                                                            |
| ----------------------------------------- | ---------- | --------------------------------------------------------------- |
| `typescript`                              | Apache-2.0 | Typage strict                                                   |
| `tailwindcss`, `@tailwindcss/postcss`     | MIT        | Styles utilitaires + design tokens                              |
| `eslint`, `eslint-config-next`            | MIT        | Qualité de code                                                 |
| `prettier`                                | MIT        | Formatage                                                       |
| `vitest`, `@vitejs/plugin-react`, `jsdom` | MIT        | Tests unitaires                                                 |
| `@playwright/test`                        | Apache-2.0 | Tests end-to-end                                                |
| `marked`                                  | MIT        | Conversion du guide administrateur en PDF (`npm run guide:pdf`) |
| `@testing-library/*`                      | MIT        | Utilitaires de test                                             |
| `tsx`, `cross-env`, `dotenv`              | MIT        | Outillage de scripts                                            |
| `@types/*`                                | MIT        | Définitions de types                                            |

## 4. Services externes

| Service                                                                      | Statut                      | Coût indicatif                                                                                                 |
| ---------------------------------------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------- |
| **Hébergement** (VPS 2 vCPU / 4 Go)                                          | requis                      | 10–25 € / mois                                                                                                 |
| **Nom de domaine**                                                           | requis                      | 10–20 € / an                                                                                                   |
| **Certificat TLS** (Let's Encrypt)                                           | requis                      | gratuit                                                                                                        |
| **PostgreSQL**                                                               | requis                      | inclus dans le VPS (ou 10–20 € / mois en base gérée)                                                           |
| **SMTP** (Brevo, Postmark, Mailgun, OVH…)                                    | requis pour le formulaire   | 0–15 € / mois selon le volume                                                                                  |
| **Sauvegardes hors site** (stockage objet)                                   | recommandé                  | 1–5 € / mois                                                                                                   |
| **Analytics** (Umami / Plausible auto-hébergés, ou Google Analytics 4)       | optionnel                   | 0 € auto-hébergé ; ~9 € / mois en SaaS ; Google Analytics gratuit (cookies → bannière de consentement fournie) |
| **Surveillance de disponibilité** (UptimeRobot / Better Stack / Uptime Kuma) | recommandé                  | 0 € (offre gratuite ou auto-hébergé)                                                                           | sonde sur `/api/health` |
| **Prestataire de paiement**                                                  | uniquement si vente directe | commissions ~1,5 % + 0,25 € par transaction                                                                    |

**Ordre de grandeur : 15 à 40 € par mois**, hors maintenance et hors paiement.

## 5. Polices et médias

- Polices **Source Serif 4**, **Inter** et **Playfair Display** (lettres du logo),
  sous SIL Open Font License, téléchargées au moment du build et **servies depuis le
  domaine du site** : aucun appel à un service tiers, aucun cookie, aucune donnée
  envoyée à Google.
- Icônes : SVG dessinés dans le projet (`src/components/ui/Icon.tsx`), aucune
  bibliothèque externe.
- Logo : dessiné en SVG dans les pages (`src/components/brand/BrandMark.tsx`) ; icônes
  du navigateur, image de partage social par défaut (`public/og-default.png`, remplaçable
  depuis le CMS) et fichiers `public/brand/` générés en PNG par `npm run brand:assets`,
  sans nouvelle dépendance (Chromium de Playwright ; la police est chargée depuis Google
  Fonts sur le poste qui lance la commande, pas sur le site).

## 6. Mise à jour et sécurité

```bash
npm outdated          # état des versions
npm audit             # vulnérabilités connues
npm update            # mises à jour mineures
```

Recommandations :

- correctifs de sécurité : **sous 7 jours** ;
- montée de version mineure de Next.js / Payload : mensuelle, sur staging d'abord ;
- montée de version majeure : à planifier (lire les notes de migration) ;
- après toute mise à jour : `npm run verify` puis `npm run test:e2e`.

## 7. Réversibilité

- Contenus : base PostgreSQL standard (`pg_dump`) + fichiers médias sur disque.
- Code : dépôt Git complet, aucune dépendance à un hébergeur particulier.
- Aucune donnée n'est captive d'un service tiers.
