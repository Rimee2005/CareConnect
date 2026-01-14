import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Protect Vital routes
    if (path.startsWith('/vital') && token?.role !== 'VITAL') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Protect Guardian routes
    if (path.startsWith('/guardian') && token?.role !== 'GUARDIAN') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Public routes
        if (
          path === '/' ||
          path.startsWith('/auth') ||
          path.startsWith('/about') ||
          path.startsWith('/api/auth')
        ) {
          return true;
        }

        // Protected routes require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/vital/:path*',
    '/guardian/:path*',
    '/api/vital/:path*',
    '/api/guardian/:path*',
    '/api/bookings/:path*',
    '/api/notifications/:path*',
  ],
};

