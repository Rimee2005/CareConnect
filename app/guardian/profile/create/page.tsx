'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { useTranslation } from '@/lib/i18n';
import { featureFlags } from '@/lib/feature-flags';
import { Upload, X, Plus, CheckCircle2, Calendar, Globe, Clock, Check, Loader2 } from 'lucide-react';

// Care type tags options
const CARE_TAGS = [
  'Elderly Care',
  'Post-Surgery Care',
  'Bedridden Care',
  'Dementia Support',
  'Medication Assistance',
  'Mobility Support',
  'Chronic Disease Care',
  'Palliative Care',
  'Rehabilitation Support',
  'Home Nursing',
];

// Language options
const LANGUAGES = [
  'Hindi',
  'English',
  'Bengali',
  'Telugu',
  'Marathi',
  'Tamil',
  'Gujarati',
  'Kannada',
  'Malayalam',
  'Punjabi',
  'Urdu',
  'Odia',
  'Assamese',
  'Other',
];

const guardianProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().min(18).max(100),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']),
  experience: z.number().min(0),
  introduction: z.string().max(300, 'Introduction must be less than 300 characters').optional(),
  careTags: z.array(z.string()).optional(),
  experienceBreakdown: z.array(z.object({
    years: z.number().min(0),
    type: z.string().min(1, 'Type is required'),
  })).optional(),
  specialization: z.string().min(1, 'At least one specialization is required'),
  serviceRadius: z.number().min(1),
  availabilityDays: z.string().min(1, 'Select at least one day'),
  availabilityStart: z.string().min(1, 'Start time is required'),
  availabilityEnd: z.string().min(1, 'End time is required'),
  shiftType: z.enum(['Morning', 'Night', '24×7']).optional(),
  languages: z.array(z.string()).optional(),
  city: z.string().min(1, 'City is required'),
  pricingHourly: z.number().min(0).optional(),
  pricingDaily: z.number().min(0).optional(),
  pricingMonthly: z.number().min(0).optional(),
  pricingBreakdown: z.string().max(500, 'Price breakdown must be less than 500 characters').optional(),
});

type GuardianProfileForm = z.infer<typeof guardianProfileSchema>;

interface GuardianProfile {
  _id: string;
  name: string;
  age: number;
  gender: string;
  experience: number;
  introduction?: string;
  careTags?: string[];
  experienceBreakdown?: Array<{ years: number; type: string }>;
  specialization: string[];
  serviceRadius: number;
  availability: {
    days: string[];
    hours: {
      start: string;
      end: string;
    };
    shiftType?: 'Morning' | 'Night' | '24×7';
  };
  languages?: string[];
  location: {
    city: string;
  };
  certifications?: string[];
  profilePhoto?: string;
  pricing?: {
    hourly?: number;
    daily?: number;
    monthly?: number;
    priceBreakdown?: string;
  };
}

