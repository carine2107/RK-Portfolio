# Guide administrateur — RK CMS

Ce guide s'adresse au propriétaire du site. Aucune compétence technique n'est
nécessaire : tout ce qui suit se fait depuis l'interface d'administration.

**Adresse de l'administration : `https://<votre-domaine>/admin`**

---

## 1. Se connecter et gérer son compte

1. Ouvrir `/admin`, saisir l'e-mail et le mot de passe.
2. En haut à droite, le menu du compte permet de changer le mot de passe.
3. Après cinq tentatives infructueuses, le compte est verrouillé dix minutes.

### Rôles

| Rôle                | Peut faire                                                                                                       | Ne peut pas faire                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Administrator**   | Tout : contenus, réglages du site, apparence (couleurs, polices), pages légales, comptes utilisateurs            | —                                                                   |
| **Editor / Author** | Créer, modifier et publier les contenus (articles, expertises, expériences, livres, activités), gérer les médias | Créer des comptes, changer un rôle, créer/supprimer une page légale |

Créer un compte : **Administration → Utilisateurs → Créer**, choisir le rôle,
saisir un mot de passe solide. Ne jamais partager un compte entre deux personnes.

---

## 2. Deux réglages de langue à ne pas confondre

| Réglage                                               | Où                                           | Ce qu'il change                                                           |
| ----------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------- |
| **Locale** (en haut à droite : « Locale : Français ») | Barre supérieure de l'administration         | La **langue du contenu** que vous êtes en train de rédiger (FR / DE / EN) |
| **Language**                                          | Votre compte → _Payload Settings → Language_ | La **langue de l'interface** d'administration (boutons, menus, messages)  |

Autrement dit : passer la _Locale_ en français ne traduit pas les boutons de
l'interface — c'est le réglage _Language_ qui s'en charge.

Le sélecteur _Locale_ n'apparaît que là où il sert : il est masqué sur votre
compte, sur les utilisateurs et sur les demandes de contact, qui ne contiennent
aucun champ traduit.

L'administration est **entièrement traduite en français, allemand et anglais** :
menus, noms de collections, libellés de champs, options et textes d'aide. Elle
s'ouvre dans la langue de votre navigateur ; pour la forcer en français une fois
pour toutes : **votre compte → _Payload Settings_ → _Language / Sprache_ →
Français**.

## 3. Les trois langues

Chaque contenu existe en **français, allemand et anglais**.

- En haut de l'écran d'édition, un **sélecteur de langue** (`English`,
  `Français`, `Deutsch`) change la langue en cours d'édition.
- On enregistre **par langue** : rédiger en anglais, enregistrer, passer au
  français, traduire, enregistrer, puis l'allemand.
- Les champs non traduits (dates, prix, liens, ISBN, images) sont communs.
- Une traduction laissée vide retombe automatiquement sur l'anglais : le site
  n'affiche jamais de texte vide ni de code technique. **Mais** un contenu
  partiellement traduit produit une page mélangeant deux langues : toujours
  compléter les trois versions avant de publier.
