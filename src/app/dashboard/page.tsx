'use client';

import { useState } from 'react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'beats' | 'stats' | 'settings'>('beats');

  return (
    <div className="min-h-screen">
      {/* Header Dashboard */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard Producteur</h1>
            <p className="text-sm text-gray-400 mt-1">Gérez vos beats et vos ventes</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400 border border-green-500/20">
              Abonnement actif — 5€/mois
            </span>
            <a href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
              ← Retour au site
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats rapides */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Beats uploadés', value: '0', icon: '🎵' },
            { label: 'Vues ce mois', value: '0', icon: '👁️' },
            { label: 'Ventes totales', value: '0€', icon: '💰' },
            { label: 'Écoutes', value: '0', icon: '🎧' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-800 mb-8">
          {[
            { id: 'beats' as const, label: '🎵 Mes Beats' },
            { id: 'stats' as const, label: '📊 Statistiques' },
            { id: 'settings' as const, label: '⚙️ Paramètres' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-[1px] ${
                activeTab === tab.id
                  ? 'border-violet-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Mes Beats */}
        {activeTab === 'beats' && (
          <div>
            {/* Upload button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Mes Beats</h2>
              <button className="rounded-xl bg-violet-600 hover:bg-violet-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all">
                + Upload un beat
              </button>
            </div>

            {/* Empty state */}
            <div className="text-center py-20 border border-dashed border-gray-700 rounded-2xl">
              <span className="text-5xl mb-4 block">🎹</span>
              <h3 className="text-xl font-semibold text-white mb-2">
                Aucun beat uploadé
              </h3>
              <p className="text-gray-400 max-w-md mx-auto mb-6">
                Commencez à vendre en uploadant votre premier beat.
                Formats acceptés : MP3, WAV, ZIP (stems).
              </p>
              <button className="rounded-xl bg-violet-600 hover:bg-violet-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all">
                Upload mon premier beat
              </button>
            </div>
          </div>
        )}

        {/* Tab: Stats */}
        {activeTab === 'stats' && (
          <div className="text-center py-20 border border-gray-800 rounded-2xl bg-gray-900/30">
            <span className="text-5xl mb-4 block">📊</span>
            <h3 className="text-xl font-semibold text-white mb-2">Pas encore de données</h3>
            <p className="text-gray-400">Les statistiques apparaîtront dès vos premières ventes.</p>
          </div>
        )}

        {/* Tab: Settings */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-8">
            {/* Profil */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">👤 Profil producteur</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Nom d&apos;artiste</label>
                  <input
                    type="text"
                    placeholder="Votre nom"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Bio</label>
                  <textarea
                    rows={3}
                    placeholder="Parlez de votre style, vos influences..."
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Site web / réseaux</label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/..."
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
                  />
                </div>
                <button className="rounded-lg bg-violet-600 hover:bg-violet-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors">
                  Sauvegarder
                </button>
              </div>
            </div>

            {/* Paiements */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">💰 Paiements</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-700 bg-gray-800">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💳</span>
                    <div>
                      <p className="text-sm font-medium text-white">Stripe Connect</p>
                      <p className="text-xs text-gray-400">Carte bancaire — Paiements automatiques</p>
                    </div>
                  </div>
                  <button className="text-sm text-violet-400 hover:text-violet-300 font-medium">
                    Configurer
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-700 bg-gray-800">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🅿️</span>
                    <div>
                      <p className="text-sm font-medium text-white">PayPal</p>
                      <p className="text-xs text-gray-400">Paiements via email PayPal</p>
                    </div>
                  </div>
                  <button className="text-sm text-violet-400 hover:text-violet-300 font-medium">
                    Configurer
                  </button>
                </div>
              </div>
            </div>

            {/* Abonnement */}
            <div className="rounded-xl border border-violet-500/30 bg-violet-950/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">📋 Abonnement</h3>
              <p className="text-sm text-gray-400 mb-4">Votre abonnement producteur à 5€/mois</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Plan Producteur</p>
                  <p className="text-sm text-green-400">Période d&apos;essai active</p>
                </div>
                <span className="text-2xl font-bold text-white">5€<span className="text-sm text-gray-400 font-normal">/mois</span></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
