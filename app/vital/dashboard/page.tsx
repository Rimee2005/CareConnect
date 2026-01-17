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
    // Wait for session to finish loading
    if (status === 'loading') {
      return;
    }

    // Only redirect if we're definitely unauthenticated
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    // If authenticated, check role and fetch data
    if (status === 'authenticated' && session) {
      if (session.user?.role === 'VITAL') {
        fetchProfile();
        fetchBookings();
        fetchGuardians();
      } else if (session.user?.role === 'GUARDIAN') {
        // Wrong role - redirect to guardian dashboard
        router.push('/guardian/dashboard');
      } else {
        // No role or invalid role - redirect to home
        console.warn('Session missing role:', session);
        router.push('/');
      }
    }
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/vital/profile', {
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Check if response is JSON before parsing
      const contentType = res.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      if (res.ok && isJson) {
        const data = await res.json();
        setProfile(data);
      } else if (res.status === 404) {
        // Profile doesn't exist - user needs to create one
        setProfile(null);
      } else if (res.status === 401 || res.status === 403) {
        // Unauthorized - redirect to login
        console.error('Unauthorized - redirecting to login');
        router.push('/auth/login');
        return;
      } else {
        // Other error (500, etc.)
        if (isJson) {
          const errorData = await res.json().catch(() => ({}));
          console.error('Failed to fetch profile:', res.status, errorData);
        } else {
          console.error('Failed to fetch profile: Non-JSON response', res.status);
        }
        setProfile(null);
      }
    } catch (error) {
      // Handle JSON parse errors (HTML responses)
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        console.error('Received HTML instead of JSON - likely auth issue');
        router.push('/auth/login');
        return;
      }
      console.error('Failed to fetch profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings', {
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const contentType = res.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      if (res.ok && isJson) {
        const data = await res.json();
        setBookings(data);
      } else if (res.status === 401 || res.status === 403) {
        // Unauthorized - silently fail (don't redirect, let user see empty state)
        setBookings([]);
      } else if (isJson) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Failed to fetch bookings:', res.status, errorData);
      }
    } catch (error) {
      // Handle JSON parse errors gracefully
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        // HTML response - likely auth issue, but don't redirect from here
        setBookings([]);
      } else {
        console.error('Failed to fetch bookings:', error);
      }
    }
  };

  const fetchGuardians = async () => {
    try {
      const res = await fetch('/api/guardians', {
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const contentType = res.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      if (res.ok && isJson) {
        const data = await res.json();
        setGuardians(data);
      } else if (res.status === 401 || res.status === 403) {
        // Unauthorized - silently fail
        setGuardians([]);
      } else if (isJson) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Failed to fetch guardians:', res.status, errorData);
      }
    } catch (error) {
      // Handle JSON parse errors gracefully
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        setGuardians([]);
      } else {
        console.error('Failed to fetch guardians:', error);
      }
    }
  };

  // Get availability status for guardian
  const getThisWeekAvailability = (guardian: Guardian): 'high' | 'medium' | 'low' => {
    if (!guardian?.availability?.days || !Array.isArray(guardian.availability.days)) {
      return 'low';
    }
    
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


  // Only show loading if we're still checking authentication
  // Don't block on profile loading - show create profile screen if needed
  if (status === 'loading') {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <p>{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  // If unauthenticated, redirect (handled by useEffect, but show loading while redirecting)
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <p>{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated but no profile, show create profile screen
  // This handles both "profile doesn't exist" and "profile still loading" cases
  if (!profile && !loading) {
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

  // If profile is still loading or doesn't exist, show loading
  if (!profile || loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <p>{t('common.loading')}</p>
          </div>
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
    <div className="min-h-screen bg-background dark:bg-gradient-to-br dark:from-background-dark dark:via-background-dark-secondary/80 dark:to-background-dark transition-colors">
      <Navbar />
      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl font-bold text-text sm:text-2xl md:text-3xl dark:text-text-dark transition-colors">{t('dashboard.vital.welcome')}, {profile.name}!</h1>
          <p className="text-xs text-text-muted sm:text-sm md:text-base dark:text-text-dark-muted transition-colors mt-1">{t('dashboard.vital.subtitle')}</p>
        </div>

        <div className="mb-4 grid gap-4 sm:gap-5 sm:mb-6 md:mb-8 md:gap-6 grid-cols-1 md:grid-cols-2">
          <Card className="dark:bg-gradient-to-br dark:from-background-dark-secondary dark:to-background-dark-secondary/95 dark:border-border-dark/40 dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_6px_24px_rgba(0,0,0,0.3)] dark:hover:border-primary-dark-mode/30 dark:hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader>
              <CardTitle className="dark:text-text-dark">{t('dashboard.vital.myProfile')}</CardTitle>
              <CardDescription className="dark:text-text-dark-muted">{t('dashboard.vital.viewEdit')}</CardDescription>
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
                  <p className="font-semibold dark:text-text-dark transition-colors">{profile.name}</p>
                  <p className="text-sm text-text-muted dark:text-text-dark-muted transition-colors">{t('dashboard.vital.age')}: {profile.age}</p>
                </div>
              </div>
              <Link href="/vital/profile/create">
                <Button variant="outline" className="mt-4 w-full dark:border-border-dark/50 dark:hover:bg-background-dark-secondary/80 dark:hover:border-primary-dark-mode/40 dark:hover:shadow-[0_0_8px_rgba(45,212,191,0.15)] dark:focus:ring-2 dark:focus:ring-primary-dark-mode/40 transition-all">
                  {t('dashboard.vital.editProfile')}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="dark:bg-gradient-to-br dark:from-background-dark-secondary dark:to-background-dark-secondary/95 dark:border-border-dark/40 dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_6px_24px_rgba(0,0,0,0.3)] dark:hover:border-primary-dark-mode/30 dark:hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader>
              <CardTitle className="dark:text-text-dark">{t('dashboard.vital.browseGuardiansTitle')}</CardTitle>
              <CardDescription className="dark:text-text-dark-muted">{t('dashboard.vital.browseGuardiansDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/vital/guardians">
                <Button className="w-full dark:shadow-[0_0_8px_rgba(45,212,191,0.2)] dark:hover:shadow-[0_0_12px_rgba(45,212,191,0.25)] dark:focus:ring-2 dark:focus:ring-primary-dark-mode/40 transition-all">
                  <Search className="mr-2 h-4 w-4" />
                  {t('vital.browse')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

   

        {/* Care History Section */}
        {allBookings.length > 0 && (
          <Card className="mb-4 sm:mb-6 md:mb-8 dark:bg-gradient-to-br dark:from-background-dark-secondary dark:to-background-dark-secondary/95 dark:border-border-dark/40 dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_6px_24px_rgba(0,0,0,0.3)] dark:hover:border-primary-dark-mode/30 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-text-dark">
                <Calendar className="h-5 w-5 dark:text-primary-dark-mode" />
                {t('dashboard.vital.careHistory')}
              </CardTitle>
              <CardDescription className="dark:text-text-dark-muted">
                {t('dashboard.vital.careHistoryDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Pending Bookings */}
                {pendingBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-yellow-200 dark:border-border-dark/50 dark:bg-background-dark-secondary dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] p-3 sm:p-4 animate-pulse transition-all"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      {booking.guardianId.profilePhoto ? (
                        <img
                          src={booking.guardianId.profilePhoto}
                          alt={booking.guardianId.name}
                          className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-full object-cover ring-2 ring-yellow-500/20 dark:ring-border-dark/40"
                        />
                      ) : (
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-background-dark/60 ring-2 ring-yellow-500/20 dark:ring-border-dark/40">
                          <span className="text-base sm:text-lg text-yellow-700 dark:text-text-dark font-semibold">
                            {booking.guardianId.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm sm:text-base font-semibold dark:text-text-dark transition-colors truncate">{booking.guardianId.name}</p>
                        <Badge className="bg-amber-500 dark:bg-amber-500/90 dark:text-white text-white animate-pulse shadow-sm font-medium text-xs mt-1">
                          {t('booking.status.pending')}
                        </Badge>
                        <p className="mt-1 text-xs text-text-muted dark:text-text-dark-light transition-colors">
                          {t('dashboard.vital.awaitingResponse')}
                        </p>
                      </div>
                    </div>
                    {booking.guardianId && (booking.guardianId as any)?._id && (
                      <Link href={`/vital/chat/${(booking.guardianId as any)._id}`} className="w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm dark:border-primary-dark-mode/60 dark:text-primary-dark-mode dark:hover:bg-primary-dark-mode/15 dark:hover:border-primary-dark-mode dark:hover:shadow-[0_0_8px_rgba(45,212,191,0.25)] dark:focus:ring-2 dark:focus:ring-primary-dark-mode/50 dark:active:bg-primary-dark-mode/20 transition-all">
                          <MessageSquare className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
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
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-blue-200 dark:border-border-dark/50 dark:bg-background-dark-secondary dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] p-3 sm:p-4 transition-all"
                    style={{
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      {booking.guardianId.profilePhoto ? (
                        <img
                          src={booking.guardianId.profilePhoto}
                          alt={booking.guardianId.name}
                          className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-full object-cover ring-2 ring-blue-400/30 dark:ring-border-dark/40"
                        />
                      ) : (
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-background-dark/60 ring-2 ring-blue-400/30 dark:ring-border-dark/40">
                          <span className="text-base sm:text-lg text-blue-700 dark:text-text-dark font-semibold">
                            {booking.guardianId.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm sm:text-base font-semibold dark:text-text-dark transition-colors truncate">{booking.guardianId.name}</p>
                        <Badge className="bg-blue-500 dark:bg-cyan-500 dark:text-white text-white shadow-sm font-medium text-xs mt-1">
                          {booking.status === 'ONGOING' ? t('dashboard.vital.active') : t('booking.status.accepted')}
                        </Badge>
                        {booking.startDate && (
                          <p className="mt-1 text-xs text-text-muted dark:text-text-dark-light transition-colors">
                            {t('dashboard.vital.started')}: {new Date(booking.startDate).toLocaleDateString((i18n.language || 'en') === 'hi' ? 'hi-IN' : 'en-US')}
                          </p>
                        )}
                      </div>
                    </div>
                    {booking.guardianId && (booking.guardianId as any)?._id && (
                      <Link href={`/vital/chat/${(booking.guardianId as any)._id}`} className="w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm dark:border-primary-dark-mode/60 dark:text-primary-dark-mode dark:hover:bg-primary-dark-mode/15 dark:hover:border-primary-dark-mode dark:hover:shadow-[0_0_8px_rgba(45,212,191,0.25)] dark:focus:ring-2 dark:focus:ring-primary-dark-mode/50 dark:active:bg-primary-dark-mode/20 transition-all">
                          <MessageSquare className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
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
                    g._id === (booking.guardianId as any)?._id || g.name === booking.guardianId?.name
                  );
                  const availabilityStatus = guardianData && guardianData.availability ? getThisWeekAvailability(guardianData) : null;
                  
                  return (
                    <div
                      key={booking._id}
                      className="rounded-lg border border-green-200 dark:border-border-dark/50 dark:bg-background-dark-secondary dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] p-3 sm:p-4 transition-all duration-300 hover:shadow-md dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
                    >
                      {/* This Week's Availability Strip for Past Guardian */}
                      {availabilityStatus && (
                        <div 
                          className="h-1.5 w-full mb-3 rounded-t"
                          style={{
                            background: availabilityStatus === 'high' 
                              ? 'linear-gradient(to right, #2DD4BF, #3B82F6)' 
                              : availabilityStatus === 'medium' 
                              ? 'linear-gradient(to right, #FBBF24, #FF6B6B)'
                              : 'linear-gradient(to right, #FF6B6B, #EF4444)'
                          }}
                          title={`This Week's Availability: ${availabilityStatus}`}
                        />
                      )}
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          {booking.guardianId.profilePhoto ? (
                            <img
                              src={booking.guardianId.profilePhoto}
                              alt={booking.guardianId.name}
                              className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-full object-cover ring-2 ring-green-500/20 dark:ring-border-dark/40"
                            />
                          ) : (
                            <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-background-dark/60 ring-2 ring-green-500/20 dark:ring-border-dark/40">
                              <span className="text-base sm:text-lg text-green-700 dark:text-text-dark font-semibold">
                                {booking.guardianId.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm sm:text-base font-semibold dark:text-text-dark transition-colors truncate">{booking.guardianId.name}</p>
                            <Badge className="bg-[#2DD4BF] dark:bg-[#2DD4BF] dark:text-white text-white shadow-sm font-medium text-xs mt-1">
                              {t('dashboard.vital.completed')}
                            </Badge>
                            <p className="mt-1 text-xs text-text-muted dark:text-text-dark-light transition-colors">
                              {t('dashboard.vital.completedOn')} {new Date(booking.createdAt).toLocaleDateString((i18n.language || 'en') === 'hi' ? 'hi-IN' : 'en-US')}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          {(booking.guardianId as any)?._id && (
                            <Link href={`/vital/guardians/${(booking.guardianId as any)._id}`} className="flex-1 sm:flex-none">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="w-full sm:w-auto text-xs sm:text-sm whitespace-nowrap dark:border-border-dark/50 dark:hover:bg-background-dark-secondary/80 dark:hover:border-primary-dark-mode/40 dark:text-primary-dark-mode dark:hover:shadow-[0_0_6px_rgba(45,212,191,0.12)] dark:focus:ring-2 dark:focus:ring-primary-dark-mode/40 transition-all"
                              >
                                {t('dashboard.vital.bookAgain')}
                              </Button>
                            </Link>
                          )}
                          <Link href={`/vital/reviews/create/${booking._id}`} className="flex-1 sm:flex-none">
                            <Button 
                              size="sm" 
                              className="w-full sm:w-auto text-xs sm:text-sm bg-[#2DD4BF] hover:bg-[#2DD4BF]/90 dark:bg-[#2DD4BF] dark:hover:bg-[#2DD4BF]/90 text-white shadow-sm font-medium"
                            >
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
          <Card className="mb-4 sm:mb-6 md:mb-8 dark:bg-gradient-to-br dark:from-background-dark-secondary dark:to-background-dark-secondary/95 dark:border-border-dark/40 dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_6px_24px_rgba(0,0,0,0.3)] dark:hover:border-primary-dark-mode/30 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-text-dark">
                <AlertCircle className="h-5 w-5 text-error dark:text-secondary-dark-mode" />
                {t('dashboard.vital.emergencySupport')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-text-muted dark:text-text-dark-muted transition-colors">{t('feature.sos.comingSoon')}</p>
              <Button variant="outline" disabled className="dark:border-border-dark/40 dark:text-text-dark-muted">
                {t('dashboard.vital.comingSoon')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