- Le **slug** (fin de l'URL) est traduisible : `/fr/insights/lire-un-bilan…`
  et `/de/insights/eine-bilanz-lesen…` désignent le même article. Laisser le
  champ vide le génère automatiquement à partir du titre.

> ⚠️ Ne jamais coller une traduction automatique non relue : le cahier des
> charges l'interdit explicitement.

---

## 4. Publier un article RK Insights

1. **RK Insights → Articles RK Insights → Créer**.
2. Renseigner :
   - **Titre** — le titre affiché ;
   - **Slug (URL)** — laisser vide pour la génération automatique ;
   - **Accroche** — 2 à 3 phrases, réutilisées dans les listes et les partages
     LinkedIn/Facebook ;
   - **Image de couverture** — paysage, au moins 1600 × 900 px (voir §8) ;
   - **Catégorie** — obligatoire ;
   - **Published at** — date d'affichage. **Une date future programme la
     publication** : l'article n'apparaîtra qu'à partir de cette date ;
   - **Article à la une** — met l'article en avant en haut de la page RK Insights ;
   - onglet **Article** — le corps du texte (titres de niveau 2 pour le
     sommaire automatique) ;
   - onglet **Liens** — expertises, articles et livres liés ;
   - onglet **Référencement** — titre et description spécifiques si besoin.
3. Traduire dans les deux autres langues (§3).
4. **Enregistrer comme brouillon** pour continuer plus tard, **Aperçu** pour voir
   le rendu, **Publier** pour mettre en ligne.

Le temps de lecture est calculé automatiquement à l'enregistrement.

> **Aperçu** — le bouton _Aperçu_ ouvre la page telle qu'elle sera publiée,
> même si l'article est encore en brouillon. Un bandeau orange le rappelle ;
> « Quitter l'aperçu » revient à la version publique. L'aperçu n'est visible que
> par une personne connectée à l'administration.
>
> **Délai d'affichage** — une modification publiée apparaît sur le site public
> dans les **5 minutes** au plus (le site met les pages en cache pour rester
> rapide). Un rechargement forcé ne raccourcit pas ce délai.

### Modifier ou dépublier

Ouvrir l'article → modifier → **Publier les modifications**.
Pour le retirer du site : menu **⋯ → Dépublier** (l'article reste en brouillon).
Toutes les versions sont conservées : onglet **Versions → Restaurer** pour revenir
à un état antérieur.

---

## 5. Newsletter RK Insights

**Qui s'inscrit ?** Les visiteurs, depuis la page **Newsletter** (`/newsletter`), le
bandeau du pied de page et l'encart en fin d'article. Chaque inscription est
**confirmée par e-mail** (double opt-in) : l'adresse reçoit un lien valable 48 h.
Le formulaire n'apparaît que si l'envoi d'e-mails est configuré sur le serveur.

**Envoyer un article** : dans l'article, cocher **Envoyer aux abonnés de la
newsletter** (colonne de droite), puis publier.

- Publication immédiate : l'envoi part quelques secondes après l'enregistrement.
- Publication programmée : l'envoi part à la date prévue (vérification toutes les
  10 minutes).
- Chaque abonné confirmé reçoit l'article **dans sa langue** ; un article n'est
  **jamais envoyé deux fois**. Une fois l'envoi fait, la date d'envoi et le nombre de
  destinataires s'affichent dans l'article.
- Un article sans traduction dans la langue d'un abonné ne lui est pas envoyé.

**Administration → Abonnés newsletter** : liste des adresses avec leur langue et
leur statut (_En attente de confirmation_, _Confirmé_, _Désinscrit_).

- Pour retirer une adresse sur demande : passer son statut à **Désinscrit**, ou la
  supprimer (rôle Administrator).
- Chaque e-mail contient un lien de désinscription ; les messageries (Gmail, Outlook,
  Apple Mail) proposent aussi leur bouton « Se désinscrire ».
- **Protection des données** : une inscription non confirmée est supprimée après
  7 jours, une adresse désinscrite après 30 jours. Seules l'adresse, la langue et
  les dates de consentement / confirmation sont conservées.

> Envoyer une newsletter engage la réputation de l'adresse d'expédition : utiliser
> un fournisseur SMTP professionnel (voir `DEPLOIEMENT.md`) et n'écrire qu'aux
> personnes inscrites via le formulaire — jamais d'import de liste achetée ou
> recopiée.

---

## 6. Gérer les expériences et projets

**Contenus → Expériences et projets**

| Champ                      | Remarque                                                                                                                                                   |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**                   | _Mission / poste_ ou _Projet / programme_                                                                                                                  |
| **Organisation**           | Nom uniquement — aucun logo tiers n'est affiché                                                                                                            |
| **Rôle**, **Secteur**      | Traduits                                                                                                                                                   |
| **Région**                 | Europe / Afrique / International — alimente les filtres                                                                                                    |
| **Pays**                   | Choisir chaque pays dans la liste : il apparaît sur la **carte Europe–Afrique** et son nom s'affiche en FR/DE/EN. _Nom affiché_ facultatif (ville, région) |
| **Début / Fin**            | Laisser la date de fin vide pour une mission en cours                                                                                                      |
| **Résumé**                 | Texte affiché dans la liste                                                                                                                                |
| **Afficher sur l'accueil** | Affiche la fiche sur la page d'accueil                                                                                                                     |
| **Résultats vérifiés…**    | **Case décisive** : les résultats ne s'affichent sur le site **que si elle est cochée**                                                                    |
| **Liens**                  | Expertises et articles liés                                                                                                                                |

> **Carte des expériences** : elle s'affiche en haut de la page Expériences dès
> qu'au moins une fiche a un pays choisi dans la liste. Les pays concernés sont
> colorés, avec le nombre d'expériences ; un clic sur la carte ou sur la liste
> filtre les fiches. La carte couvre l'Europe et l'Afrique : un pays hors de cette
> zone reste dans la liste, sans forme sur la carte.

> Ne jamais saisir un chiffre ou un résultat non vérifiable. Tant que la case
> « Résultats vérifiés et validés pour publication » est décochée, le site indique simplement qu'aucun
> résultat n'est publié pour cette mission.

---

## 7. Domaines d'expertise

**Contenus → Domaines d’expertise**

Chaque domaine dispose d'une page dédiée référencée par les moteurs de
recherche : introduction, problématiques traitées, prestations, publics,
approche, expériences et articles liés.

- **Order** — ordre d'affichage (croissant).
- **Featured on home** — présence sur la page d'accueil.
- **Icon** — pictogramme de la carte.

---

## 8. Livres et publications

**Contenus → Livres et publications**

| Champ                                                  | Rôle                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| **Couverture**                                         | Couverture, format portrait                                  |
| **Résumé**, **Présentation détaillée**                 | Résumé court et présentation détaillée                       |
| **Public**, **Langue**, **Format**, **ISBN**           | Fiche technique                                              |
| **Éditeur**, **Date de parution**, **Nombre de pages** | Fiche technique ; affichés seulement s'ils sont renseignés   |
| **Prix TTC** + **Devise**                              | Prix TTC ; laisser vide si le prix est fixé par le revendeur |
| **Disponibilité**                                      | Disponible / Précommande / Bientôt / Épuisé                  |
| **Mode de vente**                                      | _External retailer_, _Direct sale_, _Information only_       |
| **Liens d’achat**                                      | Un ou plusieurs boutons d'achat externes (Amazon, éditeur…)  |
| **Extrait (PDF)**                                      | Extrait facultatif                                           |

**Modèle de vente** — modèle hybride du cahier des charges, choisi livre par livre :

- _Plateforme externe_ : le bouton renvoie vers Amazon, l'éditeur ou tout autre revendeur ;
- _Vente directe sur le site_ : panier et paiement sur le site (voir ci-dessous) ;
- _Présentation seule_ : fiche sans achat.

**Vente directe** — **Boutique → Réglages de la boutique** puis **Boutique → Commandes**.

1. Prérequis (prestataire technique) : clés **Stripe** et/ou **PayPal** configurées
   sur le serveur (`DEPLOIEMENT.md`). Sans clés, rien n'est payable, même boutique
   ouverte : la fiche continue d'annoncer la vente directe « prochainement ».
2. Faire valider les **conditions générales de vente** et la **politique de
   livraison et de retours** (pages légales), ainsi que le **taux de TVA** avec le
   comptable.
3. Dans le livre : _Mode de vente_ = **Vente directe sur le site**, **prix TTC en
   EUR**, disponibilité _Disponible_ ou _Précommande_, **stock** facultatif (vide =
   non suivi ; à 0 le livre passe « Épuisé »).
4. Dans **Réglages de la boutique** : saisir le **taux de TVA** validé (0 = aucune
   TVA indiquée), l'adresse qui reçoit les commandes, puis cocher **Ouvrir la vente
   directe**.

Côté visiteur : bouton **Ajouter au panier** → page **Panier** (prix recalculés par
le site, livraison offerte, acceptation des CGV) → paiement sur la page sécurisée
de **Stripe** (carte, Apple Pay, Google Pay…) ou de **PayPal**, qui demande aussi
l'adresse de livraison. Aucune donnée bancaire ne passe par le site.

**Traiter une commande** — chaque commande payée envoie un e-mail à l'acheteur
(confirmation) et à l'adresse des commandes (à expédier).

| Statut                     | Signification / action                                                                        |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| **En attente de paiement** | Le visiteur est sur la page de paiement ou l'a quittée : ne rien expédier                     |
| **Payée — à expédier**     | Paiement confirmé par Stripe ou PayPal : expédier le livre à l'adresse indiquée               |
| **Expédiée**               | Renseigner d'abord le _lien de suivi_ (facultatif) : l'acheteur reçoit un e-mail d'expédition |
| **Annulée**                | Paiement non abouti (session expirée) ou commande annulée                                     |
| **Remboursée**             | Rembourser **dans le tableau de bord Stripe ou PayPal**, puis passer la commande à ce statut  |

Le reçu de paiement est envoyé par Stripe ou PayPal. Les montants et l'historique
des paiements se consultent aussi dans leurs tableaux de bord.

### Produits numériques (e-books, formations, ressources)

**Boutique → Produits numériques**, puis **Boutique → Fichiers protégés**, **Membres**
et **Accès aux produits**. Vendus uniquement quand la vente directe est ouverte (voir
ci-dessus).

1. **Fichiers protégés** : téléverser le PDF / EPUB de l'e-book, la ressource (PDF,
   ZIP, Word, Excel, PowerPoint) ou la pièce jointe d'une leçon. Ces fichiers ne sont
   jamais publics.
