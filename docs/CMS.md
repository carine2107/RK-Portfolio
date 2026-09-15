# Modèle de contenu (CMS)

Référence technique du contenu géré dans Payload CMS. Le guide destiné au
propriétaire est [`GUIDE_ADMIN.md`](GUIDE_ADMIN.md).

- Fichiers : `src/payload/collections/`, `src/payload/globals/`,
  `src/payload/fields/shared.ts`, `src/payload.config.ts`.
- Types générés : `src/payload-types.ts` (`npm run generate:types`).
- Accès public : les pages du site lisent le CMS via `src/lib/cms.ts`, qui
  convertit les documents en modèles de vue typés (`src/lib/types.ts`) et
  retombe sur le contenu de démarrage si la base est indisponible.

## Conventions communes

| Champ           | Présent sur                   | Rôle                                                                           |
| --------------- | ----------------------------- | ------------------------------------------------------------------------------ |
| `slug`          | tous les contenus adressables | **Localisé** : une URL par langue. Généré depuis le titre s'il est laissé vide |
| `seo` (groupe)  | contenus + pages              | `title`, `description`, `image`, `noindex` — localisés                         |
| `isPlaceholder` | contenus                      | Marque un contenu d'exemple : bandeau public + rappel dans l'admin             |
| `order`         | listes ordonnées              | Tri croissant                                                                  |
| `_status`       | collections versionnées       | `draft` / `published`                                                          |

**Aperçu des brouillons** : le bouton _Aperçu_ (`admin.preview`, fonction commune
`previewUrl` de `src/payload/preview.ts`) existe sur `insights`, `books`, `products`,
`expertise-areas`, `experiences`, `engagements`, `campaigns`, `legal-pages` (page de détail)
et `businesses` (page Entreprises). Il ouvre `/api/preview`, qui active le mode brouillon de
Next.js pour un compte administrateur ou éditeur connecté ; les pages lisent alors la
dernière version non publiée (`getDraft*BySlug`, `getDraftBusinesses` dans
`src/lib/cms.ts`), avec repli sur la version publiée, affichent un bandeau et ne sont ni
mises en cache ni indexées. Pas d'aperçu sur `home-page` et `about-page` (globals sans
brouillons) ni sur `credentials` (sans page propre).

Localisation du **contenu** : `en` (par défaut), `fr`, `de`, avec
`fallback: true`.
Langue de l'**interface** d'administration : `fr`, `de` et `en`
(`i18n.supportedLanguages`, repli `fr`), négociée depuis le navigateur et
surchargeable par utilisateur. Tous les libellés du CMS (collections, groupes,
champs, options, textes d'aide) passent par `src/payload/i18n.ts` —
`tr(fr, de, en)` — de sorte que l'administration n'est jamais à moitié
traduite. Toute nouvelle collection ou tout nouveau champ doit utiliser ce
helper.
Le sélecteur de langue de contenu (composant `localizer` de Payload) est masqué
par CSS (`src/app/(payload)/custom.scss`) sur les écrans sans champ traduit —
compte, `users`, `contact-submissions`, `subscribers`, `orders`, `members`, `entitlements`,
`protected-files`, globals `appearance` et `shop-settings` — où il n'aurait aucun effet (liste à
tenir à jour). Les langues y sont nommées dans la langue de l'interface (`label` objet
`{ fr, de, en }` dans `payload.config.ts`). L'avatar est l'avatar interne de Payload
(`admin.avatar: 'default'`) : pas d'appel à Gravatar.

---

## Collections

### `expertise-areas` — Domaines d'expertise

`title`_, `slug`_, `summary`\*, `icon`, `featuredOnHome`, `order`, `isPlaceholder`,
onglet **Content** (`intro`, `challenges[]`, `services[{title, description}]`,
`audiences[]`, `approach`), onglet **SEO**.
Versions + brouillons. Alimente `/expertise` et `/expertise/[slug]`.

### `experiences` — Expériences et projets

