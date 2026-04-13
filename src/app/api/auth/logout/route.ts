import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get('session-token')?.value;

  if (sessionToken) {
    try {
      await prisma.session.deleteMany({ where: { sessionToken } });
    } catch {
      // Ignore DB errors on logout
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('session-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
    path: '/',
  });

  return response;
}
