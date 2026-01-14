import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { NextRequest, NextResponse } from 'next/server';

export type UserRole = 'VITAL' | 'GUARDIAN';

export async function requireAuth(request?: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return null;
  }

  return session;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth();
  
  if (!session) {
    throw new Error('Unauthorized');
  }

  if (!allowedRoles.includes(session.user.role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  return session;
}

export async function requireVital() {
  return requireRole(['VITAL']);
}

export async function requireGuardian() {
  return requireRole(['GUARDIAN']);
}

export function createApiResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

export function createApiError(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

