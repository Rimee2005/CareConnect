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
import { Plus, Calendar, User, Star, MapPin, Clock, CheckCircle, TrendingUp, Power, PowerOff, Edit, MessageSquare } from 'lucide-react';
import { StarRating } from '@/components/StarRating';
import { featureFlags } from '@/lib/feature-flags';
import BaseMap from '@/components/MapWrapper';
import { useGeolocation } from '@/hooks/useGeolocation';

interface GuardianProfile {
  _id: string;
  name: string;
  experience: number;
  specialization: string[];
  profilePhoto?: string;
  location?: {
    city?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  serviceRadius?: number;
  availability?: {
    days: string[];
    hours: {
      start: string;
      end: string;
    };
  };
  careTags?: string[];
  introduction?: string;
  languages?: string[];
  certifications?: string[];
  pricing?: {
    hourly?: number;
    daily?: number;
    monthly?: number;
  };
  isVerified?: boolean;
  verificationBadges?: {
    idVerified: boolean;
    certificationUploaded: boolean;
    highlyRated: boolean;
    repeatBookings: boolean;
  };
}

interface Booking {
  _id: string;
  status: string;
  vitalId: {
    _id: string;
    name: string;
    profilePhoto?: string;
    location?: {
      city?: string;
    };
  };
  notes?: string;
  startDate?: string;
  endDate?: string;
  careType?: string;
  createdAt: string;
}

interface Review {
  _id: string;
  rating: number;
  reviewText?: string;
  comment?: string;
  vitalId: {
    _id: string;
    name: string;
    profilePhoto?: string;
  };
  createdAt: string;
}

export default function GuardianDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const currentLanguage = i18n.language || 'en';
  const [profile, setProfile] = useState<GuardianProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  
  // Geolocation for map
  const { position: browserPosition, loading: geoLoading } = useGeolocation();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      if (session?.user?.role === 'GUARDIAN') {
        fetchProfile();
        fetchBookings();
        fetchReviews();
      } else if (session?.user?.role === 'VITAL') {
        // Wrong role - redirect to vital dashboard
        router.push('/vital/dashboard');
      } else {
        // No role or invalid role - redirect to home
        router.push('/');
      }
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

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/guardian/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'accept' | 'reject' | 'start' | 'complete') => {
    try {
      const res = await fetch(`/api/guardian/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        fetchBookings();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update booking');
      }
    } catch (error) {
      console.error('Failed to update booking:', error);
      alert(t('error.generic'));
    }
  };

  const handleReschedule = async (bookingId: string) => {
    // For now, this will open a dialog or navigate to a reschedule page
    // You can implement a modal or separate page for rescheduling
    const newDate = prompt('Enter new date and time (format: YYYY-MM-DD HH:MM):');
    if (newDate) {
      try {
        const res = await fetch(`/api/guardian/bookings/${bookingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reschedule', newDate }),
        });

        if (res.ok) {
          fetchBookings();
        } else {
          const data = await res.json();
          alert(data.error || 'Failed to reschedule booking');
        }
      } catch (error) {
        console.error('Failed to reschedule booking:', error);
        alert(t('error.generic'));
      }
    }
  };

  const toggleAvailability = async () => {
    // This would update the guardian's availability status
    // For now, we'll just toggle the local state
    setIsAvailable(!isAvailable);
    // TODO: Add API call to update availability status
  };

  // Calculate profile completion percentage - MUST be before any early returns
  const profileCompletion = useMemo(() => {
    if (!profile) return 0;
    let completed = 0;
    let total = 0;

    // Basic fields
    total += 4; // name, age, experience, specialization
    if (profile.name) completed++;
    if (profile.experience) completed++;
    if (profile.specialization && profile.specialization.length > 0) completed++;
    if (profile.profilePhoto) completed++;

    // Location
    total += 2;
    if (profile.location?.city) completed++;
    if (profile.location?.coordinates?.lat && profile.location?.coordinates?.lng) completed++;

    // Additional fields
    total += 5;
    if (profile.availability?.days && profile.availability.days.length > 0) completed++;
    if (profile.careTags && profile.careTags.length > 0) completed++;
    if (profile.introduction) completed++;
    if (profile.languages && profile.languages.length > 0) completed++;
    if (profile.certifications && profile.certifications.length > 0) completed++;

    return Math.round((completed / total) * 100);
  }, [profile]);

  // Filter bookings - MUST be before any early returns
  const todayBookings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookings.filter(booking => {
      if (!booking.startDate) return false;
      const bookingDate = new Date(booking.startDate);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate.getTime() === today.getTime() && 
             (booking.status === 'ACCEPTED' || booking.status === 'ONGOING');
    });
  }, [bookings]);

  const upcomingBookings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookings.filter(booking => {
      if (!booking.startDate) return false;
      const bookingDate = new Date(booking.startDate);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate.getTime() > today.getTime() && 
             (booking.status === 'ACCEPTED' || booking.status === 'PENDING');
    }).sort((a, b) => {
      const dateA = new Date(a.startDate || a.createdAt);
      const dateB = new Date(b.startDate || b.createdAt);
      return dateA.getTime() - dateB.getTime();
    });
  }, [bookings]);

  const pendingBookings = useMemo(() => {
    return bookings.filter(booking => booking.status === 'PENDING');
  }, [bookings]);

  // Calculate quick stats - MUST be before any early returns
  const quickStats = useMemo(() => {
    const totalBookings = bookings.length;
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;
    const activeVitals = new Set(bookings
      .filter(b => b.status === 'ACCEPTED' || b.status === 'ONGOING')
      .map(b => b.vitalId.name)
    ).size;

    return { totalBookings, averageRating, activeVitals };
  }, [bookings, reviews]);

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
              <CardDescription>{t('dashboard.guardian.createProfile')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/guardian/profile/create">
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
    REJECTED: t('booking.status.rejected'),
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gradient-to-br dark:from-background-dark dark:via-background-dark-secondary/80 dark:to-background-dark transition-colors">
      <Navbar />
      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl font-bold text-text sm:text-2xl md:text-3xl dark:text-text-dark transition-colors">{t('dashboard.guardian.welcome')}, {profile.name}!</h1>
          <p className="text-xs text-text-muted sm:text-sm md:text-base dark:text-text-dark-muted transition-colors mt-1">{t('dashboard.guardian.subtitle')}</p>
        </div>

        {/* Overview Widgets */}
        <div className="mb-4 grid gap-3 sm:gap-4 sm:mb-6 md:mb-8 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Profile Completion */}
          <Card className="dark:bg-gradient-to-br dark:from-background-dark-secondary dark:to-background-dark-secondary/95 dark:border-border-dark/40 dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_6px_24px_rgba(0,0,0,0.3)] dark:hover:border-primary-dark-mode/30 dark:hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('dashboard.guardian.profileCompletion')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-2xl font-bold text-text dark:text-text-dark transition-colors">{profileCompletion}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-border dark:bg-border-dark">
                    <div
                      className="h-full bg-primary transition-all duration-500 dark:bg-primary-dark-mode"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="mt-3 w-full dark:border-border-dark/50 dark:hover:bg-background-dark-secondary/80 dark:hover:border-primary-dark-mode/40 dark:hover:shadow-[0_0_6px_rgba(45,212,191,0.12)] dark:focus:ring-2 dark:focus:ring-primary-dark-mode/40 transition-all"
                onClick={() => router.push('/guardian/profile/create')}
              >
                <Edit className="mr-2 h-4 w-4" />
                {t('dashboard.guardian.completeProfile')}
              </Button>
            </CardContent>
          </Card>

          {/* Availability Toggle */}
          <Card className="dark:bg-gradient-to-br dark:from-background-dark-secondary dark:to-background-dark-secondary/95 dark:border-border-dark/40 dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_6px_24px_rgba(0,0,0,0.3)] dark:hover:border-primary-dark-mode/30 dark:hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-base dark:text-text-dark">{t('dashboard.guardian.availability')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text dark:text-text-dark transition-colors">
                    {isAvailable ? t('dashboard.guardian.available') : t('dashboard.guardian.unavailable')}
                  </p>
                  <p className="text-xs text-text-muted dark:text-text-dark-muted transition-colors">
                    {isAvailable ? t('dashboard.guardian.acceptingBookings') : t('dashboard.guardian.notAcceptingBookings')}
                  </p>
                </div>
                <button
                  onClick={toggleAvailability}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    isAvailable ? 'bg-primary dark:bg-primary-dark-mode' : 'bg-border dark:bg-border-dark'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isAvailable ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {isAvailable ? (
                <div className="mt-3 flex items-center gap-1 text-xs text-success">
                  <Power className="h-3 w-3" />
                  <span>{t('dashboard.guardian.on')}</span>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-1 text-xs text-error">
                  <PowerOff className="h-3 w-3" />
                  <span>{t('dashboard.guardian.off')}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Bookings */}
          <Card className="dark:bg-gradient-to-br dark:from-background-dark-secondary dark:to-background-dark-secondary/95 dark:border-border-dark/40 dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_6px_24px_rgba(0,0,0,0.3)] dark:hover:border-primary-dark-mode/30 dark:hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base dark:text-text-dark">
                <Clock className="h-4 w-4 dark:text-primary-dark-mode" />
                {t('dashboard.guardian.today')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-text dark:text-text-dark transition-colors">{todayBookings.length}</p>
              <p className="text-sm text-text-muted dark:text-text-dark-muted transition-colors">{t('dashboard.guardian.bookingsToday')}</p>
            </CardContent>
          </Card>

          {/* Upcoming Bookings */}
          <Card className="dark:bg-gradient-to-br dark:from-background-dark-secondary dark:to-background-dark-secondary/95 dark:border-border-dark/40 dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_6px_24px_rgba(0,0,0,0.3)] dark:hover:border-primary-dark-mode/30 dark:hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base dark:text-text-dark">
                <Calendar className="h-4 w-4 dark:text-primary-dark-mode" />
                {t('dashboard.guardian.upcoming')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-text dark:text-text-dark transition-colors">{upcomingBookings.length}</p>
              <p className="text-sm text-text-muted dark:text-text-dark-muted transition-colors">{t('dashboard.guardian.scheduledBookings')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mb-4 grid gap-3 sm:gap-4 sm:mb-6 md:mb-8 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <Card className="dark:bg-gradient-to-br dark:from-background-dark-secondary dark:to-background-dark-secondary/95 dark:border-border-dark/40 dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_6px_24px_rgba(0,0,0,0.3)] dark:hover:border-primary-dark-mode/30 dark:hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base dark:text-text-dark">
                <TrendingUp className="h-4 w-4 dark:text-primary-dark-mode" />
                {t('dashboard.guardian.totalBookings')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-text dark:text-text-dark transition-colors">{quickStats.totalBookings}</p>
              <p className="text-sm text-text-muted dark:text-text-dark-muted transition-colors">{t('dashboard.guardian.allTime')}</p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gradient-to-br dark:from-background-dark-secondary dark:to-background-dark-secondary/95 dark:border-border-dark/40 dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_6px_24px_rgba(0,0,0,0.3)] dark:hover:border-primary-dark-mode/30 dark:hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base dark:text-text-dark">
                <Star className="h-4 w-4 dark:text-primary-dark-mode" />
                {t('dashboard.guardian.averageRating')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-text dark:text-text-dark transition-colors">
                  {quickStats.averageRating > 0 ? quickStats.averageRating.toFixed(1) : 'N/A'}
                </p>
                {quickStats.averageRating > 0 && (
                  <StarRating rating={quickStats.averageRating} readonly size="sm" />
                )}
              </div>
              <p className="text-sm text-text-muted dark:text-text-dark-muted transition-colors">
                {reviews.length} {reviews.length === 1 ? t('dashboard.guardian.review') : t('dashboard.guardian.reviews')}
              </p>
            </CardContent>
          </Card>

          <Card className="dark:bg-gradient-to-br dark:from-background-dark-secondary dark:to-background-dark-secondary/95 dark:border-border-dark/40 dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_6px_24px_rgba(0,0,0,0.3)] dark:hover:border-primary-dark-mode/30 dark:hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base dark:text-text-dark">
                <User className="h-4 w-4 dark:text-primary-dark-mode" />
                {t('dashboard.guardian.activeVitals')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-text dark:text-text-dark transition-colors">{quickStats.activeVitals}</p>
              <p className="text-sm text-text-muted dark:text-text-dark-muted transition-colors">{t('dashboard.guardian.currentlyActive')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Map Section - Always visible for visual context */}
        {!geoLoading && browserPosition && (
          <Card className="mb-4 sm:mb-6 md:mb-8 rounded-2xl border border-border dark:border-border-dark/50 shadow-md dark:bg-gradient-to-br dark:from-background-dark-secondary dark:to-background-dark-secondary/95 dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-all duration-300">
            <CardContent className="p-6">
              <div className="mb-5 space-y-2">
                <h2 className="text-xl font-bold text-text dark:text-text-dark">
                  Your Service Area
                </h2>
                <p className="text-sm text-text-muted dark:text-text-dark-muted">
                  This is how vitals see your availability on the map
                </p>
              </div>
              <div className="relative w-full rounded-xl overflow-hidden border border-border dark:border-border-dark/40 mb-4" style={{ height: '360px' }}>
                <BaseMap
                  center={browserPosition}
                  zoom={13}
                  markers={[
                    {
                      position: browserPosition,
                      label: '📍',
                      color: 'user',
                    },
                  ]}
                  circle={
                    profile?.serviceRadius
                      ? {
                          center: browserPosition,
                          radius: profile.serviceRadius || 10,
                          color: '#14b8a6',
                          fillColor: '#14b8a6',
                          fillOpacity: 0.15,
                        }
                      : undefined
                  }
                  height="360px"
                />
              </div>
              {/* Service radius info */}
              <div className="space-y-1">
                <p className="text-sm text-text-muted dark:text-text-dark-muted transition-colors">
                  Service Radius: {profile?.serviceRadius || 10} km from {profile?.location?.city || 'your location'}
                </p>
                {bookings.filter(b => b.status === 'ACCEPTED' || b.status === 'ONGOING').length > 0 && (
                  <p className="text-xs text-text-muted dark:text-text-dark-muted italic">
                    Active booking location shown (approximate)
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Management */}
        <Card className="dark:bg-gradient-to-br dark:from-background-dark-secondary dark:to-background-dark-secondary/95 dark:border-border-dark/40 dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_6px_24px_rgba(0,0,0,0.3)] dark:hover:border-primary-dark-mode/30 transition-all duration-300">
          <CardHeader>
            <CardTitle className="dark:text-text-dark">{t('dashboard.guardian.bookingManagement')}</CardTitle>
            <CardDescription className="dark:text-text-dark-muted">{t('dashboard.guardian.bookingManagementDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="py-8 text-center text-text-muted dark:text-text-dark-muted transition-colors">{t('dashboard.guardian.noBookings')}</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const bookingDate = booking.startDate ? new Date(booking.startDate) : null;
                  const bookingTime = booking.startDate ? new Date(booking.startDate).toLocaleTimeString(currentLanguage === 'hi' ? 'hi-IN' : 'en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) : null;

                  return (
                    <div
                      key={booking._id}
                      className="rounded-lg border border-border dark:border-border-dark/40 dark:bg-gradient-to-br dark:from-background-dark-secondary dark:to-background-dark-secondary/90 dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)] p-3 sm:p-4 transition-all hover:shadow-md dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.25)] dark:hover:border-primary-dark-mode/30 dark:hover:-translate-y-0.5"
                    >
                      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-start sm:justify-between">
                        {/* Vital Info & Booking Details */}
                        <div className="flex-1 space-y-2 sm:space-y-3">
                          <div className="flex items-start gap-2 sm:gap-3">
                            {booking.vitalId.profilePhoto ? (
                              <img
                                src={booking.vitalId.profilePhoto}
                                alt={booking.vitalId.name}
                                className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-dark-mode/20 transition-colors">
                                <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary dark:text-primary-dark-mode transition-colors" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                <p className="text-sm sm:text-base font-semibold text-text dark:text-text-dark transition-colors">
                                  {booking.vitalId.name}
                                </p>
                                <Badge variant={statusColors[booking.status as keyof typeof statusColors]} className="text-xs w-fit">
                                  {statusLabels[booking.status as keyof typeof statusLabels]}
                                </Badge>
                              </div>
                              {booking.vitalId.location?.city && (
                                <p className="text-xs text-text-muted dark:text-text-dark-muted transition-colors flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {booking.vitalId.location.city}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Booking Details */}
                          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                            {booking.careType && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-text-muted dark:text-text-dark-muted transition-colors">{t('dashboard.guardian.careType')}:</span>
                                <span className="font-medium text-text dark:text-text-dark transition-colors">{booking.careType}</span>
                              </div>
                            )}
                            {bookingDate && (
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-text-muted dark:text-text-dark-muted transition-colors" />
                                <span className="text-text-muted dark:text-text-dark-muted transition-colors">{t('dashboard.guardian.date')}:</span>
                                <span className="font-medium text-text dark:text-text-dark transition-colors">
                                  {bookingDate.toLocaleDateString(currentLanguage === 'hi' ? 'hi-IN' : 'en-US', { 
                                    weekday: 'short', 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </span>
                              </div>
                            )}
                            {bookingTime && (
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-text-muted dark:text-text-dark-muted transition-colors" />
                                <span className="text-text-muted dark:text-text-dark-muted transition-colors">{t('dashboard.guardian.time')}:</span>
                                <span className="font-medium text-text dark:text-text-dark transition-colors">{bookingTime}</span>
                              </div>
                            )}
                            {booking.endDate && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-text-muted dark:text-text-dark-muted transition-colors">{t('dashboard.guardian.end')}:</span>
                                <span className="font-medium text-text dark:text-text-dark transition-colors">
                                  {new Date(booking.endDate).toLocaleDateString(currentLanguage === 'hi' ? 'hi-IN' : 'en-US', { 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </span>
                              </div>
                            )}
                          </div>

                          {booking.notes && (
                            <div className="rounded-md bg-background/50 dark:bg-background-dark/30 dark:border dark:border-border-dark/40 p-3">
                              <p className="text-xs font-medium text-text-muted dark:text-text-dark-muted transition-colors mb-1">{t('booking.notes')}:</p>
                              <p className="text-sm text-text dark:text-text-dark transition-colors">{booking.notes}</p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 sm:min-w-[180px] md:min-w-[200px] mt-2 sm:mt-0">
                          {booking.status === 'PENDING' && (
                            <div className="flex flex-col sm:flex-col gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleBookingAction(booking._id, 'accept')}
                                className="w-full text-xs sm:text-sm dark:shadow-[0_0_6px_rgba(45,212,191,0.18)] dark:hover:shadow-[0_0_10px_rgba(45,212,191,0.22)] dark:focus:ring-2 dark:focus:ring-primary-dark-mode/40 transition-all"
                              >
                                <CheckCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                {t('guardian.accept')}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleBookingAction(booking._id, 'reject')}
                                className="w-full text-xs sm:text-sm dark:shadow-[0_0_6px_rgba(248,113,113,0.15)] dark:hover:shadow-[0_0_10px_rgba(248,113,113,0.2)] dark:focus:ring-2 dark:focus:ring-red-400/40 transition-all"
                              >
                                {t('guardian.reject')}
                              </Button>
                            </div>
                          )}
                          {booking.status === 'ACCEPTED' && (
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleBookingAction(booking._id, 'start')}
                                className="w-full text-xs sm:text-sm dark:shadow-[0_0_6px_rgba(45,212,191,0.18)] dark:hover:shadow-[0_0_10px_rgba(45,212,191,0.22)] dark:focus:ring-2 dark:focus:ring-primary-dark-mode/40 transition-all"
                              >
                                {t('dashboard.guardian.startService')}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReschedule(booking._id)}
                                className="w-full text-xs sm:text-sm dark:border-border-dark/50 dark:hover:bg-background-dark-secondary dark:hover:border-primary-dark-mode/40"
                              >
                                {t('dashboard.guardian.reschedule')}
                              </Button>
                            </div>
                          )}
                          {booking.status === 'ONGOING' && (
                            <Button
                              size="sm"
                              onClick={() => handleBookingAction(booking._id, 'complete')}
                              className="w-full text-xs sm:text-sm dark:shadow-[0_0_6px_rgba(45,212,191,0.18)] dark:hover:shadow-[0_0_10px_rgba(45,212,191,0.22)] dark:focus:ring-2 dark:focus:ring-primary-dark-mode/40 transition-all"
                            >
                              <CheckCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                              {t('dashboard.guardian.markComplete')}
                            </Button>
                          )}
                          {(booking.status === 'ACCEPTED' || booking.status === 'ONGOING') && (
                            <>
                              {(booking.vitalId as any)?._id && (
                                <Link href={`/guardian/chat/${(booking.vitalId as any)._id}`}>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full text-xs sm:text-sm dark:border-primary-dark-mode/60 dark:text-primary-dark-mode dark:hover:bg-primary-dark-mode/15 dark:hover:border-primary-dark-mode dark:hover:shadow-[0_0_8px_rgba(45,212,191,0.25)] dark:focus:ring-2 dark:focus:ring-primary-dark-mode/50 dark:active:bg-primary-dark-mode/20 transition-all"
                                  >
                                    <MessageSquare className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                    {t('dashboard.guardian.chat')}
                                  </Button>
                                </Link>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviews Section - Read-only for Guardian */}
        {reviews.length > 0 && (
          <Card className="mt-4 sm:mt-6 md:mt-8 dark:bg-gradient-to-br dark:from-background-dark-secondary dark:to-background-dark-secondary/95 dark:border-border-dark/40 dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_6px_24px_rgba(0,0,0,0.3)] dark:hover:border-primary-dark-mode/30 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-text-dark">
                <Star className="h-5 w-5 dark:text-primary-dark-mode" />
                {t('dashboard.guardian.reviewsFromVitals')}
              </CardTitle>
              <CardDescription className="dark:text-text-dark-muted">
                {t('dashboard.guardian.reviewsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="rounded-lg border border-border dark:border-border-dark/40 dark:bg-gradient-to-br dark:from-background-dark-secondary dark:to-background-dark-secondary/90 dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)] p-4 transition-all hover:shadow-md dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.25)] dark:hover:border-primary-dark-mode/30 dark:hover:-translate-y-0.5"
                    >
                    <div className="mb-3 flex items-center gap-3">
                      {review.vitalId.profilePhoto ? (
                        <img
                          src={review.vitalId.profilePhoto}
                          alt={review.vitalId.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-sm font-semibold text-primary">
                            {review.vitalId.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-text dark:text-text-dark">
                          {review.vitalId.name}
                        </p>
                        <p className="text-xs text-text-muted dark:text-text-dark-light">
                          {new Date(review.createdAt).toLocaleDateString(currentLanguage === 'hi' ? 'hi-IN' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="mb-2">
                      <StarRating
                        rating={review.rating}
                        readonly
                        size="md"
                      />
                    </div>
                    {(review.reviewText || review.comment) && (
                      <p className="text-sm text-text dark:text-text-dark leading-relaxed">
                        "{review.reviewText || review.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {reviews.length === 0 && (
          <Card className="mt-4 sm:mt-6 md:mt-8 dark:bg-gradient-to-br dark:from-background-dark-secondary dark:to-background-dark-secondary/95 dark:border-border-dark/40 dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_6px_24px_rgba(0,0,0,0.3)] dark:hover:border-primary-dark-mode/30 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-text-dark">
                <Star className="h-5 w-5 dark:text-primary-dark-mode" />
                {t('dashboard.guardian.reviewsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="py-4 text-center text-text-muted dark:text-text-dark-muted transition-colors">
                {t('dashboard.guardian.noReviews')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

