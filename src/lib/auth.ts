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
    async jwt({ token, user }) {
      // two ways of getting user
      // const dbUser: User | null = await db.get(`user:${token.id}`);
      const dbUserResult: string | null = await fetchRedis('get', `user:${token.id}`);

      if (!dbUserResult) {
        token.id = user!.id;
        return token;
      }

      const dbUser: User = JSON.parse(dbUserResult);

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
      }
    },
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.picture;
      }

      return session;
    },
    redirect() {
      return '/dashboard'
    }
  }
};