2. **Produits numériques → Créer** : titre, type (_E-book_, _Formation_, _Ressource
   téléchargeable_), **prix TTC en EUR**, résumé, visuel, présentation, puis :
   - _E-book_ : choisir le fichier PDF et/ou EPUB ;
   - _Ressource_ : choisir le fichier ;
   - _Formation_ : ajouter des **modules**, et dans chacun des **leçons** (titre,
     durée, contenu, vidéo YouTube ou Vimeo **non listée**, pièce jointe).
     Les titres et durées forment le programme visible par tous ; le contenu, la vidéo
     et la pièce jointe sont réservés aux acheteurs.
3. **Publier**. Décocher _En vente_ retire le produit de la vente sans supprimer les
   accès déjà achetés.

Faire compléter les **CGV** pour les contenus numériques : au moment de payer,
l'acheteur doit cocher la demande d'**accès immédiat**, qui lui fait perdre son droit
de rétractation (enregistré dans la commande).

**Après le paiement** : le compte membre de l'acheteur est créé avec son adresse
e-mail, le produit est ajouté à son espace et il reçoit un e-mail « Accédez à vos
achats » avec un lien de connexion (valable 72 h). Ensuite, il se reconnecte depuis
**Mon espace** (pied de page du site) en recevant un nouveau lien par e-mail : il n'y
a pas de mot de passe. Chaque fichier peut être téléchargé 50 fois par accès.

