'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useSession } from 'next-auth/react';

interface Notification {
  _id: string;
  type: string;
  message: string;
  read: boolean;
  relatedId?: string;
  createdAt: string;
}

export function NotificationBell() {
  const { data: session } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (session?.user?.id) {
      // Fetch notifications once on mount (no polling, no socket.io)
      fetchNotifications();
      
      // Request browser notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          console.log('Notification permission:', permission);
        });
      }
      
      // All real-time functionality disabled - no socket.io, no polling
      // Socket.io and polling removed to prevent timeout errors
    }
  }, [session]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    // Handle escape key to close dropdown
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Check if response is JSON before parsing
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Response is HTML (likely redirect) - user is not authenticated
        if (res.status === 401 || res.status === 403) {
          setNotifications([]);
          setUnreadCount(0);
          return;
        }
        throw new Error('Invalid response format');
      }

      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      } else if (res.status === 401 || res.status === 403) {
        // Unauthorized - clear notifications
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      // Only log if it's not a JSON parse error (which we handle above)
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        // HTML response received - likely unauthenticated
        setNotifications([]);
        setUnreadCount(0);
      } else {
        console.error('Failed to fetch notifications:', error);
      }
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    try {
      await fetch(`/api/notifications/${notification._id}`, { method: 'PATCH' });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }

    // Close notification panel
    setIsOpen(false);

    // Redirect based on notification type
    if (!session?.user?.role) return;

    switch (notification.type) {
      case 'BOOKING_REQUEST':
        if (session.user.role === 'GUARDIAN') {
          router.push('/guardian/dashboard');
        }
        break;

      case 'BOOKING_ACCEPTED':
      case 'BOOKING_REJECTED':
      case 'BOOKING_COMPLETED':
        if (session.user.role === 'VITAL') {
          router.push('/vital/dashboard');
        }
        break;

      case 'MESSAGE':
        // For messages, we need to get the chat partner's ID
        // The relatedId is the messageId, we need to fetch the message to get the chat partner
        if (notification.relatedId) {
          try {
            const messageRes = await fetch(`/api/messages/${notification.relatedId}`);
            if (messageRes.ok) {
              const message = await messageRes.json();
              if (session.user.role === 'VITAL') {
                // Redirect to chat with guardian
                router.push(`/vital/chat/${message.guardianId}`);
              } else if (session.user.role === 'GUARDIAN') {
                // Redirect to chat with vital
                router.push(`/guardian/chat/${message.vitalId}`);
              }
            }
          } catch (error) {
            console.error('Failed to fetch message:', error);
            // Fallback to dashboard
            router.push(`/${session.user.role.toLowerCase()}/dashboard`);
          }
        } else {
          router.push(`/${session.user.role.toLowerCase()}/dashboard`);
        }
        break;

      default:
        router.push(`/${session.user.role.toLowerCase()}/dashboard`);
    }
  };

  if (!session) return null;

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="error"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-80 rounded-lg border border-border bg-background dark:bg-background-dark dark:border-border-dark shadow-medium dark:shadow-dark-medium transition-colors sm:w-80"
          role="dialog"
          aria-modal="true"
          aria-label="Notifications dropdown"
        >
          <div className="border-b border-border dark:border-border-dark p-3 sm:p-4">
            <h3 className="text-sm font-semibold text-text dark:text-text-dark sm:text-base transition-colors">Notifications</h3>
          </div>
          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto sm:max-h-96">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-text-muted dark:text-text-dark-muted">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`border-b border-border dark:border-border-dark p-3 hover:bg-background-secondary dark:hover:bg-background-dark-secondary cursor-pointer transition-colors sm:p-4 ${
                    !notification.read ? 'bg-primary/5 dark:bg-primary-dark-mode/10' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <p className="text-xs font-medium text-text dark:text-text-dark sm:text-sm transition-colors">{notification.message}</p>
                  <p className="mt-1 text-xs text-text-muted dark:text-text-dark-light">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

