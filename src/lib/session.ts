import { cookies } from 'next/headers';
import { prisma } from './prisma';

export interface SessionUser {
  id: string;
  email: string;
  displayName: string | null;
  name: string | null;
  role: string;
  subscriptionStatus: string | null;
}

export async function getServerSession(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('session-token')?.value;

  if (!sessionToken) return null;

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
    return null;
  }

  return session.user as SessionUser;
}
