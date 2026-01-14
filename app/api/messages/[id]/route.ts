import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/rbac';
import connectDB from '@/lib/db';
import Message from '@/models/Message';

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
    const message = await Message.findById(id).lean();

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Verify user has access to this message
    const VitalProfile = (await import('@/models/VitalProfile')).default;
    const GuardianProfile = (await import('@/models/GuardianProfile')).default;

    const vitalProfile = await VitalProfile.findById(message.vitalId);
    const guardianProfile = await GuardianProfile.findById(message.guardianId);

    if (!vitalProfile || !guardianProfile) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Check if user is part of this chat
    const isVital = session.user.role === 'VITAL' && vitalProfile.userId.toString() === session.user.id;
    const isGuardian = session.user.role === 'GUARDIAN' && guardianProfile.userId.toString() === session.user.id;

    if (!isVital && !isGuardian) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Convert ObjectIds to strings
    return NextResponse.json({
      ...message,
      _id: message._id.toString(),
      vitalId: message.vitalId.toString(),
      guardianId: message.guardianId.toString(),
      senderId: message.senderId.toString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

