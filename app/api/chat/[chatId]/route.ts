import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/rbac';
import connectDB from '@/lib/db';
import Message from '@/models/Message';
import VitalProfile from '@/models/VitalProfile';
import GuardianProfile from '@/models/GuardianProfile';
import User from '@/models/User';
import Notification from '@/models/Notification';

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

    // Fetch messages with optimized query
    const messages = await Message.find({
      vitalId,
      guardianId,
    })
      .sort({ createdAt: 1 })
      .lean()
      .maxTimeMS(5000); // 5 second timeout

    // Batch fetch all unique sender IDs
    const senderIds = [...new Set(messages.map(msg => msg.senderId.toString()))];
    
    // Parallel fetch all profiles
    const [vitals, guardians, users] = await Promise.all([
      VitalProfile.find({ userId: { $in: senderIds } }).lean().maxTimeMS(3000),
      GuardianProfile.find({ userId: { $in: senderIds } }).lean().maxTimeMS(3000),
      User.find({ _id: { $in: senderIds } }).lean().maxTimeMS(3000),
    ]);

    // Create lookup maps for O(1) access
    const vitalMap = new Map(vitals.map(v => [v.userId.toString(), v.name]));
    const guardianMap = new Map(guardians.map(g => [g.userId.toString(), g.name]));
    const userMap = new Map(users.map(u => [u._id.toString(), u.email]));

    // Map messages with sender names (O(n) instead of O(n*m))
    const messagesWithNames = messages.map((msg) => {
      let senderName = 'Unknown';
      const senderIdStr = msg.senderId.toString();
      
      if (msg.senderRole === 'VITAL') {
        senderName = vitalMap.get(senderIdStr) || userMap.get(senderIdStr) || 'Unknown';
      } else {
        senderName = guardianMap.get(senderIdStr) || userMap.get(senderIdStr) || 'Unknown';
      }

      return {
        _id: msg._id.toString(),
        vitalId: msg.vitalId.toString(),
        guardianId: msg.guardianId.toString(),
        senderId: msg.senderId.toString(),
        senderRole: msg.senderRole,
        message: msg.message,
        read: msg.read,
        senderName,
        createdAt: msg.createdAt.toISOString(),
      };
    });

    return NextResponse.json(messagesWithNames);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
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
    const body = await request.json();
    const { vitalId, guardianId, senderId, senderRole, message } = body;

    // Validate required fields
    if (!vitalId || !guardianId || !senderId || !senderRole || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user is the sender
    if (senderId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Verify chat ID matches
    const expectedChatId = `${vitalId}-${guardianId}`;
    if (chatId !== expectedChatId) {
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

    // Create message
    const newMessage = await Message.create({
      vitalId,
      guardianId,
      senderId,
      senderRole,
      message: message.trim(),
      read: false,
    });

    // Get sender name
    let senderName = 'Unknown';
    if (senderRole === 'VITAL') {
      senderName = vitalProfile.name || 'Vital';
    } else {
      senderName = guardianProfile.name || 'Guardian';
    }

    // Create notification for the recipient
    let notification;
    try {
      let recipientUserId;
      if (senderRole === 'VITAL') {
        recipientUserId = guardianProfile.userId;
      } else {
        recipientUserId = vitalProfile.userId;
      }

      if (recipientUserId) {
        notification = await Notification.create({
          userId: recipientUserId,
          type: 'MESSAGE',
          message: `You have a new message from ${senderName}`,
          relatedId: newMessage._id,
        });
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      // Don't fail the message send if notification fails
    }

    const messageResponse = {
      _id: newMessage._id.toString(),
      vitalId,
      guardianId,
      senderId,
      senderRole,
      senderName,
      message: newMessage.message,
      read: false,
      createdAt: newMessage.createdAt.toISOString(),
    };

    // Emit real-time updates via socket server (non-blocking with timeout)
    const emitPromise = (async () => {
      try {
        const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002';
        let recipientUserId;
        if (senderRole === 'VITAL') {
          recipientUserId = guardianProfile.userId;
        } else {
          recipientUserId = vitalProfile.userId;
        }

        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        try {
          await fetch(`${socketServerUrl}/api/emit-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chatId: `${vitalId}-${guardianId}`,
              messageData: messageResponse,
              recipientUserId: recipientUserId?.toString(),
              notification: notification ? {
                _id: notification._id.toString(),
                type: notification.type,
                message: notification.message,
                read: notification.read,
                relatedId: notification.relatedId?.toString(),
                createdAt: notification.createdAt.toISOString(),
              } : undefined,
            }),
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (err: any) {
        // Don't fail if socket server is unavailable or times out
        if (err.name === 'AbortError') {
          console.log('Socket server request timed out');
        } else {
          console.log('Socket server not available for real-time emission:', err.message);
        }
      }
    })();

    // Don't await - let it run in background
    emitPromise.catch(() => {}); // Suppress unhandled rejection

    return NextResponse.json(messageResponse, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

