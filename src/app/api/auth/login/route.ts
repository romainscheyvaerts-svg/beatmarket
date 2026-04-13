import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: { message: 'Email et mot de passe requis' } },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: { message: 'Email ou mot de passe incorrect' } },
        { status: 401 }
      );
    }

    // Support bcrypt and legacy SHA256 hashes
    let isValid = false;
    if (user.passwordHash.startsWith('$2')) {
      isValid = await bcrypt.compare(password, user.passwordHash);
    } else {
      const sha256Hash = createHash('sha256').update(password).digest('hex');
      isValid = sha256Hash === user.passwordHash;
      // Migrate to bcrypt on successful login
      if (isValid) {
        const newHash = await bcrypt.hash(password, 12);
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: newHash },
        });
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { error: { message: 'Email ou mot de passe incorrect' } },
        { status: 401 }
      );
    }

    // Create session in DB
    const sessionToken = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.session.create({
      data: { sessionToken, userId: user.id, expires },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    });

    response.cookies.set('session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: { message: 'Erreur interne du serveur' } },
      { status: 500 }
    );
  }
}
