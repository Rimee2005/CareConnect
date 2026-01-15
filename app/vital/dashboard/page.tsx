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
import { featureFlags } from '@/lib/feature-flags';
import { AlertCircle, Plus, Search, Calendar, MessageSquare } from 'lucide-react';
import { StarRating } from '@/components/StarRating';

interface VitalProfile {
  _id: string;
  name: string;
  age: number;
  healthNeeds: string;
  profilePhoto?: string;
}

interface Booking {
  _id: string;
  status: string;
  guardianId: {
    _id?: string;
    name: string;
    profilePhoto?: string;
  };
  createdAt: string;
}

export default function VitalDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<VitalProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      if (session?.user?.role === 'VITAL') {
        fetchProfile();
        fetchBookings();
      } else if (session?.user?.role === 'GUARDIAN') {
        // Wrong role - redirect to guardian dashboard
        router.push('/guardian/dashboard');
      } else {
        // No role or invalid role - redirect to home
        router.push('/');
      }
    }
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/vital/profile');
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
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
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
              <CardDescription>Create your profile to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/vital/profile/create">
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

  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING' || b.status === 'ACCEPTED');

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text">Welcome, {profile.name}!</h1>
          <p className="text-text-muted">Your care dashboard</p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
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
                  <p className="text-sm text-text-muted">Age: {profile.age}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={() => router.push('/vital/profile/create')}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Browse Guardians</CardTitle>
              <CardDescription>Find compassionate caregivers</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/vital/guardians">
                <Button className="w-full">
                  <Search className="mr-2 h-4 w-4" />
                  {t('vital.browse')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Completed Bookings - Review Prompt */}
        {completedBookings.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Completed Services
              </CardTitle>
              <CardDescription>
                Leave a review to help others find quality care
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      {booking.guardianId.profilePhoto ? (
                        <img
                          src={booking.guardianId.profilePhoto}
                          alt={booking.guardianId.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-lg text-primary">
                            {booking.guardianId.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{booking.guardianId.name}</p>
                        <p className="text-sm text-text-muted">
                          Completed on {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Link href={`/vital/reviews/create/${booking._id}`}>
                      <Button size="sm">Leave Review</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Bookings */}
        {pendingBookings.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Active Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      {booking.guardianId.profilePhoto ? (
                        <img
                          src={booking.guardianId.profilePhoto}
                          alt={booking.guardianId.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-lg text-primary">
                            {booking.guardianId.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{booking.guardianId.name}</p>
                        <Badge variant="outline">{booking.status}</Badge>
                      </div>
                    </div>
                    {booking.guardianId && (
                      <Link href={`/vital/chat/${(booking.guardianId as any)._id || ''}`}>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Chat
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {featureFlags.SOS_EMERGENCY && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-error" />
                Emergency Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-text-muted">{t('feature.sos.comingSoon')}</p>
              <Button variant="outline" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
