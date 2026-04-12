import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: { message: 'L\'email est requis' } },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({ where: { email } });

    // SÉCURITÉ : On retourne toujours un succès pour ne pas révéler
    // si un email existe ou non dans la base de données
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
      });
    }

    // Invalider tous les tokens précédents pour cet email
    await prisma.passwordResetToken.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    // Générer un token sécurisé
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    // Sauvegarder le token en base
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    // Envoyer l'email
    const emailResult = await sendPasswordResetEmail(email, token);

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      // On ne révèle pas l'erreur à l'utilisateur
    }

    return NextResponse.json({
      success: true,
      message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: { message: 'Erreur interne du serveur' } },
      { status: 500 }
    );
  }
}