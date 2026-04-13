import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get('session-token')?.value;

  if (!sessionToken) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    select: { userId: true, expires: true },
  });

  if (!session || session.expires < new Date()) {
    return NextResponse.json({ error: 'Session expirée' }, { status: 401 });
  }

  const tracks = await prisma.track.findMany({
    where: { producerId: session.userId },
    select: {
      id: true,
      title: true,
      genre: true,
      bpm: true,
      status: true,
      playCount: true,
      priceMp3Lease: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ tracks });
}
