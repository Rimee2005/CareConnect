import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/rbac';
import connectDB from '@/lib/db';
import Message from '@/models/Message';
import VitalProfile from '@/models/VitalProfile';
import GuardianProfile from '@/models/GuardianProfile';
import User from '@/models/User';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { chatId } = await params;
    // chatId format: vitalId-guardianId
    const [vitalId, guardianId] = chatId.split('-');

    if (!vitalId || !guardianId) {
      return NextResponse.json({ error: 'Invalid chat ID' }, { status: 400 });
    }

    // Verify user has access to this chat
    const vitalProfile = await VitalProfile.findById(vitalId);
    const guardianProfile = await GuardianProfile.findById(guardianId);

    if (!vitalProfile || !guardianProfile) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Check if user is part of this chat
    const isVital = session.user.role === 'VITAL' && vitalProfile.userId.toString() === session.user.id;
    const isGuardian = session.user.role === 'GUARDIAN' && guardianProfile.userId.toString() === session.user.id;

    if (!isVital && !isGuardian) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch messages
    const messages = await Message.find({
      vitalId,
      guardianId,
    })
      .sort({ createdAt: 1 })
      .lean();

    // Get sender names
    const messagesWithNames = await Promise.all(
      messages.map(async (msg) => {
        const sender = await User.findById(msg.senderId);
        let senderName = 'Unknown';
        
        if (msg.senderRole === 'VITAL') {
          const vital = await VitalProfile.findOne({ userId: msg.senderId });
          senderName = vital?.name || sender?.email || 'Unknown';
        } else {
          const guardian = await GuardianProfile.findOne({ userId: msg.senderId });
          senderName = guardian?.name || sender?.email || 'Unknown';
        }

        return {
          ...msg,
          senderName,
        };
      })
    );

    return NextResponse.json(messagesWithNames);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

