import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const isApiRoute = path.startsWith('/api/');

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Middleware:', { path, hasToken: !!token, role: token?.role, isApiRoute });
    }

    // For API routes, return JSON 401 instead of redirect
    if (isApiRoute) {
      if (!token) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Check role-based access for API routes
      if (path.startsWith('/api/vital') && token.role !== 'VITAL') {
        return NextResponse.json(
          { error: 'Forbidden: VITAL role required' },
          { status: 403 }
        );
      }

      if (path.startsWith('/api/guardian') && token.role !== 'GUARDIAN') {
        return NextResponse.json(
          { error: 'Forbidden: GUARDIAN role required' },
          { status: 403 }
        );
      }

      // API route is authorized
      return NextResponse.next();
    }

    // For page routes, handle redirects
    // Protect Vital routes
    if (path.startsWith('/vital')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }
      if (token.role !== 'VITAL') {
        // If user has a different role, redirect to their dashboard
        if (token.role === 'GUARDIAN') {
          return NextResponse.redirect(new URL('/guardian/dashboard', req.url));
        }
        // No role or invalid role - redirect to home
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // Protect Guardian routes
    if (path.startsWith('/guardian')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }
      if (token.role !== 'GUARDIAN') {
        // If user has a different role, redirect to their dashboard
        if (token.role === 'VITAL') {
          return NextResponse.redirect(new URL('/vital/dashboard', req.url));
        }
        // No role or invalid role - redirect to home
        return NextResponse.redirect(new URL('/', req.url));
      }
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
        // Note: We handle API vs page route responses in the middleware function above
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

