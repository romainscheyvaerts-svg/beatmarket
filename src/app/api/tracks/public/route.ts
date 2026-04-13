import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tracks = await prisma.track.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        genre: true,
        mood: true,
        bpm: true,
        musicKey: true,
        tags: true,
        coverArt: true,
        previewUrl: true,
        priceMp3Lease: true,
        priceWavLease: true,
        priceUnlimited: true,
        priceExclusive: true,
        playCount: true,
        likeCount: true,
        createdAt: true,
        producer: {
          select: {
            id: true,
            displayName: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Public tracks error:', error);
    return NextResponse.json({ tracks: [] });
  }
}
