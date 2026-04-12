// ============================================================================
// 🎵 BeatMarket — Zustand Store pour le Lecteur Audio Persistant
// ============================================================================

import { create } from 'zustand';
import type { Track } from '@/types';

interface AudioState {
  // État du lecteur
  currentTrack: Track | null;
  playlist: Track[];
  isPlaying: boolean;
  volume: number;          // 0 à 1
  currentTime: number;     // en secondes
  duration: number;        // en secondes
  isLoading: boolean;
  isMuted: boolean;

  // Actions
  play: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  seek: (time: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsLoading: (loading: boolean) => void;
  playNext: () => void;
  playPrevious: () => void;
  setPlaylist: (tracks: Track[]) => void;
  addToPlaylist: (track: Track) => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  // État initial
  currentTrack: null,
  playlist: [],
  isPlaying: false,
  volume: 0.75,
  currentTime: 0,
  duration: 0,
  isLoading: false,
  isMuted: false,

  // ---- Actions ----

  play: (track) => {
    const { playlist } = get();
    // Ajouter au playlist si pas déjà présent
    const exists = playlist.some((t) => t.id === track.id);
    set({
      currentTrack: track,
      isPlaying: true,
      currentTime: 0,
      isLoading: true,
      playlist: exists ? playlist : [...playlist, track],
    });
  },

  pause: () => set({ isPlaying: false }),

  resume: () => {
    const { currentTrack } = get();
    if (currentTrack) {
      set({ isPlaying: true });
    }
  },

  stop: () =>
    set({
      isPlaying: false,
      currentTime: 0,
      currentTrack: null,
    }),

  togglePlay: () => {
    const { isPlaying, currentTrack } = get();
    if (currentTrack) {
      set({ isPlaying: !isPlaying });
    }
  },

  setVolume: (volume) =>
    set({
      volume: Math.max(0, Math.min(1, volume)),
      isMuted: volume === 0,
    }),

  toggleMute: () => {
    const { isMuted, volume } = get();
    set({
      isMuted: !isMuted,
      volume: isMuted ? (volume === 0 ? 0.75 : volume) : volume,
    });
  },

  seek: (time) => set({ currentTime: time }),

  setCurrentTime: (time) => set({ currentTime: time }),

  setDuration: (duration) => set({ duration }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  playNext: () => {
    const { currentTrack, playlist } = get();
    if (!currentTrack || playlist.length === 0) return;

    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    const nextTrack = playlist[nextIndex];

    if (nextTrack) {
      set({
        currentTrack: nextTrack,
        isPlaying: true,
        currentTime: 0,
        isLoading: true,
      });
    }
  },

  playPrevious: () => {
    const { currentTrack, playlist, currentTime } = get();
    if (!currentTrack || playlist.length === 0) return;

    // Si on est à plus de 3 secondes, revenir au début
    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }

    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = currentIndex <= 0 ? playlist.length - 1 : currentIndex - 1;
    const prevTrack = playlist[prevIndex];

    if (prevTrack) {
      set({
        currentTrack: prevTrack,
        isPlaying: true,
        currentTime: 0,
        isLoading: true,
      });
    }
  },

  setPlaylist: (tracks) => set({ playlist: tracks }),

  addToPlaylist: (track) => {
    const { playlist } = get();
    if (!playlist.some((t) => t.id === track.id)) {
      set({ playlist: [...playlist, track] });
    }
  },
}));
