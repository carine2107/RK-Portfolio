# Rapport des tests exécutés

Date d'exécution : **10 septembre 2026**
Environnement : Windows 11, Node 24.15, PostgreSQL 16 (Docker), build de
**production** (`npm run build` + `npm start`), contenu servi par le CMS.

---

## 1. Synthèse

| Suite                            | Périmètre                                                               | Résultat                             |
| -------------------------------- | ----------------------------------------------------------------------- | ------------------------------------ |
| Tests unitaires (Vitest)         | Traductions, contrastes, moteur d'apparence, validation, SEO, anti-abus | **79 / 79 réussis**                  |
| Tests end-to-end (Playwright)    | 68 scénarios × 4 configurations                                         | **246 réussis, 26 ignorés, 0 échec** |
| Compilation TypeScript (`tsc`)   | Mode strict, tout le projet                                             | **0 erreur**                         |
| Lint (ESLint 9 + config Next 16) | Tout le projet                                                          | **0 erreur, 0 avertissement**        |
| Formatage (Prettier)             | `src`, `tests`, `docs`                                                  | **conforme**                         |
| Build de production              | `next build`                                                            | **réussi**                           |
| Recette visuelle                 | 11 pages × 3 langues × 2 thèmes × 5 largeurs (99 captures)              | **conforme après corrections**       |

Configurations end-to-end : **Chromium 1280 px**, **mobile 375 px**,
**Firefox**, **WebKit**.

Tests ignorés, tous volontaires :

- **24** : l'audit de contraste axe (12 scénarios) ne tourne que sur les deux
  configurations Chromium — le contraste ne dépend pas du moteur de rendu ;
- **2** sur WebKit : Safari ne déplace pas le focus vers les liens avec la touche
  Tab tant que « Full Keyboard Access » n'est pas activé dans le système. Le
  comportement est vérifié sur Chromium et Firefox.

Commandes :

```bash
npm run verify                                  # format + types + lint + unitaires
E2E_PROD=1 E2E_ALL_BROWSERS=1 npx playwright test
node tests/visual/capture.mjs test-results/visual
```

---

## 2. Tests unitaires (79)

| Fichier                  | Ce qui est vérifié                                                                                                                                                                                                                             |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `messages.test.ts`       | FR et DE couvrent 100 % des clés anglaises, aucune clé en trop, aucun message vide, paramètres ICU identiques, navigation réellement traduite                                                                                                  |
| `contrast.test.ts`       | 15 paires couleur texte/fond × 2 thèmes + anneau de focus, seuils WCAG 2.2 AA calculés depuis les design tokens du CSS                                                                                                                         |
| `contact-schema.test.ts` | Schéma du formulaire (consentement, e-mail, pays, type de demande, longueurs), clés d'erreur traduisibles, liste de pays localisée et triée                                                                                                    |
| `seo.test.ts`            | Canonical, hreflang FR/DE/EN + `x-default`, chemins traduits, `noindex`, Open Graph, troncature des descriptions, génération des slugs                                                                                                         |
| `theme.test.ts`          | Moteur d'apparence : les 6 palettes et **300 palettes personnalisées aléatoires** respectent 15 paires de contraste AA dans les deux thèmes ; couleurs vides = palette Signature ; aucune saisie brute du CMS dans la feuille de style générée |
| `video.test.ts`          | Liens YouTube (watch, youtu.be, embed, shorts, live, mobile) et Vimeo convertis en lecteurs sans cookie ; tout autre lien refusé (domaines imitant YouTube, `javascript:`, identifiants invalides)                                             |
| `world-map.test.ts`      | Carte Europe–Afrique : pays d'Europe et d'Afrique présents avec leur code ISO, pays lointains exclus, taille des tracés < 80 Ko ; noms de pays localisés FR/DE/EN                                                                              |
| `retention.test.ts`      | Date limite de conservation des demandes de contact (24 / 6 mois, désactivation à 0, valeurs invalides), calculée en UTC — indépendante du fuseau et de l'heure d'été                                                                          |
| `rate-limit.test.ts`     | Limitation par IP : seuil, réinitialisation de fenêtre, isolation entre clients, lecture des en-têtes de proxy                                                                                                                                 |

## 3. Tests end-to-end (68 scénarios)

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

### Accessibilité (`accessibility.spec.ts`)

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
