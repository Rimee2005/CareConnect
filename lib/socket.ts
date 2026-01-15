/**
 * Socket.io Client for Next.js (Vercel-compatible)
 * 
 * This file contains ONLY the Socket.io CLIENT code.
 * The Socket.io SERVER runs separately on Render/Railway.
 * 
 * IMPORTANT: This uses singleton pattern to prevent multiple connections.
 */

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Get or create a singleton Socket.io client instance
 * 
 * @param options - Optional socket configuration
 * @returns Socket instance
 */
export function getSocket(options?: {
  path?: string;
  transports?: ('websocket' | 'polling')[];
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  timeout?: number;
}): Socket {
  // Return existing socket if already connected
  if (socket && socket.connected) {
    return socket;
  }

  // Get Socket.io server URL from environment variable
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
  
  if (!socketUrl) {
    throw new Error(
      'NEXT_PUBLIC_SOCKET_URL is not set. Please add it to your .env.local file.\n' +
      'Example: NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.onrender.com'
    );
  }

  // Create new socket connection
  socket = io(socketUrl, {
    path: options?.path || '/socket.io',
    transports: options?.transports || ['websocket'], // Prefer websocket, fallback to polling
    reconnection: options?.reconnection !== false, // Default: true
    reconnectionAttempts: options?.reconnectionAttempts || 5,
    reconnectionDelay: options?.reconnectionDelay || 1000,
    timeout: options?.timeout || 20000,
    // Force websocket transport for better performance
    upgrade: true,
    rememberUpgrade: true,
  });

  // Log connection events (only in development)
  if (process.env.NODE_ENV === 'development') {
    socket.on('connect', () => {
      console.log('✅ Socket.io connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket.io disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket.io connection error:', error.message);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket.io reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_error', (error) => {
      console.error('❌ Socket.io reconnection error:', error.message);
    });

    socket.on('reconnect_failed', () => {
      console.error('❌ Socket.io reconnection failed after all attempts');
    });
  }

  return socket;
}

/**
 * Disconnect the socket (useful for cleanup)
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Check if socket is connected
 */
export function isSocketConnected(): boolean {
  return socket?.connected || false;
}

/**
 * Get the current socket instance (may be null if not initialized)
 */
export function getSocketInstance(): Socket | null {
  return socket;
}