**Geste commercial ou problème** : dans **Accès aux produits → Créer**, choisir le
membre et le produit (le membre doit exister : il est créé à son premier achat). Pour
retirer un accès (remboursement), supprimer la ligne correspondante.

---

## 9. Médias et documents

- **Médiathèque → Médiathèque** : images. Le **texte alternatif est obligatoire**
  (accessibilité et SEO) : décrire ce que montre l'image en une phrase.
  Les images sont converties en WebP et déclinées automatiquement en cinq
  tailles ; inutile de les redimensionner avant l'envoi (10 Mo maximum).
- **Médiathèque → Documents (PDF)** : CV international, International Expert
  Profile, extraits de livres. Choisir le bon **Type de document**.

### Publier l'International Expert Profile

1. **Médiathèque → Documents (PDF) → Créer**, téléverser le PDF, **Type de document = International Expert Profile**.
2. **Administration → Réglages du site → Marque → International Expert Profile** : sélectionner ce document.
3. Les boutons « Télécharger l'Expert Profile » deviennent actifs partout sur le site.

Tant qu'aucun document n'est associé, le bouton reste visible mais explique que
le document n'est pas encore publié — il ne renvoie jamais vers un lien mort.

---

## 10. Réglages du site

**Administration → Réglages du site**

| Onglet              | Contenu                                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Marque**          | Nom, positionnement (traduit), signature, logo, Expert Profile, CV                                                             |
| **Contact**         | E-mail et téléphone publiés, adresse, **adresse de réception des demandes**, langues parlées, **lien de prise de rendez-vous** |
| **Réseaux sociaux** | Profils LinkedIn, X, Facebook, YouTube, Instagram (affichés dans le pied de page)                                              |
| **SEO par défaut**  | Titre et description par défaut, image de partage social (1200 × 630)                                                          |

