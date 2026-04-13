import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: { message: 'Non authentifié' } }, { status: 401 });
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session || session.expires < new Date()) {
      return NextResponse.json({ error: { message: 'Session expirée' } }, { status: 401 });
    }

    const body = await request.json();
    const { displayName, paypalEmail, paypalPayoutPreferred } = body;

    const updateData: Record<string, unknown> = {};

    if (displayName !== undefined) {
      if (displayName.trim().length < 2) {
        return NextResponse.json({ error: { message: 'Le nom doit faire au moins 2 caractères' } }, { status: 400 });
      }
      // Check uniqueness
      const existing = await prisma.user.findFirst({
        where: { displayName: displayName.trim(), NOT: { id: session.userId } },
      });
      if (existing) {
        return NextResponse.json({ error: { message: 'Ce nom d\'artiste est déjà pris' } }, { status: 400 });
      }
      updateData.displayName = displayName.trim();
    }

    if (paypalEmail !== undefined) {
      updateData.paypalEmail = paypalEmail.trim() || null;
    }

    if (paypalPayoutPreferred !== undefined) {
      updateData.paypalPayoutPreferred = Boolean(paypalPayoutPreferred);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        paypalEmail: true,
        paypalPayoutPreferred: true,
        stripeConnectId: true,
        stripeOnboardingDone: true,
        subscriptionStatus: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: { message: 'Erreur serveur' } }, { status: 500 });
  }
}
