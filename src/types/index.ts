// ============================================================================
// 🎵 BeatMarket — Types TypeScript
// ============================================================================

// ---- User Types ----

export type UserRole = 'BUYER' | 'PRODUCER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string | null;
  displayName: string | null;
  avatar: string | null;
  bio: string | null;
  role: UserRole;
  country: string | null;
  city: string | null;
  website: string | null;
  stripeConnectId: string | null;
  stripeOnboardingDone: boolean;
  createdAt: Date;
}

export interface ProducerProfile extends User {
  role: 'PRODUCER';
  tracks: Track[];
  totalSales: number;
  totalEarnings: number;
}

// ---- Track Types ----

export type TrackStatus = 'DRAFT' | 'PROCESSING' | 'PUBLISHED' | 'SOLD_OUT' | 'ARCHIVED';

export type MusicKey =
  | 'C_MAJOR' | 'C_MINOR' | 'C_SHARP_MAJOR' | 'C_SHARP_MINOR'
  | 'D_MAJOR' | 'D_MINOR' | 'D_SHARP_MAJOR' | 'D_SHARP_MINOR'
  | 'E_MAJOR' | 'E_MINOR'
  | 'F_MAJOR' | 'F_MINOR' | 'F_SHARP_MAJOR' | 'F_SHARP_MINOR'
  | 'G_MAJOR' | 'G_MINOR' | 'G_SHARP_MAJOR' | 'G_SHARP_MINOR'
  | 'A_MAJOR' | 'A_MINOR' | 'A_SHARP_MAJOR' | 'A_SHARP_MINOR'
  | 'B_MAJOR' | 'B_MINOR';

export interface Track {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  producerId: string;
  producer?: User;
  bpm: number | null;
  musicKey: MusicKey | null;
  genre: string | null;
  mood: string | null;
  tags: string[];
  duration: number | null;
  coverArt: string | null;
  previewUrl: string | null;
  waveformData: number[] | null;
  priceMp3Lease: number | null;
  priceWavLease: number | null;
  priceUnlimited: number | null;
  priceExclusive: number | null;
  status: TrackStatus;
  isExclusiveSold: boolean;
  playCount: number;
  likeCount: number;
  createdAt: Date;
  publishedAt: Date | null;
}

// ---- License Types ----

export type LicenseType = 'MP3_LEASE' | 'WAV_LEASE' | 'UNLIMITED' | 'EXCLUSIVE';

export interface LicenseTemplate {
  id: string;
  trackId: string;
  type: LicenseType;
  name: string;
  price: number; // centimes EUR
  maxStreams: number | null;
  maxDistributions: number | null;
  maxMusicVideos: number | null;
  maxPerformances: number | null;
  allowProfit: boolean;
  allowRadioBroadcast: boolean;
  isExclusive: boolean;
  includesMp3: boolean;
  includesWav: boolean;
  includesStems: boolean;
  customTerms: string | null;
}

export interface LicenseOption {
  type: LicenseType;
  label: string;
  price: number; // centimes
  features: string[];
}

// ---- Cart Types ----

export interface CartItem {
  id: string;
  trackId: string;
  track: Track;
  licenseType: LicenseType;
  price: number; // centimes
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

// ---- Order Types ----

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  subtotal: number;
  vatAmount: number;
  vatRate: number;
  totalAmount: number;
  platformFee: number;
  buyerCountry: string;
  buyerVatNumber: string | null;
  invoiceNumber: string | null;
  paymentMethod: string | null;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: Date;
  completedAt: Date | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  trackId: string;
  track: Track;
  licenseId: string;
  licenseType: LicenseType;
  price: number;
  producerId: string;
  licensePdfUrl: string | null;
  downloadCount: number;
  maxDownloads: number;
}

// ---- Payout Types ----

export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Payout {
  id: string;
  producerId: string;
  grossAmount: number;
  platformFee: number;
  stripeFee: number;
  netAmount: number;
  periodStart: Date;
  periodEnd: Date;
  status: PayoutStatus;
  createdAt: Date;
  processedAt: Date | null;
}

// ---- Audio Player Types ----

export interface AudioPlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;       // 0-1
  currentTime: number;  // seconds
  duration: number;     // seconds
  isLoading: boolean;
}

// ---- Search & Filter Types ----

export interface SearchFilters {
  query?: string;
  genre?: string;
  mood?: string;
  bpmMin?: number;
  bpmMax?: number;
  key?: MusicKey;
  priceMin?: number;  // centimes
  priceMax?: number;  // centimes
  sortBy?: 'newest' | 'popular' | 'price_asc' | 'price_desc';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  tracks: Track[];
  total: number;
  page: number;
  totalPages: number;
  filters: SearchFilters;
}

// ---- VAT Types ----

export interface VatCalculation {
  country: string;
  vatRate: number;       // ex: 0.20
  subtotal: number;      // centimes HT
  vatAmount: number;     // centimes TVA
  total: number;         // centimes TTC
  isReverseCharge: boolean; // Auto-liquidation B2B intra-EU
}

// ---- API Response Types ----

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ---- Dashboard Stats Types ----

export interface ProducerStats {
  totalTracks: number;
  totalSales: number;
  totalRevenue: number;     // centimes
  pendingPayouts: number;   // centimes
  monthlyRevenue: number;   // centimes
  topTrack: Track | null;
  recentOrders: OrderItem[];
  salesByMonth: {
    month: string;
    revenue: number;
    sales: number;
  }[];
}
