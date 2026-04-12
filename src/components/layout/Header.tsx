'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SessionUser {
  id: string;
  email: string;
  displayName: string | null;
  name: string | null;
  role: string;
}

export default function Header() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-950/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="text-xl font-bold text-gradient flex-shrink-0">
          BeatMarket
        </a>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="/" className="text-gray-400 hover:text-white transition-colors">
            Accueil
          </a>
          {user?.role === 'PRODUCER' && (
            <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              Dashboard
            </a>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-full bg-gray-800 hover:bg-gray-700 px-4 py-2 text-sm text-white transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold">
                  {(user.displayName || user.name || user.email)[0].toUpperCase()}
                </span>
                <span className="hidden sm:inline max-w-[120px] truncate">
                  {user.displayName || user.name || user.email}
                </span>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-700 bg-gray-900 shadow-xl z-20 py-1">
                    {user.role === 'PRODUCER' && (
                      <a
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                        onClick={() => setMenuOpen(false)}
                      >
                        <span>🎵</span> Dashboard
                      </a>
                    )}
                    <hr className="border-gray-800 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800"
                    >
                      <span>↩</span> Se déconnecter
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <a
                href="/login"
                className="hidden sm:inline-block rounded-lg px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                Connexion
              </a>
              <a
                href="/register"
                className="rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all"
              >
                Commencer
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
