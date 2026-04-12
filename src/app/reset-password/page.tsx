'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Lien de réinitialisation invalide. Veuillez demander un nouveau lien.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || 'Une erreur est survenue');
        return;
      }

      setSuccess(true);
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
          <h1 className="mt-6 text-3xl font-bold text-white">
            Nouveau mot de passe
          </h1>
          <p className="mt-2 text-gray-400">
            Choisissez un nouveau mot de passe sécurisé
          </p>
        </div>

        {success ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-white mb-3">
              Mot de passe modifié !
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Votre mot de passe a été réinitialisé avec succès.
              Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </p>
            <a
              href="/login"
              className="block w-full rounded-xl bg-violet-600 hover:bg-violet-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all text-center"
            >
              Se connecter
            </a>
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
                Nouveau mot de passe
              </label>
              <input
                type="password"
                required
                placeholder="Min. 8 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                required
                placeholder="Répéter le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            {/* Indicateur de force du mot de passe */}
            {password.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  <div className={`h-1 flex-1 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-700'}`} />
                  <div className={`h-1 flex-1 rounded-full ${password.length >= 12 ? 'bg-green-500' : 'bg-gray-700'}`} />
                  <div className={`h-1 flex-1 rounded-full ${/[A-Z]/.test(password) && /[0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-700'}`} />
                  <div className={`h-1 flex-1 rounded-full ${/[^A-Za-z0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-700'}`} />
                </div>
                <p className="text-xs text-gray-500">
                  {password.length < 8 ? 'Trop court' : password.length < 12 ? 'Correct' : 'Fort'} 
                  {' '}— Min. 8 caractères
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:cursor-not-allowed py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all"
            >
              {loading ? 'Modification en cours...' : 'Réinitialiser le mot de passe'}
            </button>

            <p className="text-center text-sm text-gray-400">
              <a href="/forgot-password" className="text-violet-400 hover:underline font-medium">
                Demander un nouveau lien
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Chargement...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}