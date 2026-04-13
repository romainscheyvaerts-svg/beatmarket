'use client';

import { useState, useRef } from 'react';

interface StemFile {
  id: string;
  name: string;
  label: string;
  file: File;
}

const GENRES = [
  'Trap', 'Drill', 'Afrobeat', 'R&B', 'Pop', 'Lo-Fi', 'Boom Bap',
  'Reggaeton', 'Dancehall', 'House', 'UK Drill', 'Jersey Club',
  'Phonk', 'Soul', 'Jazz', 'Rock', 'Electronic', 'Autre',
];

const MOODS = [
  'Dark', 'Chill', 'Energetic', 'Sad', 'Happy', 'Aggressive',
  'Romantic', 'Dreamy', 'Bouncy', 'Epic', 'Melodic', 'Hard',
];

const KEYS = [
  'C Major', 'C Minor', 'C# Major', 'C# Minor',
  'D Major', 'D Minor', 'D# Major', 'D# Minor',
  'E Major', 'E Minor', 'F Major', 'F Minor',
  'F# Major', 'F# Minor', 'G Major', 'G Minor',
  'G# Major', 'G# Minor', 'A Major', 'A Minor',
  'A# Major', 'A# Minor', 'B Major', 'B Minor',
];

const KEY_MAP: Record<string, string> = {
  'C Major': 'C_MAJOR', 'C Minor': 'C_MINOR', 'C# Major': 'C_SHARP_MAJOR', 'C# Minor': 'C_SHARP_MINOR',
  'D Major': 'D_MAJOR', 'D Minor': 'D_MINOR', 'D# Major': 'D_SHARP_MAJOR', 'D# Minor': 'D_SHARP_MINOR',
  'E Major': 'E_MAJOR', 'E Minor': 'E_MINOR', 'F Major': 'F_MAJOR', 'F Minor': 'F_MINOR',
  'F# Major': 'F_SHARP_MAJOR', 'F# Minor': 'F_SHARP_MINOR', 'G Major': 'G_MAJOR', 'G Minor': 'G_MINOR',
  'G# Major': 'G_SHARP_MAJOR', 'G# Minor': 'G_SHARP_MINOR', 'A Major': 'A_MAJOR', 'A Minor': 'A_MINOR',
  'A# Major': 'A_SHARP_MAJOR', 'A# Minor': 'A_SHARP_MINOR', 'B Major': 'B_MAJOR', 'B Minor': 'B_MINOR',
};

const STEM_PRESETS = [
  { label: 'Kick', icon: '🥁' },
  { label: 'Snare', icon: '🪘' },
  { label: 'Hi-Hat', icon: '🎩' },
  { label: 'Percs', icon: '🔔' },
  { label: 'Bass / 808', icon: '🔊' },
  { label: 'Melody', icon: '🎹' },
  { label: 'Chords', icon: '🎸' },
  { label: 'Vocals / Chops', icon: '🎤' },
  { label: 'FX / SFX', icon: '✨' },
  { label: 'Autre', icon: '🎵' },
];

