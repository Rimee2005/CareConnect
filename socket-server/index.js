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
// These are self-contained CommonJS modules in the socket-server directory
const connectDB = require('./lib/db');
const Message = require('./models/Message');
const Notification = require('./models/Notification');
const VitalProfile = require('./models/VitalProfile');
const GuardianProfile = require('./models/GuardianProfile');

const app = express();
const httpServer = http.createServer(app);

// Set server timeouts to prevent hanging connections
httpServer.timeout = 10000; // 10 second timeout
httpServer.keepAliveTimeout = 65000; // 65 seconds
httpServer.headersTimeout = 66000; // 66 seconds

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

// Middleware to parse JSON
app.use(express.json());

// Endpoint for API routes to trigger socket emissions
app.post('/api/emit-message', async (req, res) => {
  // Set response timeout
  req.setTimeout(2000, () => {
    if (!res.headersSent) {
      res.status(200).json({ success: true, timeout: true });
    }
  });

  try {
    const { chatId, messageData, recipientUserId, notification } = req.body;
    
    if (!chatId || !messageData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const roomName = `chat-${chatId}`;
    
    // Emit to all clients in the room (non-blocking)
    io.to(roomName).emit('receive-message', messageData);
    
    // If recipientUserId is provided, emit notification (non-blocking)
    if (recipientUserId && notification) {
      const recipientUserIdStr = recipientUserId.toString();
      const userSockets = Array.from(io.sockets.sockets.values()).filter(
        (s) => s.data?.userId === recipientUserIdStr
      );
      
      userSockets.forEach((userSocket) => {
        userSocket.emit('new-notification', notification);
      });
    }
    
    // Respond immediately without waiting
    res.status(200).json({ 
      success: true, 
      roomName, 
      clientsNotified: io.sockets.adapter.rooms.get(roomName)?.size || 0 
    });
  } catch (error) {
    console.error('Error in /api/emit-message:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
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

  // Store user ID on socket for notification targeting
  socket.on('register-user', (data) => {
    const { userId } = data;
    if (userId) {
      socket.data = { ...socket.data, userId: userId.toString() };
      console.log(`👤 User ${userId} registered on socket ${socket.id}`);
    }
  });

  // Join room based on chat ID (synchronous, no database calls)
  socket.on('join-room', (data) => {
    try {
      const { userId, role, chatId } = data;
      
      if (!chatId) {
        console.warn('⚠️  join-room called without chatId');
        socket.emit('room-error', { error: 'Missing chatId' });
        return;
      }

      // Store user ID on socket for notifications (synchronous)
      if (userId) {
        socket.data = { ...socket.data, userId: userId.toString() };
      }

      const roomName = `chat-${chatId}`;
      socket.join(roomName);
      console.log(`👤 User ${userId} (${role}) joined room: ${roomName}`);
      
      // Emit confirmation immediately (non-blocking)
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

      const roomName = `chat-${chatId || `${vitalId}-${guardianId}`}`;

      // Create timeout promise for database operations
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database operation timeout')), 5000);
      });

      // Parallel database operations with timeout
      const dbOperations = Promise.race([
        (async () => {
          // Ensure database connection
          await connectDB();

          // Parallel fetch profiles and create message
          const [savedMessage, vitalProfile, guardianProfile] = await Promise.all([
            Message.create({
              vitalId,
              guardianId,
              senderId,
              senderRole,
              message,
              read: false,
            }),
            VitalProfile.findById(vitalId).lean().maxTimeMS(2000),
            GuardianProfile.findById(guardianId).lean().maxTimeMS(2000),
          ]);

          // Get sender name
          let senderName = '';
          if (senderRole === 'VITAL') {
            senderName = vitalProfile?.name || 'Vital';
          } else {
            senderName = guardianProfile?.name || 'Guardian';
          }

          return { savedMessage, senderName, vitalProfile, guardianProfile };
        })(),
        timeoutPromise,
      ]);

      const { savedMessage, senderName, vitalProfile, guardianProfile } = await dbOperations;

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

      // Emit to all clients in the room IMMEDIATELY (non-blocking)
      io.to(roomName).emit('receive-message', messageData);

      // Send confirmation back to sender
      socket.emit('message-sent', { messageId: savedMessage._id.toString() });

      // Create notification for the recipient (non-blocking, don't wait)
      (async () => {
        try {
          let recipientUserId;
          if (senderRole === 'VITAL') {
            recipientUserId = guardianProfile?.userId;
          } else {
            recipientUserId = vitalProfile?.userId;
          }

          if (recipientUserId) {
            const notification = await Promise.race([
              Notification.create({
                userId: recipientUserId,
                type: 'MESSAGE',
                message: `You have a new message from ${senderName}`,
                relatedId: savedMessage._id,
              }),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Notification timeout')), 2000)),
            ]);
            
            // Emit notification to the recipient in real-time
            const recipientUserIdStr = recipientUserId.toString();
            const userSockets = Array.from(io.sockets.sockets.values()).filter(
              (s) => s.data?.userId === recipientUserIdStr
            );
            
            console.log(`📢 Emitting notification to ${userSockets.length} socket(s) for user ${recipientUserIdStr}`);
            
            // Emit to all user's sockets
            userSockets.forEach((userSocket) => {
              userSocket.emit('new-notification', {
                _id: notification._id.toString(),
                type: notification.type,
                message: notification.message,
                read: notification.read,
                relatedId: notification.relatedId?.toString(),
                createdAt: notification.createdAt.toISOString(),
              });
            });
          }
        } catch (error) {
          console.error('Error creating notification:', error);
          // Don't fail the message send if notification fails
        }
      })();

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

