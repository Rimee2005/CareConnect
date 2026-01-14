'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n';
import { Search, Star, MapPin, Shield } from 'lucide-react';

interface Guardian {
  _id: string;
  name: string;
  experience: number;
  specialization: string[];
  profilePhoto?: string;
  isVerified: boolean;
  serviceRadius: number;
  location?: {
    city?: string;
  };
  averageRating?: number;
}

export default function GuardiansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role === 'VITAL') {
      fetchGuardians();
    }
  }, [session, status, router]);

  const fetchGuardians = async () => {
    try {
      const res = await fetch('/api/guardians');
      if (res.ok) {
        const data = await res.json();
        setGuardians(data);
      }
    } catch (error) {
      console.error('Failed to fetch guardians:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGuardians = guardians.filter((guardian) =>
    guardian.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guardian.specialization.some((spec) =>
      spec.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-3 text-2xl font-bold text-text sm:text-3xl sm:mb-4 dark:text-text-dark transition-colors">{t('vital.browse')}</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted sm:h-5 sm:w-5" />
            <Input
              placeholder="Search by name or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-sm sm:pl-10 sm:text-base"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGuardians.map((guardian) => (
            <Card key={guardian._id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  {guardian.profilePhoto ? (
                    <img
                      src={guardian.profilePhoto}
                      alt={guardian.name}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-primary/10">
                      <span className="text-4xl text-primary">
                        {guardian.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {guardian.isVerified && (
                    <Badge
                      variant="success"
                      className="absolute right-2 top-2 flex items-center gap-1"
                    >
                      <Shield className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="mb-2 text-lg font-semibold text-text dark:text-text-dark sm:text-xl transition-colors">{guardian.name}</h3>
                  <div className="mb-2 flex flex-wrap gap-1">
                    {guardian.specialization.slice(0, 2).map((spec, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                    {guardian.specialization.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{guardian.specialization.length - 2}
                      </Badge>
                    )}
                  </div>
                  <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-text-muted dark:text-text-dark-light sm:text-sm sm:gap-4 transition-colors">
                    <span>{guardian.experience} years experience</span>
                    {guardian.averageRating && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-warning text-warning sm:h-4 sm:w-4" />
                        {guardian.averageRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {guardian.location?.city && (
                    <div className="mb-3 flex items-center gap-1 text-xs text-text-muted dark:text-text-dark-light sm:mb-4 sm:text-sm transition-colors">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                      {guardian.location.city}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Link href={`/vital/guardians/${guardian._id}`} className="flex-1">
                      <Button className="w-full text-xs sm:text-sm" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredGuardians.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-text-muted">No guardians found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

