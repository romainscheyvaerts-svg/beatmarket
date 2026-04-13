import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';
import { MusicKey } from '@prisma/client';

// Supabase client for storage
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials');
  return createClient(url, key);
}

// Generate a unique slug from title
function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  const random = Math.random().toString(36).substring(2, 8);
  return `${base}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Get metadata
    const title = formData.get('title') as string;
    const description = formData.get('description') as string || '';
    const bpm = formData.get('bpm') as string;
    const musicKey = formData.get('musicKey') as string;
    const genre = formData.get('genre') as string;
    const mood = formData.get('mood') as string;
    const tagsStr = formData.get('tags') as string;
    const priceMp3Lease = parseInt(formData.get('priceMp3Lease') as string) || null;
    const priceWavLease = parseInt(formData.get('priceWavLease') as string) || null;
    const priceUnlimited = parseInt(formData.get('priceUnlimited') as string) || null;
    const priceExclusive = parseInt(formData.get('priceExclusive') as string) || null;
    const stemCount = parseInt(formData.get('stemCount') as string) || 0;

    if (!title) {
      return NextResponse.json(
        { error: { message: 'Le titre est requis' } },
        { status: 400 }
      );
    }

    // Get files
    const mp3File = formData.get('mp3') as File | null;
    const wavFile = formData.get('wav') as File | null;
    const coverFile = formData.get('cover') as File | null;

    if (!mp3File && !wavFile) {
      return NextResponse.json(
        { error: { message: 'Au moins un fichier audio est requis' } },
        { status: 400 }
      );
    }

    // Get stems
    const stemFiles: { file: File; label: string }[] = [];
    for (let i = 0; i < stemCount; i++) {
      const file = formData.get(`stem_${i}`) as File | null;
      const label = formData.get(`stem_${i}_label`) as string || `Stem ${i + 1}`;
      if (file) {
        stemFiles.push({ file, label });
      }
    }

    // For now, get the first producer from DB (we'll add auth later)
    // TODO: Replace with actual auth when NextAuth is configured
    const producer = await prisma.user.findFirst({
      where: { role: 'PRODUCER' },
    });

    if (!producer) {
      return NextResponse.json(
        { error: { message: 'Aucun producteur trouvé. Veuillez vous connecter.' } },
        { status: 401 }
      );
    }

    const slug = generateSlug(title);
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];

    // Try to upload to Supabase Storage if configured
    let mp3FileKey: string | null = null;
    let wavFileKey: string | null = null;
    let coverArtUrl: string | null = null;
    let stemsFileKey: string | null = null;

    const hasSupabaseStorage = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasSupabaseStorage) {
      try {
        const supabase = getSupabaseAdmin();
        const timestamp = Date.now();

        // Upload MP3
        if (mp3File) {
          const buffer = Buffer.from(await mp3File.arrayBuffer());
          const key = `tracks/${producer.id}/${timestamp}/${mp3File.name}`;
          await supabase.storage.from('audio').upload(key, buffer, {
            contentType: 'audio/mpeg',
            upsert: true,
          });
          mp3FileKey = key;
        }

        // Upload WAV
        if (wavFile) {
          const buffer = Buffer.from(await wavFile.arrayBuffer());
          const key = `tracks/${producer.id}/${timestamp}/${wavFile.name}`;
          await supabase.storage.from('audio').upload(key, buffer, {
            contentType: 'audio/wav',
            upsert: true,
          });
          wavFileKey = key;
        }

        // Upload Cover
        if (coverFile) {
          const buffer = Buffer.from(await coverFile.arrayBuffer());
          const ext = coverFile.name.split('.').pop() || 'jpg';
          const key = `covers/${producer.id}/${timestamp}/cover.${ext}`;
          await supabase.storage.from('audio').upload(key, buffer, {
            contentType: coverFile.type,
            upsert: true,
          });
          const { data: urlData } = supabase.storage.from('audio').getPublicUrl(key);
          coverArtUrl = urlData.publicUrl;
        }

        // Upload Stems
        if (stemFiles.length > 0) {
          const stemKeys: string[] = [];
          for (const stem of stemFiles) {
            const buffer = Buffer.from(await stem.file.arrayBuffer());
            const key = `stems/${producer.id}/${timestamp}/${stem.label.replace(/[^a-zA-Z0-9]/g, '_')}_${stem.file.name}`;
            await supabase.storage.from('audio').upload(key, buffer, {
              contentType: stem.file.type || 'audio/wav',
              upsert: true,
            });
            stemKeys.push(key);
          }
          stemsFileKey = JSON.stringify(stemKeys);
        }
      } catch (storageError) {
        console.error('Supabase Storage error:', storageError);
        // Continue without storage — save metadata only
      }
    }

    // Save track to database
    const track = await prisma.track.create({
      data: {
        slug,
        title,
        description: description || null,
        producerId: producer.id,
        bpm: bpm ? parseInt(bpm) : null,
        musicKey: (musicKey && Object.values(MusicKey).includes(musicKey as MusicKey)) ? musicKey as MusicKey : null,
        genre: genre || null,
        mood: mood || null,
        tags,
        coverArt: coverArtUrl,
        mp3FileKey,
        wavFileKey,
        stemsFileKey,
        priceMp3Lease,
        priceWavLease,
        priceUnlimited,
        priceExclusive,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      track: {
        id: track.id,
        slug: track.slug,
        title: track.title,
        status: track.status,
      },
      message: 'Beat uploadé avec succès !',
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: { message: 'Erreur lors de l\'upload. Veuillez réessayer.' } },
      { status: 500 }
    );
  }
}
