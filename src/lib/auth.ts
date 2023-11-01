import { NextAuthOptions } from 'next-auth';
import { UpstashRedisAdapter } from '@next-auth/upstash-redis-adapter';
import GoogleProvider from 'next-auth/providers/google';

import { db } from './db';
import { fetchRedis } from '@/helpers/redis';

function getGoogleCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId) {
    throw new Error('Missing google client id');
  }

  if (!clientSecret) {
    throw new Error('Missing google client secret');
  }

  return {
    clientId,
    clientSecret,
  };
}

export const authOptions: NextAuthOptions = {
  adapter: UpstashRedisAdapter(db),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [GoogleProvider(getGoogleCredentials())],
  callbacks: {
    async signIn({ user }) {
      user.isAdmin = false;
      user.isGuest = true;
      return true;
    },
    async jwt({ token, user }) {
      // two ways of getting user
      // const dbUser: AppUser | null = await db.get(`user:${token.id}`);
      const userFromDB: string | null = await fetchRedis('get', `user:${token.id}`);

      if (!userFromDB) {
        token.id = user.id;
        token.isGuest = true;
        token.isAdmin = false;
        return token;
      }

      const dbUser: AppUser = JSON.parse(userFromDB);

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
        isGuest: dbUser.isGuest,
        isAdmin: dbUser.isAdmin,
      };
    },
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.picture;
        session.user.isGuest = token.isGuest;
        session.user.isAdmin = token.isAdmin;
      }

      return session;
    },
    redirect() {
      return '/dashboard';
    },
  },
};
