import NextAuth, { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcryptjs from 'bcryptjs';
import { z } from 'zod';

import prisma from './lib/prisma';

const DUMMY_HASH = '$2a$12$CwTycUXWue0Thq9StjUM0uJ8.5jM6qD1yF0u3o2O5bC1y2Z3X4Y5W';
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const REQUIRE_VERIFIED_EMAIL = process.env.REQUIRE_VERIFIED_EMAIL === 'true';

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(128),
});

export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 7 },
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/new-account',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      if (pathname.startsWith('/auth')) return true;

      const isProtected =
        pathname.startsWith('/checkout') ||
        pathname.startsWith('/orders') ||
        pathname.startsWith('/profile') ||
        pathname.startsWith('/admin');

      if (isProtected) return isLoggedIn;
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id!;
        token.name = user.name!;
        token.email = user.email!;
        token.role = user.role;
        token.emailVerified = user.emailVerified ?? null;
        token.image = user.image ?? null;
        return token;
      }

      if (trigger === 'update' && typeof token.id === 'string' && token.id) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id },
          select: { role: true, emailVerified: true, name: true, image: true },
        });
        if (fresh) {
          token.role = fresh.role;
          token.emailVerified = fresh.emailVerified;
          token.name = fresh.name;
          token.image = fresh.image;
        }
      }

      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.role = token.role;
      session.user.emailVerified = token.emailVerified ?? null;
      session.user.image = token.image ?? null;
      return session;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email: string = parsed.data.email;
        const password: string = parsed.data.password;
        const user = await prisma.user.findUnique({ where: { email } });

        if (user?.lockedUntil && user.lockedUntil > new Date()) {
          await bcryptjs.compare(password, DUMMY_HASH);
          return null;
        }

        const hashToCheck = user?.password ?? DUMMY_HASH;
        const isValid = await bcryptjs.compare(password, hashToCheck);

        if (!user || !isValid) {
          if (user) {
            const nextAttempts = user.failedAttempts + 1;
            const shouldLock = nextAttempts >= MAX_FAILED_ATTEMPTS;
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedAttempts: shouldLock ? 0 : nextAttempts,
                lockedUntil: shouldLock
                  ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
                  : user.lockedUntil,
              },
            });
          }
          return null;
        }

        if (REQUIRE_VERIFIED_EMAIL && !user.emailVerified) return null;

        if (user.failedAttempts !== 0 || user.lockedUntil) {
          await prisma.user.update({
            where: { id: user.id },
            data: { failedAttempts: 0, lockedUntil: null },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
          image: user.image,
        };
      },
    }),
  ],
};

export const { signIn, signOut, auth, handlers } = NextAuth(authConfig);
