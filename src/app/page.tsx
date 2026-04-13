// ============================================================================
// 🎵 BeatMarket — Page d'accueil
// ============================================================================

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-violet-950/50 to-gray-950" />
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Trouvez le{' '}
            <span className="text-gradient">beat parfait</span>
            {' '}pour votre prochain hit
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            La marketplace de beats et instrumentales en Europe.
            Découvrez des productions de qualité professionnelle,
            prêtes à être licensiées.
          </p>
          
          {/* Barre de recherche */}
          <div className="mt-10 flex items-center justify-center gap-x-4">
            <div className="relative flex-1 max-w-xl">
              <input
                type="text"
                placeholder="Rechercher par genre, mood, BPM..."
                className="w-full rounded-xl border border-gray-700 bg-gray-900/80 backdrop-blur px-6 py-4 text-white placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
              <a href="/beats" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-violet-600 hover:bg-violet-500 px-6 py-2 text-sm font-semibold text-white transition-colors">
                Explorer
              </a>
            </div>
          </div>

          {/* Tags populaires */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-gray-400">Genres :</span>
            {['Trap', 'Drill', 'Afrobeat', 'R&B', 'Lo-fi', 'Pop'].map((genre) => (
              <button
                key={genre}
                className="rounded-full bg-gray-800 hover:bg-gray-700 px-4 py-1.5 text-sm text-gray-300 transition-colors"
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Message quand pas encore de beats */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="text-center py-20 border border-gray-800 rounded-2xl bg-gray-900/30">
          <span className="text-5xl mb-4 block">🎵</span>
          <h2 className="text-2xl font-bold text-white mb-3">
            Les premiers beats arrivent bientôt
          </h2>
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            BeatMarket vient de lancer ! Inscrivez-vous en tant que producteur 
            pour être parmi les premiers à vendre vos beats.
          </p>
          <a
            href="/register"
            className="inline-block rounded-xl bg-violet-600 hover:bg-violet-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40"
          >
            Créer mon compte producteur — 5€/mois
          </a>
        </div>
      </section>

      {/* CTA Producteurs */}
      <section className="border-t border-gray-800">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Vous êtes producteur ?
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Rejoignez BeatMarket et vendez vos beats à des artistes en Europe.
            Commission de 15% sur les ventes. Paiements via Stripe ou PayPal.
          </p>
          
          {/* Avantages */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
              <span className="text-2xl">🎹</span>
              <h3 className="mt-3 text-lg font-semibold text-white">Votre page producteur</h3>
              <p className="mt-2 text-sm text-gray-400">
                Page personnalisée avec vos beats, bio et liens. Votre vitrine professionnelle.
              </p>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
              <span className="text-2xl">💰</span>
              <h3 className="mt-3 text-lg font-semibold text-white">Paiements flexibles</h3>
              <p className="mt-2 text-sm text-gray-400">
                Recevez vos revenus via Stripe ou PayPal. Paiements automatiques chaque semaine.
              </p>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
              <span className="text-2xl">📜</span>
              <h3 className="mt-3 text-lg font-semibold text-white">Licences automatiques</h3>
              <p className="mt-2 text-sm text-gray-400">
                Contrats PDF générés automatiquement. MP3, WAV, Unlimited, Exclusive.
              </p>
            </div>
          </div>

          {/* Pricing */}
          <div className="mt-12 rounded-2xl border border-violet-500/30 bg-violet-950/20 p-8 max-w-md mx-auto">
            <p className="text-violet-400 text-sm font-medium uppercase tracking-wider">Abonnement Producteur</p>
            <div className="mt-3 flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold text-white">5€</span>
              <span className="text-gray-400">/mois</span>
            </div>
            <ul className="mt-6 space-y-3 text-left">
              {[
                'Page producteur personnalisée',
                'Upload illimité de beats',
                'Lecteur audio avec waveform',
                'Système de licences configurables',
                'Paiements Stripe + PayPal',
                'Statistiques de ventes',
                'Support prioritaire',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-violet-400">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href="/register"
              className="mt-8 block w-full rounded-xl bg-violet-600 hover:bg-violet-500 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all"
            >
              Commencer maintenant
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
