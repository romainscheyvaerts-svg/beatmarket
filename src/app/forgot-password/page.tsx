'use client';

import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || 'Une erreur est survenue');
        return;
      }

      setSent(true);
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-bold text-gradient">BeatMarket</a>
          <h1 className="mt-6 text-3xl font-bold text-white">Mot de passe oublié</h1>
          <p className="mt-2 text-gray-400">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {sent ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">📧</div>
            <h2 className="text-xl font-semibold text-white mb-3">Email envoyé !</h2>
            <p className="text-gray-400 text-sm mb-6">
              Si un compte existe avec l&apos;adresse <strong className="text-white">{email}</strong>,
              vous recevrez un lien de réinitialisation dans quelques minutes.
            </p>
            <p className="text-gray-500 text-xs mb-6">
              Pensez à vérifier vos spams si vous ne le trouvez pas.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="w-full rounded-xl bg-gray-800 hover:bg-gray-700 py-3 text-sm font-medium text-gray-300 transition-all"
              >
                Renvoyer un email
              </button>
              <a
                href="/login"
                className="block w-full rounded-xl bg-violet-600 hover:bg-violet-500 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all text-center"
              >
                Retour à la connexion
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 bg-gray-900 border border-gray-800 rounded-2xl p-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Adresse email
              </label>
              <input
                type="email"
                required
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Nous enverrons un lien de réinitialisation à cette adresse
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:cursor-not-allowed py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all"
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
            </button>

            <p className="text-center text-sm text-gray-400">
              Vous vous souvenez de votre mot de passe ?{' '}
              <a href="/login" className="text-violet-400 hover:underline font-medium">
                Se connecter
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}