# Rapport des tests exécutés

Date d'exécution : **10 septembre 2026**
Environnement : Windows 11, Node 24.15, PostgreSQL 16 (Docker), build de
**production** (`npm run build` + `npm start`), contenu servi par le CMS.

---

## 1. Synthèse

| Suite                            | Périmètre                                                               | Résultat                             |
| -------------------------------- | ----------------------------------------------------------------------- | ------------------------------------ |
| Tests unitaires (Vitest)         | Traductions, contrastes, moteur d'apparence, validation, SEO, anti-abus | **129 / 129 réussis**                |
| Tests end-to-end (Playwright)    | 103 scénarios × 4 configurations                                        | **382 réussis, 30 ignorés, 0 échec** |
| Compilation TypeScript (`tsc`)   | Mode strict, tout le projet                                             | **0 erreur**                         |
| Lint (ESLint 9 + config Next 16) | Tout le projet                                                          | **0 erreur, 0 avertissement**        |
| Formatage (Prettier)             | `src`, `tests`, `docs`                                                  | **conforme**                         |
| Build de production              | `next build`                                                            | **réussi**                           |
| Recette visuelle                 | 11 pages × 3 langues × 2 thèmes × 5 largeurs (99 captures)              | **conforme après corrections**       |

Configurations end-to-end : **Chromium 1280 px**, **mobile 375 px**,
**Firefox**, **WebKit**.

Tests ignorés, tous volontaires :

- **4** : la vérification d'un lien de prise de rendez-vous configuré est sautée tant qu'aucun lien n'est renseigné dans le CMS ;
- **24** : l'audit de contraste axe (12 scénarios) ne tourne que sur les deux
  configurations Chromium — le contraste ne dépend pas du moteur de rendu ;
- **2** sur WebKit : Safari ne déplace pas le focus vers les liens avec la touche
  Tab tant que « Full Keyboard Access » n'est pas activé dans le système. Le
  comportement est vérifié sur Chromium et Firefox.

Limite d’envoi du formulaire : une suite complète envoie une vingtaine de demandes de contact. Le limiteur (en mémoire, `CONTACT_RATE_LIMIT=50` par 15 minutes en local) peut répondre 429 si l’on enchaîne plusieurs suites : redémarrer le serveur entre deux passages rapprochés.

Commandes :

```bash
npm run verify                                  # format + types + lint + unitaires
E2E_PROD=1 E2E_ALL_BROWSERS=1 npx playwright test
node tests/visual/capture.mjs test-results/visual
```

---

## 2. Tests unitaires (129)

