/**
 * Socket.io Server - Separate Backend
 * 
 * This server runs independently from Next.js and can be deployed on:
 * - Render (render.com)
 * - Railway (railway.app)
 * - Heroku
 * - Any Node.js hosting platform
 * 
 * DO NOT deploy this on Vercel (serverless functions don't support WebSockets)
 */

require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

// Import database connection and models
// Note: These use relative paths from socket-server directory
let connectDB, Message, Notification, VitalProfile, GuardianProfile;

try {
  // Try ES module style (default export)
  connectDB = require('../lib/db').default || require('../lib/db');
  Message = require('../models/Message').default || require('../models/Message');
  Notification = require('../models/Notification').default || require('../models/Notification');
  VitalProfile = require('../models/VitalProfile').default || require('../models/VitalProfile');
  GuardianProfile = require('../models/GuardianProfile').default || require('../models/GuardianProfile');
} catch (error) {
  // Fallback to CommonJS style
  connectDB = require('../lib/db');
  Message = require('../models/Message');
  Notification = require('../models/Notification');
  VitalProfile = require('../models/VitalProfile');
  GuardianProfile = require('../models/GuardianProfile');
}

const app = express();
const httpServer = http.createServer(app);

// CORS configuration
// IMPORTANT: Update this with your production frontend URL
const allowedOrigins = [
  process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  process.env.NEXTAUTH_URL || 'http://localhost:3000',
  // Add your Vercel deployment URL here
  // 'https://your-app.vercel.app',
];

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        console.warn('⚠️  Blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // Use default path '/socket.io'
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  allowEIO3: true, // Support older Socket.io clients
});

// Health check endpoint (for Render/Railway)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Socket.io Server is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      socket: '/socket.io',
    },
  });
});

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    // Don't exit - server can still run, but socket features won't work
  });

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);
  console.log('📍 Origin:', socket.handshake.headers.origin);

  // Join room based on chat ID
  socket.on('join-room', async (data) => {
    try {
      const { userId, role, chatId } = data;
      
      if (!chatId) {
        console.warn('⚠️  join-room called without chatId');
        return;
      }

      const roomName = `chat-${chatId}`;
      socket.join(roomName);
      console.log(`👤 User ${userId} (${role}) joined room: ${roomName}`);
      
      // Emit confirmation
      socket.emit('room-joined', { roomName, chatId });
    } catch (error) {
      console.error('❌ Error in join-room:', error);
      socket.emit('room-error', { error: 'Failed to join room' });
    }
  });

  // Handle sending messages
  socket.on('send-message', async (data) => {
    try {
      const { vitalId, guardianId, senderId, senderRole, message, chatId } = data;

      // Validate required fields
      if (!vitalId || !guardianId || !senderId || !senderRole || !message) {
        socket.emit('message-error', { error: 'Missing required fields' });
        return;
      }

      // Ensure database connection
      await connectDB();

      // Save message to database
      const savedMessage = await Message.create({
        vitalId,
        guardianId,
        senderId,
        senderRole,
        message,
        read: false,
      });

      const roomName = `chat-${chatId || `${vitalId}-${guardianId}`}`;

      // Get sender name for the message
      let senderName = '';
      try {
        if (senderRole === 'VITAL') {
          const vital = await VitalProfile.findById(vitalId);
          senderName = vital?.name || 'Vital';
        } else {
          const guardian = await GuardianProfile.findById(guardianId);
          senderName = guardian?.name || 'Guardian';
        }
      } catch (error) {
        console.error('Error fetching sender name:', error);
        senderName = senderRole === 'VITAL' ? 'Vital' : 'Guardian';
      }

      const messageData = {
        _id: savedMessage._id.toString(),
        vitalId,
        guardianId,
        senderId,
        senderRole,
        senderName,
        message,
        read: false,
        createdAt: savedMessage.createdAt.toISOString(),
      };

      // Get list of clients in the room for logging
      const room = io.sockets.adapter.rooms.get(roomName);
      const clientsInRoom = room ? Array.from(room).length : 0;
      
      console.log(`📤 Broadcasting message to room ${roomName} (${clientsInRoom} clients)`);

      // Emit to all clients in the room
      io.to(roomName).emit('receive-message', messageData);

      // Send confirmation back to sender
      socket.emit('message-sent', { messageId: savedMessage._id.toString() });

      // Create notification for the recipient
      try {
        let recipientUserId;
        if (senderRole === 'VITAL') {
          const guardian = await GuardianProfile.findById(guardianId);
          recipientUserId = guardian?.userId;
        } else {
          const vital = await VitalProfile.findById(vitalId);
          recipientUserId = vital?.userId;
        }

        if (recipientUserId) {
          await Notification.create({
            userId: recipientUserId,
            type: 'MESSAGE',
            message: `New message from ${senderRole === 'VITAL' ? 'Vital' : 'Guardian'}`,
            relatedId: savedMessage._id,
          });
        }
      } catch (error) {
        console.error('Error creating notification:', error);
        // Don't fail the message send if notification fails
      }

      console.log(`✅ Message broadcasted successfully`);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      socket.emit('message-error', { 
        error: error.message || 'Failed to send message' 
      });
    }
  });

  // Handle marking messages as read
  socket.on('mark-read', async (data) => {
    try {
      const { messageIds } = data;
      
      if (!messageIds || !Array.isArray(messageIds)) {
        return;
      }

      await connectDB();
      await Message.updateMany(
        { _id: { $in: messageIds } },
        { read: true }
      );
      
      console.log(`✅ Marked ${messageIds.length} messages as read`);
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log('❌ Client disconnected:', socket.id, 'Reason:', reason);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });
});

// Start server
const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST || '0.0.0.0';

httpServer.listen(PORT, HOST, () => {
  console.log(`
🚀 Socket.io Server is running!
📍 Port: ${PORT}
🌐 Environment: ${process.env.NODE_ENV || 'development'}
🔗 Socket endpoint: ws://${HOST}:${PORT}/socket.io
📊 Health check: http://${HOST}:${PORT}/health
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

