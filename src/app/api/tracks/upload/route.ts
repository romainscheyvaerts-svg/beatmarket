import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MusicKey } from '@prisma/client';
import { cookies } from 'next/headers';

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
    // Auth: get current user from session cookie
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: { message: 'Veuillez vous connecter.' } },
        { status: 401 }
      );
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session || session.expires < new Date()) {
      return NextResponse.json(
        { error: { message: 'Session expirée. Veuillez vous reconnecter.' } },
        { status: 401 }
      );
    }

    const producer = session.user;

    // Auto-upgrade to PRODUCER if needed
    if (producer.role === 'BUYER') {
      await prisma.user.update({
        where: { id: producer.id },
        data: { role: 'PRODUCER' },
      });
    }

    // Parse JSON body
    const body = await request.json();
    const {
      title, description, bpm, musicKey, genre, mood, tags,
      priceMp3Lease, priceWavLease, priceUnlimited, priceExclusive,
      hasMp3, hasWav, hasCover, stemCount, stemLabels,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: { message: 'Le titre est requis' } },
        { status: 400 }
      );
    }

    if (!hasMp3 && !hasWav) {
      return NextResponse.json(
        { error: { message: 'Au moins un fichier audio est requis' } },
        { status: 400 }
      );
    }

    const slug = generateSlug(title.trim());
    const parsedTags = tags
      ? String(tags).split(',').map((t: string) => t.trim()).filter(Boolean)
      : [];

    // Save track to database (files will be uploaded via presigned URLs later)
    const track = await prisma.track.create({
      data: {
        slug,
        title: title.trim(),
        description: description || null,
        producerId: producer.id,
        bpm: bpm ? parseInt(String(bpm)) : null,
        musicKey: (musicKey && Object.values(MusicKey).includes(musicKey as MusicKey))
          ? musicKey as MusicKey
          : null,
        genre: genre || null,
        mood: mood || null,
        tags: parsedTags,
        priceMp3Lease: priceMp3Lease ? parseInt(String(priceMp3Lease)) : null,
        priceWavLease: priceWavLease ? parseInt(String(priceWavLease)) : null,
        priceUnlimited: priceUnlimited ? parseInt(String(priceUnlimited)) : null,
        priceExclusive: priceExclusive ? parseInt(String(priceExclusive)) : null,
        // File info stored as metadata (actual files uploaded separately)
        stemsFileKey: stemCount > 0 ? JSON.stringify(stemLabels || []) : null,
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
