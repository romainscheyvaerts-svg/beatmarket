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
  likeCount: number;
  createdAt: string;
  producer: {
    id: string;
    displayName: string | null;
    name: string | null;
    avatar: string | null;
  };
}

// Demo audio URLs for presentation (royalty-free lo-fi beats)
const DEMO_AUDIO = [
  'https://cdn.pixabay.com/audio/2024/11/28/audio_3a1ed66ce8.mp3',
  'https://cdn.pixabay.com/audio/2024/02/14/audio_8e3e1b8a07.mp3',
  'https://cdn.pixabay.com/audio/2024/09/10/audio_6e5d7ed818.mp3',
  'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
  'https://cdn.pixabay.com/audio/2023/07/19/audio_e552178e39.mp3',
];

function formatKey(key: string | null): string {
  if (!key) return '';
  return key.replace(/_/g, ' ').replace('SHARP', '#').replace('MAJOR', 'Maj').replace('MINOR', 'Min');
}

function formatPrice(cents: number | null): string {
  if (!cents) return '—';
  return `${(cents / 100).toFixed(2)}€`;
}

export default function BeatsPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
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

  const playTrack = (track: Track, index: number) => {
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
    setIsPlaying(true);
    setProgress(0);
    setCurrentTime(0);

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = getAudioUrl(track, index);
        audioRef.current.play().catch(() => {});
      }
    }, 50);
  };

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
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const genres = [...new Set(tracks.map(t => t.genre).filter(Boolean))];
  const filteredTracks = filterGenre
    ? tracks.filter(t => t.genre === filterGenre)
    : tracks;

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <a href="/" className="text-sm text-gray-400 hover:text-white transition-colors">← Accueil</a>
              <h1 className="text-3xl font-bold text-white mt-2">🎵 Catalogue de Beats</h1>
              <p className="text-gray-400 mt-1">{tracks.length} beat{tracks.length > 1 ? 's' : ''} disponible{tracks.length > 1 ? 's' : ''}</p>
            </div>
            <a href="/login" className="rounded-xl bg-violet-600 hover:bg-violet-500 px-6 py-2.5 text-sm font-semibold text-white transition-all">
              Se connecter
            </a>
          </div>

          {/* Genre filter */}
          {genres.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
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
        </div>
      </div>

      {/* Track list */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl block mb-4">🎶</span>
            <h2 className="text-xl font-semibold text-white mb-2">Aucun beat disponible</h2>
            <p className="text-gray-400">Les beats apparaîtront ici dès qu&apos;ils seront publiés.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-500 uppercase">
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
                className={`group rounded-xl border transition-all p-4 ${
                  currentTrack?.id === track.id
                    ? 'border-violet-500/50 bg-violet-500/5'
                    : 'border-gray-800 bg-gray-900/50 hover:border-gray-700 hover:bg-gray-900'
                }`}
              >
                <div className="md:grid md:grid-cols-12 md:gap-4 md:items-center">
                  {/* Play + Title */}
                  <div className="col-span-5 flex items-center gap-4">
                    <button
                      onClick={() => playTrack(track, index)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 ${
                        currentTrack?.id === track.id && isPlaying
                          ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
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
                    </button>

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
                      onClick={() => setSelectedLicense(selectedLicense === track.id ? null : track.id)}
                      className="rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-2 text-xs font-semibold text-white transition-all"
                    >
                      Acheter
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
                      onClick={() => setSelectedLicense(selectedLicense === track.id ? null : track.id)}
                      className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Acheter
                    </button>
                  </div>
                </div>

                {/* License panel */}
                {selectedLicense === track.id && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-sm font-medium text-white mb-3">Choisir une licence :</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {track.priceMp3Lease && (
                        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3 text-center hover:border-violet-500/50 cursor-pointer transition-all">
                          <p className="text-xs text-gray-400">MP3 Lease</p>
                          <p className="text-lg font-bold text-white">{formatPrice(track.priceMp3Lease)}</p>
                        </div>
                      )}
                      {track.priceWavLease && (
                        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3 text-center hover:border-violet-500/50 cursor-pointer transition-all">
                          <p className="text-xs text-gray-400">WAV Lease</p>
                          <p className="text-lg font-bold text-white">{formatPrice(track.priceWavLease)}</p>
                        </div>
                      )}
                      {track.priceUnlimited && (
                        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3 text-center hover:border-violet-500/50 cursor-pointer transition-all">
                          <p className="text-xs text-gray-400">Unlimited</p>
                          <p className="text-lg font-bold text-white">{formatPrice(track.priceUnlimited)}</p>
                        </div>
                      )}
                      {track.priceExclusive && (
                        <div className="rounded-lg border border-violet-500/30 bg-violet-900/10 p-3 text-center hover:border-violet-500/50 cursor-pointer transition-all">
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
      </div>

      {/* Global Audio Player */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 bg-gray-950/95 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-6 py-3">
            {/* Progress bar */}
            <div className="mb-2 cursor-pointer" onClick={handleSeek}>
              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Play/Pause */}
              <button
                onClick={() => {
                  if (isPlaying) {
                    audioRef.current?.pause();
                    setIsPlaying(false);
                  } else {
                    audioRef.current?.play();
                    setIsPlaying(true);
                  }
                }}
                className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center text-white transition-all shrink-0"
              >
                {isPlaying ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <rect x="5" y="4" width="3" height="12" rx="1" />
                    <rect x="12" y="4" width="3" height="12" rx="1" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 4l12 6-12 6V4z" />
                  </svg>
                )}
              </button>

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
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>

              {/* Price */}
              <span className="text-sm font-semibold text-violet-400">
                {formatPrice(currentTrack.priceMp3Lease)}
              </span>

              {/* Buy button */}
              <button
                onClick={() => setSelectedLicense(selectedLicense === currentTrack.id ? null : currentTrack.id)}
                className="rounded-lg bg-violet-600 hover:bg-violet-500 px-5 py-2 text-sm font-semibold text-white transition-all shrink-0"
              >
                🛒 Acheter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={handleTimeUpdate}
      />
    </div>
  );
}
