'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send } from 'lucide-react';

interface Message {
  _id: string;
  senderRole: 'VITAL' | 'GUARDIAN';
  message: string;
  senderName?: string;
  createdAt: string;
}

export default function GuardianChatPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const [vitalName, setVitalName] = useState('Vital');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isUserScrolling = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = (force = false) => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      
      if (force || isNearBottom || !isUserScrolling.current) {
        requestAnimationFrame(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          }
        });
      }
    }
  };

  // Track user scrolling
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      isUserScrolling.current = true;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        isUserScrolling.current = false;
      }, 1000);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Check session
  useEffect(() => {
    if (session?.user?.role !== 'GUARDIAN') {
      router.push('/');
      return;
    }
  }, [session, router]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      return;
    }

    const messageText = message.trim();

    // Add message locally only
    const newMessage: Message = {
      _id: `local-${Date.now()}`,
      senderRole: 'GUARDIAN',
      message: messageText,
      createdAt: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, newMessage]);
    setMessage('');
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

        <Card className="mx-auto max-w-4xl dark:bg-background-dark-secondary dark:border-border-dark/60">
          <CardHeader className="border-b dark:border-border-dark/60">
            <CardTitle className="dark:text-text-dark">Chat with {vitalName}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Chat Messages Area */}
            <div 
              ref={messagesContainerRef}
              className="h-96 overflow-y-auto p-4 space-y-4 bg-background-secondary dark:bg-background-dark-secondary/60"
            >
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-text-muted dark:text-text-dark-muted">
                  <div className="text-center">
                    <p className="text-lg mb-2 dark:text-text-dark">💬 Start a conversation</p>
                    <p className="text-sm dark:text-text-dark-muted">Send a message to begin chatting</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isSender = msg.senderRole === 'GUARDIAN';
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs rounded-lg px-4 py-2.5 ${
                          isSender
                            ? 'bg-primary text-white dark:bg-primary-dark-mode dark:text-white shadow-sm'
                            : 'bg-white text-text border border-border dark:bg-background-dark dark:text-text-dark dark:border-border-dark/60 shadow-sm'
                        }`}
                      >
                        {!isSender && (
                          <p className="text-xs font-semibold mb-1.5 opacity-90 dark:opacity-100 dark:text-text-dark">
                            {msg.senderName || vitalName}
                          </p>
                        )}
                        <p className={`${isSender ? 'text-white' : 'text-text dark:text-text-dark'}`}>{msg.message}</p>
                        <p className={`text-xs mt-1.5 ${isSender ? 'opacity-80 text-white/90' : 'text-text-muted dark:text-text-dark-muted'}`}>
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
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="border-t border-border dark:border-border-dark/60 p-4 flex gap-2 bg-white dark:bg-background-dark transition-colors"
            >
              <Input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 dark:bg-background-dark-secondary dark:border-border-dark/60 dark:text-text-dark dark:placeholder:text-text-dark-muted/80 dark:focus-visible:ring-primary-dark-mode/50 dark:focus-visible:border-primary-dark-mode/60"
                autoFocus
                autoComplete="off"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && message.trim()) {
                    e.preventDefault();
                    handleSendMessage(e as any);
                  }
                }}
              />
              <Button
                type="submit"
                disabled={!message.trim()}
                className="dark:bg-primary-dark-mode dark:hover:bg-primary-dark-mode/90 dark:text-white dark:border-primary-dark-mode dark:shadow-[0_2px_8px_rgba(45,212,191,0.3)] dark:disabled:opacity-50 dark:disabled:cursor-not-allowed transition-all"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
