import { NextResponse } from 'next/server';
import { requireVital } from '@/lib/rbac';
import connectDB from '@/lib/db';
import GuardianProfile from '@/models/GuardianProfile';
import User from '@/models/User';
import Booking from '@/models/Booking';
import VitalProfile from '@/models/VitalProfile';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireVital();
    await connectDB();

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'Guardian ID is required' }, { status: 400 });
    }

    // Get vital profile
    const vitalProfile = await VitalProfile.findOne({ userId: session.user.id });
    if (!vitalProfile) {
      return NextResponse.json({ error: 'Vital profile not found' }, { status: 404 });
    }

    // Check if there's an accepted or ongoing booking
    const booking = await Booking.findOne({
      vitalId: vitalProfile._id,
      guardianId: id,
      status: { $in: ['ACCEPTED', 'ONGOING'] },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Contact information is only available for accepted or ongoing bookings' },
        { status: 403 }
      );
    }

    // Get guardian profile and user
    const guardianProfile = await GuardianProfile.findById(id);
    if (!guardianProfile) {
      return NextResponse.json({ error: 'Guardian not found' }, { status: 404 });
    }

    const guardianUser = await User.findById(guardianProfile.userId).select('email');
    if (!guardianUser) {
      return NextResponse.json({ error: 'Guardian user not found' }, { status: 404 });
    }

    // Return contact information
    return NextResponse.json({
      email: guardianUser.email,
      phoneNumber: guardianProfile.phoneNumber || undefined,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Failed to fetch contact information' }, { status: 500 });
  }
}

