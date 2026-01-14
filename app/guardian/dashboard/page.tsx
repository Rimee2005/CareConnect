'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n';
import { Plus, Calendar, User } from 'lucide-react';

interface GuardianProfile {
  _id: string;
  name: string;
  experience: number;
  specialization: string[];
  profilePhoto?: string;
}

interface Booking {
  _id: string;
  status: string;
  vitalId: {
    name: string;
    profilePhoto?: string;
  };
  notes?: string;
  createdAt: string;
}

export default function GuardianDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<GuardianProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role === 'GUARDIAN') {
      fetchProfile();
      fetchBookings();
    }
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/guardian/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else if (res.status === 404) {
        setProfile(null);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/guardian/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'accept' | 'reject') => {
    try {
      const res = await fetch(`/api/guardian/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error('Failed to update booking:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle>Welcome to CareConnect</CardTitle>
              <CardDescription>Create your Guardian profile to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/guardian/profile/create">
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statusColors = {
    PENDING: 'warning',
    ACCEPTED: 'success',
    ONGOING: 'default',
    COMPLETED: 'success',
    REJECTED: 'error',
  } as const;

  const statusLabels = {
    PENDING: t('guardian.status.pending'),
    ACCEPTED: t('guardian.status.accepted'),
    ONGOING: t('guardian.status.ongoing'),
    COMPLETED: t('guardian.status.completed'),
    REJECTED: 'Rejected',
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-text sm:text-3xl dark:text-text-dark transition-colors">Welcome, {profile.name}!</h1>
          <p className="text-sm text-text-muted sm:text-base dark:text-text-dark-light transition-colors">Your Guardian dashboard</p>
        </div>

        <div className="mb-6 grid gap-4 sm:gap-6 sm:mb-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
              <CardDescription>View and edit your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {profile.profilePhoto ? (
                  <img
                    src={profile.profilePhoto}
                    alt={profile.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-2xl text-primary">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-semibold">{profile.name}</p>
                  <p className="text-sm text-text-muted dark:text-text-dark-muted transition-colors">{profile.experience} years experience</p>
                </div>
              </div>
              <Button variant="outline" className="mt-4 w-full">
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t('guardian.bookings')}
              </CardTitle>
              <CardDescription>Manage your booking requests</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-text dark:text-text-dark transition-colors">{bookings.length}</p>
              <p className="text-sm text-text-muted dark:text-text-dark-muted transition-colors">Total bookings</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booking Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="py-8 text-center text-text-muted dark:text-text-dark-muted transition-colors">No bookings yet</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="flex flex-col gap-3 rounded-lg border border-border dark:border-border-dark p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4 transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      {booking.vitalId.profilePhoto ? (
                        <img
                          src={booking.vitalId.profilePhoto}
                          alt={booking.vitalId.name}
                          className="h-10 w-10 flex-shrink-0 rounded-full object-cover sm:h-12 sm:w-12"
                        />
                      ) : (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-dark-mode/20 sm:h-12 sm:w-12 transition-colors">
                          <User className="h-5 w-5 text-primary dark:text-primary-dark-mode sm:h-6 sm:w-6 transition-colors" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-text dark:text-text-dark sm:text-base transition-colors">{booking.vitalId.name}</p>
                        <p className="text-xs text-text-muted dark:text-text-dark-light sm:text-sm transition-colors">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                        {booking.notes && (
                          <p className="mt-1 text-xs text-text dark:text-text-dark sm:text-sm line-clamp-2 transition-colors">{booking.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-4">
                      <Badge variant={statusColors[booking.status as keyof typeof statusColors]} className="self-start sm:self-auto">
                        {statusLabels[booking.status as keyof typeof statusLabels]}
                      </Badge>
                      {booking.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleBookingAction(booking._id, 'accept')}
                            className="flex-1 sm:flex-none text-xs sm:text-sm"
                          >
                            {t('guardian.accept')}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleBookingAction(booking._id, 'reject')}
                            className="flex-1 sm:flex-none text-xs sm:text-sm"
                          >
                            {t('guardian.reject')}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

