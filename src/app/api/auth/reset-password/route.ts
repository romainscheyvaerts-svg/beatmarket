import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHash } from 'crypto';

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: { message: 'Token et mot de passe requis' } },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: { message: 'Le mot de passe doit contenir au moins 8 caractères' } },
        { status: 400 }
      );
    }

    // Trouver le token en base
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: { message: 'Lien de réinitialisation invalide ou expiré' } },
        { status: 400 }
      );
    }

    // Vérifier si le token n'a pas été utilisé
    if (resetToken.used) {
      return NextResponse.json(
        { error: { message: 'Ce lien a déjà été utilisé. Veuillez en demander un nouveau.' } },
        { status: 400 }
      );
    }

    // Vérifier si le token n'est pas expiré
    if (new Date() > resetToken.expires) {
      return NextResponse.json(
        { error: { message: 'Ce lien a expiré. Veuillez en demander un nouveau.' } },
        { status: 400 }
      );
    }

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { passwordHash: hashPassword(password) },
    });

    // Marquer le token comme utilisé
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: { message: 'Erreur interne du serveur' } },
      { status: 500 }
    );
  }
}