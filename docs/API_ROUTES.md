# 🔌 BeatMarket — Liste des API Routes

## Convention

- Base URL : `/api/v1`
- Format : JSON
- Auth : Bearer token (JWT via NextAuth)
- Pagination : `?page=1&limit=20`
- Erreurs : `{ success: false, error: { code: "ERROR_CODE", message: "..." } }`

---

## 🔐 Authentification

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| `POST` | `/api/auth/register` | Inscription (email + mot de passe) | ❌ |
| `POST` | `/api/auth/login` | Connexion | ❌ |
| `POST` | `/api/auth/logout` | Déconnexion | ✅ |
| `POST` | `/api/auth/forgot-password` | Demande reset mot de passe | ❌ |
| `POST` | `/api/auth/reset-password` | Reset mot de passe avec token | ❌ |
| `GET` | `/api/auth/session` | Info session courante (NextAuth) | ✅ |

---

## 👤 Utilisateurs

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| `GET` | `/api/v1/user/profile` | Profil de l'utilisateur connecté | ✅ |
| `PUT` | `/api/v1/user/profile` | Mettre à jour le profil | ✅ |
| `PUT` | `/api/v1/user/avatar` | Upload avatar (multipart) | ✅ |
| `DELETE` | `/api/v1/user/delete-account` | Supprimer le compte (RGPD) | ✅ |
| `GET` | `/api/v1/user/export-data` | Export données personnelles (RGPD) | ✅ |
| `POST` | `/api/v1/user/upgrade-producer` | Passer en compte producteur | ✅ |

---

## 🎵 Tracks (Beats)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| `GET` | `/api/v1/tracks` | Liste des beats publiés (avec filtres) | ❌ |
| `GET` | `/api/v1/tracks/[slug]` | Détail d'un beat par slug | ❌ |
| `POST` | `/api/v1/tracks` | Créer/uploader un beat | ✅ Producer |
| `PUT` | `/api/v1/tracks/[id]` | Modifier un beat | ✅ Owner |
| `DELETE` | `/api/v1/tracks/[id]` | Supprimer un beat | ✅ Owner |
| `POST` | `/api/v1/tracks/[id]/publish` | Publier un beat (draft → published) | ✅ Owner |
| `POST` | `/api/v1/tracks/[id]/archive` | Archiver un beat | ✅ Owner |
| `POST` | `/api/v1/tracks/[id]/play` | Incrémenter le compteur de lectures | ❌ |

### Filtres disponibles pour `GET /api/v1/tracks`

```
?query=dark trap           # Recherche texte
&genre=Trap                # Genre musical
&mood=Dark                 # Ambiance
&bpmMin=120                # BPM minimum
&bpmMax=160                # BPM maximum
&key=C_MINOR               # Tonalité
&priceMin=1999             # Prix min (centimes)
&priceMax=9999             # Prix max (centimes)
&producerId=clu1234...     # Filtrer par producteur
&sortBy=newest             # newest | popular | price_asc | price_desc
&page=1                    # Pagination
&limit=20                  # Items par page
```

### Réponse type

```json
{
  "success": true,
  "data": [
    {
      "id": "clu1abc...",
      "slug": "dark-trap-beat-midnight",
      "title": "Midnight",
      "producer": {
        "id": "clu2xyz...",
        "displayName": "ProdByAlex",
        "avatar": "https://..."
      },
      "bpm": 140,
      "musicKey": "C_MINOR",
      "genre": "Trap",
      "mood": "Dark",
      "duration": 195,
      "coverArt": "https://...",
      "previewUrl": "https://...",
      "waveformData": [0.2, 0.5, 0.8, ...],
      "priceMp3Lease": 2999,
      "priceWavLease": 4999,
      "priceUnlimited": 9999,
      "priceExclusive": 29999,
      "playCount": 1250,
      "likeCount": 89,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

---

## 🔊 Audio Streaming

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| `GET` | `/api/audio/stream/[trackId]` | Stream audio preview (watermarked) | ❌ |
| `GET` | `/api/audio/download/[orderItemId]` | Télécharger le fichier acheté | ✅ Buyer |

### Logique de streaming
```
GET /api/audio/stream/[trackId]
  → Vérifie que le track existe et est publié
  → Retourne le MP3 preview (watermarked) via streaming
  → Headers: Content-Type: audio/mpeg, Accept-Ranges: bytes
  → Supporte le range request pour le seek
```

### Logique de téléchargement
```
GET /api/audio/download/[orderItemId]
  → Vérifie que l'utilisateur a acheté cette licence
  → Vérifie le nombre de téléchargements restants (max 3)
  → Vérifie la date d'expiration du lien
  → Génère un Signed URL S3 temporaire (5 min)
  → Incrémente le compteur de téléchargements
  → Log l'IP et le user-agent
  → Redirect 302 vers le Signed URL
