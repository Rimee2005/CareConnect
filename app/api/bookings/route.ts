import { NextResponse } from 'next/server';
import { requireVital } from '@/lib/rbac';
import connectDB from '@/lib/db';
import Booking from '@/models/Booking';
import Notification from '@/models/Notification';
import GuardianProfile from '@/models/GuardianProfile';
import User from '@/models/User';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const session = await requireVital();
    await connectDB();

    const { guardianId, notes } = await request.json();

    if (!guardianId) {
      return NextResponse.json({ error: 'Guardian ID is required' }, { status: 400 });
    }

    // Get vital profile
    const vitalProfile = await require('@/models/VitalProfile').default.findOne({
      userId: session.user.id,
    });

    if (!vitalProfile) {
      return NextResponse.json({ error: 'Vital profile not found' }, { status: 404 });
    }

    // Check for existing pending booking
    const existing = await Booking.findOne({
      vitalId: vitalProfile._id,
      guardianId,
      status: 'PENDING',
    });

    if (existing) {
      return NextResponse.json({ error: 'Booking request already exists' }, { status: 400 });
    }

    // Create booking
    const booking = await Booking.create({
      vitalId: vitalProfile._id,
      guardianId,
      status: 'PENDING',
      notes,
    });

    // Get guardian user
    const guardianProfile = await GuardianProfile.findById(guardianId);
    if (guardianProfile) {
      const guardianUser = await User.findById(guardianProfile.userId);

      // Create notification for guardian
      await Notification.create({
        userId: guardianProfile.userId,
        type: 'BOOKING_REQUEST',
        message: `${vitalProfile.name} has requested your care services`,
        relatedId: booking._id,
      });

      // Send email to guardian
      if (guardianUser?.email) {
        await sendEmail({
          to: guardianUser.email,
          subject: 'New Booking Request',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #14b8a6;">New Booking Request</h2>
              <p>${vitalProfile.name} has requested your care services.</p>
              <p>Please log in to your dashboard to accept or reject the request.</p>
            </div>
          `,
        });
      }
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create booking' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await requireVital();
    await connectDB();

    const vitalProfile = await require('@/models/VitalProfile').default.findOne({
      userId: session.user.id,
    });

    if (!vitalProfile) {
      return NextResponse.json({ error: 'Vital profile not found' }, { status: 404 });
    }

    const bookings = await Booking.find({ vitalId: vitalProfile._id })
      .populate({
        path: 'guardianId',
        select: 'name profilePhoto specialization availability',
        model: GuardianProfile
      })
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

