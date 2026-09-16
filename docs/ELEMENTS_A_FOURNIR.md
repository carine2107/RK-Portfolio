# Éléments à fournir par le commanditaire

**Mise à jour : 15 septembre 2026.**

Le site est **fonctionnel et déployable en l'état**. Les éléments ci-dessous ne
bloquent pas l'architecture : ils remplacent des contenus explicitement marqués
« Contenu d'exemple » ou activent des fonctions volontairement inactives.

Rien n'a été inventé : aucun client, partenaire, diplôme, mission, résultat,
témoignage ni statistique ne figure sur le site.

Légende : 🔴 bloquant pour la mise en ligne · 🟠 important · 🟡 confort · ✅ reçu ou décidé

**Qui saisit quoi ?** Tous les contenus (textes, traductions, photos, livre,
activités, expériences, formations, documents PDF, coordonnées, pages légales)
se saisissent **directement dans l'administration, à tout moment**, sans
intervention technique : voir [`GUIDE_ADMIN.md`](GUIDE_ADMIN.md). Seuls le domaine, l'hébergement,
le compte d'envoi d'e-mails (SMTP), la mesure d'audience, la copie vers Google
Sheets et les prestataires de paiement demandent une configuration technique
(sections 1, 6, 9, 10 et 11).

Les vérifications techniques du jour de la mise en ligne (HTTPS, secrets,
sauvegardes, supervision…) sont regroupées dans la **checklist de mise en ligne**
de [`DEPLOIEMENT.md`](DEPLOIEMENT.md) (section 13).

---

## 1. Domaine, hébergement, comptes

