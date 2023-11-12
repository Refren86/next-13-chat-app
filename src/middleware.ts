import { getToken } from 'next-auth/jwt';
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(async function middleware(req) {
  // path user tries to access
  const pathname = req.nextUrl.pathname;

  // manage routes protection
  const isAuth = await getToken({ req });
  const isLoginPage = pathname.startsWith('/login');

  const sensitiveRoutes = ['/dashboard'];
  const isAccessingSensitiveRoute = sensitiveRoutes.some((route) => pathname.startsWith(route));

  console.log('isAuth', isAuth);

  if (isLoginPage) {
    if (isAuth) {
      // req.url -> base url
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  }

  if (!isAuth && isAccessingSensitiveRoute) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
}, {
  // to prevent bugs from next-auth while redirecting
  callbacks: {
    async authorized() {
      return true;
    }
  }
});

export const config = {
  // routes where this middleware runs
  matcher: ['/', '/login', '/dashboard/:path*'],
};
