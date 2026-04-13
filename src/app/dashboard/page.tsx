'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SessionUser {
  id: string;
  email: string;
  displayName: string | null;
  name: string | null;
  role: string;
  subscriptionStatus: string | null;
}

interface Track {
  id: string;
  title: string;
  genre: string | null;
  bpm: number | null;
  status: string;
  playCount: number;
  priceMp3Lease: number | null;
  createdAt: string;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'beats' | 'stats' | 'settings'>('beats');
  const [user, setUser] = useState<SessionUser | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(true);
  const router = useRouter();

  // Settings state
  const [settingsName, setSettingsName] = useState('');
  const [settingsMsg, setSettingsMsg] = useState('');
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [showPaypal, setShowPaypal] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalSaving, setPaypalSaving] = useState(false);
  const [showStripeInfo, setShowStripeInfo] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.user) {
          router.push('/login');
          return;
        }
        setUser(data.user);
      })
      .catch(() => router.push('/login'));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/tracks/mine')
      .then((r) => (r.ok ? r.json() : { tracks: [] }))
      .then((data) => setTracks(data.tracks ?? []))
      .catch(() => setTracks([]))
      .finally(() => setLoadingTracks(false));
  }, [user]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  const subscriptionLabel =
    user?.subscriptionStatus === 'trialing'
      ? 'Période d\'essai'
      : user?.subscriptionStatus === 'active'
      ? 'Abonnement actif'
      : 'Inactif';

  const subscriptionColor =
    user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'trialing'
      ? 'bg-green-500/10 text-green-400 border-green-500/20'
      : 'bg-red-500/10 text-red-400 border-red-500/20';

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header Dashboard */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Bonjour, {user.displayName || user.name || 'Producteur'} 👋
            </h1>
            <p className="text-sm text-gray-400 mt-1">Gérez vos beats et vos ventes</p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${subscriptionColor}`}>
              {subscriptionLabel} — 5€/mois
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              ↩ Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats rapides */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Beats uploadés', value: String(tracks.length), icon: '🎵' },
            { label: 'Vues ce mois', value: '0', icon: '👁️' },
            { label: 'Ventes totales', value: '0€', icon: '💰' },
            {
              label: 'Écoutes',
              value: String(tracks.reduce((sum, t) => sum + t.playCount, 0)),
              icon: '🎧',
            },
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Mes Beats</h2>
              <a
                href="/dashboard/upload"
                className="rounded-xl bg-violet-600 hover:bg-violet-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all"
              >
                + Upload un beat
              </a>
            </div>

            {loadingTracks ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : tracks.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-gray-700 rounded-2xl">
                <span className="text-5xl mb-4 block">🎹</span>
                <h3 className="text-xl font-semibold text-white mb-2">Aucun beat uploadé</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                  Commencez à vendre en uploadant votre premier beat. Formats acceptés : MP3, WAV, ZIP (stems).
                </p>
                <a
                  href="/dashboard/upload"
                  className="inline-block rounded-xl bg-violet-600 hover:bg-violet-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all"
                >
                  Upload mon premier beat
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/50 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center">
                        <span>🎵</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{track.title}</p>
                        <p className="text-xs text-gray-400">
                          {track.genre ?? 'Sans genre'} · {track.bpm ? `${track.bpm} BPM` : '–'} · {track.playCount} écoutes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        track.status === 'PUBLISHED'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {track.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                      </span>
                      {track.priceMp3Lease && (
                        <span className="text-violet-400 text-sm font-medium">
                          {(track.priceMp3Lease / 100).toFixed(2)}€
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              {settingsMsg && (
                <div className={`mb-4 rounded-lg p-3 text-sm ${settingsMsg.includes('✅') ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                  {settingsMsg}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Nom d&apos;artiste</label>
                  <input
                    type="text"
                    value={settingsName || user.displayName || user.name || ''}
                    onChange={e => setSettingsName(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    disabled
                    className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-gray-400 cursor-not-allowed"
                  />
                </div>
                <button
                  disabled={settingsSaving}
                  onClick={async () => {
                    setSettingsSaving(true); setSettingsMsg('');
                    try {
                      const res = await fetch('/api/auth/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ displayName: settingsName || user.displayName }) });
                      const data = await res.json();
                      if (res.ok) { setSettingsMsg('✅ Profil mis à jour !'); setUser({ ...user, displayName: data.user.displayName }); }
                      else setSettingsMsg(data.error?.message || 'Erreur');
                    } catch { setSettingsMsg('Erreur de connexion'); }
                    finally { setSettingsSaving(false); }
                  }}
                  className="rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors"
                >
                  {settingsSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>

            {/* Paiements */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">💰 Paiements</h3>
              <div className="space-y-4">
                {/* Stripe Connect */}
                <div className="p-4 rounded-lg border border-gray-700 bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">💳</span>
                      <div>
                        <p className="text-sm font-medium text-white">Stripe Connect</p>
                        <p className="text-xs text-gray-400">Carte bancaire — Paiements automatiques</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowStripeInfo(!showStripeInfo)}
                      className="text-sm text-violet-400 hover:text-violet-300 font-medium"
                    >
                      {showStripeInfo ? 'Fermer' : 'Configurer'}
                    </button>
                  </div>
                  {showStripeInfo && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-4">
                        <p className="text-sm text-violet-300 mb-2 font-medium">🔗 Stripe Connect</p>
                        <p className="text-xs text-gray-400 mb-3">
                          Stripe Connect permet de recevoir automatiquement vos paiements de ventes de beats directement sur votre compte bancaire.
                          La configuration sera finalisée lors de la mise en production.
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                            ⏳ Bientôt disponible
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* PayPal */}
                <div className="p-4 rounded-lg border border-gray-700 bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🅿️</span>
                      <div>
                        <p className="text-sm font-medium text-white">PayPal</p>
                        <p className="text-xs text-gray-400">
                          {paypalEmail ? `Configuré : ${paypalEmail}` : 'Paiements via email PayPal'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPaypal(!showPaypal)}
                      className="text-sm text-violet-400 hover:text-violet-300 font-medium"
                    >
                      {showPaypal ? 'Fermer' : paypalEmail ? 'Modifier' : 'Configurer'}
                    </button>
                  </div>
                  {showPaypal && (
                    <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Adresse email PayPal</label>
                        <input
                          type="email"
                          value={paypalEmail}
                          onChange={e => setPaypalEmail(e.target.value)}
                          placeholder="votre@email-paypal.com"
                          className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
                        />
                      </div>
                      <button
                        disabled={paypalSaving}
                        onClick={async () => {
                          setPaypalSaving(true);
                          try {
                            const res = await fetch('/api/auth/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paypalEmail, paypalPayoutPreferred: true }) });
                            const data = await res.json();
                            if (res.ok) { setSettingsMsg('✅ PayPal configuré !'); setShowPaypal(false); }
                            else setSettingsMsg(data.error?.message || 'Erreur');
                          } catch { setSettingsMsg('Erreur de connexion'); }
                          finally { setPaypalSaving(false); }
                        }}
                        className="rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 px-5 py-2 text-sm font-semibold text-white transition-colors"
                      >
                        {paypalSaving ? 'Sauvegarde...' : '✅ Enregistrer PayPal'}
                      </button>
                    </div>
                  )}
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
                  <p className={`text-sm ${subscriptionColor.includes('green') ? 'text-green-400' : 'text-red-400'}`}>
                    {subscriptionLabel}
                  </p>
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