`title`_, `slug`_, `type`_ (`assignment` | `project`), `organisation`_, `role`_,
`sector`, `region`_ (`europe` | `africa` | `international`),
`countries[{code, name}]` (`code` ISO 3166-1 alpha-2 → carte et nom localisé ; `name` facultatif et localisé, prioritaire à l'affichage),
`startDate`_, `endDate`, `summary`_, `featured`, `order`, `isPlaceholder`,
onglet **Detail** (`context`, `responsibilities[]`, `resultsValidated`,
`results[]`), onglet **Relations** (`expertiseAreas`, `relatedInsights`), **SEO**.

> `results[]` n'est visible dans l'admin **et** sur le site que si
> `resultsValidated` est coché : aucun résultat non vérifié ne peut être publié
> par inadvertance.

### `subscribers` — Abonnés newsletter

`email`_ (unique), `locale`_ (`fr` | `de` | `en`), `status`\_ (`pending` |
`confirmed` | `unsubscribed`), `consentAt`, `confirmedAt`, `unsubscribedAt`,
`source`. Création uniquement par l'API publique ; aucun jeton stocké (liens signés
HMAC avec `PAYLOAD_SECRET`). Purge : `pending` > 7 jours, `unsubscribed` > 30 jours.

### `insights` — Articles RK Insights

`title`_, `slug`_, `excerpt`_, `coverImage`, `category`_, `author`,
`publishedAt`, `featured`, `readingTime` (calculé), `isPlaceholder`,
onglet **Article** (`content`\*), onglet **Relations** (`relatedExpertise`,
`relatedInsights`, `relatedBooks`), **SEO**.
Brouillons + **programmation de publication** (`schedulePublish`) + aperçu (voir
« Aperçu des brouillons »).
Le site n'affiche que les articles publiés dont `publishedAt` est passé.
Newsletter : `sendNewsletter` (case à cocher), `newsletterSentAt` et `newsletterRecipients` (lecture seule) — l'article est envoyé une seule fois aux abonnés confirmés quand il est publié et que sa date est atteinte.

### `categories` — Catégories éditoriales

`title`_, `slug`_, `description`. Neuf catégories créées par le seed.

### `books` — Livres et publications

`title`_, `slug`_, `subtitle`, `author`_, `cover`, `summary`_, `description`,
`audience[]`, `bookLanguage[]`, `format[]`, `isbn`, `publisher`,
`publicationDate`, `pages`, `price`, `currency`, `stock` (vente directe, vide = non suivi),
`availability`_, `saleType`_, `purchaseLinks[]`, `directOrderForm`, `previewPdf`,
`relatedBooks`, `featured`, `order`, `isPlaceholder`, `seo`.

`directOrderForm` (mode `external` uniquement, libellé « Proposer aussi l'achat direct sur le
site ») : le livre garde ses liens d'achat et propose en plus l'achat direct. Sous les liens,
**« Commander ici »** ouvre une fenêtre d'ajout au panier (`OrderDialog`) si le livre est
achetable selon la règle du serveur (`isPurchasable` de `src/lib/shop-pricing.ts` : prix TTC > 0
en EUR, disponible ou en précommande, stock), sinon elle indique que la commande directe n'est
pas encore ouverte. Le panier (`CartView`) se déroule en trois étapes : panier → coordonnées
(`src/lib/shop-customer.ts`, mêmes règles dans le navigateur et dans `POST /api/shop/checkout`,
champ `customer`) → moyens de paiement, affichés seulement si la boutique est ouverte et les
clés configurées. Nom, e-mail et adresse sont enregistrés sur la commande en attente et
transmis à Stripe (`customer_email`, `payment_intent_data.shipping`) ou PayPal
(`SET_PROVIDED_ADDRESS`) ; au paiement, ils priment sur ceux renvoyés par le prestataire. La
valeur `bookOrder` des demandes de contact reste disponible mais n'est plus utilisée par la
fiche livre.

