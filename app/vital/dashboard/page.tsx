'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n';
import i18n from '@/lib/i18n';
import { featureFlags } from '@/lib/feature-flags';
import { AlertCircle, Plus, Search, Calendar, MessageSquare, MapPin, Shield, Users } from 'lucide-react';
import { StarRating } from '@/components/StarRating';
import { calculateDistance } from '@/lib/utils';

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
  startDate?: string;
  endDate?: string;
}

interface Guardian {
  _id: string;
  name: string;
  age: number;
  gender: string;
  experience: number;
  specialization: string[];
  availability: {
    days: string[];
    hours: {
      start: string;
      end: string;
    };
  };
  profilePhoto?: string;
  isVerified: boolean;
  serviceRadius: number;
  location?: {
    city?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  averageRating?: number;
  reviewCount?: number;
  aiMatch?: {
    score: number;
    explanation: string;
    reasons: string[];
    isRecommended: boolean;
  };
}

export default function VitalDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<VitalProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuardian, setSelectedGuardian] = useState<Guardian | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      if (session?.user?.role === 'VITAL') {
        fetchProfile();
        fetchBookings();
        fetchGuardians();
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

  const fetchGuardians = async () => {
    try {
      const res = await fetch('/api/guardians');
      if (res.ok) {
        const data = await res.json();
        setGuardians(data);
      }
    } catch (error) {
      console.error('Failed to fetch guardians:', error);
    }
  };

  // Get availability status for guardian
  const getThisWeekAvailability = (guardian: Guardian): 'high' | 'medium' | 'low' => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    let availableDays = 0;
    for (let i = 0; i < 7; i++) {
      const checkDay = (dayOfWeek + i) % 7;
      const dayName = dayNames[checkDay];
      if (guardian.availability.days.includes(dayName)) {
        availableDays++;
      }
    }
    
    if (availableDays >= 5) return 'high';
    if (availableDays >= 3) return 'medium';
    return 'low';
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
              <CardTitle>{t('common.welcome')} {t('nav.home')}</CardTitle>
              <CardDescription>{t('dashboard.vital.createProfile')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/vital/profile/create">
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('form.create')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');
  const activeBookings = bookings.filter((b) => b.status === 'ACCEPTED' || b.status === 'ONGOING');
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const allBookings = [...pendingBookings, ...activeBookings, ...completedBookings];
  
  // Helper to check if guardian is a past guardian (defined after completedBookings)
  const isPastGuardian = (guardianId: string) => {
    return completedBookings.some(b => 
      (b.guardianId as any)._id === guardianId || b.guardianId.name === guardianId
    );
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text">{t('dashboard.vital.welcome')}, {profile.name}!</h1>
          <p className="text-text-muted">{t('dashboard.vital.subtitle')}</p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.vital.myProfile')}</CardTitle>
              <CardDescription>{t('dashboard.vital.viewEdit')}</CardDescription>
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
                  <p className="text-sm text-text-muted">{t('dashboard.vital.age')}: {profile.age}</p>
                </div>
              </div>
              <Link href="/vital/profile/create">
                <Button variant="outline" className="mt-4 w-full">
                  {t('dashboard.vital.editProfile')}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.vital.browseGuardiansTitle')}</CardTitle>
              <CardDescription>{t('dashboard.vital.browseGuardiansDesc')}</CardDescription>
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

        {/* Map View - Nearest Guardians Only */}
        {featureFlags.MAP_VIEW && vitalLocation && nearestGuardians.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t('dashboard.vital.nearestGuardians')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.vital.nearestGuardiansDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeafletMap
                guardians={nearestGuardians}
                vitalLocation={vitalLocation}
                radius={10}
                onGuardianClick={(guardian) => {
                  router.push(`/vital/guardians/${guardian._id}`);
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Care History Section */}
        {allBookings.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t('dashboard.vital.careHistory')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.vital.careHistoryDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Pending Bookings */}
                {pendingBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="flex items-center justify-between rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-4 animate-pulse"
                  >
                    <div className="flex items-center gap-4">
                      {booking.guardianId.profilePhoto ? (
                        <img
                          src={booking.guardianId.profilePhoto}
                          alt={booking.guardianId.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-800">
                          <span className="text-lg text-yellow-700 dark:text-yellow-300">
                            {booking.guardianId.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{booking.guardianId.name}</p>
                        <Badge className="bg-yellow-500 text-white animate-pulse">
                          {t('booking.status.pending')}
                        </Badge>
                        <p className="mt-1 text-xs text-text-muted">
                          {t('dashboard.vital.awaitingResponse')}
                        </p>
                      </div>
                    </div>
                    {booking.guardianId && (
                      <Link href={`/vital/chat/${(booking.guardianId as any)._id || ''}`}>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          {t('dashboard.vital.chat')}
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}

                {/* Active Bookings */}
                {activeBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="flex items-center justify-between rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4"
                    style={{
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {booking.guardianId.profilePhoto ? (
                        <img
                          src={booking.guardianId.profilePhoto}
                          alt={booking.guardianId.name}
                          className="h-12 w-12 rounded-full object-cover ring-2 ring-blue-400"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800 ring-2 ring-blue-400">
                          <span className="text-lg text-blue-700 dark:text-blue-300">
                            {booking.guardianId.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{booking.guardianId.name}</p>
                        <Badge className="bg-blue-500 text-white">
                          {booking.status === 'ONGOING' ? t('dashboard.vital.active') : t('booking.status.accepted')}
                        </Badge>
                        {booking.startDate && (
                          <p className="mt-1 text-xs text-text-muted">
                            {t('dashboard.vital.started')}: {new Date(booking.startDate).toLocaleDateString((i18n.language || 'en') === 'hi' ? 'hi-IN' : 'en-US')}
                          </p>
                        )}
                      </div>
                    </div>
                    {booking.guardianId && (
                      <Link href={`/vital/chat/${(booking.guardianId as any)._id || ''}`}>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          {t('dashboard.vital.chat')}
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}

                {/* Completed Bookings */}
                {completedBookings.map((booking) => {
                  // Find guardian data for availability strip
                  const guardianData = guardians.find(g => 
                    g._id === (booking.guardianId as any)._id || g.name === booking.guardianId.name
                  );
                  const availabilityStatus = guardianData ? getThisWeekAvailability(guardianData) : null;
                  
                  return (
                    <div
                      key={booking._id}
                      className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4 transition-all duration-300 hover:shadow-md"
                    >
                      {/* This Week's Availability Strip for Past Guardian */}
                      {availabilityStatus && (
                        <div className={`h-1.5 w-full mb-3 rounded-t ${
                          availabilityStatus === 'high' ? 'bg-green-500' :
                          availabilityStatus === 'medium' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} title={`This Week's Availability: ${availabilityStatus}`} />
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {booking.guardianId.profilePhoto ? (
                            <img
                              src={booking.guardianId.profilePhoto}
                              alt={booking.guardianId.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
                              <span className="text-lg text-green-700 dark:text-green-300">
                                {booking.guardianId.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold">{booking.guardianId.name}</p>
                            <Badge className="bg-green-500 text-white">
                              {t('dashboard.vital.completed')}
                            </Badge>
                            <p className="mt-1 text-xs text-text-muted">
                              {t('dashboard.vital.completedOn')} {new Date(booking.createdAt).toLocaleDateString((i18n.language || 'en') === 'hi' ? 'hi-IN' : 'en-US')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {(booking.guardianId as any)._id && (
                            <Link href={`/vital/guardians/${(booking.guardianId as any)._id}`}>
                              <Button size="sm" variant="outline" className="whitespace-nowrap">
                                {t('dashboard.vital.bookAgain')}
                              </Button>
                            </Link>
                          )}
                          <Link href={`/vital/reviews/create/${booking._id}`}>
                            <Button size="sm" className="bg-green-500 hover:bg-green-600">
                              {t('dashboard.vital.leaveReview')}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {featureFlags.SOS_EMERGENCY && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-error" />
                {t('dashboard.vital.emergencySupport')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-text-muted">{t('feature.sos.comingSoon')}</p>
              <Button variant="outline" disabled>
                {t('dashboard.vital.comingSoon')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
