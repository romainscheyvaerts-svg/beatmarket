# 🗺️ BeatMarket — Roadmap de Développement

## Vue d'ensemble

Développement prévu en **4 phases** sur environ **16-20 semaines** (1 développeur full-stack).

---

## 📋 Phase 1 — Fondations (Semaines 1-4)

### Objectif : Infrastructure de base fonctionnelle

| Tâche | Priorité | Estimation | Status |
|-------|----------|------------|--------|
| Setup projet Next.js 14+ (App Router, TypeScript, Tailwind) | 🔴 Critique | 0.5j | ⬜ |
| Configuration Prisma + PostgreSQL (Supabase) | 🔴 Critique | 1j | ⬜ |
| Schéma de BDD complet + migrations | 🔴 Critique | 1j | ⬜ |
| Authentification (NextAuth v5 + Supabase Auth) | 🔴 Critique | 2j | ⬜ |
| Pages auth : Login, Register, Forgot Password | 🔴 Critique | 1.5j | ⬜ |
| Layout principal (Header, Footer, Sidebar) | 🔴 Critique | 1j | ⬜ |
| Design system avec shadcn/ui (boutons, inputs, cards, modals) | 🟡 Important | 1.5j | ⬜ |
| Configuration S3/Cloudflare R2 pour le stockage | 🔴 Critique | 1j | ⬜ |
| Système de rôles (Buyer / Producer / Admin) | 🔴 Critique | 1j | ⬜ |
| API CRUD Users (profil, avatar, settings) | 🟡 Important | 1j | ⬜ |
| Page profil utilisateur | 🟡 Important | 0.5j | ⬜ |
| Tests unitaires fondations | 🟢 Nice-to-have | 1j | ⬜ |

### Livrables Phase 1 :
- ✅ Utilisateurs peuvent créer un compte et se connecter
- ✅ Distinction des rôles Buyer/Producer
- ✅ Layout responsive de base
- ✅ Base de données opérationnelle

---

## 🎵 Phase 2 — Marketplace Core (Semaines 5-10)

### Objectif : Fonctionnalités cœur de la marketplace

| Tâche | Priorité | Estimation | Status |
|-------|----------|------------|--------|
| **Upload de beats** | | | |
| Système d'upload (presigned URLs + S3) | 🔴 Critique | 2j | ⬜ |
| Processing audio en arrière-plan (transcode, waveform, metadata) | 🔴 Critique | 3j | ⬜ |
| Watermark audio automatique sur les previews | 🔴 Critique | 2j | ⬜ |
| Formulaire création/édition de beat (titre, BPM, key, genre, mood, tags) | 🔴 Critique | 1.5j | ⬜ |
| Upload cover art avec crop/resize | 🟡 Important | 1j | ⬜ |
| | | | |
| **Lecteur Audio** | | | |
| Composant AudioPlayer persistant (Zustand) | 🔴 Critique | 2j | ⬜ |
| Waveform interactive (Canvas / Wavesurfer.js) | 🔴 Critique | 2j | ⬜ |
| Streaming audio sécurisé (API route) | 🔴 Critique | 1j | ⬜ |
| Playlist / queue de lecture | 🟡 Important | 1j | ⬜ |
| Raccourcis clavier (espace = play/pause, etc.) | 🟢 Nice-to-have | 0.5j | ⬜ |
| | | | |
| **Marketplace** | | | |
| Page d'accueil avec beats trending | 🔴 Critique | 1.5j | ⬜ |
| Grille/liste de beats (BeatCard, BeatGrid) | 🔴 Critique | 1.5j | ⬜ |
| Page détail d'un beat (/beat/[slug]) | 🔴 Critique | 1j | ⬜ |
| Moteur de recherche avec filtres (BPM, Key, Genre, Mood) | 🔴 Critique | 2j | ⬜ |
| Système de favoris (❤️) | 🟡 Important | 0.5j | ⬜ |
| Page profil producteur public | 🟡 Important | 1j | ⬜ |
| SEO : Meta tags, sitemap, structured data | 🟡 Important | 1j | ⬜ |
| | | | |
| **Licences** | | | |
| Configuration des templates de licence par beat | 🔴 Critique | 1.5j | ⬜ |
| Affichage comparatif des licences (MP3, WAV, Unlimited, Exclusive) | 🔴 Critique | 1j | ⬜ |
| Génération automatique du PDF de contrat de licence | 🔴 Critique | 2j | ⬜ |