La **mention de bas de page** (« © by Nana-Consulting. Tous droits réservés. »)
s'affiche tout en bas de chaque page. Vider le champ _Crédit du pied de page_ la
remplace par « © {année} Romial Kenmogne. Tous droits réservés. » ; renseigner
l'URL du crédit transforme « © by Nana-Consulting » en lien.

**Prise de rendez-vous** : coller dans _Lien de prise de rendez-vous_ l'adresse de
la page de réservation (Cal.com, Calendly, Microsoft Bookings…). Un bouton
« Réserver un échange » apparaît alors sur les pages **Contact** et **À propos** ;
l'outil s'ouvre dans un nouvel onglet et rien n'en est chargé sur le site avant
le clic (pas de cookie tiers). Vider le champ retire le bouton. Les rendez-vous se
gèrent dans l'outil choisi.

**Pages → Page d’accueil** : accroche, proposition de valeur, photo du hero, points
clés, textes d'introduction des sections, appel à l'action final.

**Pages → Page À propos** : biographie exécutive, parcours, vision Europe–Afrique,
valeurs, langues, régions.

**Contenus → Formations et qualifications** : diplômes et certifications.

---

## 11. Apparence du site

**Administration → Apparence** (réservé au rôle Administrator ; les éditeurs la
consultent sans pouvoir la modifier).

| Onglet             | Réglage                                                                                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Couleurs**       | Une **palette prête à l'emploi** (Signature marine et or — par défaut —, Ivoire et marine, Anthracite et or, Bleu pétrole et cuivre, Vert profond et or, Bordeaux et or) ou **Personnalisée** |
| **Typographie**    | Police des titres : Source Serif 4 (par défaut), Playfair Display ou Inter. Le texte courant reste en Inter                                                                                   |
| **Page d'accueil** | Fond du bandeau d'accueil : halo doré (par défaut), uni, ou **image** (discrète ou marquée)                                                                                                   |

**Palette personnalisée** : choisir « Personnalisée » fait apparaître les
couleurs du **mode clair** (couleur principale, accent, texte secondaire, fond de
page, fond des sections alternées) et du **mode sombre** (fond de page, fond des
sections alternées, accent). Chaque couleur se choisit avec le nuancier ou en
saisissant son code (`#10233F`) ; le bouton **Par défaut** la vide, et une
couleur vide reprend celle de la palette Signature.

**Lisibilité garantie** : le site ajuste automatiquement les couleurs des textes
(et au besoin celle des boutons ou du bandeau foncé) pour respecter le contraste
WCAG 2.2 AA. Une couleur choisie peut donc apparaître légèrement plus foncée ou
plus claire sur le site : l'**aperçu** affiché sous les couleurs montre le
rendu réel, en mode clair et en mode sombre, et signale quand un ajustement a eu
lieu. Deux garde-fous refusent l'enregistrement : un fond trop sombre pour le mode
clair, ou trop clair pour le mode sombre.

**Image de fond** : une photo décorative (bureau, ville, texture), idéalement
2 400 px de large. Elle est voilée de la couleur de fond (85 % ou 92 %) pour que
le texte reste lisible ; elle n'a pas de texte alternatif, car elle ne porte aucune
information. Ne pas utiliser de portrait généré par IA.

Les changements sont visibles sur le site **dès l'enregistrement**. Pour revenir
à l'apparence d'origine : palette **Signature**, police **Source Serif 4**, fond
**Halo doré**.

---

## 12. Activités entrepreneuriales

**Contenus → Écosystème entrepreneurial** — RK Business Consulting, RK IMMO-FINANZ,
Kenmogne Strategic Publishing, KAILI Institut, KAILI Event.

Décocher **Activité visible** masque immédiatement une activité du site sans la supprimer.

---

## 13. Conférences & médias

**Contenus → Conférences & médias** — page publique **Conférences** (`/speaking`),
présente dans le menu et le pied de page.

| Champ                                | Rôle                                                                                                  |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| **Type**                             | Conférence, atelier, table ronde, interview, podcast, vidéo, presse                                   |
| **Date** / **Fin**                   | Une date future range l'intervention dans « À venir », une date passée dans « Interventions passées » |
| **Résumé**, **Description**          | Traduits (FR / DE / EN)                                                                               |
| **Événement**, **Organisateur**      | Nom de l'événement ou de l'émission, organisateur ou média                                            |
| **Ville**, **Pays**                  | Laisser la ville vide pour une intervention en ligne                                                  |
| **Image**                            | Photo réelle de l'intervention ou visuel de l'événement ; sert d'aperçu de la vidéo                   |
| **Vidéo (YouTube ou Vimeo)**         | Coller le lien de la vidéo : elle ne se charge **qu'au clic** du visiteur, en mode sans cookie        |
| **Lien externe** + **Texte du lien** | Podcast, article de presse, page de l'événement                                                       |

