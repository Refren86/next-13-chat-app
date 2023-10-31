import type { Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

declare module 'next-auth/jwt' {
  interface JWT {
    id: UserId;
    isGuest: boolean;
    isAdmin: boolean;
  }
}

declare module 'next-auth' {
  interface Session {
    user: User;
  }

  interface User {
    id: string;
    isGuest: boolean;
    isAdmin: boolean;
  }
}