```

---

## 📜 Licences

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| `GET` | `/api/v1/licenses/[trackId]` | Licences disponibles pour un beat | ❌ |
| `POST` | `/api/v1/licenses` | Créer un template de licence | ✅ Producer |
| `PUT` | `/api/v1/licenses/[id]` | Modifier un template de licence | ✅ Owner |
| `GET` | `/api/v1/licenses/contract/[orderItemId]` | Télécharger le PDF du contrat | ✅ Buyer |

---

## 🛒 Panier

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| `GET` | `/api/v1/cart` | Contenu du panier | ✅ |
| `POST` | `/api/v1/cart` | Ajouter au panier | ✅ |
| `DELETE` | `/api/v1/cart/[itemId]` | Retirer du panier | ✅ |
| `DELETE` | `/api/v1/cart` | Vider le panier | ✅ |

> **Note** : Le panier est aussi géré côté client via Zustand + localStorage
> pour une UX fluide. L'API sert de source de vérité et de sync.

---

## 📦 Commandes (Orders)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| `GET` | `/api/v1/orders` | Liste des commandes de l'utilisateur | ✅ |
| `GET` | `/api/v1/orders/[id]` | Détail d'une commande | ✅ |
| `GET` | `/api/v1/orders/[id]/invoice` | Télécharger la facture PDF | ✅ |

---

## 💳 Checkout & Paiement

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| `POST` | `/api/v1/checkout/create-session` | Créer une session Stripe Checkout | ✅ |
| `POST` | `/api/v1/checkout/calculate-tax` | Calculer la TVA avant paiement | ✅ |
| `GET` | `/api/v1/checkout/success` | Page de confirmation après paiement | ✅ |

### Payload `create-session`

```json
{
  "items": [
    { "trackId": "clu1abc...", "licenseType": "WAV_LEASE" }
  ],
  "buyerCountry": "FR",
  "buyerVatNumber": null
}
```

### Réponse

```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_...",
    "sessionId": "cs_..."
  }
}
```

---

## 🪝 Webhooks

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| `POST` | `/api/webhooks/stripe` | Webhook Stripe (paiement, refund...) | Signature |
| `POST` | `/api/webhooks/paypal` | Webhook PayPal | Signature |

### Événements Stripe traités

| Événement | Action |
|-----------|--------|
| `checkout.session.completed` | Créer l'Order, générer les PDF de licence, envoyer emails |
| `payment_intent.succeeded` | Confirmer le paiement |
| `payment_intent.payment_failed` | Marquer l'order comme FAILED |
| `charge.refunded` | Gérer le remboursement |
| `account.updated` | Mise à jour du statut Stripe Connect du producteur |

---

## 💸 Payouts (Versements aux producteurs)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| `GET` | `/api/v1/payouts` | Liste des versements du producteur | ✅ Producer |
| `GET` | `/api/v1/payouts/[id]` | Détail d'un versement | ✅ Producer |
| `GET` | `/api/v1/payouts/balance` | Solde disponible | ✅ Producer |

---

## 📊 Dashboard Producteur

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| `GET` | `/api/v1/dashboard/stats` | Statistiques globales | ✅ Producer |
| `GET` | `/api/v1/dashboard/sales` | Historique des ventes | ✅ Producer |
| `GET` | `/api/v1/dashboard/analytics` | Données analytiques (plays, views) | ✅ Producer |

### Réponse `stats`

```json
{
  "success": true,
  "data": {
    "totalTracks": 24,
    "totalSales": 156,
    "totalRevenue": 498500,
    "pendingPayouts": 125000,
    "monthlyRevenue": 89500,
    "topTrack": { "id": "...", "title": "Midnight", "sales": 42 },
    "salesByMonth": [
      { "month": "2024-01", "revenue": 45000, "sales": 12 },
      { "month": "2024-02", "revenue": 89500, "sales": 28 }
    ]
  }
}
```

---

## 🔌 Stripe Connect (Onboarding Producteur)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| `POST` | `/api/v1/stripe/connect/create` | Créer un compte Connect | ✅ Producer |
| `POST` | `/api/v1/stripe/connect/onboard` | Générer le lien d'onboarding | ✅ Producer |
| `GET` | `/api/v1/stripe/connect/status` | Vérifier le statut du compte Connect | ✅ Producer |

---

## ❤️ Favoris

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| `GET` | `/api/v1/favorites` | Liste des favoris | ✅ |
| `POST` | `/api/v1/favorites/[trackId]` | Ajouter en favori | ✅ |
| `DELETE` | `/api/v1/favorites/[trackId]` | Retirer des favoris | ✅ |

---

## 🔍 Recherche

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| `GET` | `/api/v1/search` | Recherche globale (tracks + producteurs) | ❌ |
| `GET` | `/api/v1/search/suggestions` | Auto-complétion pour la barre de recherche | ❌ |

---

## 🏪 Pages Producteurs (Profils publics)

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| `GET` | `/api/v1/producers` | Liste des producteurs | ❌ |
| `GET` | `/api/v1/producers/[displayName]` | Profil public d'un producteur | ❌ |
| `GET` | `/api/v1/producers/[displayName]/tracks` | Beats d'un producteur | ❌ |

---

## 📋 Upload de fichiers

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| `POST` | `/api/v1/upload/audio` | Upload fichier audio (MP3/WAV) | ✅ Producer |
| `POST` | `/api/v1/upload/cover` | Upload cover art | ✅ Producer |
| `POST` | `/api/v1/upload/stems` | Upload fichier stems (ZIP) | ✅ Producer |
| `GET` | `/api/v1/upload/presigned-url` | Obtenir un presigned URL pour upload direct S3 | ✅ Producer |

### Flow d'upload optimisé

```
1. Client demande un presigned URL → GET /api/v1/upload/presigned-url
2. Client upload directement vers S3 via le presigned URL
3. Client notifie le backend que l'upload est terminé → POST /api/v1/tracks
4. Backend lance le traitement en arrière-plan :
   - Validation du fichier (format, taille)
   - Extraction des métadonnées (BPM, Key, Duration)
   - Génération de la waveform (peaks JSON)
   - Transcodage MP3 preview + watermark audio
   - Mise à jour du statut du track (PROCESSING → DRAFT)
```
