import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Public routes that should never be intercepted by auth
const publicRoutes = [
  '/',
  '/auth',
  '/about',
  '/contact',
  '/help',
  '/press',
  '/pricing',
  '/privacy',
  '/terms',
  '/api/auth', // NextAuth routes must be public
];

function isPublicRoute(path: string): boolean {
  return publicRoutes.some(route => path === route || path.startsWith(`${route}/`));
}

// Custom middleware that handles public routes separately
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // If it's a public route, skip auth entirely
  if (isPublicRoute(path)) {
    return NextResponse.next();
  }

  // For protected routes, check auth manually
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isApiRoute = path.startsWith('/api/');

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware:', { 
      path, 
      hasToken: !!token, 
      role: token?.role, 
      tokenKeys: token ? Object.keys(token) : [],
      isApiRoute 
    });
  }

  // For API routes, return JSON 401 instead of redirect
  if (isApiRoute) {
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Log token details for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Middleware API check:', {
        path,
        tokenRole: token.role,
        tokenId: token.id,
        tokenEmail: token.email,
        hasRole: !!token.role,
      });
    }

    // Check role-based access for API routes
    // IMPORTANT: Check more specific routes FIRST (e.g., /api/guardians before /api/guardian)
    
    // /api/guardians route - let the route handler validate the role
    // The route handler uses getServerSession which reads from cookies and has the role
    // This allows the route handler to properly validate using requireVital()
    if (path.startsWith('/api/guardians')) {
      // Token exists (user is authenticated), allow through for route handler to validate role
      return NextResponse.next();
    }

    // /api/vital/* routes require VITAL role
    if (path.startsWith('/api/vital') && token.role && token.role !== 'VITAL') {
      return NextResponse.json(
        { error: `Forbidden: VITAL role required. Got: ${token.role}` },
        { status: 403 }
      );
    }

    // /api/guardian/* routes require GUARDIAN role
    // Note: This must come AFTER /api/guardians check to avoid matching it
    if (path.startsWith('/api/guardian') && token.role && token.role !== 'GUARDIAN') {
      return NextResponse.json(
        { error: `Forbidden: GUARDIAN role required. Got: ${token.role}` },
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
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(loginUrl);
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
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(loginUrl);
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
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

