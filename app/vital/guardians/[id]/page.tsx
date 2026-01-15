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
import { featureFlags } from '@/lib/feature-flags';
import { Star, MapPin, Shield, Calendar, Clock, CheckCircle, Languages, Clock as ClockIcon, TrendingUp, DollarSign, Info, Award, Sparkles } from 'lucide-react';
import { StarRating } from '@/components/StarRating';
import { Toast } from '@/components/ui/toast';
import { formatResponseSpeed, getAvailabilityStatus, formatReliabilityScore } from '@/lib/guardian-metrics';
import { GuardianMap } from '@/components/GuardianMap';
import { AIBadge } from '@/components/AIBadge';

interface Guardian {
  _id: string;
  name: string;
  age: number;
  experience: number;
  experienceBreakdown?: Array<{ years: number; type: string }>;
  specialization: string[];
  careTags?: string[];
  introduction?: string;
  availability: {
    days: string[];
    hours: {
      start: string;
      end: string;
    };
    shiftType?: 'Morning' | 'Night' | '24×7';
  };
  languages?: string[];
  serviceRadius: number;
  certifications?: string[];
  profilePhoto?: string;
  isVerified: boolean;
  aiMatch?: {
    score: number;
    explanation: string;
    reasons: string[];
    isRecommended: boolean;
  };
  verificationBadges?: {
    idVerified: boolean;
    certificationUploaded: boolean;
    highlyRated: boolean;
    repeatBookings: boolean;
  };
  pricing?: {
    hourly?: number;
    daily?: number;
    monthly?: number;
    priceBreakdown?: string;
  };
  location?: {
    city?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  averageRating?: number;
  reviewCount?: number;
  responseSpeed?: number | null;
  repeatBookings?: number;
  reliability?: number;
  distance?: number | null;
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
  const [vitalLocation, setVitalLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (session?.user?.role !== 'VITAL') {
      router.push('/');
      return;
    }
    fetchGuardian();
    fetchReviews();
    fetchVitalLocation();
  }, [params.id, session, router]);