| Fichier                     | Ce qui est vérifié                                                                                                                                                                                                                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `messages.test.ts`          | FR et DE couvrent 100 % des clés anglaises, aucune clé en trop, aucun message vide, paramètres ICU identiques, navigation réellement traduite                                                                                                                                                                 |
| `contrast.test.ts`          | 15 paires couleur texte/fond × 2 thèmes + anneau de focus, seuils WCAG 2.2 AA calculés depuis les design tokens du CSS                                                                                                                                                                                        |
| `contact-schema.test.ts`    | Schéma du formulaire (consentement, e-mail, pays, type de demande, longueurs), clés d'erreur traduisibles, liste de pays localisée et triée                                                                                                                                                                   |
| `seo.test.ts`               | Canonical, hreflang FR/DE/EN + `x-default`, chemins traduits, `noindex`, Open Graph, troncature des descriptions, génération des slugs                                                                                                                                                                        |
| `theme.test.ts`             | Moteur d'apparence : les 6 palettes et **300 palettes personnalisées aléatoires** respectent 15 paires de contraste AA dans les deux thèmes ; couleurs vides = palette Signature ; aucune saisie brute du CMS dans la feuille de style générée                                                                |
| `shop-pricing.test.ts`      | Vente directe : prix toujours issus du CMS, TVA incluse extraite (49,80 € à 7 % → 3,26 €), livres non vendables retirés (externe, bientôt, prix nul, devise ≠ EUR, stock 0, inexistant), stock respecté, lignes du panier assainies, taux de TVA borné                                                        |
| `stripe-webhook.test.ts`    | Signature des webhooks Stripe : événement signé accepté ; signature absente, secret différent, contenu modifié ou horodatage ancien refusés                                                                                                                                                                   |
| `newsletter-tokens.test.ts` | Liens de confirmation et de désinscription signés (HMAC) : aller-retour, expiration à 48 h, lien de désinscription sans expiration, refus d'un autre usage, abonné ou secret, entrées malformées                                                                                                              |
| `url.test.ts`               | Liens externes saisis dans le CMS : seules les adresses https:// absolues sont conservées (`http:`, `javascript:`, chemins relatifs, localhost refusés) ; affichage du domaine de destination                                                                                                                 |
| `video.test.ts`             | Liens YouTube (watch, youtu.be, embed, shorts, live, mobile) et Vimeo convertis en lecteurs sans cookie ; tout autre lien refusé (domaines imitant YouTube, `javascript:`, identifiants invalides)                                                                                                            |
| `world-map.test.ts`         | Carte Europe–Afrique : pays d'Europe et d'Afrique présents avec leur code ISO, pays lointains exclus, taille des tracés < 80 Ko ; noms de pays localisés FR/DE/EN                                                                                                                                             |
| `retention.test.ts`         | Date limite de conservation des demandes de contact (24 / 6 mois, désactivation à 0, valeurs invalides), calculée en UTC — indépendante du fuseau et de l'heure d'été                                                                                                                                         |
| `rate-limit.test.ts`        | Limitation par IP : seuil, réinitialisation de fenêtre, isolation entre clients, lecture des en-têtes de proxy                                                                                                                                                                                                |
| `members.test.ts`           | Cookie de session de l’espace membre signé : aller-retour, identifiant modifié, signature falsifiée ou valeur absente refusés                                                                                                                                                                                 |
| `campaign-link.test.ts`     | Boutons des pages de campagne : pages du site (préfixe de langue retiré), https externe ; http, javascript:, //hôte, espaces et mailto: refusés                                                                                                                                                               |
| `media-library.test.ts`     | Médiathèque : formats (interview filmée = vidéo + interview), entrées à venir et ateliers sans vidéo exclus, filtres format / thème / langue combinés                                                                                                                                                         |
| `lead-score.test.ts`        | Qualification des prospects : score maximal 100, demande non qualifiée 5, bornes des priorités (35 / 60), type d’organisation et valeurs inconnues non notés ; questions facultatives et valeurs hors liste refusées par le schéma                                                                            |
| `exports.test.ts`           | Export CSV : BOM UTF-8, séparateur « ; », CRLF, échappement des guillemets et retours à la ligne, neutralisation des formules ; collections exportables limitées ; colonnes et libellés FR / DE ; nom de fichier par langue et date                                                                           |
| `google-sheets.test.ts`     | Google Sheets : configuration inactive tant que les 3 valeurs ne sont pas valides, clé sur une ligne restaurée, endpoints Google imposés en production ; JWT RS256 vérifié ; ajout, mise à jour en place, suppression par index sans création d’onglet, création d’onglet, jeton unique, erreurs sans données |

## 3. Tests end-to-end (103 scénarios)

### Navigation et structure (`navigation.spec.ts`)

- Redirection de `/` vers la langue détectée
- Les 7 sections accessibles dans les 3 langues (21 pages), `<html lang>` correct
- Un seul `<h1>` par page
- Lien d'évitement fonctionnel au clavier
- 404 localisée avec statut HTTP 404 (EN et FR)
- Menu mobile : ouverture, navigation, fermeture par Échap et à la navigation
- **Absence de défilement horizontal à 320, 375, 768, 1024 et 1440 px** sur 4 pages

### Multilingue et thème (`i18n-theme.spec.ts`)

- Bascule EN → FR en restant sur la page équivalente
- **Suivi du slug traduit** d'un article (EN → DE)
- Persistance de la langue pendant la navigation
- Canonical + `hreflang` (fr, de, en, x-default) présents
- Absence de mélange de langues sur une page
- Thème sombre : application, persistance entre pages et après rechargement
- Respect de `prefers-color-scheme` par défaut
- Sélecteur de thème utilisable au clavier

