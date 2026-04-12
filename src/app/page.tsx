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
            La marketplace #1 de beats et instrumentales en Europe.
            Des milliers de productions de qualité professionnelle,
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
              <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-violet-600 hover:bg-violet-500 px-6 py-2 text-sm font-semibold text-white transition-colors">
                Rechercher
              </button>
            </div>
          </div>

          {/* Tags populaires */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-gray-400">Populaire :</span>
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

      {/* Stats */}
      <section className="border-t border-gray-800 bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { label: 'Beats disponibles', value: '10 000+' },
              { label: 'Producteurs', value: '500+' },
              { label: 'Artistes satisfaits', value: '2 000+' },
              { label: 'Pays couverts', value: '27 EU' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-violet-400">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section beats trending — placeholder */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">🔥 Beats Trending</h2>
          <a href="/beats" className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors">
            Voir tout →
          </a>
        </div>
        
        {/* Grille placeholder pour les beats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="group rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 overflow-hidden transition-all hover:shadow-lg hover:shadow-violet-500/5"
            >
              {/* Cover art placeholder */}
              <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <span className="text-4xl opacity-20">🎵</span>
              </div>
              {/* Info */}
              <div className="p-4">
                <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-800 rounded w-1/2 mb-3" />
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-gray-800 rounded w-16" />
                  <div className="h-8 bg-violet-600/20 rounded-lg w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Producteurs */}
      <section className="border-t border-gray-800">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Vous êtes producteur ?
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Rejoignez BeatMarket et vendez vos beats à des milliers d&apos;artistes en Europe.
            Commission compétitive de 15%, paiements automatiques via Stripe.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <a
              href="/register?role=producer"
              className="rounded-xl bg-violet-600 hover:bg-violet-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40"
            >
              Créer mon compte producteur
            </a>
            <a
              href="/about"
              className="rounded-xl border border-gray-700 hover:border-gray-600 px-8 py-3 text-sm font-semibold text-gray-300 transition-colors"
            >
              En savoir plus
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
