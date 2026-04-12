import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AudioPlayer from '@/components/audio/AudioPlayer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'BeatMarket — Marketplace de Beats & Instrumentales',
    template: '%s | BeatMarket',
  },
  description:
    'Découvrez et achetez des beats et instrumentales de qualité professionnelle. Plateforme européenne pour producteurs et artistes.',
  keywords: [
    'beats',
    'instrumentales',
    'marketplace',
    'producteur',
    'beatmaker',
    'licence musicale',
    'trap',
    'drill',
    'afrobeat',
    'rap',
    'hip-hop',
  ],
  authors: [{ name: 'BeatMarket' }],
  creator: 'BeatMarket',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'BeatMarket — Marketplace de Beats & Instrumentales',
    description:
      'Découvrez et achetez des beats de qualité professionnelle.',
    siteName: 'BeatMarket',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BeatMarket',
    description:
      'Marketplace de beats & instrumentales pour artistes européens.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.className} min-h-screen bg-gray-950 text-white`}>
        {/* Header sera ajouté ici */}
        
        <main className="min-h-screen">
          {children}
        </main>

        {/* Footer sera ajouté ici */}

        {/* Lecteur audio persistant — toujours visible en bas */}
        <AudioPlayer />
      </body>
    </html>
  );
}
