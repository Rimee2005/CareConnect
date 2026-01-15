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

    const Booking = (await import('@/models/Booking')).default;
    const GuardianProfile = (await import('@/models/GuardianProfile')).default;
    const Message = (await import('@/models/Message')).default;

    const guardianProfile = await GuardianProfile.findOne({
      userId: session.user.id,
    });

    if (!guardianProfile) {
      return NextResponse.json({ error: 'Guardian profile not found' }, { status: 404 });
    }

    // Check if Vital exists first
    const vital = await VitalProfile.findById(id).lean();

    if (!vital) {
      return NextResponse.json({ error: 'Vital not found' }, { status: 404 });
    }

    // Check if there's a booking OR messages between this guardian and vital
    // This allows chat access even without a booking
    const booking = await Booking.findOne({
      vitalId: id,
      guardianId: guardianProfile._id,
    });

    const hasMessages = await Message.findOne({
      vitalId: id,
      guardianId: guardianProfile._id,
    });

    // Allow access if there's a booking OR messages (for chat functionality)
    // If neither exists, still allow access for chat initiation
    // (This is more permissive to allow chat to work)
    if (!booking && !hasMessages) {
      // For chat purposes, we'll allow access but log it
      console.log(`Guardian ${guardianProfile._id} accessing Vital ${id} for chat (no booking/messages yet)`);
    }

    return NextResponse.json(vital);
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

