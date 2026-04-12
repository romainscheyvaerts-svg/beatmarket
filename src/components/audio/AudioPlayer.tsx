// ============================================================================
// 🎵 BeatMarket — Composant Lecteur Audio Persistant
// ============================================================================
// Ce composant est monté dans le layout racine et reste visible sur toutes
// les pages. Il utilise Wavesurfer.js pour le rendu de la waveform et
// Zustand pour gérer l'état global du lecteur.
// ============================================================================

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAudioStore } from '@/store/audioStore';
import { formatPrice } from '@/lib/vat';
import type { Track } from '@/types';

// ---- Icônes SVG inline (évite une dépendance externe) ----

function PlayIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function SkipNextIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  );
}

function SkipPreviousIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
    </svg>
  );
}

function VolumeIcon({ className = 'w-5 h-5', muted = false }: { className?: string; muted?: boolean }) {
  if (muted) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

function CartIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );
}

// ---- Utilitaires ----

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ---- Composant Waveform ----

interface WaveformDisplayProps {
  track: Track;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

function WaveformDisplay({ track, currentTime, duration, onSeek }: WaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progress = duration > 0 ? currentTime / duration : 0;

  // Dessiner la waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const barCount = Math.floor(width / 3); // 3px par barre
    const barWidth = 2;
    const gap = 1;

    // Utiliser les données de waveform ou générer des données aléatoires
    const peaks: number[] = track.waveformData as number[] || 
      Array.from({ length: barCount }, () => Math.random() * 0.8 + 0.2);

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < barCount; i++) {
      const peakIndex = Math.floor((i / barCount) * peaks.length);
      const peak = peaks[peakIndex] ?? 0.5;
      const barHeight = peak * height * 0.8;
      const x = i * (barWidth + gap);
      const y = (height - barHeight) / 2;

      // Couleur selon la progression
      const barProgress = i / barCount;
      if (barProgress <= progress) {
        ctx.fillStyle = '#8b5cf6'; // Violet (partie jouée)
      } else {
        ctx.fillStyle = '#4b5563'; // Gris (partie non jouée)
      }

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 1);
      ctx.fill();
    }
  }, [track, progress]);

  // Gestion du clic pour le seek
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || duration <= 0) return;
      const x = e.clientX - rect.left;
      const ratio = x / rect.width;
      onSeek(ratio * duration);
    },
    [duration, onSeek]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-12 cursor-pointer group"
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
      {/* Indicateur de position */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white opacity-80 transition-opacity group-hover:opacity-100"
        style={{ left: `${progress * 100}%` }}
      />
    </div>
  );
}

// ---- Composant Principal : AudioPlayer ----

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    isLoading,
    isMuted,
    pause,
    resume,
    togglePlay,
    setVolume,
    toggleMute,
    seek,
    setCurrentTime,
    setDuration,
    setIsLoading,
    playNext,
    playPrevious,
  } = useAudioStore();

  // Afficher le player quand une track est sélectionnée
  useEffect(() => {
    setIsVisible(!!currentTrack);
  }, [currentTrack]);

  // Contrôler l'élément audio natif
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    // Charger la nouvelle source (preview watermarked)
    if (currentTrack.previewUrl) {
      audio.src = currentTrack.previewUrl;
      audio.load();
    }
  }, [currentTrack?.id]);

  // Play/Pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {
        // Autoplay bloqué par le navigateur
        pause();
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, pause]);

  // Volume
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Seek
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isFinite(currentTime)) return;

    // Seulement si la différence est significative (éviter les boucles)
    if (Math.abs(audio.currentTime - currentTime) > 1) {
      audio.currentTime = currentTime;
    }
  }, [currentTime]);

  // Handlers audio natifs
  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
    }
  }, [setCurrentTime]);

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      setDuration(audio.duration);
      setIsLoading(false);
    }
  }, [setDuration, setIsLoading]);

  const handleEnded = useCallback(() => {
    playNext();
  }, [playNext]);

  const handleWaiting = useCallback(() => {
    setIsLoading(true);
  }, [setIsLoading]);

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
  }, [setIsLoading]);

  const handleSeek = useCallback(
    (time: number) => {
      seek(time);
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = time;
      }
    },
    [seek]
  );

  // Ne pas afficher si aucune track
  if (!isVisible || !currentTrack) return null;

  const lowestPrice = currentTrack.priceMp3Lease;

  return (
    <>
      {/* Élément audio HTML5 caché */}
      <audio
        ref={audioRef}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
      />

      {/* Barre du lecteur audio fixe en bas */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 shadow-2xl">
        <div className="max-w-screen-2xl mx-auto">
          {/* Waveform */}
          <WaveformDisplay
            track={currentTrack}
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
          />

          {/* Contrôles */}
          <div className="flex items-center justify-between px-4 py-2">
            {/* Section gauche : Info track */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Cover art */}
              {currentTrack.coverArt ? (
                <img
                  src={currentTrack.coverArt}
                  alt={currentTrack.title}
                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🎵</span>
                </div>
              )}

              {/* Titre et producteur */}
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {currentTrack.title}
                </p>
                <p className="text-gray-400 text-xs truncate">
                  {currentTrack.producer?.displayName ?? 'Producteur'}
                  {currentTrack.bpm && (
                    <span className="ml-2 text-gray-500">
                      {currentTrack.bpm} BPM
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Section centrale : Contrôles de lecture */}
            <div className="flex items-center gap-2">
              {/* Previous */}
              <button
                onClick={playPrevious}
                className="text-gray-400 hover:text-white transition-colors p-1"
                aria-label="Piste précédente"
              >
                <SkipPreviousIcon />
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                disabled={isLoading}
                className="bg-violet-600 hover:bg-violet-500 disabled:bg-gray-600 text-white rounded-full p-2.5 transition-colors shadow-lg"
                aria-label={isPlaying ? 'Pause' : 'Lecture'}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <PauseIcon />
                ) : (
                  <PlayIcon />
                )}
              </button>

              {/* Next */}
              <button
                onClick={playNext}
                className="text-gray-400 hover:text-white transition-colors p-1"
                aria-label="Piste suivante"
              >
                <SkipNextIcon />
              </button>

              {/* Timer */}
              <span className="text-gray-400 text-xs font-mono ml-2 min-w-[80px]">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Section droite : Volume + Prix + Panier */}
            <div className="flex items-center gap-4 flex-1 justify-end">
              {/* Contrôle volume */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
                >
                  <VolumeIcon muted={isMuted || volume === 0} />
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-3
                    [&::-webkit-slider-thumb]:h-3
                    [&::-webkit-slider-thumb]:bg-violet-500
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:cursor-pointer"
                  aria-label="Volume"
                />
              </div>

              {/* Tags rapides */}
              <div className="hidden md:flex items-center gap-1.5">
                {currentTrack.genre && (
                  <span className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded-full">
                    {currentTrack.genre}
                  </span>
                )}
                {currentTrack.musicKey && (
                  <span className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded-full">
                    {currentTrack.musicKey.replace('_', ' ')}
                  </span>
                )}
              </div>

              {/* Prix et bouton d'achat */}
              {lowestPrice && (
                <div className="flex items-center gap-2">
                  <span className="text-violet-400 font-bold text-sm">
                    À partir de {formatPrice(lowestPrice)}
                  </span>
                  <button className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
                    <CartIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Acheter</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