export default function UploadPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Step 1: Audio files
  const [mp3File, setMp3File] = useState<File | null>(null);
  const [wavFile, setWavFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [stems, setStems] = useState<StemFile[]>([]);

  // Step 2: Metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bpm, setBpm] = useState('');
  const [musicKey, setMusicKey] = useState('');
  const [genre, setGenre] = useState('');
  const [mood, setMood] = useState('');
  const [tags, setTags] = useState('');

  // Step 3: Pricing
  const [priceMp3, setPriceMp3] = useState('29.99');
  const [priceWav, setPriceWav] = useState('49.99');
  const [priceUnlimited, setPriceUnlimited] = useState('99.99');
  const [priceExclusive, setPriceExclusive] = useState('299.99');

  const mp3InputRef = useRef<HTMLInputElement>(null);
  const wavInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const stemInputRef = useRef<HTMLInputElement>(null);

  // Handle cover art upload with preview
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Add stem
  const handleAddStem = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newStems: StemFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const name = file.name.replace(/\.(wav|mp3|flac|aif|aiff)$/i, '');
      // Try to match with a preset
      const matchedPreset = STEM_PRESETS.find(p =>
        name.toLowerCase().includes(p.label.toLowerCase().split(' ')[0].toLowerCase())
      );
      newStems.push({
        id: Date.now().toString() + i,
        name: file.name,
        label: matchedPreset?.label || name,
        file,
      });
    }
    setStems(prev => [...prev, ...newStems]);
    e.target.value = '';
  };

  // Remove stem
  const removeStem = (id: string) => {
    setStems(prev => prev.filter(s => s.id !== id));
  };

  // Update stem label
  const updateStemLabel = (id: string, label: string) => {
    setStems(prev => prev.map(s => s.id === id ? { ...s, label } : s));
  };

  // Submit
  const handleSubmit = async () => {
    if (!mp3File && !wavFile) {
      setError('Veuillez uploader au moins un fichier audio (MP3 ou WAV)');
      return;
    }
    if (!title.trim()) {
      setError('Le titre est requis');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Send metadata as JSON (files stored locally, uploaded later via presigned URLs)
      const body = {
        title: title.trim(),
        description: description.trim(),
        bpm,
        musicKey: KEY_MAP[musicKey] || '',
        genre,
        mood,
        tags,
        priceMp3Lease: Math.round(parseFloat(priceMp3 || '0') * 100),
        priceWavLease: Math.round(parseFloat(priceWav || '0') * 100),
        priceUnlimited: Math.round(parseFloat(priceUnlimited || '0') * 100),
        priceExclusive: Math.round(parseFloat(priceExclusive || '0') * 100),
        hasMp3: !!mp3File,
        hasWav: !!wavFile,
        hasCover: !!coverFile,
        stemCount: stems.length,
        stemLabels: stems.map(s => s.label),
      };

      const res = await fetch('/api/tracks/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || 'Erreur lors de l\'upload');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-white mb-2">Beat uploadé !</h1>
          <p className="text-gray-400 mb-6">
            Votre beat a été uploadé avec succès et est en cours de traitement.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/dashboard" className="rounded-xl bg-gray-800 hover:bg-gray-700 px-6 py-3 text-sm font-semibold text-white transition-all">
              ← Dashboard
            </a>
            <button
              onClick={() => { setSuccess(false); setStep(1); setMp3File(null); setWavFile(null); setCoverFile(null); setCoverPreview(''); setStems([]); setTitle(''); setDescription(''); }}
              className="rounded-xl bg-violet-600 hover:bg-violet-500 px-6 py-3 text-sm font-semibold text-white transition-all"
            >
              + Upload un autre beat
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <a href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">← Retour au dashboard</a>
            <h1 className="text-2xl font-bold text-white mt-2">Upload un beat</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            {[1, 2, 3].map(s => (
              <button
                key={s}
                onClick={() => setStep(s)}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step === s
                    ? 'bg-violet-600 text-white'
                    : step > s
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-500'
                }`}
              >
                {step > s ? '✓' : s}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* STEP 1: Fichiers audio */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">📁 Fichiers audio principaux</h2>

              {/* MP3 Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Fichier MP3 (master)</label>
                <input ref={mp3InputRef} type="file" accept=".mp3" className="hidden" onChange={e => setMp3File(e.target.files?.[0] || null)} />
                <button
                  onClick={() => mp3InputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                    mp3File ? 'border-green-500/50 bg-green-500/5' : 'border-gray-700 hover:border-violet-500/50 hover:bg-violet-500/5'
                  }`}
                >
                  {mp3File ? (
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-green-400 text-xl">✅</span>
                      <span className="text-white font-medium">{mp3File.name}</span>
                      <span className="text-gray-500 text-sm">({(mp3File.size / 1024 / 1024).toFixed(1)} MB)</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-3xl block mb-2">🎵</span>
                      <span className="text-gray-400">Cliquez pour ajouter le fichier MP3</span>
                    </div>
                  )}
                </button>
              </div>

              {/* WAV Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fichier WAV (haute qualité) <span className="text-gray-500">— optionnel</span></label>
                <input ref={wavInputRef} type="file" accept=".wav" className="hidden" onChange={e => setWavFile(e.target.files?.[0] || null)} />
                <button
                  onClick={() => wavInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                    wavFile ? 'border-green-500/50 bg-green-500/5' : 'border-gray-700 hover:border-violet-500/50 hover:bg-violet-500/5'
                  }`}
                >
                  {wavFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-green-400 text-xl">✅</span>
                      <span className="text-white font-medium">{wavFile.name}</span>
                      <span className="text-gray-500 text-sm">({(wavFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-3xl block mb-2">📀</span>
                      <span className="text-gray-400">Cliquez pour ajouter le fichier WAV</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* STEMS */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-1">🎛️ Stems (pistes individuelles)</h2>
              <p className="text-sm text-gray-400 mb-4">
                Ajoutez vos stems séparément : kick, snare, hi-hat, melody, bass, etc.
              </p>

              {/* Stem list */}
              {stems.length > 0 && (
                <div className="space-y-3 mb-4">
                  {stems.map(stem => (
                    <div key={stem.id} className="flex items-center gap-3 bg-gray-800/50 border border-gray-700 rounded-xl p-3">
                      <span className="text-lg">
                        {STEM_PRESETS.find(p => p.label === stem.label)?.icon || '🎵'}
                      </span>
                      <select
                        value={stem.label}
                        onChange={e => updateStemLabel(stem.id, e.target.value)}
                        className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white"
                      >
                        {STEM_PRESETS.map(p => (
                          <option key={p.label} value={p.label}>{p.icon} {p.label}</option>
                        ))}
                      </select>
                      <span className="flex-1 text-sm text-gray-400 truncate">{stem.name}</span>
                      <span className="text-xs text-gray-500">
                        {(stem.file.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                      <button
                        onClick={() => removeStem(stem.id)}
                        className="text-red-400 hover:text-red-300 text-lg"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add stems button */}
              <input ref={stemInputRef} type="file" accept=".wav,.mp3,.flac,.aif,.aiff" multiple className="hidden" onChange={handleAddStem} />
              <button
                onClick={() => stemInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-700 hover:border-violet-500/50 hover:bg-violet-500/5 rounded-xl p-4 text-center transition-all"
              >
                <span className="text-2xl block mb-1">➕</span>
                <span className="text-gray-400 text-sm">Ajouter des stems (WAV, MP3, FLAC)</span>
              </button>

              {stems.length > 0 && (
                <p className="mt-3 text-xs text-gray-500">
                  ✅ {stems.length} stem{stems.length > 1 ? 's' : ''} ajouté{stems.length > 1 ? 's' : ''} — 
                  Les stems seront disponibles avec la licence Unlimited et Exclusive.
                </p>
              )}
            </div>

            {/* Cover Art */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">🎨 Cover Art</h2>
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
              <button
                onClick={() => coverInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  coverFile ? 'border-green-500/50 bg-green-500/5' : 'border-gray-700 hover:border-violet-500/50 hover:bg-violet-500/5'
                }`}
              >
                {coverPreview ? (
                  <div className="flex items-center justify-center gap-4">
                    <img src={coverPreview} alt="Cover" className="w-20 h-20 rounded-lg object-cover" />
                    <div className="text-left">
                      <span className="text-white font-medium block">{coverFile?.name}</span>
                      <span className="text-gray-500 text-sm">Cliquez pour changer</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="text-3xl block mb-2">🖼️</span>
                    <span className="text-gray-400">Image de couverture (JPG, PNG, WebP)</span>
                    <span className="block text-gray-500 text-xs mt-1">Recommandé : 1400x1400px</span>
                  </div>
                )}
              </button>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!mp3File && !wavFile}
              className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:cursor-not-allowed py-3.5 text-sm font-semibold text-white transition-all"
            >
              Suivant : Informations →
            </button>
          </div>
        )}

        {/* STEP 2: Metadata */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white mb-2">📝 Informations du beat</h2>

              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Titre *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder='Ex: "Midnight Drill"'
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Description <span className="text-gray-500">— optionnel</span></label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Décrivez votre beat, son ambiance, les instruments utilisés..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                />
              </div>

              {/* BPM + Key */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">BPM</label>
                  <input
                    type="number"
                    value={bpm}
                    onChange={e => setBpm(e.target.value)}
                    placeholder="140"
                    min="40"
                    max="300"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Tonalité</label>
                  <select
                    value={musicKey}
                    onChange={e => setMusicKey(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="">Sélectionner</option>
                    {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              </div>

              {/* Genre + Mood */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Genre *</label>
                  <select
                    value={genre}
                    onChange={e => setGenre(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="">Sélectionner</option>
                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Ambiance</label>
                  <select
                    value={mood}
                    onChange={e => setMood(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="">Sélectionner</option>
                    {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Tags <span className="text-gray-500">— séparés par des virgules</span></label>
                <input
                  type="text"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="dark, piano, 808, melodic"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 rounded-xl bg-gray-800 hover:bg-gray-700 py-3.5 text-sm font-semibold text-white transition-all">
                ← Fichiers
              </button>
              <button
                onClick={() => { if (!title.trim()) { setError('Le titre est requis'); return; } setError(''); setStep(3); }}
                className="flex-1 rounded-xl bg-violet-600 hover:bg-violet-500 py-3.5 text-sm font-semibold text-white transition-all"
              >
                Suivant : Prix →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Pricing */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-1">💰 Prix des licences</h2>
              <p className="text-sm text-gray-400 mb-6">Définissez le prix pour chaque type de licence. Laissez vide pour désactiver.</p>

              <div className="space-y-4">
                {/* MP3 Lease */}
                <div className="flex items-center gap-4 bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                  <div className="flex-1">
                    <h3 className="text-white font-medium">🎵 MP3 Lease</h3>
                    <p className="text-xs text-gray-500">MP3 320kbps — Usage commercial limité</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceMp3}
                      onChange={e => setPriceMp3(e.target.value)}
                      step="0.01"
                      min="0"
                      className="w-24 rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white text-right focus:border-violet-500 focus:outline-none"
                    />
                    <span className="text-gray-400">€</span>
                  </div>
                </div>

                {/* WAV Lease */}
                <div className="flex items-center gap-4 bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                  <div className="flex-1">
                    <h3 className="text-white font-medium">📀 WAV Lease</h3>
                    <p className="text-xs text-gray-500">WAV haute qualité — Usage commercial limité</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceWav}
                      onChange={e => setPriceWav(e.target.value)}
                      step="0.01"
                      min="0"
                      className="w-24 rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white text-right focus:border-violet-500 focus:outline-none"
                    />
                    <span className="text-gray-400">€</span>
                  </div>
                </div>

                {/* Unlimited */}
                <div className="flex items-center gap-4 bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                  <div className="flex-1">
                    <h3 className="text-white font-medium">♾️ Unlimited</h3>
                    <p className="text-xs text-gray-500">WAV + Stems — Usage commercial illimité</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceUnlimited}
                      onChange={e => setPriceUnlimited(e.target.value)}
                      step="0.01"
                      min="0"
                      className="w-24 rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white text-right focus:border-violet-500 focus:outline-none"
                    />
                    <span className="text-gray-400">€</span>
                  </div>
                </div>

                {/* Exclusive */}
                <div className="flex items-center gap-4 bg-violet-900/20 border border-violet-500/30 rounded-xl p-4">
                  <div className="flex-1">
                    <h3 className="text-white font-medium">👑 Exclusive</h3>
                    <p className="text-xs text-gray-500">Tous fichiers + Stems — Transfert complet des droits</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceExclusive}
                      onChange={e => setPriceExclusive(e.target.value)}
                      step="0.01"
                      min="0"
                      className="w-24 rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white text-right focus:border-violet-500 focus:outline-none"
                    />
                    <span className="text-gray-400">€</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Résumé */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">📋 Résumé</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Titre</span>
                  <span className="text-white font-medium">{title || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Genre</span>
                  <span className="text-white">{genre || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">BPM / Tonalité</span>
                  <span className="text-white">{bpm || '—'} / {musicKey || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fichiers</span>
                  <span className="text-white">
                    {[mp3File && 'MP3', wavFile && 'WAV', stems.length > 0 && `${stems.length} stems`].filter(Boolean).join(', ') || '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="flex-1 rounded-xl bg-gray-800 hover:bg-gray-700 py-3.5 text-sm font-semibold text-white transition-all">
                ← Infos
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-gray-700 disabled:cursor-not-allowed py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all"
              >
                {loading ? '⏳ Upload en cours...' : '🚀 Publier le beat'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
