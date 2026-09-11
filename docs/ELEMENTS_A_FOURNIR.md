# Éléments à fournir par le commanditaire

Le site est **fonctionnel et déployable en l'état**. Les éléments ci-dessous ne
bloquent pas l'architecture : ils remplacent des contenus explicitement marqués
« Contenu d'exemple » ou activent des fonctions volontairement inactives.

Rien n'a été inventé : aucun client, partenaire, diplôme, mission, résultat,
témoignage ni statistique ne figure sur le site.

Légende : 🔴 bloquant pour la mise en ligne · 🟠 important · 🟡 confort

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

| #   | Élément                                                                                | Priorité | Où l'utiliser                                                                                                  |
| --- | -------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| 2.1 | **Photographies professionnelles** (portrait vertical ≥ 1600 × 2000 px, 2–3 variantes) | 🔴       | Hero d'accueil, page À propos. Un emplacement élégant s'affiche en attendant ; **aucun visage n'a été généré** |
| 2.2 | **Logo / monogramme définitif** (SVG ou PNG transparent)                               | 🟠       | En-tête, pied de page, favicon. Un monogramme « RK » sobre est utilisé par défaut                              |
| 2.3 | Image de partage social 1200 × 630 px                                                  | 🟡       | Réglages du site → SEO defaults (une image générique est fournie)                                              |
| 2.4 | Photos d'illustration pour les articles                                                | 🟡       | Couvertures RK Insights                                                                                        |

## 3. Contenus professionnels

| #    | Élément                                                                                                     | Priorité | Où l'utiliser                                                          |
| ---- | ----------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| 3.1  | **Biographie exécutive validée** (FR / DE / EN)                                                             | 🔴       | Page À propos                                                          |
| 3.2  | **Parcours professionnel** (chronologie)                                                                    | 🔴       | Page À propos                                                          |
| 3.3  | **Expériences et projets vérifiés** : organisation, rôle, période, pays, contexte, responsabilités          | 🔴       | Expériences. 3 fiches d'exemple à remplacer                            |
| 3.4  | **Résultats validés** (uniquement s'ils sont vérifiables)                                                   | 🟠       | Case « Results verified » d'une expérience                             |
| 3.5  | **Formations et certifications** avec intitulés exacts                                                      | 🔴       | Education & credentials (2 fiches d'exemple)                           |
| 3.6  | **International Expert Profile (PDF)**                                                                      | 🔴       | Active les boutons de téléchargement                                   |
| 3.7  | **International CV 2026 (PDF)**                                                                             | 🟠       | Documents                                                              |
| 3.8  | Niveaux de langue réels (FR / EN / DE)                                                                      | 🟠       | Page À propos (« [Niveau] » aujourd'hui)                               |
| 3.9  | Descriptions validées des 4 activités : RK Business Consulting, RK IMMO-FINANZ, KAILI Institut, KAILI Event | 🔴       | Écosystème (textes entre crochets)                                     |
| 3.10 | Relecture des 8 pages d'expertise (FR / DE / EN)                                                            | 🟠       | Les textes livrés décrivent la discipline, pas un historique personnel |

## 4. RK Insights

| #   | Élément                                                        | Priorité |
| --- | -------------------------------------------------------------- | -------- |
| 4.1 | Articles existants à reprendre (texte + images + dates)        | 🟠       |
| 4.2 | Décision : conserver ou supprimer les **3 articles d'exemple** | 🔴       |
| 4.3 | Nom d'auteur à afficher (par défaut « Romial Kenmogne »)       | 🟡       |

## 5. Livres et publications

| #   | Élément                                                                                                                  | Priorité                          |
| --- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| 5.1 | Titre, sous-titre, résumé, public, langue, format, ISBN                                                                  | 🟠                                |
| 5.2 | Couverture haute définition                                                                                              | 🟠                                |
| 5.3 | **Modèle de vente retenu** : externe, direct ou hybride                                                                  | 🟠                                |
| 5.4 | Liens d'achat externes (Amazon, éditeur…)                                                                                | 🟠                                |
| 5.5 | Si vente directe : prestataire de paiement, prix TTC, TVA, pays desservis, transporteur, frais, CGV, politique de retour | 🔴 _pour cette option uniquement_ |

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

## 9. Phase 2 (hors périmètre actuel)

Newsletter et double opt-in · prise de rendez-vous en ligne · page
Speaking & Media · vidéos et podcasts · espace membres · produits digitaux ·
formations en ligne KAILI Institut · CRM.

L'architecture est prête à les accueillir sans refonte.

---

## Récapitulatif : le strict minimum pour la mise en ligne

1. Domaine + hébergement + HTTPS (1.1 → 1.3)
2. Photographies professionnelles (2.1)
3. Biographie, parcours, expériences et formations validés (3.1 → 3.5)
4. International Expert Profile (3.6)
5. Descriptions des 4 activités (3.9)
6. Coordonnées professionnelles (6.1, 6.3, 6.4)
7. Textes juridiques validés (7.1 → 7.5)
8. Compte SMTP et test d'envoi réel (8.1)
9. Suppression ou remplacement de tous les « Contenus d'exemple »
