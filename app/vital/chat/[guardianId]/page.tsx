'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n';
import { ArrowLeft, Send } from 'lucide-react';
import { Toast } from '@/components/ui/toast';

interface Message {
  _id: string;
  vitalId: string;
  guardianId: string;
  senderId: string;
  senderRole: 'VITAL' | 'GUARDIAN';
  message: string;
  senderName?: string;
  read: boolean;
  createdAt: string;
}

export default function ChatPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation();
  const [guardianName, setGuardianName] = useState('');
  const [vitalId, setVitalId] = useState('');
  const [guardianId, setGuardianId] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatIdRef = useRef<string>('');

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch messages when vitalId and guardianId are available
  useEffect(() => {
    if (vitalId && guardianId) {
      console.log('📥 Fetching messages on mount:', { vitalId, guardianId });
      fetchMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vitalId, guardianId]);

  useEffect(() => {
    if (session?.user?.role !== 'VITAL') {
      router.push('/');
      return;
    }
    
    fetchGuardianInfo();
  }, [session, router, params.guardianId]);

  useEffect(() => {
    if (!vitalId || !guardianId || !session?.user?.id) {
      console.log('Waiting for required data:', { vitalId, guardianId, userId: session?.user?.id });
      return;
    }

    console.log('Initializing Socket.io connection...', { vitalId, guardianId });
    
    // Initialize Socket.io connection
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
    const newSocket = io(socketUrl, {
      path: '/api/socket/io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to Socket.io', newSocket.id);
      setConnected(true);
      
      // Create chat ID: vitalId-guardianId (must match format on both sides)
      chatIdRef.current = `${vitalId}-${guardianId}`;
      console.log('Joining chat room:', chatIdRef.current);
      
      // Join the chat room
      newSocket.emit('join-room', {
        userId: session.user.id,
        role: 'VITAL',
        chatId: chatIdRef.current,
      });

      // Load message history after a short delay to ensure room is joined
      setTimeout(() => {
        fetchMessages();
      }, 500);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket.io connection error:', error);
      setConnected(false);
      setToastMessage('Failed to connect to chat server. Please refresh the page.');
      setShowToast(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('⚠️ Disconnected from Socket.io:', reason);
      setConnected(false);
      if (reason === 'io server disconnect') {
        // Server disconnected, reconnect manually
        newSocket.connect();
      }
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected to Socket.io after', attemptNumber, 'attempts');
      setConnected(true);
      
      // Rejoin room after reconnection
      if (chatIdRef.current) {
        newSocket.emit('join-room', {
          userId: session.user.id,
          role: 'VITAL',
          chatId: chatIdRef.current,
        });
      }
    });

    newSocket.on('receive-message', (data: Message) => {
      console.log('📨 Received message:', data);
      setMessages((prev) => {
        // Remove temporary message if it exists and add the real one
        const filtered = prev.filter(msg => !msg._id.startsWith('temp-'));
        // Check if message already exists to avoid duplicates
        const exists = filtered.some(msg => msg._id === data._id);
        if (exists) {
          return filtered;
        }
        return [...filtered, data];
      });
      scrollToBottom();
    });

    newSocket.on('message-sent', (data: { messageId: string }) => {
      console.log('✅ Message sent confirmation:', data.messageId);
      // Remove temporary message and ensure real message is displayed
      setMessages((prev) => {
        const filtered = prev.filter(msg => !msg._id.startsWith('temp-'));
        return filtered;
      });
      // Refetch messages to ensure we have the latest
      setTimeout(() => fetchMessages(), 500);
    });

    newSocket.on('message-error', (data: { error: string }) => {
      console.error('❌ Message error:', data.error);
      setToastMessage(data.error);
      setShowToast(true);
      // Remove temporary message on error
      setMessages((prev) => prev.filter(msg => !msg._id.startsWith('temp-')));
    });

    setSocket(newSocket);

    return () => {
      console.log('Cleaning up socket connection');
      newSocket.close();
    };
  }, [vitalId, guardianId, session]);

  const fetchGuardianInfo = async () => {
    try {
      console.log('📥 Fetching guardian info for ID:', params.guardianId);
      const res = await fetch(`/api/guardians/${params.guardianId}`);
      if (res.ok) {
        const data = await res.json();
        console.log('✅ Guardian data:', data.name, data._id);
        setGuardianName(data.name);
        setGuardianId(data._id);
        
        // Get Vital profile to get vitalId
        const vitalRes = await fetch('/api/vital/profile');
        if (vitalRes.ok) {
          const vitalData = await vitalRes.json();
          console.log('✅ Vital data:', vitalData.name, vitalData._id);
          setVitalId(vitalData._id);
        } else {
          console.error('❌ Failed to fetch vital profile:', vitalRes.status);
        }
      } else {
        console.error('❌ Failed to fetch guardian:', res.status);
      }
    } catch (error) {
      console.error('❌ Error fetching guardian:', error);
    }
  };

  const fetchMessages = async () => {
    if (!vitalId || !guardianId) {
      console.log('⚠️ Cannot fetch messages - missing IDs:', { vitalId, guardianId });
      return;
    }
    
    try {
      const chatId = `${vitalId}-${guardianId}`;
      console.log('📥 Fetching messages for chat:', chatId);
      const res = await fetch(`/api/chat/${chatId}`);
      if (res.ok) {
        const data = await res.json();
        console.log('✅ Fetched messages:', data.length);
        setMessages(data);
        scrollToBottom();
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Failed to fetch messages:', errorData);
      }
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !socket || !connected) {
      if (!connected) {
        setToastMessage('Not connected to chat server. Please wait for connection...');
        setShowToast(true);
      }
      return;
    }
    if (!vitalId || !guardianId || !session?.user?.id) return;

    const messageText = message.trim();
    const chatId = `${vitalId}-${guardianId}`;

    console.log('📤 Sending message:', { vitalId, guardianId, chatId, message: messageText });

    // Optimistically add message to UI
    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      vitalId,
      guardianId,
      senderId: session.user.id,
      senderRole: 'VITAL',
      message: messageText,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);
    setMessage('');

    // Emit message via Socket.io
    socket.emit('send-message', {
      vitalId,
      guardianId,
      senderId: session.user.id,
      senderRole: 'VITAL',
      message: messageText,
      chatId,
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="mx-auto max-w-4xl">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>Chat with {guardianName || 'Guardian'}</CardTitle>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    connected ? 'bg-success' : 'bg-error'
                  }`}
                />
                <span className="text-sm text-text-muted">
                  {connected ? 'Connected' : 'Connecting...'}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Chat Messages Area */}
            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-background-secondary">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-text-muted">
                  <div className="text-center">
                    <p className="text-lg mb-2">💬 Start a conversation</p>
                    <p className="text-sm">Send a message to begin chatting</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isSender = msg.senderRole === 'VITAL';
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs rounded-lg px-4 py-2 ${
                          isSender
                            ? 'bg-primary text-white'
                            : 'bg-white text-text border'
                        }`}
                      >
                        {!isSender && (
                          <p className="text-xs font-semibold mb-1 opacity-80">
                            {msg.senderName || guardianName}
                          </p>
                        )}
                        <p>{msg.message}</p>
                        <p className={`text-xs mt-1 ${isSender ? 'opacity-70' : 'text-text-muted'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="border-t border-border dark:border-border-dark p-4 flex gap-2 bg-white dark:bg-background-dark-secondary transition-colors"
            >
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={!connected}
              />
              <Button
                type="submit"
                disabled={!message.trim() || !connected}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {showToast && (
          <Toast
            message={toastMessage}
            type="error"
            onClose={() => setShowToast(false)}
            duration={5000}
          />
        )}
      </div>
    </div>
  );
}
