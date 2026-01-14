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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireGuardian();
    await connectDB();

    const { id } = await params;
    const { action } = await request.json();

    if (action !== 'accept' && action !== 'reject' && action !== 'complete' && action !== 'start') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const guardianProfile = await GuardianProfile.findOne({
      userId: session.user.id,
    });

    if (!guardianProfile) {
      return NextResponse.json({ error: 'Guardian profile not found' }, { status: 404 });
    }

    const booking = await Booking.findOne({
      _id: id,
      guardianId: guardianProfile._id,
    }).populate('vitalId', '', VitalProfile);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    let newStatus: string;
    if (action === 'accept') {
      newStatus = 'ACCEPTED';
    } else if (action === 'reject') {
      newStatus = 'REJECTED';
    } else if (action === 'start') {
      newStatus = 'ONGOING';
    } else if (action === 'complete') {
      newStatus = 'COMPLETED';
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Validate status transitions
    if (action === 'complete' && booking.status !== 'ONGOING' && booking.status !== 'ACCEPTED') {
      return NextResponse.json(
        { error: 'Can only complete ongoing or accepted bookings' },
        { status: 400 }
      );
    }

    if (action === 'start' && booking.status !== 'ACCEPTED') {
      return NextResponse.json(
        { error: 'Can only start accepted bookings' },
        { status: 400 }
      );
    }

    booking.status = newStatus as any;
    await booking.save();

    // Get vital user
    const vitalProfile = await VitalProfile.findById(booking.vitalId);
    if (vitalProfile) {
      const vitalUser = await User.findById(vitalProfile.userId);

      // Create notification based on action
      let notificationType: string;
      let notificationMessage: string;
      let emailTemplate: any = null;

      if (action === 'accept') {
        notificationType = 'BOOKING_ACCEPTED';
        notificationMessage = `${guardianProfile.name} has accepted your booking request`;
        emailTemplate = emailTemplates.bookingAccepted(vitalProfile.name, guardianProfile.name);
      } else if (action === 'reject') {
        notificationType = 'BOOKING_REJECTED';
        notificationMessage = `${guardianProfile.name} has rejected your booking request`;
        emailTemplate = emailTemplates.bookingRejected(vitalProfile.name, guardianProfile.name);
      } else if (action === 'complete') {
        notificationType = 'BOOKING_COMPLETED';
        notificationMessage = `${guardianProfile.name} has marked your service as completed. You can now leave a review.`;
        emailTemplate = {
          subject: 'Service Completed',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #22c55e;">Service Completed</h2>
              <p>Your service with <strong>${guardianProfile.name}</strong> has been marked as completed.</p>
              <p>Please leave a review to help others find quality care.</p>
              <p style="margin-top: 30px; color: #718096; font-size: 14px;">
                Care with compassion, anytime, anywhere.
              </p>
            </div>
          `,
        };
      } else if (action === 'start') {
        notificationType = 'BOOKING_ACCEPTED'; // Reuse type
        notificationMessage = `${guardianProfile.name} has started your service`;
      }

      if (notificationType) {
        await Notification.create({
          userId: vitalProfile.userId,
          type: notificationType as any,
          message: notificationMessage,
          relatedId: booking._id,
        });
      }

      // Send email
      if (vitalUser?.email && emailTemplate) {
        await sendEmail({
          to: vitalUser.email,
          ...emailTemplate,
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

