'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { VitalNavbar } from '@/components/VitalNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n';
import { 
  Search, 
  Heart, 
  Calendar, 
  Clock, 
  MessageCircle, 
  CheckCircle2, 
  Circle, 
  Loader2,
  History,
  User,
  MapPin,
  ArrowRight
} from 'lucide-react';

interface VitalProfile {
  _id: string;
  name: string;
  age: number;
  healthNeeds: string;
  profilePhoto?: string;
}

interface Booking {
  _id: string;
  status: 'PENDING' | 'ACCEPTED' | 'ONGOING' | 'COMPLETED' | 'REJECTED';
  guardianId: {
    _id: string;
    name: string;
    profilePhoto?: string;
    specialization?: string[];
    availability?: {
      days: string[];
      hours: {
        start: string;
        end: string;
      };
    };
  };
  notes?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
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

    if (status === 'authenticated' && session?.user?.role === 'VITAL') {
      fetchProfile();
      fetchBookings();
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
        <VitalNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen">
        <VitalNavbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle>Welcome to CareConnect</CardTitle>
              <CardDescription>Create your profile to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/vital/profile/create">
                <Button className="w-full">
                  Create Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Get active booking (ONGOING or ACCEPTED)
  const activeBooking = bookings.find(b => b.status === 'ONGOING' || b.status === 'ACCEPTED');
  
  // Get pending booking
  const pendingBooking = bookings.find(b => b.status === 'PENDING');
  
  // Get completed bookings for history
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED').slice(0, 5);

  const getStatusStep = (bookingStatus: string) => {
    switch (bookingStatus) {
      case 'PENDING':
        return 1; // Requested
      case 'ACCEPTED':
        return 2; // Guardian Reviewing → Confirmed
      case 'ONGOING':
        return 3; // Active
      default:
        return 0;
    }
  };

  const getStatusLabel = (bookingStatus: string) => {
    switch (bookingStatus) {
      case 'PENDING':
        return 'Requested';
      case 'ACCEPTED':
        return 'Confirmed';
      case 'ONGOING':
        return 'Active';
      default:
        return bookingStatus;
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark transition-colors">
      <VitalNavbar />
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
        {/* Welcome Section */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-3xl font-bold text-text dark:text-text-dark sm:text-4xl transition-colors mb-2">
            Welcome back, {profile.name}
          </h1>
          <p className="text-base text-text-muted dark:text-text-dark-muted sm:text-lg transition-colors">
            Your personalized care management dashboard
          </p>
        </div>

        {/* Empty State - No Active Booking */}
        {!activeBooking && !pendingBooking && (
          <div className="mb-8 animate-in fade-in duration-500">
            <Card className="border-2 border-dashed border-primary/30 bg-primary/5 dark:bg-primary-dark-mode/10">
              <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-6 text-center">
                <div className="mb-6 rounded-full bg-primary/10 p-6 dark:bg-primary-dark-mode/20">
                  <Heart className="h-12 w-12 text-primary dark:text-primary-dark-mode" />
                </div>
                <h2 className="text-2xl font-semibold text-text dark:text-text-dark mb-3 sm:text-3xl transition-colors">
                  Ready to find your perfect caregiver?
                </h2>
                <p className="text-base text-text-muted dark:text-text-dark-muted mb-8 max-w-md sm:text-lg transition-colors">
                  Browse our compassionate guardians and start your care journey today. We're here to help you find the right match.
                </p>
                <Link href="/vital/guardians">
                  <Button size="lg" className="text-base sm:text-lg px-8 py-6 h-auto">
                    <Search className="mr-2 h-5 w-5" />
                    Browse Guardians
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Active Booking Section */}
        {activeBooking && (
          <div className="mb-8 animate-in slide-in-from-bottom-4 duration-500">
            <Card className="border-primary/20 shadow-medium dark:shadow-dark-medium">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
                      Active Booking
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm sm:text-base">
                      Your care service is currently active
                    </CardDescription>
                  </div>
                  <Badge variant="success" className="text-xs sm:text-sm">
                    {getStatusLabel(activeBooking.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  {activeBooking.guardianId.profilePhoto ? (
                    <img
                      src={activeBooking.guardianId.profilePhoto}
                      alt={activeBooking.guardianId.name}
                      className="h-16 w-16 rounded-full object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20">
                      <User className="h-8 w-8 text-primary dark:text-primary-dark-mode" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-1 sm:text-xl transition-colors">
                      {activeBooking.guardianId.name}
                    </h3>
                    {activeBooking.guardianId.specialization && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {activeBooking.guardianId.specialization.slice(0, 3).map((spec, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {activeBooking.guardianId.availability && (
                  <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-border dark:border-border-dark">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary dark:text-primary-dark-mode mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-text dark:text-text-dark mb-1 transition-colors">
                          Visit Schedule
                        </p>
                        <p className="text-sm text-text-muted dark:text-text-dark-muted transition-colors">
                          {activeBooking.guardianId.availability.days.join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary dark:text-primary-dark-mode mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-text dark:text-text-dark mb-1 transition-colors">
                          Timings
                        </p>
                        <p className="text-sm text-text-muted dark:text-text-dark-muted transition-colors">
                          {activeBooking.guardianId.availability.hours.start} - {activeBooking.guardianId.availability.hours.end}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border dark:border-border-dark">
                  <Link href={`/vital/chat/${activeBooking.guardianId._id}`} className="flex-1">
                    <Button variant="default" className="w-full" size="lg">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Chat
                    </Button>
                  </Link>
                  <Link href="/vital/schedule" className="flex-1">
                    <Button variant="outline" className="w-full" size="lg">
                      View Schedule
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Booking Status Timeline - Pending/Requested */}
        {pendingBooking && !activeBooking && (
          <div className="mb-8 animate-in slide-in-from-bottom-4 duration-500">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary dark:text-primary-dark-mode animate-spin" />
                  Booking Status
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Your booking request is being reviewed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Timeline */}
                  <div className="space-y-6">
                    {/* Step 1: Requested */}
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                          getStatusStep(pendingBooking.status) >= 1
                            ? 'border-primary bg-primary text-white dark:bg-primary-dark-mode dark:border-primary-dark-mode'
                            : 'border-border dark:border-border-dark'
                        }`}>
                          {getStatusStep(pendingBooking.status) >= 1 ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </div>
                        {getStatusStep(pendingBooking.status) < 2 && (
                          <div className="h-12 w-0.5 bg-border dark:bg-border-dark mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="font-semibold text-text dark:text-text-dark transition-colors">
                          Request Sent
                        </p>
                        <p className="text-sm text-text-muted dark:text-text-dark-muted transition-colors">
                          Your booking request has been sent to {pendingBooking.guardianId.name}
                        </p>
                        <p className="text-xs text-text-muted dark:text-text-dark-muted mt-1 transition-colors">
                          {new Date(pendingBooking.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Step 2: Guardian Reviewing */}
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                          getStatusStep(pendingBooking.status) >= 2
                            ? 'border-primary bg-primary text-white dark:bg-primary-dark-mode dark:border-primary-dark-mode'
                            : 'border-border dark:border-border-dark'
                        }`}>
                          {getStatusStep(pendingBooking.status) >= 2 ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : getStatusStep(pendingBooking.status) === 1 ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </div>
                        {getStatusStep(pendingBooking.status) < 3 && (
                          <div className="h-12 w-0.5 bg-border dark:bg-border-dark mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="font-semibold text-text dark:text-text-dark transition-colors">
                          Guardian Reviewing
                        </p>
                        <p className="text-sm text-text-muted dark:text-text-dark-muted transition-colors">
                          {pendingBooking.guardianId.name} is reviewing your request
                        </p>
                      </div>
                    </div>

                    {/* Step 3: Confirmed */}
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                          getStatusStep(pendingBooking.status) >= 3
                            ? 'border-primary bg-primary text-white dark:bg-primary-dark-mode dark:border-primary-dark-mode'
                            : 'border-border dark:border-border-dark'
                        }`}>
                          {getStatusStep(pendingBooking.status) >= 3 ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="font-semibold text-text dark:text-text-dark transition-colors">
                          Confirmed
                        </p>
                        <p className="text-sm text-text-muted dark:text-text-dark-muted transition-colors">
                          Your booking will be confirmed once accepted
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guardian Info */}
                <div className="mt-6 pt-6 border-t border-border dark:border-border-dark">
                  <div className="flex items-center gap-4">
                    {pendingBooking.guardianId.profilePhoto ? (
                      <img
                        src={pendingBooking.guardianId.profilePhoto}
                        alt={pendingBooking.guardianId.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-6 w-6 text-primary dark:text-primary-dark-mode" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-text dark:text-text-dark transition-colors">
                        {pendingBooking.guardianId.name}
                      </p>
                      {pendingBooking.notes && (
                        <p className="text-sm text-text-muted dark:text-text-dark-muted mt-1 transition-colors">
                          Notes: {pendingBooking.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions - Always Available */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-medium dark:hover:shadow-dark-medium transition-all duration-300 cursor-pointer group">
            <Link href="/vital/guardians">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-3 dark:bg-primary-dark-mode/20 group-hover:bg-primary/20 dark:group-hover:bg-primary-dark-mode/30 transition-colors">
                    <Search className="h-6 w-6 text-primary dark:text-primary-dark-mode" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text dark:text-text-dark mb-1 transition-colors">
                      Browse Guardians
                    </h3>
                    <p className="text-sm text-text-muted dark:text-text-dark-muted transition-colors">
                      Find your perfect caregiver
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-text-muted dark:text-text-dark-muted group-hover:text-primary dark:group-hover:text-primary-dark-mode transition-colors" />
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-medium dark:hover:shadow-dark-medium transition-all duration-300 cursor-pointer group">
            <Link href="/vital/guardians?tab=saved">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-secondary/10 p-3 dark:bg-secondary-dark-mode/20 group-hover:bg-secondary/20 dark:group-hover:bg-secondary-dark-mode/30 transition-colors">
                    <Heart className="h-6 w-6 text-secondary dark:text-secondary-dark-mode" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text dark:text-text-dark mb-1 transition-colors">
                      Saved Guardians
                    </h3>
                    <p className="text-sm text-text-muted dark:text-text-dark-muted transition-colors">
                      View your shortlisted caregivers
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-text-muted dark:text-text-dark-muted group-hover:text-secondary dark:group-hover:text-secondary-dark-mode transition-colors" />
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-medium dark:hover:shadow-dark-medium transition-all duration-300 cursor-pointer group">
            <Link href="/vital/profile/create">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-sage/10 p-3 dark:bg-sage-dark-mode/20 group-hover:bg-sage/20 dark:group-hover:bg-sage-dark-mode/30 transition-colors">
                    <User className="h-6 w-6 text-sage dark:text-sage-dark-mode" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text dark:text-text-dark mb-1 transition-colors">
                      My Profile
                    </h3>
                    <p className="text-sm text-text-muted dark:text-text-dark-muted transition-colors">
                      Manage your profile
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-text-muted dark:text-text-dark-muted group-hover:text-sage dark:group-hover:text-sage-dark-mode transition-colors" />
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Care History */}
        {completedBookings.length > 0 && (
          <div className="animate-in fade-in duration-500">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <History className="h-5 w-5 sm:h-6 sm:w-6" />
                  Care History
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Your past care services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedBookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="flex items-center gap-4 rounded-lg border border-border dark:border-border-dark p-4 hover:bg-background-secondary dark:hover:bg-background-dark-secondary transition-colors"
                    >
                      {booking.guardianId.profilePhoto ? (
                        <img
                          src={booking.guardianId.profilePhoto}
                          alt={booking.guardianId.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-6 w-6 text-primary dark:text-primary-dark-mode" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-text dark:text-text-dark transition-colors">
                          {booking.guardianId.name}
                        </p>
                        <p className="text-sm text-text-muted dark:text-text-dark-muted transition-colors">
                          Completed on {new Date(booking.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="success" className="text-xs sm:text-sm">
                        Completed
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
