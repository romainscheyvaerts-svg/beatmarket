'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Track {
  id: string;
  slug: string;
  title: string;
  genre: string | null;
  mood: string | null;
  bpm: number | null;
  musicKey: string | null;
  tags: string[];
  coverArt: string | null;
  previewUrl: string | null;
  priceMp3Lease: number | null;
  priceWavLease: number | null;
  priceUnlimited: number | null;
  priceExclusive: number | null;
  playCount: number;
  createdAt: string;
  producer: {
    id: string;
    displayName: string | null;
    name: string | null;
  };
}

// Reliable demo audio (SoundHelix - always works, no CORS issues)
const DEMO_AUDIO = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
];

function formatPrice(cents: number | null): string {
  if (!cents) return '—';
  return `${(cents / 100).toFixed(2)}€`;
}

function formatKey(key: string | null): string {
  if (!key) return '';
  return key.replace(/_/g, ' ').replace('SHARP', '#').replace('MAJOR', 'Maj').replace('MINOR', 'Min');
}

export default function HomePage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedLicense, setSelectedLicense] = useState<string | null>(null);
  const [filterGenre, setFilterGenre] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetch('/api/tracks/public')
      .then(r => r.json())
      .then(data => setTracks(data.tracks || []))
      .catch(() => setTracks([]))
      .finally(() => setLoading(false));
  }, []);

  const getAudioUrl = useCallback((track: Track, index: number) => {
    if (track.previewUrl) return track.previewUrl;
    return DEMO_AUDIO[index % DEMO_AUDIO.length];
  }, []);

  const playTrack = useCallback((track: Track, index: number) => {
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
      return;
    }

    setCurrentTrack(track);
    setCurrentIndex(index);
    setIsPlaying(true);
    setProgress(0);
    setCurrentTime(0);

    const url = getAudioUrl(track, index);
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.load();
      audioRef.current.play().catch(() => {
        // Autoplay blocked, user needs to interact
        setIsPlaying(false);
      });
    }
  }, [currentTrack, isPlaying, getAudioUrl]);

  const playNext = useCallback(() => {
    if (tracks.length === 0) return;
    const nextIndex = (currentIndex + 1) % tracks.length;
    playTrack(tracks[nextIndex], nextIndex);
  }, [tracks, currentIndex, playTrack]);

  const playPrev = useCallback(() => {
    if (tracks.length === 0) return;
    const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    playTrack(tracks[prevIndex], prevIndex);
  }, [tracks, currentIndex, playTrack]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const curr = audioRef.current.currentTime;
      const dur = audioRef.current.duration || 0;
      setCurrentTime(curr);
      setDuration(dur);
      setProgress(dur > 0 ? (curr / dur) * 100 : 0);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = x / rect.width;
      audioRef.current.currentTime = pct * duration;
    }
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const genres = Array.from(new Set(tracks.map(t => t.genre).filter(Boolean)));
  const filteredTracks = filterGenre
    ? tracks.filter(t => t.genre === filterGenre)
    : tracks;

  return (
    <div className={`relative ${currentTrack ? 'pb-28' : ''}`}>
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20 sm:py-28 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-violet-950/50 to-gray-950" />
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Trouvez le{' '}
            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">beat parfait</span>
            {' '}pour votre prochain hit
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            La marketplace de beats et instrumentales en Europe.
            Découvrez des productions de qualité professionnelle.
          </p>
          
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/register"
              className="rounded-xl bg-violet-600 hover:bg-violet-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all"
            >
              Vendre mes beats — 5€/mois
            </a>
            <a
              href="/login"
              className="rounded-xl border border-gray-700 hover:border-gray-500 px-8 py-3 text-sm font-semibold text-white transition-all"
            >
              Se connecter
            </a>
          </div>
        </div>
      </section>

      {/* ========== CATALOGUE DE BEATS ========== */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">🎵 Beats disponibles</h2>
            <p className="text-sm text-gray-400 mt-1">{tracks.length} beat{tracks.length > 1 ? 's' : ''} — Cliquez sur ▶ pour écouter</p>
          </div>
        </div>

        {/* Genre filter */}
        {genres.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setFilterGenre('')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                !filterGenre ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Tous
            </button>
            {genres.map(g => (
              <button
                key={g}
                onClick={() => setFilterGenre(g!)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filterGenre === g ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        )}

        {/* Track list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-700 rounded-2xl">
            <span className="text-5xl block mb-4">🎶</span>
            <h3 className="text-xl font-semibold text-white mb-2">Les premiers beats arrivent bientôt</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              Inscrivez-vous en tant que producteur pour vendre vos beats.
            </p>
            <a href="/register" className="inline-block rounded-xl bg-violet-600 hover:bg-violet-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all">
              Créer mon compte producteur
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-5">Beat</div>
              <div className="col-span-1 text-center">BPM</div>
              <div className="col-span-1 text-center">Tonalité</div>
              <div className="col-span-2 text-center">Genre</div>
              <div className="col-span-1 text-center">Prix</div>
              <div className="col-span-2 text-center">Actions</div>
            </div>

            {filteredTracks.map((track, index) => (
              <div
                key={track.id}
                className={`group rounded-xl border transition-all p-4 cursor-pointer ${
                  currentTrack?.id === track.id
                    ? 'border-violet-500/50 bg-violet-500/5 shadow-lg shadow-violet-500/10'
                    : 'border-gray-800 bg-gray-900/50 hover:border-gray-700 hover:bg-gray-900'
                }`}
                onClick={() => playTrack(track, index)}
              >
                <div className="md:grid md:grid-cols-12 md:gap-4 md:items-center">
                  {/* Play + Title */}
                  <div className="col-span-5 flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 ${
                        currentTrack?.id === track.id && isPlaying
                          ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30 animate-pulse'
                          : 'bg-gray-800 text-gray-400 group-hover:bg-violet-600 group-hover:text-white'
                      }`}
                    >
                      {currentTrack?.id === track.id && isPlaying ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <rect x="5" y="4" width="3" height="12" rx="1" />
                          <rect x="12" y="4" width="3" height="12" rx="1" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6 4l12 6-12 6V4z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">{track.title}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {track.producer.displayName || track.producer.name || 'Producteur'}
                        {track.mood && ` · ${track.mood}`}
                      </p>
                    </div>
                  </div>

                  {/* BPM */}
                  <div className="hidden md:block col-span-1 text-center">
                    <span className="text-sm text-gray-300">{track.bpm || '—'}</span>
                  </div>

                  {/* Key */}
                  <div className="hidden md:block col-span-1 text-center">
                    <span className="text-sm text-gray-300">{formatKey(track.musicKey)}</span>
                  </div>

                  {/* Genre */}
                  <div className="hidden md:block col-span-2 text-center">
                    {track.genre && (
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
                        {track.genre}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="hidden md:block col-span-1 text-center">
                    <span className="text-sm font-semibold text-violet-400">
                      {formatPrice(track.priceMp3Lease)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="hidden md:flex col-span-2 justify-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedLicense(selectedLicense === track.id ? null : track.id); }}
                      className="rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-2 text-xs font-semibold text-white transition-all"
                    >
                      🛒 Acheter
                    </button>
                  </div>
                </div>

                {/* Mobile info */}
                <div className="md:hidden mt-3 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex gap-3">
                    {track.bpm && <span>{track.bpm} BPM</span>}
                    {track.genre && <span className="px-2 py-0.5 rounded bg-gray-800">{track.genre}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-violet-400">{formatPrice(track.priceMp3Lease)}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedLicense(selectedLicense === track.id ? null : track.id); }}
                      className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Acheter
                    </button>
                  </div>
                </div>

                {/* License panel */}
                {selectedLicense === track.id && (
                  <div className="mt-4 pt-4 border-t border-gray-800" onClick={(e) => e.stopPropagation()}>
                    <p className="text-sm font-medium text-white mb-3">Choisir une licence :</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {track.priceMp3Lease && (
                        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3 text-center hover:border-violet-500 cursor-pointer transition-all">
                          <p className="text-xs text-gray-400">MP3 Lease</p>
                          <p className="text-lg font-bold text-white">{formatPrice(track.priceMp3Lease)}</p>
                        </div>
                      )}
                      {track.priceWavLease && (
                        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3 text-center hover:border-violet-500 cursor-pointer transition-all">
                          <p className="text-xs text-gray-400">WAV Lease</p>
                          <p className="text-lg font-bold text-white">{formatPrice(track.priceWavLease)}</p>
                        </div>
                      )}
                      {track.priceUnlimited && (
                        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3 text-center hover:border-violet-500 cursor-pointer transition-all">
                          <p className="text-xs text-gray-400">Unlimited</p>
                          <p className="text-lg font-bold text-white">{formatPrice(track.priceUnlimited)}</p>
                        </div>
                      )}
                      {track.priceExclusive && (
                        <div className="rounded-lg border border-violet-500/30 bg-violet-900/10 p-3 text-center hover:border-violet-500 cursor-pointer transition-all">
                          <p className="text-xs text-violet-400">👑 Exclusive</p>
                          <p className="text-lg font-bold text-white">{formatPrice(track.priceExclusive)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Producteurs */}
      <section className="border-t border-gray-800">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:px-8">
          <h2 className="text-3xl font-bold text-white">Vous êtes producteur ?</h2>
          <p className="mt-4 text-lg text-gray-300">
            Rejoignez BeatMarket et vendez vos beats. Commission de 15% sur les ventes.
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {[
              { icon: '🎹', title: 'Page producteur', desc: 'Votre vitrine professionnelle personnalisée.' },
              { icon: '💰', title: 'Paiements flexibles', desc: 'Stripe ou PayPal. Paiements automatiques.' },
              { icon: '📜', title: 'Licences auto', desc: 'Contrats PDF générés automatiquement.' },
            ].map(f => (
              <div key={f.title} className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <span className="text-2xl">{f.icon}</span>
                <h3 className="mt-3 text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
          <a
            href="/register"
            className="mt-10 inline-block rounded-xl bg-violet-600 hover:bg-violet-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all"
          >
            Commencer — 5€/mois
          </a>
        </div>
      </section>

      {/* ========== GLOBAL AUDIO PLAYER (FIXED BOTTOM BAR) ========== */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 bg-gray-950/95 backdrop-blur-xl shadow-2xl shadow-black/50">
          <div className="mx-auto max-w-7xl px-6 py-3">
            {/* Progress bar */}
            <div className="mb-2 cursor-pointer group" onClick={handleSeek}>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden group-hover:h-2 transition-all">
                <div className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Controls */}
              <div className="flex items-center gap-2">
                <button onClick={playPrev} className="w-8 h-8 rounded-full text-gray-400 hover:text-white flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M12 4L4 10l8 6V4zM16 4v12h-2V4h2z" /></svg>
                </button>
                <button
                  onClick={() => {
                    if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
                    else { audioRef.current?.play(); setIsPlaying(true); }
                  }}
                  className="w-11 h-11 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center text-white transition-all shadow-lg shadow-violet-500/30"
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <rect x="5" y="4" width="3" height="12" rx="1" />
                      <rect x="12" y="4" width="3" height="12" rx="1" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6 4l12 6-12 6V4z" />
                    </svg>
                  )}
                </button>
                <button onClick={playNext} className="w-8 h-8 rounded-full text-gray-400 hover:text-white flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M8 4l8 6-8 6V4zM4 4h2v12H4V4z" /></svg>
                </button>
              </div>

              {/* Track info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{currentTrack.title}</p>
                <p className="text-xs text-gray-400 truncate">
                  {currentTrack.producer.displayName || currentTrack.producer.name}
                  {currentTrack.genre && ` · ${currentTrack.genre}`}
                  {currentTrack.bpm && ` · ${currentTrack.bpm} BPM`}
                </p>
              </div>

              {/* Time */}
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>

              {/* Price + Buy */}
              <span className="text-sm font-semibold text-violet-400">{formatPrice(currentTrack.priceMp3Lease)}</span>
              <button
                onClick={() => setSelectedLicense(selectedLicense === currentTrack.id ? null : currentTrack.id)}
                className="rounded-lg bg-violet-600 hover:bg-violet-500 px-5 py-2 text-sm font-semibold text-white transition-all shrink-0 shadow-lg shadow-violet-500/20"
              >
                🛒 Acheter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={playNext}
        onLoadedMetadata={handleTimeUpdate}
        preload="auto"
        crossOrigin="anonymous"
      />
    </div>
  );
}
