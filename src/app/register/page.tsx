'use client';

import { useState } from 'react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    paypalEmail: '',
    paymentMethod: 'stripe' as 'stripe' | 'paypal',
    acceptTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (!formData.acceptTerms) {
      setError('Vous devez accepter les conditions d\'utilisation');
      return;
    }

    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: formData.displayName,
          email: formData.email,
          password: formData.password,
          role: 'PRODUCER',
          paypalEmail: formData.paymentMethod === 'paypal' ? formData.paypalEmail : undefined,
          paypalPayoutPreferred: formData.paymentMethod === 'paypal',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || 'Erreur lors de l\'inscription');
        return;
      }

      // Rediriger vers le dashboard après inscription
      window.location.href = '/dashboard';
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-bold text-gradient">BeatMarket</a>
          <h1 className="mt-6 text-3xl font-bold text-white">
            Créer un compte producteur
          </h1>
          <p className="mt-2 text-gray-400">
            Abonnement à 5€/mois — Annulable à tout moment
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5 bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Nom d'artiste */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Nom d&apos;artiste / producteur *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: ProdByAlex"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <p className="mt-1 text-xs text-gray-500">Ce sera l&apos;URL de votre page : beatmarket.com/{formData.displayName.toLowerCase().replace(/\s+/g, '-') || 'votre-nom'}</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Email *
            </label>
            <input
              type="email"
              required
              placeholder="votre@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          {/* Mot de passe */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Mot de passe *
              </label>
              <input
                type="password"
                required
                placeholder="Min. 8 caractères"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Confirmer *
              </label>
              <input
                type="password"
                required
                placeholder="Répéter le mot de passe"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Méthode de paiement */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Comment souhaitez-vous recevoir vos paiements ? *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: 'stripe' })}
                className={`p-4 rounded-lg border text-center transition-all ${
                  formData.paymentMethod === 'stripe'
                    ? 'border-violet-500 bg-violet-500/10 text-white'
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                }`}
              >
                <span className="text-xl block mb-1">💳</span>
                <span className="text-sm font-medium">Stripe</span>
                <span className="block text-xs text-gray-500 mt-0.5">Carte bancaire</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: 'paypal' })}
                className={`p-4 rounded-lg border text-center transition-all ${
                  formData.paymentMethod === 'paypal'
                    ? 'border-violet-500 bg-violet-500/10 text-white'
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                }`}
              >
                <span className="text-xl block mb-1">🅿️</span>
                <span className="text-sm font-medium">PayPal</span>
                <span className="block text-xs text-gray-500 mt-0.5">Email PayPal</span>
              </button>
            </div>
          </div>

          {/* Email PayPal si sélectionné */}
          {formData.paymentMethod === 'paypal' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Email PayPal *
              </label>
              <input
                type="email"
                required
                placeholder="votre@paypal.com"
                value={formData.paypalEmail}
                onChange={(e) => setFormData({ ...formData, paypalEmail: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          )}

          {/* CGU */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={formData.acceptTerms}
              onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
              className="mt-1 rounded border-gray-700 bg-gray-800 text-violet-500 focus:ring-violet-500"
            />
            <label htmlFor="terms" className="text-sm text-gray-400">
              J&apos;accepte les{' '}
              <a href="/terms" className="text-violet-400 hover:underline">conditions d&apos;utilisation</a>
              {' '}et la{' '}
              <a href="/privacy" className="text-violet-400 hover:underline">politique de confidentialité</a>.
              Je comprends que l&apos;abonnement de 5€/mois sera facturé après la période d&apos;essai.
            </label>
          </div>

          {/* Bouton submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:cursor-not-allowed py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all"
          >
            {loading ? 'Création en cours...' : 'Créer mon compte — 5€/mois'}
          </button>

          {/* Lien login */}
          <p className="text-center text-sm text-gray-400">
            Déjà un compte ?{' '}
            <a href="/login" className="text-violet-400 hover:underline font-medium">
              Se connecter
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