- Brouillon, aperçu et **publication programmée** comme pour les articles.
- Tant qu'aucune intervention n'est publiée, la page l'indique et propose
  seulement le bouton **Proposer une intervention**.
- Ce bouton ouvre le formulaire de contact avec le type « Conférence / médias »
  déjà sélectionné.
- Les conférences, ateliers et tables rondes sont déclarés aux moteurs de
  recherche comme **événements** (date, lieu, intervenant).
- N'ajouter que des interventions réelles, et des vidéos dont la diffusion est
  autorisée.

---

## 13 bis. Pages de campagne

Une page de campagne est une page d’atterrissage dédiée à **un livre, une formation ou
une mission** : on la partage sur les réseaux, par e-mail ou dans une publicité. Elle
n’apparaît pas dans le menu du site.

**Pages → Pages de campagne → Créer**

1. **Titre de la page** et **résumé** (utilisé par Google et lors des partages).
2. Onglet **Contenu** : ajouter des blocs avec **Ajouter un bloc**, puis les ordonner par
   glisser-déposer.

| Bloc                       | Usage                                                                          |
| -------------------------- | ------------------------------------------------------------------------------ |
| **En-tête**                | À mettre en premier : surtitre, grand titre, accroche, image et bouton         |
| **Texte**                  | Paragraphe mis en forme, avec une image à gauche ou à droite                   |
| **Points clés**            | 1 à 12 cartes (titre + texte) : bénéfices, programme, public visé              |
| **Vidéo**                  | Lien YouTube ou Vimeo, chargé seulement quand le visiteur clique               |
| **Livres**                 | Choisir un ou plusieurs livres publiés                                         |
| **Produits numériques**    | Choisir des e-books, formations ou ressources publiés                          |
| **Questions fréquentes**   | Questions / réponses dépliables (aussi comprises par Google)                   |
| **Appel à l’action**       | Bande sombre avec un titre, un texte et un ou deux boutons                     |
| **Inscription newsletter** | Formulaire RK Insights (masqué tant que l’envoi d’e-mails n’est pas configuré) |

**Boutons** : _Texte du bouton_ + _Destination_. La destination est soit une page du site
qui commence par `/` (par exemple `/contact?type=speaking`, `/books`, `/products`), soit
une adresse complète en `https://` (ouverte dans un nouvel onglet). Le site ajoute
lui-même la langue. Une adresse incorrecte est refusée à l’enregistrement.

3. Traduire : changer la langue de contenu en haut de l’écran et remplir les textes (titre,
   slug, résumé et textes des blocs) en français et en allemand.
4. **Publier** (ou programmer la publication). L’adresse à partager est
   `https://<domaine>/fr/campaigns/<slug>` (remplacer `fr` par `de` ou `en`).

Pour une campagne temporaire : cocher **Exclure des moteurs de recherche** dans l’onglet
Référencement, puis dépublier la page à la fin de la campagne.

**Administration → Demandes de contact**

Chaque demande envoyée par le formulaire est enregistrée avec le nom,
l'organisation, l'e-mail, le pays, le type de demande, le sujet, le message, la
langue et l'horodatage du consentement.

- **Statut** : Nouvelle → En cours → Répondue → Archivée.
- **Notification envoyée** indique si la notification a réellement pu être envoyée.
- Répondre depuis sa messagerie habituelle (l'e-mail de notification a le
  visiteur en `Reply-To`).
- **Protection des données** : une demande restée **sans modification pendant
  24 mois** est **supprimée automatiquement** (vérification quotidienne). Changer
  le statut ou la fiche repart de zéro. La durée se règle côté serveur
  (`CONTACT_RETENTION_MONTHS`, `0` = jamais) et doit correspondre à celle
  annoncée dans la politique de confidentialité. Une demande peut aussi être
  supprimée à la main (rôle Administrator), par exemple sur demande de la personne.

