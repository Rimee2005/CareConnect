import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/rbac';
import connectDB from '@/lib/db';
import Booking from '@/models/Booking';
import VitalProfile from '@/models/VitalProfile';
import GuardianProfile from '@/models/GuardianProfile';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const booking = await Booking.findById(id)
      .populate('vitalId', 'name', VitalProfile)
      .populate('guardianId', 'name', GuardianProfile)
      .lean();

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify user has access
    const vitalProfile = await VitalProfile.findById(booking.vitalId);
    const guardianProfile = await GuardianProfile.findById(booking.guardianId);

    if (!vitalProfile || !guardianProfile) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const isVital = session.user.role === 'VITAL' && vitalProfile.userId.toString() === session.user.id;
    const isGuardian = session.user.role === 'GUARDIAN' && guardianProfile.userId.toString() === session.user.id;

    if (!isVital && !isGuardian) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(booking);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

