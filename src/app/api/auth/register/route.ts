import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { displayName, email, password, role, paypalEmail, paypalPayoutPreferred } = body;

    // Validation
    if (!displayName || !email || !password) {
      return NextResponse.json(
        { error: { message: 'Tous les champs obligatoires doivent être remplis' } },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: { message: 'Le mot de passe doit contenir au moins 8 caractères' } },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: { message: 'Un compte existe déjà avec cet email' } },
        { status: 409 }
      );
    }

    // Vérifier si le displayName existe déjà
    const existingName = await prisma.user.findUnique({ where: { displayName } });
    if (existingName) {
      return NextResponse.json(
        { error: { message: 'Ce nom d\'artiste est déjà pris' } },
        { status: 409 }
      );
    }

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        displayName,
        name: displayName,
        passwordHash: await bcrypt.hash(password, 12),
        role: role === 'PRODUCER' ? 'PRODUCER' : 'BUYER',
        paypalEmail: paypalEmail || null,
        paypalPayoutPreferred: paypalPayoutPreferred || false,
        gdprConsent: true,
        gdprConsentDate: new Date(),
        subscriptionStatus: role === 'PRODUCER' ? 'trialing' : null,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
      },
    });

    // Create session immediately after registration
    const sessionToken = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: { sessionToken, userId: user.id, expires },
    });

    const response = NextResponse.json(
      { success: true, user, message: 'Compte créé avec succès' },
      { status: 201 }
    );

    response.cookies.set('session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Register error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { error: { message: `Erreur interne du serveur: ${errorMessage}` } },
      { status: 500 }
    );
  }
}