---

## 15. Statistiques de fréquentation

Le site est prêt pour une mesure d'audience **sans cookie** : **Umami** ou
**Plausible**, auto-hébergés ou en offre hébergée. Tant qu'aucun outil n'est
configuré, rien n'est mesuré et aucun bandeau cookies n'est nécessaire. L'outil
est branché par le prestataire (variables `NEXT_PUBLIC_ANALYTICS_*`, voir
`DEPLOIEMENT.md`).

Les statistiques se consultent **dans le tableau de bord de l'outil** (et non dans
l'administration du site) :

| Indicateur du cahier des charges  | Où le lire                                                        |
| --------------------------------- | ----------------------------------------------------------------- |
| Visites, sources, pays, appareils | Page d'accueil du tableau de bord                                 |
| Pages les plus consultées         | Liste « Pages »                                                   |
| Actions clés                      | Liste « Événements » (Umami) ou « Goals » (Plausible), ci-dessous |

| Événement                 | Déclenché quand le visiteur…                                | Détail transmis       |
| ------------------------- | ----------------------------------------------------------- | --------------------- |
| `expert_profile_download` | télécharge l'International Expert Profile                   | emplacement du bouton |
| `cv_download`             | télécharge le CV international                              | emplacement           |
| `work_with_me_click`      | clique sur « Travailler avec moi » / « Contact »            | emplacement           |
| `contact_form_success`    | envoie le formulaire avec succès                            | type de demande       |
| `article_view`            | ouvre un article RK Insights                                | article               |
| `book_purchase_click`     | clique sur un bouton d'achat (Amazon…)                      | livre, lien           |
| `book_preview_click`      | ouvre l'extrait d'un livre                                  | livre                 |
| `newsletter_subscribe`    | envoie le formulaire d'inscription à la newsletter          | formulaire d'origine  |
| `add_to_cart`             | ajoute un livre au panier (vente directe)                   | livre                 |
| `begin_checkout`          | lance le paiement depuis le panier                          | prestataire           |
| `booking_click`           | ouvre l'outil de prise de rendez-vous                       | page d'origine        |
| `video_play`              | lance une vidéo (Conférences & médias)                      | plateforme            |
| `media_link_click`        | ouvre le lien externe d'une intervention (podcast, presse…) | intervention          |
| `business_click`          | ouvre le site d'une activité de l'écosystème                | activité              |
| `language_change`         | change de langue                                            | langues               |
| `theme_change`            | passe en mode clair / sombre / système                      | thème                 |

Aucune donnée personnelle n'est transmise (ni nom, ni e-mail, ni message). Avec
Plausible, déclarer chaque événement comme « Goal » pour qu'il apparaisse.

---

## 16. Pages légales

**Administration → Pages légales** — Impressum, confidentialité, cookies, CGV,
livraison/retours.

Ces pages sont livrées comme **trames à compléter**. Tant que la case
**« Brouillon à faire valider juridiquement »** est cochée :

- un bandeau d'avertissement s'affiche sur la page ;
- la page est exclue des moteurs de recherche et du sitemap.

Décocher la case **uniquement** après validation par le commanditaire et, si
nécessaire, par un professionnel du droit.

---

## 17. Contenus d'exemple

Les entrées livrées avec le site portent la mention **« Contenu d'exemple »**
(case _Contenu d’exemple_ dans la barre latérale) et affichent un bandeau
d'avertissement sur le site public.

Avant la mise en ligne : remplacer le contenu par des informations validées puis
**décocher la case**, ou supprimer l'entrée.

Liste complète des éléments encore attendus :
[`ELEMENTS_A_FOURNIR.md`](ELEMENTS_A_FOURNIR.md).

---

## 18. Bonnes pratiques

- Publier en trois langues ou pas du tout : une page à moitié traduite se voit.
- Toujours renseigner le texte alternatif des images.
- Vérifier titres, fonctions, organisations, dates, pays et résultats **avant**
  publication : le site n'invente rien, il affiche ce qui est saisi.
- Utiliser l'aperçu avant de publier un article.
- Ne pas publier de logo ou de témoignage tiers sans autorisation écrite.
- Prévenir le prestataire technique avant toute modification du modèle de
  contenu (ajout de champ, nouvelle collection).