| #   | Élément                                                                                           | Priorité | Où l'utiliser                           |
| --- | ------------------------------------------------------------------------------------------------- | -------- | --------------------------------------- |
| 1.1 | ✅ **Nom de domaine** : `romialkenmogne.com` (confirmé le 16/09/2026 ; DNS à pointer vers le VPS) | —        | `NEXT_PUBLIC_SITE_URL`, DNS             |
| 1.2 | **Hébergement** (VPS ou plateforme Node avec volume persistant)                                   | 🔴       | Voir [`DEPLOIEMENT.md`](DEPLOIEMENT.md) |
| 1.3 | Certificat HTTPS (Let's Encrypt suffit)                                                           | 🔴       | Reverse proxy                           |
| 1.4 | Compte **Google Search Console**                                                                  | 🟠       | Soumission du sitemap                   |
| 1.5 | Titulaire des comptes (domaine, hébergement, e-mail) **au nom du commanditaire**                  | 🔴       | Propriété et réversibilité              |

## 2. Identité visuelle et médias

| #   | Élément                                                                                         | Priorité | Où l'utiliser                                                                                                                                                       |
| --- | ----------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | ✅ **Photographies professionnelles** — reçues le 11/09/2026 (3 photos)                         | —        | Hero d’accueil (RK.jpeg), page À propos (RK1.jpeg), médiathèque (RK2.jpeg)                                                                                          |
| 2.2 | ✅ **Logo** — choisi le 16/09/2026 : anneau marine et or, R marine et K doré (Playfair Display) | —        | En-tête, pied de page, icônes, image de partage, administration, couvertures PDF (`npm run brand:assets`)                                                           |
| 2.3 | Image de partage social personnalisée 1200 × 630 px (facultatif)                                | 🟡       | Réglages du site → SEO par défaut. Une image par défaut en PNG avec le logo est fournie (`public/og-default.png`) ; une photo ou un visuel propre peut la remplacer |
| 2.4 | Photos d'illustration pour les articles                                                         | 🟡       | Couvertures RK Insights                                                                                                                                             |

## 3. Contenus professionnels

| #    | Élément                                                                                                                                                                                                                                                    | Priorité | Où l'utiliser                                                          |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| 3.1  | **Biographie** — reprise de la présentation d’auteur du livre (11/09/2026) ; versions DE/EN à relire                                                                                                                                                       | 🟠       | Page À propos                                                          |
| 3.2  | **Parcours professionnel** (chronologie)                                                                                                                                                                                                                   | 🔴       | Page À propos                                                          |
| 3.3  | **Expériences et projets vérifiés** : organisation, rôle, période, pays, contexte, responsabilités                                                                                                                                                         | 🔴       | Expériences. 3 fiches d'exemple à remplacer                            |
| 3.4  | **Résultats validés** (uniquement s'ils sont vérifiables)                                                                                                                                                                                                  | 🟠       | Case « Résultats vérifiés » d'une expérience                           |
| 3.5  | **Formations et certifications** avec intitulés exacts                                                                                                                                                                                                     | 🔴       | Formations et qualifications (2 fiches d'exemple)                      |
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

| #   | Élément                                                                                                                                                  | Priorité |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 5.1 | ✅ Titre, sous-titre, résumé, public, langue, format, ISBN (978-3-9828510-0-6) — reçus le 11/09/2026                                                     | —        |
| 5.2 | ✅ Couverture — extraite du fichier d’impression « Book 6x9 new.pdf »                                                                                    | —        |
| 5.3 | ✅ Modèle de vente : externe (Amazon), commande directe avec dédicace annoncée « prochainement »                                                         | —        |
| 5.4 | ✅ Liens Amazon Allemagne et Amazon France                                                                                                               | —        |
| 5.5 | **Prix TTC** du livre (non fourni : le site n’affiche pas de prix, Amazon fait foi) — champ _Prix TTC_ de la fiche livre                                 | 🟡       |
| 5.6 | Nombre de pages, date de parution, éditeur (Kenmogne Strategic Publishing ?) — champs _Éditeur_, _Date de parution_, _Nombre de pages_ de la fiche livre | 🟡       |
| 5.7 | Relecture des traductions allemande et anglaise de la fiche livre — sélecteur de langue du contenu en haut de la fiche                                   | 🟠       |

## 6. Vente directe et produits numériques (facultatif)

La vente directe des livres, l'espace membres et les produits numériques (e-books,
formations KAILI Institut, ressources) sont **construits mais fermés** : aucun paiement
n'est simulé. Ils s'ouvrent quand les éléments ci-dessous sont réunis et que la case
« Ouvrir la vente directe » est cochée dans l'administration.

| #   | Élément                                                                                                                                                   | Priorité                               |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 6.1 | Comptes **Stripe** et/ou **PayPal** au nom du commanditaire, puis clés de test (staging) et live (production)                                             | 🔴 pour ouvrir la vente directe        |
| 6.2 | **Taux de TVA** à appliquer (régime Kleinunternehmer ou TVA 7 % livres, OSS pour l'UE) — **validation du comptable**                                      | 🔴 pour ouvrir la vente directe        |
| 6.3 | **Conditions générales de vente** et **politique de livraison et de retours** (droit de rétractation de 14 jours) validées                                | 🔴 pour ouvrir la vente directe        |
| 6.4 | Prix TTC en EUR et stock disponible du livre ; pays desservis, transporteur et délai d'expédition annoncé                                                 | 🟠                                     |
| 6.5 | Mentions de la vente directe dans la politique de confidentialité (Stripe, PayPal, conservation des commandes)                                            | 🔴 pour ouvrir la vente directe        |
| 6.6 | Produits numériques : fichiers définitifs (PDF / EPUB, ressources), contenus et vidéos **non listées** des formations KAILI Institut, prix                | 🟠 pour vendre des produits numériques |
| 6.7 | CGV complétées pour les contenus numériques (accès immédiat, perte du droit de rétractation) et confidentialité (espace membre, conservation des comptes) | 🔴 pour vendre des produits numériques |

## 7. Coordonnées, rendez-vous et réseaux

| #   | Élément                                                                                             | Priorité |
| --- | --------------------------------------------------------------------------------------------------- | -------- |
| 7.1 | **E-mail professionnel publiable**                                                                  | 🔴       |
| 7.2 | Téléphone professionnel (facultatif)                                                                | 🟡       |
| 7.3 | **Adresse professionnelle** (obligatoire pour l'Impressum)                                          | 🔴       |
| 7.4 | Adresse de réception des demandes du formulaire                                                     | 🔴       |
| 7.5 | Profils sociaux à afficher (LinkedIn en priorité)                                                   | 🟠       |
| 7.6 | Lien de la page de **prise de rendez-vous** (Cal.com, Calendly, Google Agenda, Microsoft Bookings…) | 🟡       |

## 8. Textes juridiques

| #   | Élément                                                                                                                                     | Priorité |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 8.1 | **Impressum** : dénomination, forme juridique, siège, registre, TVA, responsable de publication                                             | 🔴       |
| 8.2 | **Politique de confidentialité** : responsable de traitement, durée de conservation, prestataire e-mail, adresse pour l'exercice des droits | 🔴       |
| 8.3 | **Politique de cookies** : à compléter selon les outils réellement activés                                                                  | 🔴       |
| 8.4 | **CGV** (si vente) et politique de livraison/retour                                                                                         | 🟠       |
| 8.5 | Validation par un professionnel du droit                                                                                                    | 🔴       |

> Les cinq pages sont livrées comme **trames structurelles** marquées
> « brouillon » : bandeau visible, `noindex`, exclusion du sitemap tant que la
> case n'est pas décochée.

## 9. E-mail et mesure d'audience

| #   | Élément                                                                                                                               | Priorité                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 9.1 | **Compte SMTP** (hôte, port, identifiants, adresse d'expédition autorisée)                                                            | 🔴                                  |
| 9.2 | Enregistrements SPF / DKIM / DMARC du domaine                                                                                         | 🟠                                  |
| 9.3 | Choix de l'outil **analytics** : Umami / Plausible (sans cookie) ou **Google Analytics 4** (identifiant `G-…`, compte Google gratuit) | 🟡                                  |
| 9.4 | Si Google Analytics : **politique de cookies et de confidentialité** complétées et validées (la bannière de consentement est fournie) | 🔴 avant d'activer Google Analytics |
| 9.5 | Durée de conservation des demandes de contact (24 mois par défaut)                                                                    | 🟠                                  |

## 10. Newsletter

| #    | Élément                                                                                                                                           | Priorité                  |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| 10.1 | Compléter la **politique de confidentialité** : newsletter (finalité, base légale = consentement, conservation, désinscription, fournisseur SMTP) | 🔴 avant le premier envoi |
| 10.2 | Fournisseur SMTP professionnel + enregistrements **SPF / DKIM / DMARC** du domaine (9.1, 9.2)                                                     | 🔴 avant le premier envoi |

## 11. Google Sheets (facultatif)

| #    | Élément                                                                                                                                 | Priorité                    |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| 11.1 | Tableur Google et compte de service (clé JSON) créés par le commanditaire — procédure pas à pas dans [`DEPLOIEMENT.md`](DEPLOIEMENT.md) | 🟡 pour activer la copie    |
| 11.2 | Politique de confidentialité : mention de Google comme destinataire des demandes de contact et des adresses des abonnés confirmés       | 🔴 avant d’activer la copie |

## 12. Conférences, médias et campagnes (facultatif)

| #    | Élément                                                                                                                     | Priorité |
| ---- | --------------------------------------------------------------------------------------------------------------------------- | -------- |
| 12.1 | Interventions réelles (conférences, interviews, podcasts, presse) avec leurs dates ; vidéos dont la diffusion est autorisée | 🟡       |
| 12.2 | Pages de campagne souhaitées (livre, programme, mission) : textes, visuels et boutons, en trois langues                     | 🟡       |

> Tant qu'aucune intervention n'est publiée, les pages Conférences & médias et
> Médiathèque l'indiquent sobrement. Aucune campagne n'est publiée par défaut.

## 13. Évolutions

Livrées depuis le cahier des charges : carte Europe–Afrique · Conférences & médias et
médiathèque vidéo / podcasts · prise de rendez-vous · qualification des demandes ·
newsletter avec double opt-in · vente directe, espace membres et produits numériques
(fermés tant que les éléments de la section 6 ne sont pas réunis) · pages de campagne ·
export CSV · copie vers Google Sheets · Google Analytics avec consentement · aperçu des
brouillons sur toutes les pages · version allemande.

Reste à décider : **intégration CRM ou outil d'e-mail marketing** (Brevo, HubSpot,
Mailchimp…). L'export CSV permet déjà d'importer les abonnés et les demandes à la main.

---

## Récapitulatif : le strict minimum pour la mise en ligne

1. Domaine + hébergement + HTTPS (1.1 → 1.3) et comptes au nom du commanditaire (1.5)
2. Parcours, expériences et formations validés (3.2, 3.3, 3.5)
3. International Expert Profile (3.6)
4. Descriptions des 5 activités (3.9)
5. Décision sur les 3 articles d'exemple (4.2)
6. Coordonnées professionnelles (7.1, 7.3, 7.4)
7. Textes juridiques validés (8.1 → 8.3, 8.5)
8. Compte SMTP et test d'envoi réel (9.1)
9. Suppression ou remplacement de tous les « Contenus d'exemple »
10. Checklist technique de [`DEPLOIEMENT.md`](DEPLOIEMENT.md) (section 13) cochée le jour de l'ouverture