`saleType` implémente le modèle hybride du cahier des charges :
`external` (lien revendeur), `direct` (**modélisé mais non activé** — aucun
paiement n'est simulé), `none` (information seule).

### `orders` — Commandes (vente directe)

`number`_ (`RK-AAAA-0001`, unique), `status`_ (`pending` | `paid` | `shipped` |
`cancelled` | `refunded`), `trackingUrl`, `provider` (`stripe` | `paypal`),
`providerRef`, `locale`, `customerName`, `customerEmail`, `shipping{…}`,
`items[{book | product, title, quantity, unitPrice, lineTotal}]`, `total`, `vatRate`,
`vatAmount`, `currency`, `paidAt`, `shippedAt`, `digitalWaiverAt` (accès immédiat aux
contenus numériques accepté), `note`. Création par l'API de
paiement uniquement ; passage à `paid` uniquement par webhook Stripe signé ou capture
PayPal, une seule fois — les produits numériques sont alors ouverts dans l'espace
membre de l'acheteur. Passer à `shipped` envoie l'e-mail d'expédition.

### `products` — Produits numériques

`title`_, `slug`_, `type`_ (`ebook` | `course` | `resource`), `price`_ (TTC EUR),
`available`, `summary`\_, `cover`, `languages[]`, `description`, `ebookPdf`,
`ebookEpub`, `resourceFile`, `modules[{title, lessons[{title, durationMinutes,
content, videoUrl, attachment}]}]`, `featured`, `order`, `isPlaceholder`, `seo`.
Brouillons. Les fichiers et le contenu des leçons (texte, vidéo, pièce jointe) ne sont
**jamais** renvoyés par l'API publique : seuls les acheteurs y accèdent, par l'espace
membre, après contrôle de leur accès. Titres et durées des leçons = programme public.

### `protected-files` — Fichiers protégés (upload)

`title`. PDF, EPUB, ZIP, DOCX, XLSX, PPTX, stockés dans `private/files` (hors du
dossier public, volume Docker `private`). Lecture réservée à l'équipe ; téléchargement
par les acheteurs via `/api/members/download` (limite de 50 téléchargements par accès).

### `members` — Membres

`email`\_ (unique), `name`, `locale`, `lastLoginAt`. Créés automatiquement au premier
achat d'un produit numérique. Connexion sans mot de passe par lien e-mail à usage
unique (15 minutes ; 72 heures pour le lien envoyé après l'achat), session de 30 jours
dans un cookie signé `httpOnly`.

### `entitlements` — Accès aux produits

`member`_, `product`_, `order`, `grantedAt`, `downloads`, `completedLessons`
(progression d'une formation). Créés au paiement ; un administrateur peut en ajouter
ou en retirer à la main.

### `campaigns` — Pages de campagne

`title`_, `slug`_, `summary`\_, onglet **Contenu** : `layout` (blocs, au moins un), onglet
**SEO**. Brouillons et publication programmée. Adresse `/{langue}/campaigns/{slug}`, hors
menu, présente dans le sitemap (sauf `noindex`). Blocs :

| Bloc         | Champs                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------- |
| `hero`       | `eyebrow`, `heading` (vide = titre de la page ; H1 en premier bloc), `lead`, `image`, `cta` |
| `text`       | `heading`, `content`\_ (texte riche), `image`, `imagePosition` (`left` / `right`)           |
| `features`   | `heading`, `intro`, `items[{title, description}]` (1 à 12)                                  |
| `video`      | `heading`, `videoUrl`\_ (YouTube / Vimeo, chargée au clic), `poster`                        |
| `books`      | `heading`, `books`\_ (livres publiés)                                                       |
| `products`   | `heading`, `products`\_ (produits numériques publiés)                                       |
| `faq`        | `heading`, `items[{question, answer}]` → données structurées `FAQPage`                      |
| `cta`        | `heading`\_, `body`, `primary`, `secondary` (bande sombre)                                  |
| `newsletter` | `heading`, `body` ; masqué tant que l'envoi d'e-mails n'est pas configuré                   |

Boutons (`cta`, `primary`, `secondary`) : `{label, href}`. `href` = page du site commençant
par `/` (le préfixe de langue est ajouté automatiquement) ou adresse `https://` (nouvel
onglet) ; toute autre valeur est refusée à l'enregistrement (`src/lib/campaign-link.ts`).
Clics mesurés par l'événement `campaign_cta_click`.

### `businesses` — Écosystème entrepreneurial

`name`_, `slug`_, `tagline`, `description`\*, `valueProposition`, `field`,
`audience`, `website`, `contactEmail`, `logo`, `active`, `order`,
`isPlaceholder`, `seo`. `active: false` masque l'activité sans la supprimer.

### `engagements` — Conférences & médias

`title`_, `slug`_, `type`_ (`conference` | `workshop` | `panel` | `interview` |
`podcast` | `video` | `press`), `date`_, `endDate`, `summary`\_, `eventName`,
`organiser`, `city`, `country` (ISO), `languages[]`, `cover`, `featured`,
`isPlaceholder`, onglet **Description** (`description`), onglet **Vidéo et liens**
(`videoUrl` YouTube/Vimeo validé, `externalUrl` https, `externalLabel`), **SEO**.
Brouillons et publication programmée. Aucun contenu de démarrage.

Champs de classement : `topics` (relation multiple vers `expertise-areas`, seuls les
domaines publiés sont affichés) et `durationMinutes`. **Médiathèque** `/media` : fiches
passées dont le format est vidéo (`videoUrl` valide), `podcast`, `interview` ou
`press` (`src/lib/media-library.ts`), filtrables par format, thème et langue. Une fiche
avec vidéo et image publie un `VideoObject` (données structurées).

### `credentials` — Formations et certifications

`title`_, `institution`_, `kind`\* (`education` | `credential`), `year`,
`location`, `description`, `order`, `isPlaceholder`. Affichées sur `/about`.

### `legal-pages` — Pages légales

`title`_, `slug`_, `type`_ (unique : `imprint`, `privacy`, `cookies`, `terms`,
`returns`), `needsLegalReview`, `content`_, `lastUpdated`, `seo`.
`needsLegalReview: true` ⇒ bandeau « brouillon » + `noindex` + exclusion du sitemap.
Création/suppression réservées aux administrateurs.

### `media` — Médiathèque (upload)

`alt`\* (localisé, **obligatoire**), `credit`.
Conversion WebP (qualité 82) et six déclinaisons : `thumbnail` 400×300,
`card` 768×512, `portrait` 800×1000, `wide` 1600×900, `og` 1200×630, `book` 900 de large
(proportions d'origine, les couvertures ne sont jamais recadrées).
Types acceptés : JPEG, PNG, WebP, AVIF, SVG (`IMAGE_MIME_TYPES`). Limite 10 Mo.

**Vidéos** : aucune vidéo n'est téléversée ; elles sont ajoutées par lien YouTube ou Vimeo
(`videoUrl` des conférences & médias, des blocs vidéo de campagne et des leçons). Un hook
`beforeOperation` (`src/payload/upload-messages.ts`) refuse tout autre fichier **avant** le
contrôle de Payload, avec un message dans la langue de l'administration (FR / DE / EN) : une
vidéo renvoie vers YouTube / Vimeo et le champ _Vidéo_, tout autre fichier rappelle les
formats acceptés (réponse 400, au lieu de « The following field is invalid: file »).

### `documents` — Documents PDF (upload)

`title`_ (localisé), `kind`_ (`expert-profile`, `cv`, `book-extract`, `other`).

### `contact-submissions` — Demandes de contact

`name`_, `organisation`, `email`_, `country`_, `requestType`_ (dont `bookOrder` : commande
de livre, choisie à la main), `subject`_,
`message`_, `locale`, `status`, `emailDelivered`, `consentAt`.
**Création interdite via l'API publique** : seule la route `/api/contact` écrit
dans cette collection (API locale avec `overrideAccess`). Lecture réservée aux
comptes authentifiés, suppression aux administrateurs.

Qualification (facultative) : `organisationType`, `budget`, `timeline`, `decisionRole`
(listes fermées), `leadScore` (0–100, lecture seule) et `priority` (`high` | `medium` |
`low`, modifiable). Grille de calcul et libellés : `src/lib/lead-score.ts` ; le score n'est
jamais renvoyé au visiteur.

**Export CSV** (`subscribers`, `contact-submissions`) : boutons au-dessus de la liste
(`src/payload/components/ExportCsvButton.tsx`, `beforeListTable`) → `GET
/api/admin/export/{collection}?lang=fr|de|en[&status=confirmed]`. Réservé à un compte
administrateur ou éditeur connecté (401 sinon), lecture avec ses droits
(`overrideAccess: false`), 50 000 lignes au plus ; séparateur `;`, BOM UTF-8, protection
contre l'injection de formules (`src/lib/csv.ts`, colonnes dans `src/lib/exports.ts`).
L'export est journalisé (collection, nombre de lignes, identifiant de l'utilisateur),
jamais son contenu.

**Google Sheets** (`subscribers`, `contact-submissions`) : hooks `afterChange` /
`afterDelete` (`src/payload/hooks/sheets.ts`) → `src/lib/google-sheets.ts` (compte de
service, JWT RS256, API Sheets v4, écriture `RAW`, file d'attente en mémoire, ligne
retrouvée par l'ID en colonne A). Abonnés synchronisés seulement en `confirmed` /
`unsubscribed`. Panneau `SheetsSync` au-dessus des listes ; `GET|POST /api/admin/sheets`
(état / resynchronisation complète, compte de l'équipe connecté, origine vérifiée).
Inactif sans `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`,
`GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`.

### `users` — Comptes

`name`_, `email`_, `role`\* (`admin` | `editor`).
Session 8 h, verrouillage après 5 échecs pendant 10 minutes, cookies
`SameSite=Lax` et `Secure` en production. Seul un administrateur modifie un rôle.

---

## Globals

### `site-settings`

- **Brand** : `name`, `headline` (localisé), `signature`, `logo`,
  `expertProfile`, `cvDocument`, `creditName` (crédit « © by … » du pied de
  page, vide = masqué), `creditUrl` (lien facultatif)
- **Contact** : `email`, `phone`, `address`, `notificationEmail`,
  `spokenLanguages`, `bookingUrl` (https, outil de rendez-vous externe), `bookingLabel`
- **Social** : `social[{platform, url}]`
- **SEO defaults** : `defaultSeoTitle`, `defaultSeoDescription`, `defaultOgImage`

### `appearance` — Apparence (Administrator uniquement)

- **Couleurs** : `palette` (`signature` par défaut, `ivory`, `anthracite`,
  `petrol`, `forest`, `burgundy`, `custom`) ; si `custom` :
  `light{primary, accent, textSecondary, background, backgroundSubtle}` et
  `dark{background, backgroundSubtle, accent}` (hex, vide = valeur Signature)
- **Typographie** : `headingFont` (`source-serif`, `playfair`, `inter`)
- **Page d'accueil** : `hero{style: halo | plain | image, image, intensity: subtle | visible}`

Le moteur `src/lib/theme.ts` dérive de ces quelques couleurs l'ensemble des
design tokens des deux thèmes et ajuste chaque couleur de texte pour atteindre le
contraste WCAG AA ; la feuille générée est injectée dans le `<head>`
(`#rk-appearance`). Palette Signature = aucune surcharge : les tokens réglés à la
main dans `globals.css` s'appliquent. L'enregistrement déclenche la
revalidation des pages (`revalidatePath`).

### `shop-settings` — Réglages de la boutique

`enabled` (ouvre la vente directe ; sans effet tant que les clés de paiement
manquent), `vatRate` (TVA incluse dans les prix, 0–30 %), `notificationEmail`.

### `home-page`

`heroEyebrow`, `heroValueProposition`, `heroPortrait`, `heroKeyPoints[]`,
`expertiseIntro`, `experienceIntro`, `ecosystemIntro`, `finalCtaTitle`,
`finalCtaBody`, `seo`.

### `about-page`

`lead`, `portrait`, `biography`, `career`, `vision`, `values[]`, `languages[]`,
`regions[]`, `seo`.

---

## Règles d'accès

| Opération                         | Public | Editor | Admin |
| --------------------------------- | ------ | ------ | ----- |
| Lire un contenu publié            | ✅     | ✅     | ✅    |
| Lire un brouillon                 | ❌     | ✅     | ✅    |
| Créer / modifier un contenu       | ❌     | ✅     | ✅    |
| Créer / supprimer une page légale | ❌     | ❌     | ✅    |
| Modifier l'apparence du site      | ❌     | ❌     | ✅    |
| Lire les demandes de contact      | ❌     | ✅     | ✅    |
| Supprimer une demande de contact  | ❌     | ❌     | ✅    |
| Voir / traiter les commandes      | ❌     | ✅     | ✅    |
| Régler la boutique                | ❌     | ❌     | ✅    |
| Voir les abonnés newsletter       | ❌     | ✅     | ✅    |
| Modifier / supprimer un abonné    | ❌     | ❌     | ✅    |
| Gérer les comptes et les rôles    | ❌     | ❌     | ✅    |

Implémentation : `src/payload/access.ts`.

---

## Contenu de démarrage et repli

`src/content/starter.ts` contient le contenu livré avec le site. Il sert :

1. de source au script `npm run seed` (chaque entrée est marquée
   `isPlaceholder`) ;
2. de **repli** si `CMS_ENABLED=false` ou si la base est injoignable — le site
   reste debout, un avertissement est écrit dans les logs serveur et les fiches
   concernées affichent le bandeau « Contenu d'exemple ». Le repli n'est jamais
   silencieux.

Règles respectées dans ce fichier : aucun client, partenaire, diplôme, mission,
résultat, témoignage ou statistique inventé ; tout élément attendu du
commanditaire est écrit `[entre crochets]`.

---

## Faire évoluer le modèle

1. Modifier les fichiers de `src/payload/`.
2. `npm run generate:types` (et `generate:importmap` si un composant d'admin
   personnalisé est ajouté).
3. Adapter les mappings de `src/lib/cms.ts` et les modèles de vue de
   `src/lib/types.ts`.
4. En production : créer et appliquer une migration
   (voir [`DEPLOIEMENT.md`](DEPLOIEMENT.md) §4).