### Contenus (`content.spec.ts`)

- Recherche RK Insights : filtrage et annonce vocale du nombre de résultats
- Filtres par catégorie
- Page d'article : auteur, date, temps de lecture, partage LinkedIn, données structurées
- Filtres d'expériences : réduction de la liste puis réinitialisation
- **Aucun faux panier ni faux checkout** sur une fiche livre
- Pages légales : bandeau « brouillon » visible et `noindex`
- Bouton Expert Profile : message honnête quand le document n'existe pas
- `sitemap.xml` (avec hreflang) et `robots.txt` servis
- `/admin` renvoie `X-Robots-Tag: noindex`
- Métadonnées localisées sur la page d'accueil dans les 3 langues

### Formulaire de contact (`contact.spec.ts`)

- Validation client en français : résumé d'erreurs + messages par champ
- Message d'erreur d'e-mail en allemand
- **Envoi complet accepté et confirmé** (enregistrement CMS + e-mails)
- Honeypot : la soumission d'un robot est acceptée en apparence et jetée
- API : payload invalide → 422 avec erreurs par champ

### Supervision (`content.spec.ts`)

- `/api/health` répond `200`, `{"status":"ok","database":"up"}`, non mis en cache, sans aucune autre information

Contrôle manuel complémentaire (base locale) : une demande de contact de test
antidatée de 2020 est supprimée par `npm run purge:contacts`, les 83 autres
demandes restent intactes.

### Conférences & médias (`speaking.spec.ts`)

- Page publiée en FR / DE / EN et liée depuis le pied de page
- « Proposer une intervention » ouvre le formulaire avec « Conférence / médias » présélectionné
- Aucune requête vers YouTube / Vimeo et aucun `iframe` avant action du visiteur
- Page présente dans le sitemap

### Prise de rendez-vous (`booking.spec.ts`)

- Aucune requête vers Cal.com / Calendly / Microsoft Bookings et aucun `iframe` sur Contact et À propos
- Lien configuré : ouverture dans un nouvel onglet, `rel="noopener"`, adresse https

Contrôle manuel (serveur de développement, lien de test Cal.com temporaire) : bloc « Réserver un échange » sur Contact (FR) et bouton « Gespräch buchen » sur À propos (DE), destination annoncée, aucun débordement.

### Newsletter (`newsletter.spec.ts`)

- Page d'inscription publiée en FR / DE / EN
- Adresse et consentement obligatoires (422) ; champ piège traité comme un succès
- Liens de confirmation / désinscription falsifiés refusés (400), page « lien invalide »
- **Double opt-in de bout en bout** : inscription via le formulaire → e-mail de confirmation lu dans MailHog → lien → « Inscription confirmée »

Contrôle manuel (serveur de développement + MailHog) : envoi d'un article à un abonné confirmé en français (sujet, lien et texte en français, en-têtes `List-Unsubscribe` / `List-Unsubscribe-Post`), **seconde tentative d'envoi = 0** (jamais de doublon), page de désinscription sans effet avant le clic, désinscription en un clic par POST (200), GET refusé (405). Données de test supprimées.

Corrections faites pendant cette étape : champ e-mail de la newsletter renommé « Adresse e-mail pour la newsletter » (deux champs portaient le même nom accessible sur la page Contact) ; test d'images rendu robuste aux réponses interrompues sous forte charge (l'adresse de l'image est revérifiée).

### Vente directe (`shop.spec.ts`) — état livré, sans clés de paiement

- Page Panier fonctionnelle et non indexée
- Paiement refusé (503 « indisponible »), aucun bouton « Ajouter au panier »
- Webhook Stripe non signé refusé ; référence de commande falsifiée → 404 sans information

