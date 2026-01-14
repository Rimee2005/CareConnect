'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n';
import { ArrowLeft, Send } from 'lucide-react';
import { Toast } from '@/components/ui/toast';

export default function ChatPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation();
  const [guardianName, setGuardianName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (session?.user?.role !== 'VITAL') {
      router.push('/');
      return;
    }
    fetchGuardianInfo();
  }, [session, router, params.guardianId]);

  const fetchGuardianInfo = async () => {
    try {
      const res = await fetch(`/api/guardians/${params.guardianId}`);
      if (res.ok) {
        const data = await res.json();
        setGuardianName(data.name);
      }
    } catch (error) {
      console.error('Failed to fetch guardian:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    // For now, show a placeholder message
    // In a full implementation, this would send to a chat API
    setToastMessage('💬 Chat feature coming soon! You can contact your Guardian through the booking system.');
    setShowToast(true);
    setMessage('');
    
    // Auto-dismiss toast
    setTimeout(() => setShowToast(false), 5000);
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
            <CardTitle>Chat with {guardianName || 'Guardian'}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Chat Messages Area */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-text-muted">
                  <div className="text-center">
                    <p className="text-lg mb-2">💬 Start a conversation</p>
                    <p className="text-sm">
                      Chat feature is coming soon! For now, you can communicate through booking notes.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === 'vital' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs rounded-lg px-4 py-2 ${
                        msg.sender === 'vital'
                          ? 'bg-primary text-white'
                          : 'bg-background-secondary text-text'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="border-t p-4 flex gap-2"
            >
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" disabled={!message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {showToast && (
          <Toast
            message={toastMessage}
            type="info"
            onClose={() => setShowToast(false)}
            duration={5000}
          />
        )}
      </div>
    </div>
  );
}

