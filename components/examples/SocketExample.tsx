/**
 * Example React Component using Socket.io Client
 * 
 * This demonstrates how to safely use the socket in a React component
 * with proper cleanup and error handling.
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { getSocket, disconnectSocket, isSocketConnected } from '@/lib/socket';

interface Message {
  _id: string;
  message: string;
  senderName: string;
  createdAt: string;
}

export function SocketExample() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  useEffect(() => {
    // Initialize socket connection
    try {
      const socket = getSocket({
        transports: ['websocket'], // Prefer websocket
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current = socket;

      // Connection event handlers
      socket.on('connect', () => {
        console.log('✅ Connected to Socket.io');
        setConnected(true);
        setError(null);
      });

      socket.on('disconnect', () => {
        console.log('❌ Disconnected from Socket.io');
        setConnected(false);
      });

      socket.on('connect_error', (err) => {
        console.error('❌ Connection error:', err);
        setError(err.message);
        setConnected(false);
      });

      // Example: Listen for incoming messages
      socket.on('receive-message', (data: Message) => {
        console.log('📨 Received message:', data);
        setMessages((prev) => [...prev, data]);
      });

      // Example: Listen for room join confirmation
      socket.on('room-joined', (data) => {
        console.log('✅ Joined room:', data);
      });

      // Example: Join a chat room
      socket.emit('join-room', {
        userId: 'user-123',
        role: 'VITAL',
        chatId: 'vital-123-guardian-456',
      });

      // Cleanup function
      return () => {
        console.log('🧹 Cleaning up socket connection...');
        
        // Remove all event listeners
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.off('receive-message');
        socket.off('room-joined');

        // Disconnect socket (optional - singleton will handle reconnection)
        // Only disconnect if you're sure the component won't need it again
        // disconnectSocket();
      };
    } catch (err) {
      console.error('❌ Failed to initialize socket:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []); // Empty deps - only run once on mount

  // Example: Send a message
  const sendMessage = (messageText: string) => {
    if (!socketRef.current || !connected) {
      setError('Socket not connected');
      return;
    }

    socketRef.current.emit('send-message', {
      vitalId: 'vital-123',
      guardianId: 'guardian-456',
      senderId: 'user-123',
      senderRole: 'VITAL',
      message: messageText,
      chatId: 'vital-123-guardian-456',
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Socket.io Example</h2>
      
      <div className="mb-4">
        <p>
          Status:{' '}
          <span className={connected ? 'text-green-500' : 'text-red-500'}>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </p>
        {error && <p className="text-red-500 text-sm mt-2">Error: {error}</p>}
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Messages:</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-sm">No messages yet</p>
          ) : (
            messages.map((msg) => (
              <div key={msg._id} className="p-2 bg-gray-100 rounded">
                <p className="font-semibold text-sm">{msg.senderName}</p>
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs text-gray-500">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <button
        onClick={() => sendMessage('Hello from client!')}
        disabled={!connected}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        Send Test Message
      </button>
    </div>
  );
}