Contrôle manuel (serveur de développement, clé Stripe et secret de webhook **factices**, données restaurées ensuite) : livre passé en vente directe à 24,90 € et boutique ouverte avec TVA 7 % → « Ajouter au panier », offre dans les données structurées, panier recalculé par le serveur (24,90 €, dont TVA 1,63 €, livraison offerte), CGV obligatoires, échec propre avec la clé factice (commande en attente créée). Webhook `checkout.session.completed` signé : signature falsifiée 400, premier envoi → commande **payée**, rejeu → ignoré, adresse et TVA enregistrées, stock 5 → 4 ; e-mail de confirmation à l'acheteur (FR) et notification à l'adresse des commandes reçus dans MailHog ; page de confirmation « Commande RK-2026-0001 confirmée » et panier vidé. Le parcours PayPal (API distante) n'a pas pu être testé sans identifiants sandbox.

### Produits numériques et espace membres (`members.spec.ts`)

- Page Produits numériques publiée en FR / DE / EN
- `/account` sans session → redirection vers la connexion, pages non indexées
- Demande de lien de connexion : réponse identique qu'un compte existe ou non ; adresse invalide → 422
- Lien de connexion falsifié refusé (400, page « lien invalide ») ; téléchargement et progression sans session → 401 ; fichiers protégés inaccessibles par l'API du CMS

Contrôle manuel (serveur de développement, clé Stripe et secret de webhook **factices**, données supprimées ensuite) : un e-book (PDF) et une formation (2 leçons, vidéo, pièce jointe) publiés ; fichier stocké dans `private/files`, jamais servi publiquement (API 403, URL directe 404) ; l'API publique ne renvoie ni le fichier ni le contenu, la vidéo ou la pièce jointe des leçons. Panier : quantité bornée à 1, pas de ligne livraison, case d'**accès immédiat / renonciation au droit de rétractation** obligatoire (422 sans elle). Webhook signé → commande payée, rejeu ignoré, signature falsifiée 400 ; membre et accès créés ; e-mails dans MailHog : confirmation acheteur, notification, **accès aux achats** avec lien. Lien → session ouverte, « Mon espace » liste les deux produits ; lien réutilisé → 400. Téléchargement du PDF 200 (`attachment`, `application/pdf`), produit non acheté → 403. Formation : progression 1/2 enregistrée, leçon vidéo (lecture au clic), pièce jointe, navigation entre leçons.

### Google Sheets (`sheets.spec.ts`, `google-sheets.test.ts`)

- Sans session : état et resynchronisation refusés (401) ; requête de resynchronisation venant d'un autre site refusée (403)
- Configuration inactive tant que l'identifiant, l'adresse du compte de service et la clé ne sont pas valides ; clé collée sur une ligne restaurée ; en production, impossible de viser un autre serveur que Google
- Jeton : JWT RS256 vérifié avec la clé publique, portée limitée aux tableurs ; un seul jeton pour plusieurs appels
- Lignes : ajout, mise à jour en place (ligne trouvée par ID), suppression par index, aucun onglet créé pour une suppression, onglet créé si absent, en-tête écrit une fois en texte brut ; erreurs Google remontées sans les données envoyées

Contrôle manuel (serveur de développement relié à un **faux serveur Google local** qui vérifie la signature du jeton et conserve les onglets en mémoire ; clés, variables et enregistrements de test supprimés ensuite) : demande de contact dont le nom est une formule `=IMPORTXML(…)` → onglet « Demandes de contact » créé, en-tête français, ligne ajoutée puis **mise à jour en place** quand la notification est partie (« oui »), formule conservée comme texte ; inscription newsletter en attente → **aucun appel** à Google ; confirmation → onglet « Abonnés newsletter » créé et ligne « Confirmé » ; désinscription → même ligne passée à « Désinscrit » ; « Tout resynchroniser » → 158 demandes et 29 abonnés réécrits, dont une demande dont la copie avait échoué ; suppression des enregistrements → lignes retirées. Défaut trouvé pendant ce contrôle et corrigé : une inscription non confirmée créait inutilement l’onglet des abonnés (la suppression ne crée plus d’onglet, test ajouté). Les échecs (404 du faux serveur mal configuré au premier essai) sont journalisés sans données et n’ont pas bloqué le formulaire.

### Export CSV (`exports.spec.ts`, `exports.test.ts`)

