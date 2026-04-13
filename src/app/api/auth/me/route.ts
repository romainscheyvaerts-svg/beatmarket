import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get('session-token')?.value;

  if (!sessionToken) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          displayName: true,
          name: true,
          role: true,
          subscriptionStatus: true,
        },
      },
    },
  });

  if (!session || session.expires < new Date()) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user: session.user });
}
