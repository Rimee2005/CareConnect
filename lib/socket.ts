import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Socket } from 'socket.io';

// Ensure environment variables are loaded (for TypeScript/ESM context)
// This runs when the module is first loaded
if (typeof process !== 'undefined') {
  try {
    // Always try to load dotenv to ensure env vars are available
    const dotenv = require('dotenv');
    const result = dotenv.config({ path: '.env.local' });
    if (result.error && !process.env.MONGODB_URI) {
      console.warn('Warning: Could not load .env.local, MONGODB_URI may not be set');
    }
  } catch (e) {
    // dotenv might not be available, but that's okay if env vars are already set
    if (!process.env.MONGODB_URI) {
      console.warn('Warning: dotenv not available and MONGODB_URI not set');
    }
  }
}

import connectDB from './db';
import Message from '../models/Message';
import Notification from '../models/Notification';
import VitalProfile from '../models/VitalProfile';
import GuardianProfile from '../models/GuardianProfile';

let io: SocketIOServer | null = null;

export function initSocketIO(server: HTTPServer) {
  if (io) {
    return io;
  }

  io = new SocketIOServer(server, {
    path: '/api/socket/io',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXTAUTH_URL || '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Join room based on chat ID
    socket.on('join-room', async (data: { userId: string; role: string; chatId: string }) => {
      const roomName = `chat-${data.chatId}`;
      socket.join(roomName);
      console.log(`User ${data.userId} joined room ${roomName}`);
    });

    // Handle sending messages
    socket.on('send-message', async (data: {
      vitalId: string;
      guardianId: string;
      senderId: string;
      senderRole: 'VITAL' | 'GUARDIAN';
      message: string;
      chatId: string;
    }) => {
      try {
        // Verify MONGODB_URI is available
        if (!process.env.MONGODB_URI) {
          console.error('MONGODB_URI not found in process.env');
          // Try to reload dotenv
          try {
            require('dotenv').config({ path: '.env.local' });
          } catch (e) {
            console.error('Failed to load dotenv:', e);
          }
          
          if (!process.env.MONGODB_URI) {
            socket.emit('message-error', { error: 'Database configuration error' });
            return;
          }
        }
        
        await connectDB();

        // Save message to database
        const savedMessage = await Message.create({
          vitalId: data.vitalId,
          guardianId: data.guardianId,
          senderId: data.senderId,
          senderRole: data.senderRole,
          message: data.message,
          read: false,
        });

        const roomName = `chat-${data.chatId}`;
        
        // Get sender name for the message
        let senderName = '';
        if (data.senderRole === 'VITAL') {
          const vital = await VitalProfile.findById(data.vitalId);
          senderName = vital?.name || 'Vital';
        } else {
          const guardian = await GuardianProfile.findById(data.guardianId);
          senderName = guardian?.name || 'Guardian';
        }
        
        const messageData = {
          _id: savedMessage._id.toString(),
          vitalId: data.vitalId,
          guardianId: data.guardianId,
          senderId: data.senderId,
          senderRole: data.senderRole,
          senderName,
          message: data.message,
          read: false,
          createdAt: savedMessage.createdAt.toISOString(),
        };
        
        console.log(`📤 Broadcasting message to room ${roomName}:`, messageData);
        
        // Get list of clients in the room for debugging
        const room = io?.sockets.adapter.rooms.get(roomName);
        const clientsInRoom = room ? Array.from(room).length : 0;
        console.log(`👥 Clients in room ${roomName}: ${clientsInRoom}`);
        
        // Emit to all clients in the room
        io?.to(roomName).emit('receive-message', messageData);
        
        // Also send confirmation back to sender
        socket.emit('message-sent', { messageId: savedMessage._id.toString() });
        
        console.log(`✅ Message broadcasted to room ${roomName} (${clientsInRoom} clients)`);

        // Create notification for the recipient
        let recipientUserId;
        if (data.senderRole === 'VITAL') {
          const guardian = await GuardianProfile.findById(data.guardianId);
          recipientUserId = guardian?.userId;
        } else {
          const vital = await VitalProfile.findById(data.vitalId);
          recipientUserId = vital?.userId;
        }

        if (recipientUserId) {
          await Notification.create({
            userId: recipientUserId,
            type: 'MESSAGE',
            message: `New message from ${data.senderRole === 'VITAL' ? 'Vital' : 'Guardian'}`,
            relatedId: savedMessage._id,
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message-error', { error: 'Failed to send message' });
      }
    });

    // Handle marking messages as read
    socket.on('mark-read', async (data: { messageIds: string[] }) => {
      try {
        await connectDB();
        await Message.updateMany(
          { _id: { $in: data.messageIds } },
          { read: true }
        );
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export function getIO() {
  return io;
}