- Sans session d'administration : `/api/admin/export/{subscribers | contact-submissions | users}` → 401, corps vide
- Fichier : BOM UTF-8, séparateur `;`, fin de ligne CRLF, guillemets et retours à la ligne échappés, formules (`=`, `+`, `-`, `@`) neutralisées
- Colonnes et libellés dans la langue de l'administration (FR / DE), valeurs inconnues conservées, dates UTC ; seules les deux collections prévues sont exportables ; nom de fichier par langue et date

Contrôle manuel (base de développement, demande de test supprimée ensuite ; l’admin n’a pas été ouvert faute de session) : export exécuté comme la route, avec les droits d’un compte de l’équipe → fichier commençant par le BOM UTF-8 (`EF BB BF`), en-têtes et libellés français (priorité « Haute », budget « Plus de 50 000 € », type « Due diligence financière »), nom `=HYPERLINK(…)` exporté en `'=HYPERLINK(…)`, organisation contenant `;` et des guillemets correctement échappée, message sur deux lignes et accents intacts ; lecture anonyme de la collection refusée (Forbidden). Bouton ajouté à la carte d’import de l’admin (`npm run generate:importmap`).

### Qualification des prospects (`contact.spec.ts`, `lead-score.test.ts`)

- Grille : demande complète et urgente = 100 (haute), demande non qualifiée = 5 (basse), bornes 35 / 60 ; type d'organisation et valeurs inconnues jamais notés
- Questions facultatives (réponses vides acceptées) ; valeur hors liste refusée avec la clé traduite `qualification`
- Formulaire FR : groupe « Quelques précisions… », 4 listes non obligatoires ; API : réponses acceptées, score et priorité absents de la réponse au visiteur

Contrôle manuel (serveur de développement + MailHog, lien de réservation de test et demandes supprimés ensuite) : demande FR complète (PME, plus de 50 000 €, dans le mois, décideur, due diligence, message court) → score **95**, priorité **haute** enregistrés en base avec les quatre réponses ; notification « [Priorité haute] Nouvelle demande … » avec la ligne « Priorité (score) » et les réponses traduites ; confirmation au visiteur avec ses réponses mais **sans score ni priorité**. Avec un lien de réservation configuré : demande peu prioritaire → `suggestBooking: false` ; demande prioritaire → `true`, et en allemand le message de confirmation propose « Gespräch buchen » (nouvel onglet, `noopener`). Sans lien configuré : aucune proposition. Aucun débordement à 375 px.

### Médiathèque (`media.spec.ts`, `media-library.test.ts`)

- Page publiée en FR / DE / EN, liée depuis le pied de page et depuis Conférences & médias ; présente dans le sitemap
- Aucun lecteur YouTube / Vimeo chargé avant le clic
- Classement : interview filmée = vidéo + interview ; conférence avec vidéo = vidéo ; atelier sans vidéo exclu ; entrées à venir exclues ; filtres format / thème / langue combinés

Contrôle manuel (serveur de développement, fiches de test supprimées ensuite) : interview filmée (thème, français, 25 min), podcast (anglais, 40 min, lien externe) et conférence à venir → 2 résultats, conférence absente ; filtre « Podcasts » → 1 résultat (bouton `aria-pressed`), + langue « Français » → « Aucun résultat » et message vide, réinitialisation → 2 résultats ; options de thème et de langue limitées aux valeurs présentes ; fiche : durée, thème lié à la page d'expertise, `VideoObject` (durée `PT25M`, lecteur sans cookie, miniature) ; aucun débordement à 375 px.

### Pages de campagne (`campaigns.spec.ts`, `campaign-link.test.ts`)

- Destinations des boutons : pages du site (préfixe de langue saisi retiré), `https://` externe ; `http://`, `javascript:`, `//hôte`, espaces et `mailto:` refusés
- Campagne inconnue → 404 localisée ; aucune campagne dans le menu ; brouillons non exposés par l'API du CMS

Contrôle manuel (serveur de développement, page de test supprimée ensuite) : page publiée avec les 9 blocs ; lien `javascript:` refusé à l'enregistrement par le CMS ; un seul H1 (en-tête) ; bouton interne `/fr/contact?type=speaking` → `/fr/contact?type=speaking` (préfixe non doublé), bouton externe en nouvel onglet `noopener` ; vidéo non chargée avant le clic ; données structurées `FAQPage` ; formulaire newsletter affiché ; présence dans le sitemap (EN / FR / DE) ; en allemand repli sur le contenu anglais ; aucun débordement à 375 et 1440 px (en-tête sur deux colonnes, cartes en grille, boutons côte à côte).

