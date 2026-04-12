import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHash } from 'crypto';

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

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
        passwordHash: hashPassword(password),
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

    return NextResponse.json({ 
      success: true,
      user,
      message: 'Compte créé avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: { message: 'Erreur interne du serveur' } },
      { status: 500 }
    );
  }
}
