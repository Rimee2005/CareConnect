import { NextResponse } from 'next/server';
import { requireGuardian } from '@/lib/rbac';
import connectDB from '@/lib/db';
import VitalProfile from '@/models/VitalProfile';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireGuardian();
    await connectDB();

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Vital ID is required' }, { status: 400 });
    }

    // Guardian can only see Vitals who have booked them
    const Booking = (await import('@/models/Booking')).default;
    const GuardianProfile = (await import('@/models/GuardianProfile')).default;

    const guardianProfile = await GuardianProfile.findOne({
      userId: session.user.id,
    });

    if (!guardianProfile) {
      return NextResponse.json({ error: 'Guardian profile not found' }, { status: 404 });
    }

    // Check if there's a booking between this guardian and vital
    const booking = await Booking.findOne({
      vitalId: id,
      guardianId: guardianProfile._id,
    });

    if (!booking) {
      return NextResponse.json({ error: 'Vital not found or no booking exists' }, { status: 404 });
    }

    const vital = await VitalProfile.findById(id).lean();

    if (!vital) {
      return NextResponse.json({ error: 'Vital not found' }, { status: 404 });
    }

    return NextResponse.json(vital);
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

