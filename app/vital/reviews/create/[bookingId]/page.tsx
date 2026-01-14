'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { ReviewForm } from '@/components/ReviewForm';
import { Card, CardContent } from '@/components/ui/card';

interface Booking {
  _id: string;
  status: string;
  guardianId: {
    _id: string;
    name: string;
  };
}

export default function CreateReviewPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.user?.role !== 'VITAL') {
      router.push('/');
      return;
    }

    fetchBooking();
  }, [session, router, params.bookingId]);

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${params.bookingId}`);
      if (res.ok) {
        const data = await res.json();
        
        // Verify booking is completed
        if (data.status !== 'COMPLETED') {
          setError('Only completed bookings can be reviewed');
          return;
        }

        setBooking(data);
      } else {
        setError('Booking not found');
      }
    } catch (error) {
      setError('Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    router.push('/vital/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-error">{error || 'Booking not found'}</p>
              <button
                onClick={() => router.push('/vital/dashboard')}
                className="mt-4 text-primary hover:underline"
              >
                Go to Dashboard
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <ReviewForm
          bookingId={params.bookingId as string}
          guardianName={booking.guardianId.name}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}

