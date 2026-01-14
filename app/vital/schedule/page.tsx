'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { VitalNavbar } from '@/components/VitalNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, User, MapPin, Star, Shield, MessageCircle } from 'lucide-react';

interface Guardian {
  _id: string;
  name: string;
  age: number;
  experience: number;
  specialization: string[];
  availability: {
    days: string[];
    hours: {
      start: string;
      end: string;
    };
  };
  serviceRadius: number;
  profilePhoto?: string;
  isVerified: boolean;
  location?: {
    city?: string;
  };
  averageRating?: number;
  reviewCount?: number;
}

interface Booking {
  _id: string;
  status: string;
  guardianId: Guardian;
  notes?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ViewSchedulePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role === 'VITAL') {
      fetchActiveBooking();
    }
  }, [session, status, router]);

  const fetchActiveBooking = async () => {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const bookings = await res.json();
        // Find active booking (ONGOING or ACCEPTED)
        const active = bookings.find((b: Booking) => 
          b.status === 'ONGOING' || b.status === 'ACCEPTED'
        );
        
        if (active) {
          // Fetch full guardian details
          const guardianRes = await fetch(`/api/guardians/${active.guardianId._id}`);
          if (guardianRes.ok) {
            const guardianData = await guardianRes.json();
            setBooking({
              ...active,
              guardianId: guardianData,
            });
          } else {
            setBooking(active);
          }
        } else {
          // No active booking - redirect to dashboard
          router.push('/vital/dashboard');
        }
      }
    } catch (error) {
      console.error('Failed to fetch booking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark transition-colors">
        <VitalNavbar />
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!booking || !booking.guardianId) {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark transition-colors">
        <VitalNavbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-text-muted dark:text-text-dark-muted">
                No active booking found. Please return to your dashboard.
              </p>
              <Link href="/vital/dashboard" className="mt-4 inline-block">
                <Button>Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const guardian = booking.guardianId;

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark transition-colors">
      <VitalNavbar />
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8">
        {/* Back to Dashboard */}
        <Link href="/vital/dashboard">
          <Button variant="ghost" className="mb-6 text-sm sm:text-base">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Schedule Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary dark:text-primary-dark-mode" />
                  Visit Schedule
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Your assigned guardian's availability and schedule
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Available Days */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-text dark:text-text-dark sm:text-base transition-colors">
                    Available Days
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {guardian.availability.days.map((day) => (
                      <Badge key={day} variant="default" className="text-sm px-3 py-1">
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Available Hours */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-text dark:text-text-dark sm:text-base transition-colors flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Available Hours
                  </h3>
                  <div className="rounded-lg border border-border dark:border-border-dark bg-background-secondary dark:bg-background-dark-secondary p-4">
                    <p className="text-base font-medium text-text dark:text-text-dark transition-colors">
                      {guardian.availability.hours.start} - {guardian.availability.hours.end}
                    </p>
                    <p className="mt-1 text-sm text-text-muted dark:text-text-dark-muted transition-colors">
                      Available during these hours on scheduled days
                    </p>
                  </div>
                </div>

                {/* Booking Details */}
                {booking.notes && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-text dark:text-text-dark sm:text-base transition-colors">
                      Booking Notes
                    </h3>
                    <div className="rounded-lg border border-border dark:border-border-dark bg-background-secondary dark:bg-background-dark-secondary p-4">
                      <p className="text-sm text-text dark:text-text-dark transition-colors">
                        {booking.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Booking Status */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-text dark:text-text-dark sm:text-base transition-colors">
                    Booking Status
                  </h3>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={booking.status === 'ONGOING' ? 'success' : 'default'}
                      className="text-sm"
                    >
                      {booking.status === 'ONGOING' ? 'Active' : booking.status === 'ACCEPTED' ? 'Confirmed' : booking.status}
                    </Badge>
                    <span className="text-sm text-text-muted dark:text-text-dark-muted transition-colors">
                      Booking created on {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Guardian Profile Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-primary dark:text-primary-dark-mode" />
                  Assigned Guardian
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Guardian Photo */}
                <div className="flex justify-center">
                  {guardian.profilePhoto ? (
                    <img
                      src={guardian.profilePhoto}
                      alt={guardian.name}
                      className="h-24 w-24 rounded-full object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20">
                      <span className="text-3xl text-primary dark:text-primary-dark-mode">
                        {guardian.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Guardian Name */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-text dark:text-text-dark transition-colors">
                    {guardian.name}
                  </h3>
                  {guardian.isVerified && (
                    <Badge variant="success" className="mt-2 flex items-center gap-1 mx-auto w-fit">
                      <Shield className="h-3 w-3" />
                      Verified Guardian
                    </Badge>
                  )}
                </div>

                {/* Specializations */}
                <div>
                  <p className="mb-2 text-sm font-medium text-text-muted dark:text-text-dark-muted transition-colors">
                    Specializations
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {guardian.specialization.map((spec, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Experience & Rating */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border dark:border-border-dark">
                  <div>
                    <p className="text-xs text-text-muted dark:text-text-dark-muted transition-colors">Experience</p>
                    <p className="text-sm font-semibold text-text dark:text-text-dark transition-colors">
                      {guardian.experience} years
                    </p>
                  </div>
                  {guardian.averageRating && (
                    <div>
                      <p className="text-xs text-text-muted dark:text-text-dark-muted transition-colors">Rating</p>
                      <p className="text-sm font-semibold text-text dark:text-text-dark transition-colors flex items-center gap-1">
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        {guardian.averageRating.toFixed(1)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Location */}
                {guardian.location?.city && (
                  <div className="pt-2 border-t border-border dark:border-border-dark">
                    <p className="text-xs text-text-muted dark:text-text-dark-muted transition-colors mb-1">Location</p>
                    <p className="text-sm text-text dark:text-text-dark transition-colors flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {guardian.location.city}
                    </p>
                    <p className="text-xs text-text-muted dark:text-text-dark-muted transition-colors mt-1">
                      Service radius: {guardian.serviceRadius} km
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-border dark:border-border-dark space-y-2">
                  <Link href={`/vital/guardians/${guardian._id}`} className="block">
                    <Button variant="outline" className="w-full" size="sm">
                      View Full Profile
                    </Button>
                  </Link>
                  <Link href={`/vital/chat/${guardian._id}`} className="block">
                    <Button className="w-full" size="sm">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Chat
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