### Livrables Phase 2 :
- ✅ Producteurs peuvent uploader et publier des beats
- ✅ Lecteur audio avec waveform fonctionne sur tout le site
- ✅ Recherche avec filtres avancés
- ✅ Pages marketplace navigables
- ✅ Système de licences configuré

---

## 💳 Phase 3 — Paiement & Commandes (Semaines 11-14)

### Objectif : Monétisation complète

| Tâche | Priorité | Estimation | Status |
|-------|----------|------------|--------|
| **Panier** | | | |
| Cart store (Zustand + localStorage) | 🔴 Critique | 1j | ⬜ |
| Cart drawer / sidebar | 🔴 Critique | 1j | ⬜ |
| Sélection de licence dans le panier | 🔴 Critique | 0.5j | ⬜ |
| | | | |
| **Paiement** | | | |
| Intégration Stripe Checkout | 🔴 Critique | 2j | ⬜ |
| Stripe Connect onboarding pour les producteurs | 🔴 Critique | 2j | ⬜ |
| Calcul TVA automatique (moteur EU VAT) | 🔴 Critique | 1.5j | ⬜ |
| Stripe Tax intégration | 🟡 Important | 1j | ⬜ |
| Webhook Stripe (payment succeeded, failed, refund) | 🔴 Critique | 2j | ⬜ |
| Intégration PayPal (optionnel, phase suivante) | 🟢 Nice-to-have | 2j | ⬜ |
| | | | |
| **Commandes** | | | |
| Création automatique des commandes après paiement | 🔴 Critique | 1j | ⬜ |
| Page "Mes achats" (liste des commandes) | 🔴 Critique | 1j | ⬜ |
| Téléchargement sécurisé (signed URLs, limite 3 DL) | 🔴 Critique | 1.5j | ⬜ |
| Envoi email acheteur (confirmation + liens) | 🔴 Critique | 1j | ⬜ |
| Envoi email vendeur (notification de vente) | 🟡 Important | 0.5j | ⬜ |
| Facturation automatique (PDF conforme EU) | 🔴 Critique | 2j | ⬜ |
| | | | |
| **Payouts** | | | |
| Calcul des commissions plateforme (15%) | 🔴 Critique | 0.5j | ⬜ |
| Stripe Connect transfers automatiques | 🔴 Critique | 1.5j | ⬜ |
| Page "Mes revenus" pour les producteurs | 🔴 Critique | 1j | ⬜ |
| Historique des payouts | 🟡 Important | 0.5j | ⬜ |

### Livrables Phase 3 :
- ✅ Acheteurs peuvent acheter des beats via Stripe
- ✅ TVA calculée automatiquement selon le pays
- ✅ Factures conformes aux normes EU
- ✅ Producteurs reçoivent leurs revenus automatiquement
- ✅ Emails transactionnels fonctionnels

---

## 🏗️ Phase 4 — Dashboard, RGPD & Polish (Semaines 15-18)

### Objectif : Dashboard producteur complet, conformité légale, optimisation

