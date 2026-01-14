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
import { AlertCircle, Plus, Search } from 'lucide-react';

interface VitalProfile {
  _id: string;
  name: string;
  age: number;
  healthNeeds: string;
  profilePhoto?: string;
}

export default function VitalDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<VitalProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role === 'VITAL') {
      fetchProfile();
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

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-text sm:text-3xl dark:text-text-dark transition-colors">Welcome, {profile.name}!</h1>
          <p className="text-sm text-text-muted sm:text-base dark:text-text-dark-light transition-colors">Your care dashboard</p>
        </div>

        <div className="mb-6 grid gap-4 sm:gap-6 sm:mb-8 md:grid-cols-2">
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
                  <p className="text-sm text-text-muted dark:text-text-dark-muted transition-colors">Age: {profile.age}</p>
                </div>
              </div>
              <Button variant="outline" className="mt-4 w-full">
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

        {featureFlags.SOS_EMERGENCY && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-error" />
                Emergency Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-text-muted dark:text-text-dark-muted transition-colors">{t('feature.sos.comingSoon')}</p>
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

