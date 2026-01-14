'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { VitalNavbar } from '@/components/VitalNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/i18n';
import { Star, MapPin, Shield, Calendar, Clock } from 'lucide-react';
import { StarRating } from '@/components/StarRating';
import { Toast } from '@/components/ui/toast';

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

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  vitalId: {
    name: string;
  };
  createdAt: string;
}

export default function GuardianDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation();
  const [guardian, setGuardian] = useState<Guardian | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingNotes, setBookingNotes] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (session?.user?.role !== 'VITAL') {
      router.push('/');
      return;
    }
    fetchGuardian();
    fetchReviews();
  }, [params.id, session, router]);

  const fetchGuardian = async () => {
    try {
      if (!params.id) {
        console.error('No guardian ID provided');
        setLoading(false);
        return;
      }
      
      const res = await fetch(`/api/guardians/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setGuardian(data);
      } else {
        const errorData = await res.json();
        console.error('Failed to fetch guardian:', errorData);
      }
    } catch (error) {
      console.error('Failed to fetch guardian:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/guardians/${params.id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const handleBook = async () => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guardianId: params.id,
          notes: bookingNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToastMessage(data.error || 'Failed to create booking');
        setShowToast(true);
        return;
      }

      setToastMessage('✅ Service booked successfully! Your booking request has been sent.');
      setShowToast(true);
      setBookingNotes('');
    } catch (error) {
      setToastMessage('An error occurred. Please try again.');
      setShowToast(true);
    }
  };

  const handleChat = async () => {
    if (!guardian || !session?.user?.id) return;
    
    // Get Vital profile to ensure we have vitalId
    try {
      const vitalRes = await fetch('/api/vital/profile');
      if (vitalRes.ok) {
        router.push(`/vital/chat/${params.id}`);
      } else {
        setToastMessage('Please create your profile first');
        setShowToast(true);
      }
    } catch (error) {
      setToastMessage('Failed to load chat');
      setShowToast(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <VitalNavbar />
        <div className="container mx-auto px-4 py-8">
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!guardian) {
    return (
      <div className="min-h-screen">
        <VitalNavbar />
        <div className="container mx-auto px-4 py-8">
          <p>Guardian not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <VitalNavbar />
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-sm sm:text-base">
          ← Back
        </Button>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="mb-6 sm:mb-8">
              <CardContent className="p-0">
                <div className="relative h-48 bg-primary/10 dark:bg-primary-dark-mode/20 sm:h-64 transition-colors">
                  {guardian.profilePhoto ? (
                    <img
                      src={guardian.profilePhoto}
                      alt={guardian.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-4xl text-primary dark:text-primary-dark-mode sm:text-6xl transition-colors">
                        {guardian.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {guardian.isVerified && (
                    <Badge
                      variant="success"
                      className="absolute right-2 top-2 flex items-center gap-1 text-xs sm:right-4 sm:top-4 sm:text-sm"
                    >
                      <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                      Verified Guardian
                    </Badge>
                  )}
                </div>
                <div className="p-4 sm:p-6">
                  <h1 className="mb-2 text-2xl font-bold text-text dark:text-text-dark sm:text-3xl transition-colors">{guardian.name}</h1>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {guardian.specialization.map((spec, idx) => (
                      <Badge key={idx} variant="default">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs text-text-muted dark:text-text-dark-light sm:text-sm transition-colors">Experience</p>
                      <p className="text-base font-semibold text-text dark:text-text-dark sm:text-lg transition-colors">{guardian.experience} years</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted dark:text-text-dark-light sm:text-sm transition-colors">Service Radius</p>
                      <p className="text-base font-semibold text-text dark:text-text-dark sm:text-lg transition-colors">{guardian.serviceRadius} km</p>
                    </div>
                    {guardian.location?.city && (
                      <div>
                        <p className="text-xs text-text-muted dark:text-text-dark-light sm:text-sm transition-colors">Location</p>
                        <p className="text-base font-semibold text-text dark:text-text-dark sm:text-lg flex items-center gap-1 transition-colors">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                          {guardian.location.city}
                        </p>
                      </div>
                    )}
                    {guardian.averageRating ? (
                      <div>
                        <p className="text-xs text-text-muted dark:text-text-dark-light sm:text-sm transition-colors">Rating</p>
                        <div className="flex items-center gap-2">
                          <StarRating
                            rating={guardian.averageRating}
                            readonly
                            size="md"
                          />
                          <p className="text-base font-semibold text-text dark:text-text-dark sm:text-lg transition-colors">
                            {guardian.averageRating.toFixed(1)} ({guardian.reviewCount || 0} reviews)
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-text-muted dark:text-text-dark-light sm:text-sm transition-colors">Rating</p>
                        <Badge variant="outline">New Guardian</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="mb-2 font-semibold">Available Days:</p>
                  <div className="flex flex-wrap gap-2">
                    {guardian.availability.days.map((day) => (
                      <Badge key={day} variant="outline">
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Hours:
                  </p>
                  <p className="text-text">
                    {guardian.availability.hours.start} - {guardian.availability.hours.end}
                  </p>
                </div>
              </CardContent>
            </Card>

            {reviews.length > 0 && (
              <Card className="mt-6 sm:mt-8">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="text-lg sm:text-xl">Reviews</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="border-b border-border dark:border-border-dark pb-4 last:border-0 transition-colors">
                        <div className="mb-2 flex items-center gap-2">
                          <StarRating
                            rating={review.rating}
                            readonly
                            size="sm"
                          />
                          <span className="text-sm font-semibold text-text dark:text-text-dark sm:text-base transition-colors">{review.vitalId.name}</span>
                        </div>
                        {(review.reviewText || review.comment) && (
                          <p className="text-sm text-text dark:text-text-dark sm:text-base transition-colors">
                            {review.reviewText || review.comment}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-text-muted dark:text-text-dark-light transition-colors">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-lg sm:text-xl">{t('vital.book')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4 sm:px-6">
                <div>
                  <Label htmlFor="notes" className="text-sm sm:text-base">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    rows={4}
                    placeholder="Any special requirements or notes..."
                    className="text-sm sm:text-base"
                  />
                </div>
                <Button onClick={handleBook} className="w-full text-sm sm:text-base" size="lg">
                  {t('vital.book')}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-sm sm:text-base" 
                  size="lg"
                  onClick={handleChat}
                >
                  {t('vital.chat')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {showToast && (
          <Toast
            message={toastMessage}
            type={toastMessage.includes('success') || toastMessage.includes('✅') ? 'success' : 'error'}
            onClose={() => setShowToast(false)}
            duration={toastMessage.includes('success') || toastMessage.includes('✅') ? 4000 : 5000}
          />
        )}
      </div>
    </div>
  );
}