  const fetchVitalLocation = async () => {
    try {
      const res = await fetch('/api/vital/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.location?.coordinates) {
          setVitalLocation({
            lat: data.location.coordinates.lat,
            lng: data.location.coordinates.lng,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch vital location:', error);
    }
  };

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
        console.log('Guardian data:', data); // Debug log
        console.log('Pricing:', data.pricing); // Debug log
        console.log('Care Tags:', data.careTags); // Debug log
        console.log('Languages:', data.languages); // Debug log
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
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-bold text-text dark:text-text-dark sm:text-3xl transition-colors">{guardian.name}</h1>
                    {guardian.aiMatch?.isRecommended && featureFlags.AI_MATCHING && (
                      <AIBadge
                        explanation={guardian.aiMatch.explanation}
                        reasons={guardian.aiMatch.reasons}
                        score={guardian.aiMatch.score}
                      />
                    )}
                  </div>
                  
                  {/* AI Explanation - Why This Guardian? */}
                  {guardian.aiMatch?.isRecommended && featureFlags.AI_MATCHING && (
                    <div className="mb-4 rounded-lg border-2 border-primary/30 dark:border-primary-dark-mode/30 bg-primary/5 dark:bg-primary-dark-mode/5 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary dark:text-primary-dark-mode" />
                        <h3 className="text-base font-semibold text-text dark:text-text-dark transition-colors">
                          Why this Guardian?
                        </h3>
                      </div>
                      <p className="mb-2 text-sm text-text dark:text-text-dark transition-colors">
                        {guardian.aiMatch.explanation}
                      </p>
                      {guardian.aiMatch.reasons && guardian.aiMatch.reasons.length > 0 && (
                        <ul className="list-disc space-y-1 pl-5 text-xs text-text-muted dark:text-text-dark-muted transition-colors">
                          {guardian.aiMatch.reasons.slice(0, 3).map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  
                  {/* Human Introduction - Always Show if Available */}
                  {guardian.introduction && (
                    <div className="mb-4 rounded-lg border-2 border-primary/20 dark:border-primary-dark-mode/20 bg-background-secondary dark:bg-background-dark-secondary p-4 sm:p-5">
                      <h3 className="mb-2 text-base font-semibold text-text dark:text-text-dark sm:text-lg transition-colors">
                        About {guardian.name}
                      </h3>
                      <p className="text-sm leading-relaxed text-text dark:text-text-dark sm:text-base transition-colors">
                        {guardian.introduction}
                      </p>
                    </div>
                  )}
                  
                  {/* Full Care Type Tags - Always Show if Available */}
                  {guardian.careTags && Array.isArray(guardian.careTags) && guardian.careTags.length > 0 ? (
                    <div className="mb-4 rounded-lg border-2 border-primary/20 dark:border-primary-dark-mode/20 bg-background-secondary dark:bg-background-dark-secondary p-4 sm:p-5">
                      <h3 className="mb-3 text-base font-semibold text-text dark:text-text-dark sm:text-lg transition-colors">
                        {t('guardian.detail.careTags')}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {guardian.careTags.map((tag, idx) => (
                          <Badge key={idx} variant="default" className="bg-primary/20 text-primary border border-primary/30 dark:bg-primary-dark-mode/20 dark:text-primary-dark-mode dark:border-primary-dark-mode/30 px-3 py-1.5 text-sm font-medium">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  
                  {/* Languages Spoken - Dedicated Section */}
                  {guardian.languages && Array.isArray(guardian.languages) && guardian.languages.length > 0 ? (
                    <div className="mb-4 rounded-lg border-2 border-primary/20 dark:border-primary-dark-mode/20 bg-background-secondary dark:bg-background-dark-secondary p-4 sm:p-5">
                      <h3 className="mb-3 text-base font-semibold text-text dark:text-text-dark sm:text-lg transition-colors flex items-center gap-2">
                        <Languages className="h-5 w-5 text-primary dark:text-primary-dark-mode" />
                        {t('guardian.detail.languages')}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {guardian.languages.map((lang, idx) => (
                          <Badge key={idx} variant="outline" className="text-sm px-3 py-1.5 border-primary/30 text-primary dark:border-primary-dark-mode/30 dark:text-primary-dark-mode">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  
                  {/* Specialization */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {guardian.specialization.map((spec, idx) => (
                      <Badge key={idx} variant="default">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                  {/* Experience Breakdown - Always Show if Available */}
                  {guardian.experienceBreakdown && guardian.experienceBreakdown.length > 0 && (
                    <div className="mb-4 rounded-lg border border-border dark:border-border-dark bg-background-secondary/50 dark:bg-background-dark-secondary/50 p-4">
                      <h3 className="mb-3 text-base font-semibold text-text dark:text-text-dark sm:text-lg transition-colors">
                        {t('guardian.detail.experienceBreakdown')}
                      </h3>
                      <div className="space-y-2">
                        {guardian.experienceBreakdown.map((exp, idx) => (
                          <div key={idx} className="flex items-center gap-3 rounded-md bg-background dark:bg-background-dark p-2.5 border border-border/50 dark:border-border-dark/50">
                            <Calendar className="h-4 w-4 text-primary dark:text-primary-dark-mode flex-shrink-0" />
                            <div>
                              <p className="text-base font-semibold text-text dark:text-text-dark sm:text-lg transition-colors">
                                {exp.years} {exp.years === 1 ? 'year' : 'years'} – {exp.type}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs text-text-muted dark:text-text-dark-light sm:text-sm transition-colors">{t('guardian.detail.experience')}</p>
                      <p className="text-base font-semibold text-text dark:text-text-dark sm:text-lg transition-colors">
                        {guardian.experience} {guardian.experience === 1 ? 'year' : 'years'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted dark:text-text-dark-light sm:text-sm transition-colors">{t('guardian.detail.serviceRadius')}</p>
                      <p className="text-base font-semibold text-text dark:text-text-dark sm:text-lg transition-colors">{guardian.serviceRadius} km</p>
                    </div>
                    {guardian.location?.city && (
                      <div>
                        <p className="text-xs text-text-muted dark:text-text-dark-light sm:text-sm transition-colors">{t('guardian.detail.location')}</p>
                        <p className="text-base font-semibold text-text dark:text-text-dark sm:text-lg flex items-center gap-1 transition-colors">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                          {guardian.location.city}
                        </p>
                      </div>
                    )}
                    {guardian.averageRating ? (
                      <div>
                        <p className="text-xs text-text-muted dark:text-text-dark-light sm:text-sm transition-colors">{t('guardian.detail.rating')}</p>
                        <div className="flex items-center gap-2">
                          <StarRating
                            rating={guardian.averageRating}
                            readonly
                            size="md"
                          />
                          <p className="text-base font-semibold text-text dark:text-text-dark sm:text-lg transition-colors">
                            {guardian.averageRating.toFixed(1)} ({guardian.reviewCount || 0} {t('guardian.detail.reviewCount')})
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-text-muted dark:text-text-dark-light sm:text-sm transition-colors">{t('guardian.detail.rating')}</p>
                        <Badge variant="outline">{t('guardian.detail.noReviews')}</Badge>
                      </div>
                    )}
                    {/* Response Speed (NEW) */}
                    {featureFlags.ADVANCED_GUARDIAN_PROFILE && guardian.responseSpeed !== null && guardian.responseSpeed !== undefined && (
                      <div>
                        <p className="text-xs text-text-muted dark:text-text-dark-light sm:text-sm transition-colors">{t('guardian.detail.responseSpeed')}</p>
                        <p className="text-base font-semibold text-text dark:text-text-dark sm:text-lg flex items-center gap-1 transition-colors">
                          <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                          {formatResponseSpeed(guardian.responseSpeed)}
                        </p>
                      </div>
                    )}
                    {/* Repeat Bookings (NEW) */}
                    {featureFlags.ADVANCED_GUARDIAN_PROFILE && guardian.repeatBookings !== undefined && guardian.repeatBookings > 0 && (
                      <div>
                        <p className="text-xs text-text-muted dark:text-text-dark-light sm:text-sm transition-colors">{t('guardian.detail.repeatBookings')}</p>
                        <p className="text-base font-semibold text-text dark:text-text-dark sm:text-lg flex items-center gap-1 transition-colors">
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                          {t('guardians.repeatBookings')} {guardian.repeatBookings} {t('guardians.families')}
                        </p>
                      </div>
                    )}
                    {/* Reliability (NEW) */}
                    {featureFlags.ADVANCED_GUARDIAN_PROFILE && guardian.reliability !== undefined && (
                      <div>
                        <p className="text-xs text-text-muted dark:text-text-dark-light sm:text-sm transition-colors">{t('guardian.detail.reliability')}</p>
                        <p className="text-base font-semibold text-text dark:text-text-dark sm:text-lg transition-colors">
                          {formatReliabilityScore(guardian.reliability)}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Verification & Certification Badges - Always Show if Available */}
                  {guardian.verificationBadges && (
                    <div className="mt-4 rounded-lg border border-border dark:border-border-dark bg-background-secondary/50 dark:bg-background-dark-secondary/50 p-4">
                      <h3 className="mb-3 text-base font-semibold text-text dark:text-text-dark sm:text-lg transition-colors">
                        Verification & Trust Badges
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {guardian.verificationBadges.idVerified && (
                          <Badge variant="outline" className="flex items-center gap-1.5 border-success/30 bg-success/5 text-success px-3 py-1.5">
                            <CheckCircle className="h-4 w-4" />
                            {t('guardian.detail.badges.idVerified')}
                          </Badge>
                        )}
                        {guardian.verificationBadges.certificationUploaded && (
                          <Badge variant="outline" className="flex items-center gap-1.5 border-primary/30 bg-primary/5 text-primary dark:border-primary-dark-mode/30 dark:bg-primary-dark-mode/5 dark:text-primary-dark-mode px-3 py-1.5">
                            <Award className="h-4 w-4" />
                            {t('guardian.detail.badges.certificationUploaded')}
                          </Badge>
                        )}
                        {guardian.verificationBadges.highlyRated && (
                          <Badge variant="outline" className="flex items-center gap-1.5 border-warning/30 bg-warning/5 text-warning px-3 py-1.5">
                            <Star className="h-4 w-4 fill-warning" />
                            {t('guardian.detail.badges.highlyRated')}
                          </Badge>
                        )}
                        {guardian.verificationBadges.repeatBookings && (
                          <Badge variant="outline" className="flex items-center gap-1.5 border-sage/30 bg-sage/5 text-sage dark:border-sage-dark-mode/30 dark:bg-sage-dark-mode/5 dark:text-sage-dark-mode px-3 py-1.5">
                            <TrendingUp className="h-4 w-4" />
                            {t('guardian.detail.badges.repeatBookings')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Full Pricing Structure - Always Show if Available */}
                  {guardian.pricing && (guardian.pricing.hourly || guardian.pricing.daily || guardian.pricing.monthly) ? (
                    <div className="mt-4 rounded-lg border-2 border-secondary/30 dark:border-secondary-dark-mode/30 bg-gradient-to-br from-secondary/10 to-secondary/5 dark:from-secondary-dark-mode/10 dark:to-secondary-dark-mode/5 p-5">
                      <div className="mb-4 flex items-center gap-2">
                        <DollarSign className="h-6 w-6 text-secondary dark:text-secondary-dark-mode" />
                        <h3 className="text-lg font-bold text-text dark:text-text-dark transition-colors">
                          {t('guardian.detail.pricing')}
                        </h3>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-3">
                        {guardian.pricing.hourly && (
                          <div className="rounded-lg border border-secondary/20 dark:border-secondary-dark-mode/20 bg-background dark:bg-background-dark p-3">
                            <p className="mb-1 text-xs font-medium text-text-muted dark:text-text-dark-light transition-colors">
                              {t('form.pricing.hourly')}
                            </p>
                            <p className="text-xl font-bold text-secondary dark:text-secondary-dark-mode transition-colors">
                              ₹{guardian.pricing.hourly}
                            </p>
                            <p className="text-xs text-text-muted dark:text-text-dark-muted transition-colors">
                              {t('form.pricing.perHour')}
                            </p>
                          </div>
                        )}
                        {guardian.pricing.daily && (
                          <div className="rounded-lg border border-secondary/20 dark:border-secondary-dark-mode/20 bg-background dark:bg-background-dark p-3">
                            <p className="mb-1 text-xs font-medium text-text-muted dark:text-text-dark-light transition-colors">
                              {t('form.pricing.daily')}
                            </p>
                            <p className="text-xl font-bold text-secondary dark:text-secondary-dark-mode transition-colors">
                              ₹{guardian.pricing.daily}
                            </p>
                            <p className="text-xs text-text-muted dark:text-text-dark-muted transition-colors">
                              {t('form.pricing.perDay')}
                            </p>
                          </div>
                        )}
                        {guardian.pricing.monthly && (
                          <div className="rounded-lg border border-secondary/20 dark:border-secondary-dark-mode/20 bg-background dark:bg-background-dark p-3">
                            <p className="mb-1 text-xs font-medium text-text-muted dark:text-text-dark-light transition-colors">
                              {t('form.pricing.monthly')}
                            </p>
                            <p className="text-xl font-bold text-secondary dark:text-secondary-dark-mode transition-colors">
                              ₹{guardian.pricing.monthly}
                            </p>
                            <p className="text-xs text-text-muted dark:text-text-dark-muted transition-colors">
                              {t('form.pricing.perMonth')}
                            </p>
                          </div>
                        )}
                      </div>
                      {guardian.pricing.priceBreakdown && (
                        <div className="mt-4 rounded-lg border border-border dark:border-border-dark bg-background-secondary dark:bg-background-dark-secondary p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <Info className="h-4 w-4 text-primary dark:text-primary-dark-mode" />
                            <p className="text-sm font-semibold text-text dark:text-text-dark transition-colors">
                              {t('guardian.detail.pricing.breakdown')}
                            </p>
                          </div>
                          <p className="text-sm leading-relaxed text-text dark:text-text-dark transition-colors">
                            {guardian.pricing.priceBreakdown}
                          </p>
                        </div>
                      )}
                      <p className="mt-4 text-xs font-medium text-text-muted dark:text-text-dark-muted transition-colors">
                        {t('form.pricing.transparent')}
                      </p>
                    </div>
                  ) : null}
                  
                  {/* Certifications */}
                  {guardian.certifications && guardian.certifications.length > 0 && (
                    <div className="mt-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary dark:text-primary-dark-mode" />
                        <h3 className="text-lg font-semibold text-text dark:text-text-dark transition-colors">
                          Certifications & Credentials
                        </h3>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {guardian.certifications.map((cert, idx) => (
                          <div key={idx} className="relative overflow-hidden rounded-lg border border-border dark:border-border-dark">
                            <img
                              src={cert}
                              alt={`Certification ${idx + 1}`}
                              className="h-32 w-full object-cover transition-transform hover:scale-105"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {t('guardian.detail.availability')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="mb-2 font-semibold">{t('form.availability.days')}:</p>
                  <div className="flex flex-wrap gap-2">
                    {guardian.availability.days.map((day) => (
                      <Badge key={day} variant="outline">
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <p className="mb-2 font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {t('form.availability.start')} - {t('form.availability.end')}:
                  </p>
                  <p className="text-text">
                    {guardian.availability.hours.start} - {guardian.availability.hours.end}
                  </p>
                </div>
                {/* Availability Status (NEW) */}
                {featureFlags.ADVANCED_GUARDIAN_PROFILE && (
                  <div>
                    {(() => {
                      const availStatus = getAvailabilityStatus(guardian.availability);
                      return (
                        <>
                          <p className="mb-2 font-semibold">Current Availability:</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant={availStatus.today === 'Available' ? 'default' : 'outline'}
                              className={availStatus.today === 'Available' ? 'bg-success/20 text-success border-success/30' : ''}
                            >
                              {availStatus.today === 'Available' ? t('guardians.availableToday') : t('guardians.notAvailable')}
                            </Badge>
                            {availStatus.shiftType && (
                              <Badge variant="outline">
                                {availStatus.shiftType}
                              </Badge>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Map with Service Radius */}
            {featureFlags.MAP_VIEW && guardian.location?.coordinates && (
              <Card className="mt-6 sm:mt-8">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <MapPin className="h-5 w-5" />
                    Location & Service Area
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div className="h-64 w-full rounded-lg overflow-hidden">
                    <GuardianMap
                      guardians={[guardian]}
                      vitalLocation={vitalLocation}
                      onGuardianClick={() => {}}
                    />
                  </div>
                  <p className="mt-3 text-xs text-text-muted dark:text-text-dark-muted transition-colors">
                    Service radius: {guardian.serviceRadius} km from {guardian.location?.city || 'location'}
                    {vitalLocation && guardian.distance !== null && guardian.distance !== undefined && (
                      <span className="ml-2">
                        • Distance: {guardian.distance.toFixed(1)} km away
                      </span>
                    )}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Reviews & Ratings - Full Display */}
            <Card className="mt-6 sm:mt-8">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-lg sm:text-xl">
                  {t('guardian.detail.reviews')} {guardian.averageRating && `(${guardian.averageRating.toFixed(1)}⭐)`}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                {reviews.length > 0 ? (
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
                          <p className="text-sm leading-relaxed text-text dark:text-text-dark sm:text-base transition-colors">
                            {review.reviewText || review.comment}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-text-muted dark:text-text-dark-light transition-colors">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted dark:text-text-dark-muted transition-colors">
                    {t('guardian.detail.noReviews')}
                  </p>
                )}
              </CardContent>
            </Card>
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

