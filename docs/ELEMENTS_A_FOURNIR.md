# Éléments à fournir par le commanditaire

Le site est **fonctionnel et déployable en l'état**. Les éléments ci-dessous ne
bloquent pas l'architecture : ils remplacent des contenus explicitement marqués
« Contenu d'exemple » ou activent des fonctions volontairement inactives.

Rien n'a été inventé : aucun client, partenaire, diplôme, mission, résultat,
témoignage ni statistique ne figure sur le site.

Légende : 🔴 bloquant pour la mise en ligne · 🟠 important · 🟡 confort

**Qui saisit quoi ?** Tous les contenus (textes, traductions, photos, livre,
activités, expériences, formations, documents PDF, coordonnées, pages légales)
se saisissent **directement dans l'administration, à tout moment**, sans
intervention technique : voir `GUIDE_ADMIN.md`. Seuls le domaine, l'hébergement,
le compte d'envoi d'e-mails (SMTP), la mesure d'audience et un éventuel
prestataire de paiement demandent une configuration technique (sections 1, 8 et
5.5).

---

## 1. Domaine, hébergement, comptes

| #   | Élément                                                                          | Priorité | Où l'utiliser               |
| --- | -------------------------------------------------------------------------------- | -------- | --------------------------- |
| 1.1 | **Nom de domaine définitif** (`romialkenmogne.com` à vérifier)                   | 🔴       | `NEXT_PUBLIC_SITE_URL`, DNS |
| 1.2 | **Hébergement** (VPS ou plateforme Node avec volume persistant)                  | 🔴       | Voir `DEPLOIEMENT.md`       |
| 1.3 | Certificat HTTPS (Let's Encrypt suffit)                                          | 🔴       | Reverse proxy               |
| 1.4 | Compte **Google Search Console**                                                 | 🟠       | Soumission du sitemap       |
| 1.5 | Titulaire des comptes (domaine, hébergement, e-mail) **au nom du commanditaire** | 🔴       | Propriété et réversibilité  |

## 2. Identité visuelle et médias

| #   | Élément                                                                 | Priorité | Où l'utiliser                                                                     |
| --- | ----------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------- |
| 2.1 | ✅ **Photographies professionnelles** — reçues le 11/09/2026 (3 photos) | —        | Hero d’accueil (RK.jpeg), page À propos (RK1.jpeg), médiathèque (RK2.jpeg)        |
| 2.2 | **Logo / monogramme définitif** (SVG ou PNG transparent)                | 🟠       | En-tête, pied de page, favicon. Un monogramme « RK » sobre est utilisé par défaut |
| 2.3 | Image de partage social 1200 × 630 px                                   | 🟡       | Réglages du site → SEO defaults (une image générique est fournie)                 |
| 2.4 | Photos d'illustration pour les articles                                 | 🟡       | Couvertures RK Insights                                                           |

## 3. Contenus professionnels

| #    | Élément                                                                                                                                                                                                                                                    | Priorité | Où l'utiliser                                                          |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| 3.1  | 🟡 **Biographie** — reprise de la présentation d’auteur du livre (11/09/2026) ; versions DE/EN à relire                                                                                                                                                    | 🟠       | Page À propos                                                          |
| 3.2  | **Parcours professionnel** (chronologie)                                                                                                                                                                                                                   | 🔴       | Page À propos                                                          |
| 3.3  | **Expériences et projets vérifiés** : organisation, rôle, période, pays, contexte, responsabilités                                                                                                                                                         | 🔴       | Expériences. 3 fiches d'exemple à remplacer                            |
| 3.4  | **Résultats validés** (uniquement s'ils sont vérifiables)                                                                                                                                                                                                  | 🟠       | Case « Results verified » d'une expérience                             |
| 3.5  | **Formations et certifications** avec intitulés exacts                                                                                                                                                                                                     | 🔴       | Education & credentials (2 fiches d'exemple)                           |
| 3.6  | **International Expert Profile (PDF)**                                                                                                                                                                                                                     | 🔴       | Active les boutons de téléchargement                                   |
| 3.7  | **International CV 2026 (PDF)**                                                                                                                                                                                                                            | 🟠       | Documents                                                              |
| 3.8  | Niveaux de langue réels (FR / EN / DE)                                                                                                                                                                                                                     | 🟠       | Page À propos (« [Niveau] » aujourd'hui)                               |
| 3.9  | Descriptions validées des 5 activités : RK Business Consulting, RK IMMO-FINANZ, Kenmogne Strategic Publishing, KAILI Institut, KAILI Event ; pour Kenmogne Strategic Publishing, préciser aussi le public visé, le site web et s'il est l'éditeur du livre | 🔴       | Écosystème (textes entre crochets)                                     |
| 3.10 | Relecture des 8 pages d'expertise (FR / DE / EN)                                                                                                                                                                                                           | 🟠       | Les textes livrés décrivent la discipline, pas un historique personnel |

## 4. RK Insights

| #   | Élément                                                        | Priorité |
| --- | -------------------------------------------------------------- | -------- |
| 4.1 | Articles existants à reprendre (texte + images + dates)        | 🟠       |
| 4.2 | Décision : conserver ou supprimer les **3 articles d'exemple** | 🔴       |
| 4.3 | Nom d'auteur à afficher (par défaut « Romial Kenmogne »)       | 🟡       |

## 5. Livres et publications

| #   | Élément                                                                                                                                                  | Priorité                          |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| 5.1 | ✅ Titre, sous-titre, résumé, public, langue, format, ISBN (978-3-9828510-0-6) — reçus le 11/09/2026                                                     | —                                 |
| 5.2 | ✅ Couverture — extraite du fichier d’impression « Book 6x9 new.pdf »                                                                                    | —                                 |
| 5.3 | ✅ Modèle de vente : externe (Amazon), commande directe avec dédicace annoncée « prochainement »                                                         | —                                 |
| 5.4 | ✅ Liens Amazon Allemagne et Amazon France                                                                                                               | —                                 |
| 5.6 | **Prix TTC** du livre (non fourni : le site n’affiche pas de prix, Amazon fait foi) — champ _Prix TTC_ de la fiche livre                                 | 🟡                                |
| 5.7 | Nombre de pages, date de parution, éditeur (Kenmogne Strategic Publishing ?) — champs _Éditeur_, _Date de parution_, _Nombre de pages_ de la fiche livre | 🟡                                |
| 5.8 | Relecture des traductions allemande et anglaise de la fiche livre — sélecteur de langue du contenu en haut de la fiche                                   | 🟠                                |
| 5.5 | Si vente directe : prestataire de paiement, prix TTC, TVA, pays desservis, transporteur, frais, CGV, politique de retour                                 | 🔴 _pour cette option uniquement_ |

> La vente directe **n'est pas activée** : le modèle de données est prêt, mais
> aucun paiement n'est simulé. Son activation est une évolution à chiffrer.

## 6. Coordonnées professionnelles

| #   | Élément                                                    | Priorité |
| --- | ---------------------------------------------------------- | -------- |
| 6.1 | **E-mail professionnel publiable**                         | 🔴       |
| 6.2 | Téléphone professionnel (facultatif)                       | 🟡       |
| 6.3 | **Adresse professionnelle** (obligatoire pour l'Impressum) | 🔴       |
| 6.4 | Adresse de réception des demandes du formulaire            | 🔴       |
| 6.5 | Profils sociaux à afficher (LinkedIn en priorité)          | 🟠       |

## 7. Textes juridiques

| #   | Élément                                                                                                                                     | Priorité |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 7.1 | **Impressum** : dénomination, forme juridique, siège, registre, TVA, responsable de publication                                             | 🔴       |
| 7.2 | **Politique de confidentialité** : responsable de traitement, durée de conservation, prestataire e-mail, adresse pour l'exercice des droits | 🔴       |
| 7.3 | **Politique de cookies** : à compléter selon les outils réellement activés                                                                  | 🔴       |
| 7.4 | **CGV** (si vente) et politique de livraison/retour                                                                                         | 🟠       |
| 7.5 | Validation par un professionnel du droit                                                                                                    | 🔴       |

> Les cinq pages sont livrées comme **trames structurelles** marquées
> « brouillon » : bandeau visible, `noindex`, exclusion du sitemap tant que la
> case n'est pas décochée.

## 8. E-mail et technique

| #   | Élément                                                                                                    | Priorité |
| --- | ---------------------------------------------------------------------------------------------------------- | -------- |
| 8.1 | **Compte SMTP** (hôte, port, identifiants, adresse d'expédition autorisée)                                 | 🔴       |
| 8.2 | Enregistrements SPF / DKIM du domaine                                                                      | 🟠       |
| 8.3 | Choix d'un outil **analytics** respectueux de la vie privée (Umami ou Plausible auto-hébergés recommandés) | 🟡       |
| 8.4 | Décision sur la bannière cookies (inutile tant qu'aucun traceur n'est installé)                            | 🟡       |
| 8.5 | Durée de conservation des demandes de contact                                                              | 🟠       |

## 5 bis. Vente directe des livres

| #    | Élément                                                                                                                                                   | Priorité                               |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 5b.1 | Comptes **Stripe** et/ou **PayPal** au nom du commanditaire, puis clés de test (staging) et live (production)                                             | 🔴 pour ouvrir la vente directe        |
| 5b.2 | **Taux de TVA** à appliquer (régime Kleinunternehmer ou TVA 7 % livres, OSS pour l'UE) — **validation du comptable**                                      | 🔴 pour ouvrir la vente directe        |
| 5b.3 | **Conditions générales de vente** et **politique de livraison et de retours** (droit de rétractation de 14 jours) validées                                | 🔴 pour ouvrir la vente directe        |
| 5b.4 | Prix TTC en EUR et stock disponible du livre ; délai d'expédition annoncé                                                                                 | 🟠                                     |
| 5b.5 | Mentions de la vente directe dans la politique de confidentialité (Stripe, PayPal, conservation des commandes)                                            | 🔴 pour ouvrir la vente directe        |
| 5b.6 | Produits numériques : fichiers définitifs (PDF / EPUB, ressources), contenus et vidéos **non listées** des formations KAILI Institut, prix                | 🟠 pour vendre des produits numériques |
| 5b.7 | CGV complétées pour les contenus numériques (accès immédiat, perte du droit de rétractation) et confidentialité (espace membre, conservation des comptes) | 🔴 pour vendre des produits numériques |

## 8 ter. Google Sheets (facultatif)

| #    | Élément                                                                                                                           | Priorité                    |
| ---- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| 8t.1 | Tableur Google et compte de service (clé JSON) créés par le commanditaire — procédure pas à pas dans `DEPLOIEMENT.md`             | 🟡 pour activer la copie    |
| 8t.2 | Politique de confidentialité : mention de Google comme destinataire des demandes de contact et des adresses des abonnés confirmés | 🔴 avant d’activer la copie |

## 8 bis. Newsletter

| #    | Élément                                                                                                                                           | Priorité                  |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| 8b.1 | Compléter la **politique de confidentialité** : newsletter (finalité, base légale = consentement, conservation, désinscription, fournisseur SMTP) | 🔴 avant le premier envoi |
| 8b.2 | Fournisseur SMTP professionnel + enregistrements **SPF / DKIM / DMARC** du domaine                                                                | 🔴 avant le premier envoi |

## 9. Phase 2 (hors périmètre actuel)

Livrés depuis : carte Europe–Afrique · page Conférences & médias (vidéos) · prise de
rendez-vous · newsletter avec double opt-in · vente directe, espace membres et
produits numériques (e-books, formations KAILI Institut, ressources) — prêts, à
activer avec les clés de paiement. Reste hors périmètre : CRM.

L'architecture est prête à les accueillir sans refonte.

---

## Récapitulatif : le strict minimum pour la mise en ligne

1. Domaine + hébergement + HTTPS (1.1 → 1.3)
2. Parcours, expériences et formations validés (3.2 → 3.5) ; relecture DE/EN de la biographie (3.1)
3. International Expert Profile (3.6)
4. Descriptions des 5 activités (3.9)
5. Coordonnées professionnelles (6.1, 6.3, 6.4)
6. Textes juridiques validés (7.1 → 7.5)
7. Compte SMTP et test d'envoi réel (8.1)
8. Suppression ou remplacement de tous les « Contenus d'exemple »