| Tâche | Priorité | Estimation | Status |
|-------|----------|------------|--------|
| **Dashboard Producteur** | | | |
| Page Dashboard (vue d'ensemble, stats) | 🔴 Critique | 1.5j | ⬜ |
| Graphiques de ventes (chart.js / recharts) | 🟡 Important | 1j | ⬜ |
| Gestion des tracks (liste, edit, delete, publish) | 🔴 Critique | 1j | ⬜ |
| Page analytiques (plays, views par track) | 🟡 Important | 1j | ⬜ |
| Settings producteur (Stripe Connect, profil public) | 🟡 Important | 1j | ⬜ |
| | | | |
| **RGPD & Légal** | | | |
| Banner cookie (consentement opt-in) | 🔴 Critique | 1j | ⬜ |
| Page Politique de confidentialité | 🔴 Critique | 0.5j | ⬜ |
| Page CGU / CGV | 🔴 Critique | 0.5j | ⬜ |
| Droit à l'oubli (suppression de compte + données) | 🔴 Critique | 1j | ⬜ |
| Export données personnelles (RGPD) | 🟡 Important | 1j | ⬜ |
| Mentions légales | 🔴 Critique | 0.5j | ⬜ |
| | | | |
| **Optimisation & Polish** | | | |
| Performance : Optimisation images (Next/Image), lazy loading | 🟡 Important | 1j | ⬜ |
| Performance : Mise en cache Redis (tracks populaires, recherche) | 🟡 Important | 1j | ⬜ |
| SEO avancé : Sitemap dynamique, robots.txt, OG images | 🟡 Important | 1j | ⬜ |
| Responsive design : Vérification mobile/tablet | 🔴 Critique | 1.5j | ⬜ |
| Monitoring : Sentry + Vercel Analytics | 🟡 Important | 0.5j | ⬜ |
| Tests E2E (Playwright) pour les flows critiques | 🟡 Important | 2j | ⬜ |
| Rate limiting sur les API publiques | 🟡 Important | 0.5j | ⬜ |
| Accessibilité (a11y) : ARIA labels, navigation clavier | 🟢 Nice-to-have | 1j | ⬜ |

### Livrables Phase 4 :
- ✅ Dashboard producteur complet avec analytics
- ✅ Conformité RGPD totale
- ✅ Site optimisé et performant
- ✅ Tests sur les parcours critiques

---

## 🚀 Phase 5 — Lancement & Post-launch (Semaines 19-20+)

### Objectif : Mise en production et itérations

| Tâche | Priorité | Estimation | Status |
|-------|----------|------------|--------|
| Déploiement Vercel (production) | 🔴 Critique | 0.5j | ⬜ |
| Configuration domaine + SSL | 🔴 Critique | 0.5j | ⬜ |
| Configuration Stripe en mode live | 🔴 Critique | 0.5j | ⬜ |
| Seed database avec données de test | 🟡 Important | 0.5j | ⬜ |
| Tests de charge / stress testing | 🟡 Important | 1j | ⬜ |
| Documentation utilisateur (onboarding producteurs) | 🟡 Important | 1j | ⬜ |
| Beta testing avec 5-10 producteurs | 🔴 Critique | 5j | ⬜ |
| Corrections bugs beta | 🔴 Critique | 3j | ⬜ |
| Lancement public 🎉 | 🔴 Critique | - | ⬜ |

---

## 📈 Fonctionnalités Futures (Backlog V2)

| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| **Système d'abonnement** | Plans mensuels pour les producteurs (plus de stockage, stats avancées) | 🟡 |
| **Collaboration** | Système de splits entre co-producteurs | 🟡 |
| **Messagerie** | Chat intégré entre artistes et producteurs | 🟢 |
| **Promotions** | Codes promo, soldes, bundles | 🟡 |
| **App mobile** | Version React Native ou PWA avancée | 🟢 |
| **API publique** | API pour intégrer les beats sur des sites externes | 🟢 |
| **Programme d'affiliation** | Commission pour les apporteurs de clients | 🟢 |
| **Système de notation/avis** | Avis vérifiés des acheteurs | 🟡 |
| **Collections/Playlists** | Producteurs créent des playlists thématiques | 🟡 |
| **Multi-langue** | Interface en EN, FR, NL | 🟡 |
| **Sound kits** | Vente de packs de samples en plus des beats | 🟢 |
| **Enchères exclusives** | Système d'enchères pour les beats exclusifs | 🟢 |
| **Système de drops** | Calendrier de sorties programmées | 🟢 |
| **Intégration YouTube** | Preview vidéo des beats | 🟢 |
| **Multi-devise** | Support EUR, USD, GBP | 🟡 |

---

## 📊 Métriques de succès (KPIs)

| Métrique | Objectif Mois 1 | Objectif Mois 6 |
|----------|-----------------|-----------------|
| Producteurs inscrits | 20 | 200 |
| Beats publiés | 100 | 2 000 |
| Acheteurs actifs | 50 | 500 |
| Volume de ventes mensuel | 2 000€ | 20 000€ |
| Taux de conversion (visite → achat) | 1% | 3% |
| NPS (Net Promoter Score) | > 40 | > 60 |

---

## 💡 Estimation budgétaire mensuelle (Production)

| Service | Coût estimé |
|---------|------------|
| Vercel Pro | 20€/mois |
| Supabase Pro | 25€/mois |
| Cloudflare R2 (stockage) | ~5-20€/mois (selon volume) |
| Upstash Redis | 0€ (free tier) → 10€/mois |
| Resend (emails) | 0€ (free tier) → 20€/mois |
| Sentry | 0€ (free tier) → 26€/mois |
| Domaine | ~15€/an |
| **Total (démarrage)** | **~50-80€/mois** |
| **Total (croissance)** | **~100-200€/mois** |

> Les frais Stripe (1.4% + 0.25€ par transaction EU) sont prélevés sur chaque vente.
