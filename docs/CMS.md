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
compte, `users`, `contact-submissions` — où il n'aurait aucun effet. L'avatar est l'avatar interne de Payload
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

### `insights` — Articles RK Insights

`title`_, `slug`_, `excerpt`_, `coverImage`, `category`_, `author`,
`publishedAt`, `featured`, `readingTime` (calculé), `isPlaceholder`,
onglet **Article** (`content`\*), onglet **Relations** (`relatedExpertise`,
`relatedInsights`, `relatedBooks`), **SEO**.
Brouillons + **programmation de publication** (`schedulePublish`) + aperçu.
Le site n'affiche que les articles publiés dont `publishedAt` est passé.

### `categories` — Catégories éditoriales

`title`_, `slug`_, `description`. Neuf catégories créées par le seed.

### `books` — Livres et publications

`title`_, `slug`_, `subtitle`, `author`_, `cover`, `summary`_, `description`,
`audience[]`, `bookLanguage[]`, `format[]`, `isbn`, `publisher`,
`publicationDate`, `pages`, `price`, `currency`,
`availability`_, `saleType`_, `purchaseLinks[]`, `previewPdf`, `relatedBooks`,
`featured`, `order`, `isPlaceholder`, `seo`.

`saleType` implémente le modèle hybride du cahier des charges :
`external` (lien revendeur), `direct` (**modélisé mais non activé** — aucun
paiement n'est simulé), `none` (information seule).

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
Conversion WebP (qualité 82) et cinq déclinaisons : `thumbnail` 400×300,
`card` 768×512, `portrait` 800×1000, `wide` 1600×900, `og` 1200×630.
Types acceptés : JPEG, PNG, WebP, AVIF, SVG. Limite 10 Mo.

### `documents` — Documents PDF (upload)

`title`_ (localisé), `kind`_ (`expert-profile`, `cv`, `book-extract`, `other`).

### `contact-submissions` — Demandes de contact

`name`_, `organisation`, `email`_, `country`_, `requestType`_, `subject`_,
`message`_, `locale`, `status`, `emailDelivered`, `consentAt`.
**Création interdite via l'API publique** : seule la route `/api/contact` écrit
dans cette collection (API locale avec `overrideAccess`). Lecture réservée aux
comptes authentifiés, suppression aux administrateurs.

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