- Parcours clavier avec anneau de focus visible (outline ≠ `none`)
- Taille des cibles tactiles : ≥ 24 px (WCAG 2.2 AA 2.5.8), ≥ 40 px pour les boutons et champs
- Toutes les images possèdent un attribut `alt`, hiérarchie de titres sans saut
- Tous les champs sont étiquetés ; les erreurs sont liées par `aria-describedby`
- La signature de marque anglaise est déclarée `lang="en"` sur une page allemande
- **Zoom 200 %** (équivalent 640 px) sans perte de contenu ni défilement horizontal

### Contraste réel des pages (`contrast.spec.ts`)

- Audit **axe-core** (règle `color-contrast`, WCAG 2.2 AA) sur 6 pages clés, en
  **mode clair et en mode sombre** (12 scénarios), avec la palette enregistrée
  dans le CMS
- Pendant le développement de l'écran Apparence, l'audit a aussi été passé avec
  la palette « Vert profond et or » et avec une palette personnalisée volontairement
  mal assortie (bleu clair, rose vif, gris clair, fond crème) + image de fond : **0
  violation** après correction automatique des couleurs

---

## 4. Recette visuelle

`node tests/visual/capture.mjs` produit 99 captures pleine page :
11 pages × 9 combinaisons langue / thème / largeur (320, 375, 768, 1024, 1440).

### Anomalies détectées et corrigées pendant la recette

| #   | Anomalie                                                                   | Correction                                                                          |
| --- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1   | En-tête : « RK Insights » et « À propos » sur deux lignes                  | `whitespace-nowrap` sur les liens de navigation                                     |
| 2   | Bouton secondaire illisible sur la bande sombre (classes en conflit)       | Variante de bouton dédiée `onContrast`                                              |
| 3   | En thème sombre, la bande d'appel à l'action se confondait avec la section | Token `--surface-contrast` distinct + bordure supérieure                            |
| 4   | Libellé de consentement dupliquant « politique de confidentialité »        | Lien intégré dans la phrase (`t.rich`)                                              |
| 5   | Note de confidentialité affichée deux fois sur la page contact             | Suppression du doublon                                                              |
| 6   | Catégorie de l'article à la une absente des filtres                        | L'article à la une est inclus dès qu'un filtre ou une recherche est actif           |
| 7   | Débordement horizontal de 11 px à 375 px (en-tête)                         | Réduction de la marque et des espacements sous `sm`                                 |
| 8   | Débordement de 4 px à 640 px (sélecteurs langue + thème)                   | Sélecteurs déplacés dans le menu sous `md`                                          |
| 9   | Case à cocher de consentement à 20 px                                      | Portée à 24 px (WCAG 2.2 AA)                                                        |
| 10  | Liste des expériences absente du HTML serveur (mauvais pour le SEO)        | Suppression de `useSearchParams` ; filtre « type » ajouté ; liste rendue au serveur |
| 11  | Fiche livre isolée trop étroite                                            | Grille adaptative quand il n'y a qu'une publication                                 |
| 12  | En-tête « À propos » avec un libellé d'emplacement photo incorrect         | Libellé d'emplacement unifié                                                        |

### Ajout des drapeaux dans le sélecteur de langue (demande du commanditaire)

