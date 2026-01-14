'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/i18n';
import { Star, MapPin, Shield, Calendar, Clock } from 'lucide-react';
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
      const res = await fetch(`/api/guardians/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setGuardian(data);
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

      setToastMessage('Booking request sent successfully!');
      setShowToast(true);
      setBookingNotes('');
    } catch (error) {
      setToastMessage('An error occurred. Please try again.');
      setShowToast(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!guardian) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>Guardian not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          ← Back
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardContent className="p-0">
                <div className="relative h-64 bg-primary/10">
                  {guardian.profilePhoto ? (
                    <img
                      src={guardian.profilePhoto}
                      alt={guardian.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-6xl text-primary">
                        {guardian.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {guardian.isVerified && (
                    <Badge
                      variant="success"
                      className="absolute right-4 top-4 flex items-center gap-1"
                    >
                      <Shield className="h-4 w-4" />
                      Verified Guardian
                    </Badge>
                  )}
                </div>
                <div className="p-6">
                  <h1 className="mb-2 text-3xl font-bold">{guardian.name}</h1>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {guardian.specialization.map((spec, idx) => (
                      <Badge key={idx} variant="default">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-text-muted">Experience</p>
                      <p className="text-lg font-semibold">{guardian.experience} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted">Service Radius</p>
                      <p className="text-lg font-semibold">{guardian.serviceRadius} km</p>
                    </div>
                    {guardian.location?.city && (
                      <div>
                        <p className="text-sm text-text-muted">Location</p>
                        <p className="text-lg font-semibold flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {guardian.location.city}
                        </p>
                      </div>
                    )}
                    {guardian.averageRating && (
                      <div>
                        <p className="text-sm text-text-muted">Rating</p>
                        <p className="text-lg font-semibold flex items-center gap-1">
                          <Star className="h-4 w-4 fill-warning text-warning" />
                          {guardian.averageRating.toFixed(1)} ({guardian.reviewCount || 0} reviews)
                        </p>
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
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="border-b pb-4 last:border-0">
                        <div className="mb-2 flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-warning text-warning'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-semibold">{review.vitalId.name}</span>
                        </div>
                        {review.comment && <p className="text-text">{review.comment}</p>}
                        <p className="mt-2 text-xs text-text-muted">
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
              <CardHeader>
                <CardTitle>{t('vital.book')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    rows={4}
                    placeholder="Any special requirements or notes..."
                  />
                </div>
                <Button onClick={handleBook} className="w-full" size="lg">
                  {t('vital.book')}
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  {t('vital.chat')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {showToast && (
          <Toast
            message={toastMessage}
            type={toastMessage.includes('success') ? 'success' : 'error'}
            onClose={() => setShowToast(false)}
          />
        )}
      </div>
    </div>
  );
}

