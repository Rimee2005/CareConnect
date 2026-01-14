import { NextResponse } from 'next/server';
import { requireGuardian } from '@/lib/rbac';
import connectDB from '@/lib/db';
import Booking from '@/models/Booking';
import GuardianProfile from '@/models/GuardianProfile';
import Notification from '@/models/Notification';
import VitalProfile from '@/models/VitalProfile';
import User from '@/models/User';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireGuardian();
    await connectDB();

    const { action } = await request.json();

    if (action !== 'accept' && action !== 'reject') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const guardianProfile = await GuardianProfile.findOne({
      userId: session.user.id,
    });

    if (!guardianProfile) {
      return NextResponse.json({ error: 'Guardian profile not found' }, { status: 404 });
    }

    const booking = await Booking.findOne({
      _id: params.id,
      guardianId: guardianProfile._id,
    }).populate('vitalId', '', VitalProfile);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const newStatus = action === 'accept' ? 'ACCEPTED' : 'REJECTED';
    booking.status = newStatus;
    await booking.save();

    // Get vital user
    const vitalProfile = await VitalProfile.findById(booking.vitalId);
    if (vitalProfile) {
      const vitalUser = await User.findById(vitalProfile.userId);

      // Create notification
      await Notification.create({
        userId: vitalProfile.userId,
        type: action === 'accept' ? 'BOOKING_ACCEPTED' : 'BOOKING_REJECTED',
        message: `${guardianProfile.name} has ${action === 'accept' ? 'accepted' : 'rejected'} your booking request`,
        relatedId: booking._id,
      });

      // Send email
      if (vitalUser?.email) {
        await sendEmail({
          to: vitalUser.email,
          ...(action === 'accept'
            ? emailTemplates.bookingAccepted(
                vitalProfile.name,
                guardianProfile.name
              )
            : emailTemplates.bookingRejected(
                vitalProfile.name,
                guardianProfile.name
              )),
        });
      }
    }

    return NextResponse.json(booking);
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Failed to update booking' }, { status: 500 });
  }
}

