# 🎵 BeatMarket — Architecture Technique Globale

## Vue d'ensemble

BeatMarket est une marketplace SaaS multi-vendeurs de beats/instrumentales, optimisée pour le marché européen (France, Belgique). Elle permet aux producteurs de créer leur boutique, uploader et vendre leurs beats à des artistes.

---

## 🏗️ Architecture Système

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Next.js 14+)                         │
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────────┐ │
│  │  Pages    │  │ Audio Player │  │ Dashboard  │  │  Checkout    │ │
│  │  (SSR)    │  │ (Persistent) │  │ Producteur │  │  (Stripe)    │ │
│  └──────────┘  └──────────────┘  └────────────┘  └──────────────┘ │
│                    Wavesurfer.js      React Query    Zustand        │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ HTTPS / REST + WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     BACKEND (Next.js API Routes)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────────┐ │
│  │ Auth (NextAuth│  │  API Routes  │  │   Webhooks (Stripe,      │ │
│  │ + Supabase)  │  │  /api/v1/*   │  │   PayPal)                │ │
│  └──────────────┘  └──────────────┘  └───────────────────────────┘ │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────────┐ │
│  │ PDF Generator│  │  VAT Engine  │  │   Commission Calculator   │ │
│  │ (License)    │  │  (EU)        │  │                           │ │
│  └──────────────┘  └──────────────┘  └───────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
              ┌────────────┼────────────────┐
              ▼            ▼                ▼
┌──────────────────┐ ┌──────────┐  ┌──────────────────┐
│  PostgreSQL      │ │  Redis   │  │  AWS S3 / R2     │
│  (Supabase)      │ │  (Cache) │  │  (Audio Storage) │
│                  │ │          │  │                  │
│  • Users         │ │  • Cart  │  │  • WAV files     │
│  • Tracks        │ │  • Queue │  │  • MP3 previews  │
│  • Orders        │ │  • Rate  │  │  • Stems         │
│  • Licenses      │ │    Limit │  │  • Cover arts    │
│  • Payouts       │ │          │  │                  │
└──────────────────┘ └──────────┘  └──────────────────┘
```

---

## 🛠️ Stack Technique

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| **Frontend** | Next.js 14+ (App Router) | SSR/SSG, SEO optimal, performance |
| **UI** | Tailwind CSS + shadcn/ui | Design system cohérent, rapide à itérer |
| **State** | Zustand | Léger, parfait pour le player audio persistant |
| **Audio** | Wavesurfer.js | Waveform interactive, streaming audio |
| **Auth** | NextAuth.js v5 + Supabase Auth | OAuth (Google, GitHub), magic link, session JWT |
| **Base de données** | PostgreSQL (Supabase) | Relationnel, RLS, temps réel |
| **ORM** | Prisma | Typage fort, migrations, introspection |
| **Cache** | Redis (Upstash) | Cart sessions, rate limiting, cache |
| **Stockage fichiers** | AWS S3 / Cloudflare R2 | Stockage sécurisé, signed URLs, CDN |
| **Paiement** | Stripe Connect + PayPal | Marketplace split payments, EU compliant |
| **TVA** | Stripe Tax | Calcul automatique TVA EU |
| **PDF** | @react-pdf/renderer | Génération de contrats de licence |
| **Email** | Resend + React Email | Emails transactionnels |
| **Monitoring** | Sentry + Vercel Analytics | Error tracking, performance |
| **Déploiement** | Vercel | Edge functions, auto-scaling |

---

## 🔐 Sécurité Audio (Anti-piratage)

### Stratégie de protection des fichiers

```
Upload du producteur
        │
        ▼
┌─────────────────┐
│  Processing Job  │
│  (Background)    │
│                  │
│  1. Validation   │
│  2. Transcode    │ ──► MP3 128kbps (Preview avec watermark audio)
│  3. Waveform     │ ──► JSON peaks data
│  4. Metadata     │ ──► BPM, Key, Duration extraction
│  5. Storage      │ ──► S3 (fichier original chiffré)
└─────────────────┘

Téléchargement après achat :
  → Signed URL temporaire (expire en 5 min)
  → Limité à 3 téléchargements
  → IP logging
```

### Points clés :
- **Preview** : MP3 128kbps avec watermark audio ("Tag" du producteur)
- **Fichiers vendus** : Servis via Signed URLs S3 (expiration courte)
- **Pas de lien direct** vers les fichiers originaux
- **Streaming** via API route avec authentification

---

## 🇪🇺 Conformité RGPD

| Exigence | Implémentation |
|----------|----------------|
| Consentement cookies | Banner cookie (opt-in, pas opt-out) avec catégories |
| Droit à l'oubli | API `/api/v1/user/delete-account` + suppression cascade |
| Portabilité données | Export JSON/CSV des données utilisateur |
| DPO | Page légale + email de contact DPO |
| Stockage données | Serveurs EU (Supabase EU region / AWS eu-west) |
| Durée conservation | Politique de rétention documentée |
| Sous-traitants | Liste publique des sous-traitants (Stripe, Vercel, etc.) |

---

## 💰 Flux de Paiement

```
Acheteur (Artiste)
        │
        │  1. Ajout au panier
        │  2. Checkout
        ▼
┌─────────────────────┐
│    Stripe Checkout   │
│                      │
│  • Calcul TVA auto   │──► Stripe Tax (FR 20%, BE 21%, etc.)
│  • Paiement sécurisé │
│  • 3D Secure         │
└─────────┬───────────┘
          │
          │  Webhook: payment_intent.succeeded
          ▼
┌─────────────────────┐
│    Traitement        │
│                      │
│  1. Créer Order      │
│  2. Générer PDF      │──► Contrat de licence
│  3. Email acheteur   │──► Liens de téléchargement
│  4. Email vendeur    │──► Notification de vente
│  5. Calcul commission│
│  6. Payout queue     │──► Stripe Connect Transfer
└─────────────────────┘

Commission plateforme : 15% (configurable)
Payout producteur : 85% - frais Stripe
Fréquence payout : Hebdomadaire (seuil minimum 50€)
```

---

## 📁 Structure du Projet

```
beatmarket/
├── docs/                          # Documentation
├── prisma/
│   └── schema.prisma              # Schéma BDD
├── public/
│   └── assets/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/                # Routes authentification
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (marketplace)/         # Routes publiques
│   │   │   ├── beats/
│   │   │   ├── producers/
│   │   │   └── beat/[slug]/
│   │   ├── (dashboard)/           # Dashboard producteur
│   │   │   ├── dashboard/
│   │   │   ├── dashboard/tracks/
│   │   │   ├── dashboard/sales/
│   │   │   ├── dashboard/payouts/
│   │   │   └── dashboard/settings/
│   │   ├── checkout/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── tracks/
│   │   │   │   ├── orders/
│   │   │   │   ├── licenses/
│   │   │   │   ├── payouts/
│   │   │   │   ├── search/
│   │   │   │   └── user/
│   │   │   ├── webhooks/
│   │   │   │   ├── stripe/
│   │   │   │   └── paypal/
│   │   │   └── audio/
│   │   │       └── stream/[trackId]/
│   │   ├── layout.tsx             # Layout racine + AudioPlayer persistant
│   │   └── page.tsx               # Page d'accueil
│   ├── components/
│   │   ├── audio/
│   │   │   ├── AudioPlayer.tsx    # Lecteur audio persistant
│   │   │   ├── WaveformDisplay.tsx
│   │   │   ├── PlayerControls.tsx
│   │   │   └── VolumeControl.tsx
│   │   ├── beats/
│   │   │   ├── BeatCard.tsx
│   │   │   ├── BeatGrid.tsx
│   │   │   └── BeatFilters.tsx
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx
│   │   │   └── CartItem.tsx
│   │   ├── dashboard/
│   │   │   ├── StatsCards.tsx
│   │   │   ├── SalesChart.tsx
│   │   │   └── TrackManager.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   └── ui/                    # shadcn/ui components
│   ├── hooks/
│   │   ├── useAudioPlayer.ts
│   │   ├── useCart.ts
│   │   └── useSearch.ts
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── stripe.ts
│   │   ├── s3.ts
│   │   ├── vat.ts                 # Calcul TVA EU
│   │   ├── license-pdf.ts        # Génération PDF licence
│   │   ├── audio-processing.ts
│   │   └── utils.ts
│   ├── store/
│   │   ├── audioStore.ts          # Zustand store audio
│   │   └── cartStore.ts           # Zustand store panier
│   └── types/
│       └── index.ts
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🔑 Variables d'environnement requises

```env
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# PayPal
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=

# AWS S3 / Cloudflare R2
S3_BUCKET_NAME=
S3_REGION=eu-west-3
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_ENDPOINT=

# Redis
REDIS_URL=

# Resend (Email)
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
PLATFORM_COMMISSION_RATE=0.15
```
