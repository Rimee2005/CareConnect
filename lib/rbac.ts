import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export type UserRole = 'VITAL' | 'GUARDIAN';

export async function requireAuth(request?: NextRequest | Request) {
  // In Next.js App Router, getServerSession automatically reads cookies from headers
  // But we can also pass headers explicitly if needed
  const session = await getServerSession(authOptions);
  
  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[requireAuth]', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userRole: session?.user?.role,
      userEmail: session?.user?.email,
    });
  }
  
  if (!session || !session.user) {
    return null;
  }

  return session;
}

export async function requireRole(allowedRoles: UserRole[], request?: NextRequest | Request) {
  const session = await requireAuth(request);
  
  if (!session) {
    throw new Error('Unauthorized');
  }

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[requireRole]', {
      allowedRoles,
      userRole: session.user.role,
      userId: session.user.id,
      hasRole: !!session.user.role,
      isAllowed: allowedRoles.includes(session.user.role as UserRole),
    });
  }

  if (!session.user.role || !allowedRoles.includes(session.user.role as UserRole)) {
    throw new Error(`Forbidden: Insufficient permissions. Required: ${allowedRoles.join(' or ')}, Got: ${session.user.role || 'none'}`);
  }

  return session;
}

export async function requireVital(request?: NextRequest | Request) {
  return requireRole(['VITAL'], request);
}

export async function requireGuardian(request?: NextRequest | Request) {
  return requireRole(['GUARDIAN'], request);
}

export function createApiResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

export function createApiError(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

