import { NextResponse } from 'next/server';
import { requireGuardian } from '@/lib/rbac';
import connectDB from '@/lib/db';
import Booking from '@/models/Booking';
import GuardianProfile from '@/models/GuardianProfile';
import VitalProfile from '@/models/VitalProfile';

export async function GET() {
  try {
    const session = await requireGuardian();
    await connectDB();

    const guardianProfile = await GuardianProfile.findOne({
      userId: session.user.id,
    });

    if (!guardianProfile) {
      return NextResponse.json({ error: 'Guardian profile not found' }, { status: 404 });
    }

    const bookings = await Booking.find({ guardianId: guardianProfile._id })
      .populate('vitalId', 'name profilePhoto', VitalProfile)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(bookings);
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

