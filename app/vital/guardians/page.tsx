'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { VitalNavbar } from '@/components/VitalNavbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/i18n';
import { Search, Star, MapPin, Shield, Heart, X, ArrowLeft, SlidersHorizontal, Calendar, Clock, Navigation } from 'lucide-react';
import { AIBadge } from '@/components/AIBadge';
import { StarRating } from '@/components/StarRating';
import { LeafletMap } from '@/components/LeafletMap';
import { featureFlags } from '@/lib/feature-flags';
import { calculateDistance, formatDistance } from '@/lib/utils';
import { useVitalLocation } from '@/hooks/useVitalLocation';

interface Guardian {
  _id: string;
  name: string;
  age: number;
  gender: string;
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
  profilePhoto?: string;
  isVerified: boolean;
  verificationBadges?: {
    idVerified: boolean;
    certificationUploaded: boolean;
    highlyRated: boolean;
    repeatBookings: boolean;
  };
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
  responseSpeed?: number | null;
  repeatBookings?: number;
  reliability?: number;
  distance?: number | null;
  pricing?: {
    hourly?: number;
    daily?: number;
    monthly?: number;
    priceBreakdown?: string;
  };
  aiMatch?: {
    score: number;
    explanation: string;
    reasons: string[];
    isRecommended: boolean;
  };
}

function GuardiansPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [savedGuardians, setSavedGuardians] = useState<Guardian[]>([]);
  const [savedGuardianIds, setSavedGuardianIds] = useState<Set<string>>(new Set());
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mapBounds, setMapBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);
  
  // Use shared location hook
  const { vitalLocation, mapRadius, setMapRadius, requestCurrentLocation } = useVitalLocation();
  
  // Filter states
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [experienceRange, setExperienceRange] = useState<[number, number]>([0, 50]);
  const [distanceRange, setDistanceRange] = useState<[number, number]>([0, 100]);
  const [sortBy, setSortBy] = useState<string>('rating');
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>(searchParams.get('tab') === 'saved' ? 'saved' : 'all');

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role === 'VITAL') {
      fetchGuardians();
      fetchSavedGuardians();
      fetchBookings();
    }
  }, [session, status, router]);

  const fetchGuardians = async () => {
    try {
      const res = await fetch('/api/guardians');
      if (res.ok) {
        const data = await res.json();
        setGuardians(data || []);
        console.log('[Browse Guardians] Fetched guardians:', data?.length || 0);
      } else {
        console.error('Failed to fetch guardians:', res.statusText);
        setGuardians([]);
      }
    } catch (error) {
      console.error('Failed to fetch guardians:', error);
      setGuardians([]);
    } finally {
      setLoading(false);
    }
  };


  const fetchSavedGuardians = async () => {
    try {
      const res = await fetch('/api/vital/saved-guardians');
      if (res.ok) {
        const data = await res.json();
        setSavedGuardians(data);
        setSavedGuardianIds(new Set(data.map((g: Guardian) => g._id)));
      }
    } catch (error) {
      console.error('Failed to fetch saved guardians:', error);
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

  // Helper to check if guardian is a past guardian (completed bookings)
  const isPastGuardian = (guardianId: string) => {
    return bookings.some(b => 
      b.status === 'COMPLETED' && 
      ((b.guardianId as any)?._id === guardianId || b.guardianId?.name === guardianId)
    );
  };

  const toggleSaveGuardian = async (guardianId: string) => {
    const isSaved = savedGuardianIds.has(guardianId);
    
    try {
      if (isSaved) {
        await fetch(`/api/vital/saved-guardians?guardianId=${guardianId}`, {
          method: 'DELETE',
        });
        setSavedGuardianIds(prev => {
          const next = new Set(prev);
          next.delete(guardianId);
          return next;
        });
        setSavedGuardians(prev => prev.filter(g => g._id !== guardianId));
      } else {
        await fetch('/api/vital/saved-guardians', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guardianId }),
        });
        const guardian = guardians.find(g => g._id === guardianId);
        if (guardian) {
          setSavedGuardianIds(prev => new Set(prev).add(guardianId));
          setSavedGuardians(prev => [...prev, guardian]);
        }
      }
    } catch (error) {
      console.error('Failed to toggle save:', error);
    }
  };

  // Get all unique specializations
  const allSpecializations = useMemo(() => {
    const specs = new Set<string>();
    guardians.forEach(g => g.specialization.forEach(s => specs.add(s)));
    return Array.from(specs).sort();
  }, [guardians]);

  // Get this week's availability for a guardian
  const getThisWeekAvailability = (guardian: Guardian): 'high' | 'medium' | 'low' => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Check next 7 days
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

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      selectedSpecializations.length > 0 ||
      selectedDays.length > 0 ||
      selectedGender !== '' ||
      experienceRange[0] > 0 ||
      experienceRange[1] < 50 ||
      distanceRange[0] > 0 ||
      distanceRange[1] < 100 ||
      debouncedSearchTerm !== ''
    );
  }, [selectedSpecializations, selectedDays, selectedGender, experienceRange, distanceRange, debouncedSearchTerm]);

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedSpecializations([]);
    setSelectedDays([]);
    setSelectedGender('');
    setExperienceRange([0, 50]);
    setDistanceRange([0, 100]);
    setSearchTerm('');
  };

  // Filter and sort guardians
  const filteredAndSortedGuardians = useMemo(() => {
    let filtered = activeTab === 'saved' ? savedGuardians : guardians;

    // Search filter (using debounced term)
    if (debouncedSearchTerm) {
      filtered = filtered.filter(
        (guardian) =>
          guardian.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          guardian.specialization.some((spec) =>
            spec.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
          )
      );
    }

    // Specialization filter
    if (selectedSpecializations.length > 0) {
      filtered = filtered.filter((guardian) =>
        selectedSpecializations.some((spec) =>
          guardian.specialization.includes(spec)
        )
      );
    }

    // Availability days filter
    if (selectedDays.length > 0) {
      filtered = filtered.filter((guardian) =>
        selectedDays.some((day) => guardian.availability.days.includes(day))
      );
    }

    // Gender filter
    if (selectedGender) {
      filtered = filtered.filter((guardian) => guardian.gender === selectedGender);
    }

    // Experience range filter
    filtered = filtered.filter(
      (guardian) =>
        guardian.experience >= experienceRange[0] &&
        guardian.experience <= experienceRange[1]
    );

    // Calculate distance for each guardian and filter by distance
    const guardiansWithDistance = filtered.map((guardian) => {
      let distance: number | null = null;
      if (vitalLocation && guardian.location?.coordinates) {
        distance = calculateDistance(
          vitalLocation.lat,
          vitalLocation.lng,
          guardian.location.coordinates.lat,
          guardian.location.coordinates.lng
        );
      }
      return { ...guardian, distance };
    });

    // Filter by distance range - Always show all guardians when browsing
    // Only apply distance filter if user explicitly wants to filter by map radius
    // By default, show ALL guardians regardless of location
    let distanceFiltered = guardiansWithDistance;
    
    // Don't filter by distance by default - show all guardians when browsing
    // Distance filtering should only happen if explicitly requested via UI
    // For now, we'll show all guardians to ensure cards are always visible

    // Filter by map bounds if available AND user is actively using map
    // Only apply map bounds filter if it's explicitly set and user is interacting with map
    // For now, we'll make this optional - comment out to show all guardians regardless of map bounds
    // if (mapBounds) {
    //   distanceFiltered = distanceFiltered.filter((guardian) => {
    //     if (!guardian.location?.coordinates) return true; // Include guardians without coordinates
    //     const { lat, lng } = guardian.location.coordinates;
    //     return (
    //       lat >= mapBounds.south &&
    //       lat <= mapBounds.north &&
    //       lng >= mapBounds.west &&
    //       lng <= mapBounds.east
    //     );
    //   });
    // }

    // Sorting
    const sorted = [...distanceFiltered].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        case 'experience':
          return b.experience - a.experience;
        case 'distance':
          if (a.distance === null && b.distance === null) return 0;
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        case 'ai-recommended':
          // AI-recommended first, then by score
          if (a.aiMatch?.isRecommended && !b.aiMatch?.isRecommended) return -1;
          if (!a.aiMatch?.isRecommended && b.aiMatch?.isRecommended) return 1;
          return (b.aiMatch?.score || 0) - (a.aiMatch?.score || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return sorted;
  }, [
    guardians,
    savedGuardians,
    activeTab,
    searchTerm,
    selectedSpecializations,
    selectedDays,
    selectedGender,
    experienceRange,
    distanceRange,
    sortBy,
    vitalLocation,
    debouncedSearchTerm,
    mapRadius,
    mapBounds,
  ]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark transition-colors">
        <VitalNavbar />
        <div className="container mx-auto px-4 py-8">
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

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

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-4 text-2xl font-bold text-text sm:text-3xl dark:text-text-dark transition-colors">
            {activeTab === 'saved' ? 'Saved Guardians' : t('vital.browse')}
          </h1>
          
          {/* Tabs */}
          <div className="mb-4 flex gap-2 border-b border-border dark:border-border-dark">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'all'
                  ? 'border-primary text-primary dark:border-primary-dark-mode dark:text-primary-dark-mode'
                  : 'border-transparent text-text-muted dark:text-text-dark-muted hover:text-text dark:hover:text-text-dark'
              }`}
            >
              All Guardians ({guardians.length})
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'saved'
                  ? 'border-primary text-primary dark:border-primary-dark-mode dark:text-primary-dark-mode'
                  : 'border-transparent text-text-muted dark:text-text-dark-muted hover:text-text dark:hover:text-text-dark'
              }`}
            >
              Saved ({savedGuardianIds.size})
            </button>
          </div>

          {/* Search and Filter Toggle */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted sm:h-5 sm:w-5" />
              <Input
                placeholder="Search by name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-sm sm:pl-10 sm:text-base"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="default" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {[
                    selectedSpecializations.length,
                    selectedDays.length,
                    selectedGender ? 1 : 0,
                    experienceRange[0] > 0 || experienceRange[1] < 50 ? 1 : 0,
                    distanceRange[0] > 0 || distanceRange[1] < 100 ? 1 : 0,
                  ].reduce((a, b) => a + b, 0)}
                </Badge>
              )}
            </Button>
          </div>

          {/* Applied Filter Chips */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-text-muted dark:text-text-dark-muted">Active filters:</span>
              {selectedSpecializations.map((spec) => (
                <Badge
                  key={spec}
                  variant="outline"
                  className="flex items-center gap-1 cursor-pointer hover:bg-background-secondary dark:hover:bg-background-dark-secondary"
                  onClick={() => setSelectedSpecializations(selectedSpecializations.filter(s => s !== spec))}
                >
                  {spec}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
              {selectedDays.map((day) => (
                <Badge
                  key={day}
                  variant="outline"
                  className="flex items-center gap-1 cursor-pointer hover:bg-background-secondary dark:hover:bg-background-dark-secondary"
                  onClick={() => setSelectedDays(selectedDays.filter(d => d !== day))}
                >
                  {day}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
              {selectedGender && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 cursor-pointer hover:bg-background-secondary dark:hover:bg-background-dark-secondary"
                  onClick={() => setSelectedGender('')}
                >
                  {selectedGender}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {(experienceRange[0] > 0 || experienceRange[1] < 50) && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 cursor-pointer hover:bg-background-secondary dark:hover:bg-background-dark-secondary"
                  onClick={() => setExperienceRange([0, 50])}
                >
                  Experience: {experienceRange[0]}-{experienceRange[1]} years
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {(distanceRange[0] > 0 || distanceRange[1] < 100) && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 cursor-pointer hover:bg-background-secondary dark:hover:bg-background-dark-secondary"
                  onClick={() => setDistanceRange([0, 100])}
                >
                  Radius: {distanceRange[0]}-{distanceRange[1]} km
                  <X className="h-3 w-3" />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-6 text-xs"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Filters Panel - Mobile Bottom Sheet */}
        {showFilters && isMobile && (
          <div className="fixed inset-0 z-50 flex items-end">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
            <Card className="relative z-10 w-full max-h-[85vh] overflow-y-auto rounded-t-xl border-b-0 animate-in slide-in-from-bottom duration-300">
              <CardContent className="p-4 sm:p-6">
                <div className="mb-4 flex items-center justify-between border-b border-border dark:border-border-dark pb-4">
                  <h3 className="text-lg font-semibold text-text dark:text-text-dark">Filters</h3>
                  <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-xs"
                      >
                        Clear All
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(false)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-6 pb-4">
                  {/* Mobile Filter Content - same as desktop but stacked */}
                  {/* Specialization Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-text dark:text-text-dark">Specialization</Label>
                    <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border border-border dark:border-border-dark p-3 bg-background-secondary dark:bg-background-dark-secondary">
                      {allSpecializations.map((spec) => (
                        <label key={spec} className="flex items-center gap-2 cursor-pointer hover:bg-background dark:hover:bg-background-dark p-1 rounded">
                          <input
                            type="checkbox"
                            checked={selectedSpecializations.includes(spec)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSpecializations([...selectedSpecializations, spec]);
                              } else {
                                setSelectedSpecializations(selectedSpecializations.filter(s => s !== spec));
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-border-dark dark:focus:ring-primary-dark-mode"
                          />
                          <span className="text-sm text-text dark:text-text-dark">{spec}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Availability Days Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-text dark:text-text-dark">Available Days</Label>
                    <div className="space-y-2 rounded-md border border-border dark:border-border-dark p-3 bg-background-secondary dark:bg-background-dark-secondary">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                        <label key={day} className="flex items-center gap-2 cursor-pointer hover:bg-background dark:hover:bg-background-dark p-1 rounded">
                          <input
                            type="checkbox"
                            checked={selectedDays.includes(day)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDays([...selectedDays, day]);
                              } else {
                                setSelectedDays(selectedDays.filter(d => d !== day));
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-border-dark dark:focus:ring-primary-dark-mode"
                          />
                          <span className="text-sm text-text dark:text-text-dark">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Gender Filter */}
                  <div className="space-y-3">
                    <Label htmlFor="gender-mobile" className="text-sm font-semibold text-text dark:text-text-dark">Gender</Label>
                    <Select
                      id="gender-mobile"
                      value={selectedGender}
                      onChange={(e) => setSelectedGender(e.target.value)}
                    >
                      <option value="">All Genders</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </Select>
                  </div>

                  {/* Experience Range */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-text dark:text-text-dark">
                      Experience: {experienceRange[0]} - {experienceRange[1]} years
                    </Label>
                    <div className="space-y-3 rounded-md border border-border dark:border-border-dark p-4 bg-background-secondary dark:bg-background-dark-secondary">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="50"
                          value={experienceRange[0]}
                          onChange={(e) => setExperienceRange([Number(e.target.value), experienceRange[1]])}
                          className="w-20"
                        />
                        <span className="text-sm text-text-muted dark:text-text-dark-muted">to</span>
                        <Input
                          type="number"
                          min="0"
                          max="50"
                          value={experienceRange[1]}
                          onChange={(e) => setExperienceRange([experienceRange[0], Number(e.target.value)])}
                          className="w-20"
                        />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={experienceRange[0]}
                        onChange={(e) => setExperienceRange([Number(e.target.value), experienceRange[1]])}
                        className="w-full accent-primary dark:accent-primary-dark-mode"
                      />
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={experienceRange[1]}
                        onChange={(e) => setExperienceRange([experienceRange[0], Number(e.target.value)])}
                        className="w-full accent-primary dark:accent-primary-dark-mode"
                      />
                    </div>
                  </div>

                  {/* Distance Range */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-text dark:text-text-dark">
                      Service Radius: {distanceRange[0]} - {distanceRange[1]} km
                    </Label>
                    <div className="space-y-3 rounded-md border border-border dark:border-border-dark p-4 bg-background-secondary dark:bg-background-dark-secondary">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={distanceRange[0]}
                          onChange={(e) => setDistanceRange([Number(e.target.value), distanceRange[1]])}
                          className="w-20"
                        />
                        <span className="text-sm text-text-muted dark:text-text-dark-muted">to</span>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={distanceRange[1]}
                          onChange={(e) => setDistanceRange([distanceRange[0], Number(e.target.value)])}
                          className="w-20"
                        />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={distanceRange[0]}
                        onChange={(e) => setDistanceRange([Number(e.target.value), distanceRange[1]])}
                        className="w-full accent-primary dark:accent-primary-dark-mode"
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={distanceRange[1]}
                        onChange={(e) => setDistanceRange([distanceRange[0], Number(e.target.value)])}
                        className="w-full accent-primary dark:accent-primary-dark-mode"
                      />
                    </div>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-3">
                    <Label htmlFor="sort-mobile" className="text-sm font-semibold text-text dark:text-text-dark">Sort By</Label>
                    <Select
                      id="sort-mobile"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="rating">Highest Rating</option>
                      {featureFlags.AI_MATCHING && (
                        <option value="ai-recommended">AI-Recommended</option>
                      )}
                      <option value="distance">Nearest First</option>
                      <option value="experience">Most Experience</option>
                      <option value="name">Name (A-Z)</option>
                    </Select>
                  </div>
                </div>
                <div className="sticky bottom-0 border-t border-border dark:border-border-dark bg-background dark:bg-background-dark pt-4 mt-4">
                  <Button
                    className="w-full"
                    onClick={() => setShowFilters(false)}
                  >
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters Panel - Desktop Side Panel */}
        {showFilters && !isMobile && (
          <Card className="mb-6 animate-in slide-in-from-top-2 duration-300 border-primary/20">
            <CardContent className="p-4 sm:p-6">
              <div className="mb-6 flex items-center justify-between border-b border-border dark:border-border-dark pb-4">
                <h3 className="text-lg font-semibold text-text dark:text-text-dark transition-colors">
                  Filter Guardians
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  disabled={!hasActiveFilters}
                >
                  Clear All
                </Button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Specialization Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-text dark:text-text-dark">Specialization</Label>
                  <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border border-border dark:border-border-dark p-3 bg-background-secondary dark:bg-background-dark-secondary">
                    {allSpecializations.map((spec) => (
                      <label key={spec} className="flex items-center gap-2 cursor-pointer hover:bg-background dark:hover:bg-background-dark p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedSpecializations.includes(spec)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSpecializations([...selectedSpecializations, spec]);
                            } else {
                              setSelectedSpecializations(selectedSpecializations.filter(s => s !== spec));
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-border-dark dark:focus:ring-primary-dark-mode"
                        />
                        <span className="text-sm text-text dark:text-text-dark transition-colors">{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Availability Days Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-text dark:text-text-dark">Available Days</Label>
                  <div className="space-y-2 rounded-md border border-border dark:border-border-dark p-3 bg-background-secondary dark:bg-background-dark-secondary">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <label key={day} className="flex items-center gap-2 cursor-pointer hover:bg-background dark:hover:bg-background-dark p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedDays.includes(day)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDays([...selectedDays, day]);
                            } else {
                              setSelectedDays(selectedDays.filter(d => d !== day));
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-border-dark dark:focus:ring-primary-dark-mode"
                        />
                        <span className="text-sm text-text dark:text-text-dark transition-colors">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Gender Filter */}
                <div className="space-y-3">
                  <Label htmlFor="gender" className="text-sm font-semibold text-text dark:text-text-dark">Gender</Label>
                  <Select
                    id="gender"
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value)}
                  >
                    <option value="">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </Select>
                </div>

                {/* Experience Range */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-text dark:text-text-dark">
                    Experience: {experienceRange[0]} - {experienceRange[1]} years
                  </Label>
                  <div className="space-y-3 rounded-md border border-border dark:border-border-dark p-4 bg-background-secondary dark:bg-background-dark-secondary">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        value={experienceRange[0]}
                        onChange={(e) => setExperienceRange([Number(e.target.value), experienceRange[1]])}
                        className="w-20"
                      />
                      <span className="text-sm text-text-muted dark:text-text-dark-muted">to</span>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        value={experienceRange[1]}
                        onChange={(e) => setExperienceRange([experienceRange[0], Number(e.target.value)])}
                        className="w-20"
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={experienceRange[0]}
                      onChange={(e) => setExperienceRange([Number(e.target.value), experienceRange[1]])}
                      className="w-full accent-primary dark:accent-primary-dark-mode"
                    />
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={experienceRange[1]}
                      onChange={(e) => setExperienceRange([experienceRange[0], Number(e.target.value)])}
                      className="w-full accent-primary dark:accent-primary-dark-mode"
                    />
                  </div>
                </div>

                {/* Distance Range */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-text dark:text-text-dark">
                    Service Radius: {distanceRange[0]} - {distanceRange[1]} km
                  </Label>
                  <div className="space-y-3 rounded-md border border-border dark:border-border-dark p-4 bg-background-secondary dark:bg-background-dark-secondary">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={distanceRange[0]}
                        onChange={(e) => setDistanceRange([Number(e.target.value), distanceRange[1]])}
                        className="w-20"
                      />
                      <span className="text-sm text-text-muted dark:text-text-dark-muted">to</span>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={distanceRange[1]}
                        onChange={(e) => setDistanceRange([distanceRange[0], Number(e.target.value)])}
                        className="w-20"
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={distanceRange[0]}
                      onChange={(e) => setDistanceRange([Number(e.target.value), distanceRange[1]])}
                      className="w-full accent-primary dark:accent-primary-dark-mode"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={distanceRange[1]}
                      onChange={(e) => setDistanceRange([distanceRange[0], Number(e.target.value)])}
                      className="w-full accent-primary dark:accent-primary-dark-mode"
                    />
                  </div>
                </div>

                {/* Sort By */}
                <div className="space-y-3">
                  <Label htmlFor="sort" className="text-sm font-semibold text-text dark:text-text-dark">Sort By</Label>
                  <Select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort guardians"
                  >
                    <option value="rating">Highest Rating</option>
                    {featureFlags.AI_MATCHING && (
                      <option value="ai-recommended">AI-Recommended</option>
                    )}
                    <option value="distance">Nearest First</option>
                    <option value="experience">Most Experience</option>
                    <option value="name">Name (A-Z)</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Count */}
        <div className="mb-4 text-sm text-text-muted dark:text-text-dark-muted transition-colors">
          Showing {filteredAndSortedGuardians.length} of {activeTab === 'saved' ? savedGuardians.length : guardians.length} {activeTab === 'saved' ? 'saved' : ''} guardians
        </div>

        {/* Map View */}
        {featureFlags.MAP_VIEW && (
          <LeafletMap
            guardians={filteredAndSortedGuardians}
            vitalLocation={vitalLocation}
            radius={mapRadius}
            onRadiusChange={setMapRadius}
            onMapBoundsChange={setMapBounds}
            onLocationRequest={requestCurrentLocation}
            onGuardianClick={(guardian) => {
              router.push(`/vital/guardians/${guardian._id}`);
            }}
          />
        )}

        {/* Guardian Cards - Always visible when browsing */}
        {!loading && (filteredAndSortedGuardians.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedGuardians.map((guardian) => {
              const availabilityStatus = getThisWeekAvailability(guardian);
              const isSaved = savedGuardianIds.has(guardian._id);
              const hasPastBooking = isPastGuardian(guardian._id);
              
              return (
                <Card key={guardian._id} className="group relative overflow-hidden border-2 border-border/50 dark:border-border-dark/50 hover:border-primary/30 dark:hover:border-primary-dark-mode/30 hover:shadow-lg dark:hover:shadow-dark-lg transition-all duration-300 bg-background dark:bg-background-dark">
                  <CardContent className="p-0">
                    <div className="relative">
                      {/* This Week Availability Strip */}
                      <div className={`h-1.5 w-full ${
                        availabilityStatus === 'high' ? 'bg-success' :
                        availabilityStatus === 'medium' ? 'bg-warning' :
                        'bg-error'
                      }`} />
                      
                      {/* Profile Photo with Gradient Overlay */}
                      <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-primary/20 via-sage/10 to-secondary/5 dark:from-primary-dark-mode/20 dark:via-sage-dark-mode/10 dark:to-secondary-dark-mode/5">
                        {guardian.profilePhoto ? (
                          <img
                            src={guardian.profilePhoto}
                            alt={guardian.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <span className="text-5xl font-bold text-primary dark:text-primary-dark-mode transition-colors">
                              {guardian.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent dark:from-background-dark/80" />
                        
                        {/* Top Right Badges */}
                        <div className="absolute right-3 top-3 flex flex-col gap-2 items-end z-10">
                          {guardian.aiMatch?.isRecommended && (
                            <AIBadge
                              explanation={guardian.aiMatch.explanation}
                              reasons={guardian.aiMatch.reasons}
                              score={guardian.aiMatch.score}
                            />
                          )}
                          {guardian.isVerified && (
                            <Badge
                              variant="success"
                              className="flex items-center gap-1.5 px-2.5 py-1 shadow-md backdrop-blur-sm bg-success/90 text-white border-0"
                            >
                              <Shield className="h-3.5 w-3.5" />
                              <span className="text-xs font-semibold">Verified</span>
                            </Badge>
                          )}
                        </div>
                        
                        {/* Save Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-3 top-3 z-10 h-9 w-9 rounded-full bg-background/95 dark:bg-background-dark/95 hover:bg-background dark:hover:bg-background-dark shadow-lg backdrop-blur-sm border border-border/50 dark:border-border-dark/50 transition-all hover:scale-110"
                          onClick={() => toggleSaveGuardian(guardian._id)}
                          aria-label={isSaved ? 'Remove from saved' : 'Save guardian'}
                        >
                          <Heart
                            className={`h-4 w-4 transition-all ${
                              isSaved
                                ? 'fill-secondary text-secondary dark:fill-secondary-dark-mode dark:text-secondary-dark-mode scale-110'
                                : 'text-text-muted dark:text-text-dark-muted'
                            }`}
                          />
                        </Button>
                      </div>
                    </div>
                      
                    {/* Card Content - Simplified for Discovery View */}
                    <div className="p-4 sm:p-5">
                      {/* Name and Rating Row */}
                      <div className="mb-2.5 flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="mb-1 text-lg font-bold text-text dark:text-text-dark sm:text-xl transition-colors line-clamp-1">
                            {guardian.name}
                          </h3>
                          {guardian.averageRating ? (
                            <div className="flex items-center gap-1.5">
                              <StarRating
                                rating={guardian.averageRating}
                                readonly
                                size="sm"
                              />
                              <span className="text-sm font-semibold text-text dark:text-text-dark transition-colors">
                                {guardian.averageRating.toFixed(1)}
                              </span>
                              <span className="text-xs text-text-muted dark:text-text-dark-muted transition-colors">
                                ({guardian.reviewCount || 0})
                              </span>
                            </div>
                          ) : (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {t('guardians.new')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Top 2-3 Care Tags Only */}
                      {featureFlags.ADVANCED_GUARDIAN_PROFILE && guardian.careTags && guardian.careTags.length > 0 && (
                        <div className="mb-2.5 flex flex-wrap gap-1.5">
                          {guardian.careTags.slice(0, 3).map((tag, idx) => (
                            <Badge 
                              key={idx} 
                              variant="default" 
                              className="text-xs font-medium bg-primary/15 text-primary border border-primary/30 dark:bg-primary-dark-mode/15 dark:text-primary-dark-mode dark:border-primary-dark-mode/30 px-2 py-0.5"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {guardian.careTags.length > 3 && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5">
                              +{guardian.careTags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {/* Essential Info - Compact */}
                      <div className="mb-2.5 space-y-1.5">
                        {/* Starting Price */}
                        {featureFlags.PRICING_SYSTEM && guardian.pricing && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-secondary dark:text-secondary-dark-mode transition-colors">
                              {guardian.pricing.hourly ? (
                                <>From ₹{guardian.pricing.hourly}/hr</>
                              ) : guardian.pricing.daily ? (
                                <>From ₹{guardian.pricing.daily}/day</>
                              ) : guardian.pricing.monthly ? (
                                <>From ₹{guardian.pricing.monthly}/month</>
                              ) : (
                                <span className="text-xs text-text-muted dark:text-text-dark-muted">
                                  {t('form.pricing.availableOnRequest')}
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                        
                        {/* Distance */}
                        {guardian.distance !== null && vitalLocation && (
                          <div className="flex items-center gap-1.5 text-xs text-text-muted dark:text-text-dark-muted">
                            <MapPin className="h-3 w-3" />
                            <span>{formatDistance(guardian.distance)} {t('guardians.away')}</span>
                          </div>
                        )}
                        
                        {/* Trusted by X families */}
                        {guardian.reviewCount !== undefined && guardian.reviewCount > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-text-muted dark:text-text-dark-muted">
                            <span>Trusted by {guardian.reviewCount} {guardian.reviewCount === 1 ? 'family' : 'families'}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Primary CTA: Book Service */}
                      <div className="flex flex-col gap-2">
                        <Link href={`/vital/guardians/${guardian._id}`} className="block">
                          <Button className="w-full font-semibold shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 group-hover:bg-primary group-hover:text-white" size="sm">
                            {t('vital.book')}
                          </Button>
                        </Link>
                        {hasPastBooking && (
                          <Link href={`/vital/guardians/${guardian._id}`}>
                            <Button variant="outline" size="sm" className="w-full whitespace-nowrap text-xs sm:text-sm">
                              Book Again
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <Card className="border-2 border-dashed border-primary/30 bg-primary/5 dark:bg-primary-dark-mode/10">
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-6 text-center">
              {activeTab === 'saved' ? (
                <>
                  <div className="mb-6 rounded-full bg-primary/10 p-6 dark:bg-primary-dark-mode/20">
                    <Heart className="h-12 w-12 text-primary dark:text-primary-dark-mode" />
                  </div>
                  <h2 className="text-xl font-semibold text-text dark:text-text-dark mb-3 sm:text-2xl transition-colors">
                    No saved guardians yet
                  </h2>
                  <p className="text-base text-text-muted dark:text-text-dark-muted mb-6 max-w-md transition-colors">
                    Start browsing guardians and save your favorites by clicking the heart icon on their cards. Your saved guardians will appear here for easy access.
                  </p>
                  <Link href="/vital/guardians">
                    <Button size="lg" onClick={() => setActiveTab('all')}>
                      Browse Guardians
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <div className="mb-6 rounded-full bg-primary/10 p-6 dark:bg-primary-dark-mode/20">
                    <Search className="h-12 w-12 text-primary dark:text-primary-dark-mode" />
                  </div>
                  <h2 className="text-xl font-semibold text-text dark:text-text-dark mb-3 sm:text-2xl transition-colors">
                    No guardians found
                  </h2>
                  <p className="text-base text-text-muted dark:text-text-dark-muted mb-6 max-w-md transition-colors">
                    {hasActiveFilters 
                      ? 'No guardians match your current filters. Try adjusting your search criteria or clear filters to see all available guardians.'
                      : 'No guardians are available at the moment. Please check back later.'}
                  </p>
                  {hasActiveFilters && (
                    <Button size="lg" onClick={clearAllFilters}>
                      Clear All Filters
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function GuardiansPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background dark:bg-background-dark transition-colors">
        <VitalNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-text dark:text-text-dark transition-colors">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <GuardiansPageContent />
    </Suspense>
  );
}