export default function CreateGuardianProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [certFiles, setCertFiles] = useState<File[]>([]);
  const [certPreviews, setCertPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<GuardianProfile | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [selectedCareTags, setSelectedCareTags] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<GuardianProfileForm>({
    resolver: zodResolver(guardianProfileSchema),
    defaultValues: {
      experienceBreakdown: [],
      careTags: [],
      languages: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experienceBreakdown',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.role === 'GUARDIAN') {
      fetchProfile();
    }
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/guardian/profile');
      
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setIsCreateMode(false);
        
        // Populate form with existing data
        reset({
          name: data.name,
          age: data.age,
          gender: data.gender,
          experience: data.experience,
          introduction: data.introduction || '',
          specialization: data.specialization?.join(', ') || '',
          serviceRadius: data.serviceRadius,
          availabilityDays: data.availability?.days?.join(', ') || '',
          availabilityStart: data.availability?.hours?.start || '',
          availabilityEnd: data.availability?.hours?.end || '',
          shiftType: data.availability?.shiftType,
          city: data.location?.city || '',
          pricingHourly: data.pricing?.hourly,
          pricingDaily: data.pricing?.daily,
          pricingMonthly: data.pricing?.monthly,
          pricingBreakdown: data.pricing?.priceBreakdown || '',
          experienceBreakdown: data.experienceBreakdown || [],
          careTags: data.careTags || [],
          languages: data.languages || [],
        });
        
        // Set selected tags and languages
        setSelectedCareTags(data.careTags || []);
        setSelectedLanguages(data.languages || []);
        
        // Set photo preview if profilePhoto exists
        if (data.profilePhoto && data.profilePhoto.trim() !== '') {
          setPhotoPreview(data.profilePhoto);
        } else {
          setPhotoPreview('');
        }
        
        // Set certification previews
        if (data.certifications && data.certifications.length > 0) {
          setCertPreviews(data.certifications);
        }
      } else if (res.status === 404) {
        // Profile doesn't exist - show create mode
        setProfile(null);
        setIsCreateMode(true);
        reset({
          experienceBreakdown: [],
          careTags: [],
          languages: [],
        });
        setPhotoPreview('');
        setPhotoFile(null);
        setSelectedCareTags([]);
        setSelectedLanguages([]);
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Failed to load profile' }));
        setError(errorData.error || 'Failed to load profile');
        setIsCreateMode(true);
        setPhotoPreview('');
        setPhotoFile(null);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError('Failed to load profile. You can still create your profile below.');
      setIsCreateMode(true);
      reset({
        experienceBreakdown: [],
        careTags: [],
        languages: [],
      });
      setPhotoPreview('');
      setPhotoFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCertChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setCertFiles([...certFiles, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCertPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const toggleCareTag = (tag: string) => {
    setSelectedCareTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const onSubmit = async (data: GuardianProfileForm) => {
    if (!session) {
      router.push('/auth/login');
      return;
    }

    setSaving(true);
    setError('');

    try {
      let profilePhoto = '';
      const certifications: string[] = [];

      // Upload profile photo
      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          profilePhoto = uploadData.url;
        }
      } else if (!isCreateMode && profile?.profilePhoto) {
        // In edit mode, preserve existing photo if no new one is uploaded
        profilePhoto = profile.profilePhoto;
      }

      // Upload certifications
      for (const certFile of certFiles) {
        const formData = new FormData();
        formData.append('file', certFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          certifications.push(uploadData.url);
        }
      }
      
      // In edit mode, preserve existing certifications if no new ones are uploaded
      if (!isCreateMode && profile?.certifications && certFiles.length === 0) {
        certifications.push(...profile.certifications);
      }

      // Create profile
      const specialization = data.specialization.split(',').map((s) => s.trim());
      const availabilityDays = data.availabilityDays.split(',').map((d) => d.trim());

      const profileData: any = {
        name: data.name,
        age: data.age,
        gender: data.gender,
        experience: data.experience,
        specialization,
        serviceRadius: data.serviceRadius,
        availability: {
          days: availabilityDays,
          hours: {
            start: data.availabilityStart,
            end: data.availabilityEnd,
          },
        },
        location: {
          city: data.city,
        },
      };
      
      // Only include profilePhoto if we have one (new or existing)
      if (profilePhoto) {
        profileData.profilePhoto = profilePhoto;
      }
      
      // Only include certifications if we have any
      if (certifications.length > 0) {
        profileData.certifications = certifications;
      }

      // Add new fields if feature flag is enabled
      if (featureFlags.ADVANCED_GUARDIAN_PROFILE) {
        if (data.introduction) {
          profileData.introduction = data.introduction;
        }
        if (selectedCareTags.length > 0) {
          profileData.careTags = selectedCareTags;
        }
        if (data.experienceBreakdown && data.experienceBreakdown.length > 0) {
          profileData.experienceBreakdown = data.experienceBreakdown;
        }
        if (selectedLanguages.length > 0) {
          profileData.languages = selectedLanguages;
        }
        if (data.shiftType) {
          profileData.availability.shiftType = data.shiftType;
        }
      }

      // Add pricing if feature flag is enabled
      if (featureFlags.PRICING_SYSTEM) {
        const pricing: any = {};
        if (data.pricingHourly) pricing.hourly = data.pricingHourly;
        if (data.pricingDaily) pricing.daily = data.pricingDaily;
        if (data.pricingMonthly) pricing.monthly = data.pricingMonthly;
        if (data.pricingBreakdown) pricing.priceBreakdown = data.pricingBreakdown;
        if (Object.keys(pricing).length > 0) {
          profileData.pricing = pricing;
        }
      }

      const method = isCreateMode ? 'POST' : 'PUT';
      const res = await fetch('/api/guardian/profile', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      const result = await res.json();

      if (!res.ok) {
        // If profile already exists error, switch to edit mode and refetch
        if (res.status === 400 && result.error?.includes('already exists')) {
          setError('Profile already exists. Switching to edit mode...');
          setIsCreateMode(false);
          await fetchProfile();
          return;
        }
        setError(result.error || `Failed to ${isCreateMode ? 'create' : 'update'} profile`);
        return;
      }

      // Success - refresh profile data and show success message
      await fetchProfile();
      setError('');
      router.push('/guardian/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark transition-colors">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="mx-auto max-w-3xl">
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-primary-dark-mode" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark transition-colors">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <CardTitle className="text-text dark:text-text-dark transition-colors">
              {isCreateMode ? t('form.create') : 'Edit Profile'}
            </CardTitle>
            <CardDescription className="text-text-light dark:text-text-dark-light transition-colors">
              {isCreateMode 
                ? 'Tell us about your experience and availability to start receiving bookings'
                : 'Update your profile information'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg border border-error/30 bg-error/10 p-3">
                <p className="text-sm font-medium text-error dark:text-error transition-colors">
                  {error}
                </p>
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Photo */}
              <div className="space-y-2">
                <Label htmlFor="photo">{t('form.profilePhoto')}</Label>
                <div className="flex items-center gap-4">
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  )}
                  <label
                    htmlFor="photo"
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-text hover:bg-background-secondary dark:border-border-dark dark:text-text-dark dark:hover:bg-background-dark-secondary transition-colors"
                  >
                    <Upload className="h-4 w-4 text-text dark:text-text-dark transition-colors" />
                    <span>{t('form.upload')}</span>
                    <input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-2">
                <Label htmlFor="name">{t('form.name')} *</Label>
                <Input id="name" {...register('name')} />
                {errors.name && (
                  <p className="text-sm font-medium text-error dark:text-error transition-colors">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="age">{t('form.age')} *</Label>
                  <Input
                    id="age"
                    type="number"
                    {...register('age', { valueAsNumber: true })}
                  />
                  {errors.age && (
                    <p className="text-sm font-medium text-error dark:text-error transition-colors">
                      {errors.age.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">{t('form.gender')} *</Label>
                  <Select id="gender" {...register('gender')}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </Select>
                  {errors.gender && (
                    <p className="text-sm font-medium text-error dark:text-error transition-colors">
                      {errors.gender.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">{t('form.city')} *</Label>
                  <Input id="city" {...register('city')} />
                  {errors.city && (
                    <p className="text-sm font-medium text-error dark:text-error transition-colors">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">{t('form.experience.years')} *</Label>
                  <Input
                    id="experience"
                    type="number"
                    {...register('experience', { valueAsNumber: true })}
                  />
                  {errors.experience && (
                    <p className="text-sm font-medium text-error dark:text-error transition-colors">
                      {errors.experience.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Introduction (NEW) */}
              {featureFlags.ADVANCED_GUARDIAN_PROFILE && (
                <div className="space-y-2">
                  <Label htmlFor="introduction">{t('form.introduction')}</Label>
                  <Textarea
                    id="introduction"
                    {...register('introduction')}
                    placeholder={t('form.introduction.placeholder')}
                    rows={3}
                    maxLength={300}
                  />
                  <p className="text-xs text-text-muted dark:text-text-dark-muted transition-colors">
                    {t('form.introduction.help')}
                  </p>
                  {errors.introduction && (
                    <p className="text-sm font-medium text-error dark:text-error transition-colors">
                      {errors.introduction.message}
                    </p>
                  )}
                </div>
              )}

              {/* Care Tags (NEW) - Enhanced */}
              {featureFlags.ADVANCED_GUARDIAN_PROFILE && (
                <div className="space-y-3 rounded-lg border-2 border-border/50 dark:border-border-dark/50 bg-background-secondary/30 dark:bg-background-dark-secondary/30 p-4 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-dark-mode/10">
                      <CheckCircle2 className="h-4 w-4 text-primary dark:text-primary-dark-mode" />
                    </div>
                    <div>
                      <Label className="text-base font-semibold text-text dark:text-text-dark transition-colors">
                        {t('form.careTags')}
                      </Label>
                      <p className="text-xs text-text-muted dark:text-text-dark-muted transition-colors">
                        {t('form.careTags.help')}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {CARE_TAGS.map((tag) => {
                      const isSelected = selectedCareTags.includes(tag);
                      return (
                        <Badge
                          key={tag}
                          variant={isSelected ? 'default' : 'outline'}
                          className={`group relative cursor-pointer px-4 py-2 text-sm font-medium transition-all duration-200 ${
                            isSelected
                              ? 'bg-primary text-white shadow-md hover:shadow-lg hover:scale-105 dark:bg-primary-dark-mode'
                              : 'hover:bg-primary/10 hover:border-primary/50 dark:hover:bg-primary-dark-mode/10 dark:hover:border-primary-dark-mode/50'
                          }`}
                          onClick={() => toggleCareTag(tag)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              toggleCareTag(tag);
                            }
                          }}
                          aria-label={`${isSelected ? 'Remove' : 'Add'} ${tag}`}
                        >
                          {isSelected && (
                            <Check className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          {tag}
                        </Badge>
                      );
                    })}
                  </div>
                  {selectedCareTags.length > 0 && (
                    <p className="text-xs font-medium text-success dark:text-success transition-colors">
                      {selectedCareTags.length} {selectedCareTags.length === 1 ? 'tag' : 'tags'} selected
                    </p>
                  )}
                </div>
              )}

              {/* Experience Breakdown (NEW) - Enhanced */}
              {featureFlags.ADVANCED_GUARDIAN_PROFILE && (
                <div className="space-y-3 rounded-lg border-2 border-border/50 dark:border-border-dark/50 bg-background-secondary/30 dark:bg-background-dark-secondary/30 p-4 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-dark-mode/10">
                      <Calendar className="h-4 w-4 text-primary dark:text-primary-dark-mode" />
                    </div>
                    <div>
                      <Label className="text-base font-semibold text-text dark:text-text-dark transition-colors">
                        {t('form.experienceBreakdown')}
                      </Label>
                      <p className="text-xs text-text-muted dark:text-text-dark-muted transition-colors">
                        Break down your experience by type of care
                      </p>
                    </div>
                  </div>
                  
                  {fields.length > 0 && (
                    <div className="space-y-3">
                      {fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex items-center gap-2 rounded-lg border border-border/50 dark:border-border-dark/50 bg-background dark:bg-background-dark p-3 transition-colors"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              type="number"
                              placeholder={t('form.experienceBreakdown.years')}
                              {...register(`experienceBreakdown.${index}.years`, {
                                valueAsNumber: true,
                              })}
                              className="w-20 font-semibold"
                              min="0"
                            />
                            <span className="text-sm text-text-muted dark:text-text-dark-muted transition-colors">
                              {t('form.experienceBreakdown.years')}
                            </span>
                            <Input
                              placeholder={t('form.experienceBreakdown.type.placeholder')}
                              {...register(`experienceBreakdown.${index}.type`)}
                              className="flex-1"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            aria-label="Remove experience"
                            className="h-8 w-8 text-error hover:bg-error/10 hover:text-error dark:hover:bg-error/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ years: 0, type: '' })}
                    className="w-full border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 dark:border-primary-dark-mode/30 dark:hover:border-primary-dark-mode dark:hover:bg-primary-dark-mode/5 transition-all"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('form.experienceBreakdown.add')}
                  </Button>
                </div>
              )}

              {/* Specialization - Enhanced */}
              <div className="space-y-2 rounded-lg border-2 border-border/50 dark:border-border-dark/50 bg-background-secondary/30 dark:bg-background-dark-secondary/30 p-4 transition-colors">
                <Label htmlFor="specialization" className="text-base font-semibold text-text dark:text-text-dark transition-colors">
                  {t('form.specialization')} <span className="text-error">*</span>
                </Label>
                <Input
                  id="specialization"
                  {...register('specialization')}
                  placeholder="e.g., Elderly Care, Post-Surgery Care, Medication Management"
                  className="border-2 focus:border-primary dark:focus:border-primary-dark-mode transition-colors"
                />
                <p className="text-xs text-text-muted dark:text-text-dark-muted transition-colors">
                  Enter your areas of expertise, separated by commas
                </p>
                {errors.specialization && (
                  <p className="text-sm font-medium text-error dark:text-error transition-colors">
                    {errors.specialization.message}
                  </p>
                )}
              </div>

              {/* Languages (NEW) - Enhanced */}
              {featureFlags.ADVANCED_GUARDIAN_PROFILE && (
                <div className="space-y-3 rounded-lg border-2 border-border/50 dark:border-border-dark/50 bg-background-secondary/30 dark:bg-background-dark-secondary/30 p-4 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-dark-mode/10">
                      <Globe className="h-4 w-4 text-primary dark:text-primary-dark-mode" />
                    </div>
                    <div>
                      <Label className="text-base font-semibold text-text dark:text-text-dark transition-colors">
                        {t('form.languages')}
                      </Label>
                      <p className="text-xs text-text-muted dark:text-text-dark-muted transition-colors">
                        {t('form.languages.help')}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {LANGUAGES.map((lang) => {
                      const isSelected = selectedLanguages.includes(lang);
                      return (
                        <Badge
                          key={lang}
                          variant={isSelected ? 'default' : 'outline'}
                          className={`group relative cursor-pointer px-4 py-2 text-sm font-medium transition-all duration-200 ${
                            isSelected
                              ? 'bg-primary text-white shadow-md hover:shadow-lg hover:scale-105 dark:bg-primary-dark-mode'
                              : 'hover:bg-primary/10 hover:border-primary/50 dark:hover:bg-primary-dark-mode/10 dark:hover:border-primary-dark-mode/50'
                          }`}
                          onClick={() => toggleLanguage(lang)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              toggleLanguage(lang);
                            }
                          }}
                          aria-label={`${isSelected ? 'Remove' : 'Add'} ${lang}`}
                        >
                          {isSelected && (
                            <Check className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          {lang}
                        </Badge>
                      );
                    })}
                  </div>
                  {selectedLanguages.length > 0 && (
                    <p className="text-xs font-medium text-success dark:text-success transition-colors">
                      {selectedLanguages.length} {selectedLanguages.length === 1 ? 'language' : 'languages'} selected
                    </p>
                  )}
                </div>
              )}

              {/* Availability - Enhanced */}
              <div className="space-y-3 rounded-lg border-2 border-border/50 dark:border-border-dark/50 bg-background-secondary/30 dark:bg-background-dark-secondary/30 p-4 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-dark-mode/10">
                    <Clock className="h-4 w-4 text-primary dark:text-primary-dark-mode" />
                  </div>
                  <div>
                    <Label htmlFor="availabilityDays" className="text-base font-semibold text-text dark:text-text-dark transition-colors">
                      {t('form.availability.days')} <span className="text-error">*</span>
                    </Label>
                    <p className="text-xs text-text-muted dark:text-text-dark-muted transition-colors">
                      Select your available days
                    </p>
                  </div>
                </div>
                <Input
                  id="availabilityDays"
                  {...register('availabilityDays')}
                  placeholder="e.g., Monday, Tuesday, Wednesday, Thursday, Friday"
                  className="border-2 focus:border-primary dark:focus:border-primary-dark-mode transition-colors"
                />
                <div className="flex flex-wrap gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                    const watchDays = watch('availabilityDays') || '';
                    const currentDays = watchDays.split(',').map(d => d.trim()).filter(Boolean);
                    const isSelected = currentDays.some(d => d.toLowerCase() === day.toLowerCase());
                    return (
                      <Badge
                        key={day}
                        variant={isSelected ? 'default' : 'outline'}
                        className={`cursor-pointer px-3 py-1 text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-primary text-white dark:bg-primary-dark-mode'
                            : 'hover:bg-primary/10 hover:border-primary/50 dark:hover:bg-primary-dark-mode/10'
                        }`}
                        onClick={() => {
                          const newDays = isSelected
                            ? currentDays.filter(d => d.toLowerCase() !== day.toLowerCase())
                            : [...currentDays, day];
                          setValue('availabilityDays', newDays.join(', '), { shouldValidate: true });
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            const newDays = isSelected
                              ? currentDays.filter(d => d.toLowerCase() !== day.toLowerCase())
                              : [...currentDays, day];
                            setValue('availabilityDays', newDays.join(', '), { shouldValidate: true });
                          }
                        }}
                        aria-label={`${isSelected ? 'Remove' : 'Add'} ${day}`}
                      >
                        {isSelected && <Check className="mr-1 h-3 w-3" />}
                        {day.slice(0, 3)}
                      </Badge>
                    );
                  })}
                </div>
                {errors.availabilityDays && (
                  <p className="text-sm font-medium text-error dark:text-error transition-colors">
                    {errors.availabilityDays.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="availabilityStart">{t('form.availability.start')} *</Label>
                  <Input
                    id="availabilityStart"
                    type="time"
                    {...register('availabilityStart')}
                  />
                  {errors.availabilityStart && (
                    <p className="text-sm font-medium text-error dark:text-error transition-colors">
                      {errors.availabilityStart.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availabilityEnd">{t('form.availability.end')} *</Label>
                  <Input
                    id="availabilityEnd"
                    type="time"
                    {...register('availabilityEnd')}
                  />
                  {errors.availabilityEnd && (
                    <p className="text-sm font-medium text-error dark:text-error transition-colors">
                      {errors.availabilityEnd.message}
                    </p>
                  )}
                </div>

                {/* Shift Type (NEW) */}
                {featureFlags.ADVANCED_GUARDIAN_PROFILE && (
                  <div className="space-y-2">
                    <Label htmlFor="shiftType">{t('form.shiftType')}</Label>
                    <Select id="shiftType" {...register('shiftType')}>
                      <option value="">Select</option>
                      <option value="Morning">{t('form.shiftType.morning')}</option>
                      <option value="Night">{t('form.shiftType.night')}</option>
                      <option value="24×7">{t('form.shiftType.24x7')}</option>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceRadius">{t('form.serviceRadius')} ({t('form.serviceRadius.km')}) *</Label>
                <Input
                  id="serviceRadius"
                  type="number"
                  {...register('serviceRadius', { valueAsNumber: true })}
                />
                {errors.serviceRadius && (
                  <p className="text-sm font-medium text-error dark:text-error transition-colors">
                    {errors.serviceRadius.message}
                  </p>
                )}
              </div>

              {/* Pricing (NEW) */}
              {featureFlags.PRICING_SYSTEM && (
                <div className="space-y-4 rounded-lg border border-border dark:border-border-dark p-4">
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-text dark:text-text-dark transition-colors">
                      {t('form.pricing.transparent')}
                    </h3>
                    <p className="text-sm text-text-muted dark:text-text-dark-muted transition-colors">
                      {t('form.pricing.confirmedAfter')}
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="pricingHourly">{t('form.pricing.hourly')}</Label>
                      <Input
                        id="pricingHourly"
                        type="number"
                        {...register('pricingHourly', { valueAsNumber: true })}
                        placeholder="300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pricingDaily">{t('form.pricing.daily')}</Label>
                      <Input
                        id="pricingDaily"
                        type="number"
                        {...register('pricingDaily', { valueAsNumber: true })}
                        placeholder="2000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pricingMonthly">{t('form.pricing.monthly')}</Label>
                      <Input
                        id="pricingMonthly"
                        type="number"
                        {...register('pricingMonthly', { valueAsNumber: true })}
                        placeholder="18000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pricingBreakdown">{t('form.pricing.breakdown')}</Label>
                    <Textarea
                      id="pricingBreakdown"
                      {...register('pricingBreakdown')}
                      placeholder={t('form.pricing.breakdown.placeholder')}
                      rows={2}
                      maxLength={500}
                    />
                    <p className="text-xs text-text-muted dark:text-text-dark-muted transition-colors">
                      {t('form.pricing.breakdown.help')}
                    </p>
                  </div>
                </div>
              )}

              {/* Certifications */}
              <div className="space-y-2">
                <Label htmlFor="certifications">{t('form.certifications')}</Label>
                <div className="flex flex-wrap gap-2">
                  {certPreviews.map((preview, idx) => (
                    <img
                      key={idx}
                      src={preview}
                      alt={`Cert ${idx + 1}`}
                      className="h-20 w-20 rounded object-cover"
                    />
                  ))}
                </div>
                <label
                  htmlFor="certifications"
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-text hover:bg-background-secondary dark:border-border-dark dark:text-text-dark dark:hover:bg-background-dark-secondary transition-colors"
                >
                  <Upload className="h-4 w-4 text-text dark:text-text-dark transition-colors" />
                  <span>{t('form.upload')} {t('form.certifications')}</span>
                  <input
                    id="certifications"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleCertChange}
                    className="hidden"
                  />
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={saving || loading}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isCreateMode ? 'Creating...' : 'Saving...'}
                  </>
                ) : (
                  isCreateMode ? t('form.create') : 'Save Changes'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