| #   | Anomalie révélée par l'ajout                                                 | Correction                                                                                                        |
| --- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 13  | En-tête trop chargé à partir de 1280 px (débordement jusqu'à 193 px)         | Ligne de portée géographique retirée de l'en-tête, navigation et sélecteurs resserrés, sélecteur de thème compact |
| 14  | Cartes « écosystème » débordant à 320 px en allemand (badge non replié)      | En-tête de carte repliable (`flex-wrap` + `min-w-0`)                                                              |
| 15  | Titres de cartes allemands (« Programmmanagement ») élargissant leur colonne | Césure automatique et coupure de mot sur les titres                                                               |
| 16  | Mots composés allemands débordant les pages légales à 320 px                 | `hyphens: auto` + `overflow-wrap` sur les textes longs et les titres                                              |

Vérification finale : aucun défilement horizontal sur **14 pages × 3 langues ×
7 largeurs** (320 → 1440 px), en-tête contenu dans la colonne de contenu de
320 à 1920 px.

### Anomalies techniques corrigées

| #   | Anomalie                                                                                            | Correction                                                         |
| --- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| A   | `upgrade-insecure-requests` cassait tous les assets sous WebKit en HTTP                             | Directive envoyée uniquement lorsque le site est servi en HTTPS    |
| B   | Le honeypot déclenchait une erreur de validation 422 (et se révélait aux robots)                    | Champ accepté par le schéma, filtré silencieusement côté serveur   |
| C   | Un champ absent produisait un message d'erreur Zod en anglais                                       | Les erreurs sont toujours ramenées à la clé de traduction du champ |
| D   | Pages rendues statiquement au build : les modifications du CMS n'apparaissaient qu'au redéploiement | Revalidation incrémentale (300 s) sur toutes les pages publiques   |
| E   | Rendu lent en production (jusqu'à 5 s par page)                                                     | Même correction : 10 à 30 ms après mise en cache                   |
| F   | La 404 hors route affichait la page d'erreur par défaut de Next.js                                  | Route attrape-tout par langue → 404 localisée avec le bon statut   |

---

## 5. Test de déploiement (Docker, base vierge) — 11/09/2026

Pile `docker-compose.prod.yml` construite et démarrée sur une base PostgreSQL
**vide**, dans un projet Docker isolé :

| Étape                                   | Résultat                                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Build de l'image sans base ni secret    | réussi ; aucune page pré-générée (pas de contenu de démarrage figé)                              |
| Démarrage : `npm run migrate`           | migration `initial` appliquée (99 tables) sans intervention ; conteneur `healthy`                |
| `npm run seed` dans le conteneur        | **bug trouvé et corrigé** : échec sur les pays des expériences sur base vierge ; seed relançable |
| Pages FR / DE / EN, 404, admin, sitemap | 200 (404 attendue), contenu issu du CMS, sitemap à 69 URL                                        |
| Cache des pages (utilisateur non root)  | `MISS` → `HIT` ; écriture du cache et des médias autorisée                                       |
| Redémarrage                             | migrations déjà appliquées ignorées, démarrage en < 1 s                                          |

La pile de test a ensuite été supprimée (conteneurs, volumes, image).

## 6. Tests non automatisés — à réaliser après la mise en production

Ces vérifications dépendent d'éléments encore absents (voir
[`ELEMENTS_A_FOURNIR.md`](ELEMENTS_A_FOURNIR.md)) :

1. **Envoi d'e-mail réel** avec le compte SMTP définitif (testé ici via MailHog :
   notification propriétaire + confirmation visiteur, en français, reçues).
2. **Restauration d'une sauvegarde** sur le serveur de production
   (procédure documentée dans `DEPLOIEMENT.md` §8).
3. **Audit Lighthouse** sur le domaine final avec les photographies réelles.
4. **Lecteur d'écran** (NVDA ou VoiceOver) sur les parcours d'accueil et de contact.
5. **Indexation** : Search Console, soumission du sitemap, contrôle des hreflang.
6. **Checkout** : sans objet tant que la vente directe n'est pas activée.

## 7. Limites connues

- La limitation de débit du formulaire est **en mémoire** : elle protège une
  instance unique. Une mise à l'échelle horizontale demanderait un magasin
  partagé (Redis) — l'interface de `src/lib/rate-limit.ts` ne changerait pas.
- Le mode aperçu couvre les articles RK Insights ; les autres collections
  s'aperçoivent en publiant puis en dépubliant si nécessaire.
- Les tests visuels ne sont **pas** comparés automatiquement : les captures sont
  destinées à une relecture humaine, afin qu'un changement de design volontaire
  ne fasse pas échouer la chaîne d'intégration.
