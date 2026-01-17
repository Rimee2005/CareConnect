'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VitalNavbar } from '@/components/VitalNavbar';
import { useTranslation } from '@/lib/i18n';
import { Upload, ArrowLeft, Loader2 } from 'lucide-react';

// Create schema with translations
const createVitalProfileSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(1, t('form.validation.nameRequired')),
  age: z.number().min(1).max(120),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']),
  healthNeeds: z.string().min(10, t('form.validation.healthNeedsMin')),
  healthTags: z.string().optional(),
  city: z.string().min(1, t('form.validation.cityRequired')),
  contactPreference: z.enum(['Phone', 'Email', 'Both']),
});

type VitalProfileForm = z.infer<ReturnType<typeof createVitalProfileSchema>>;

interface VitalProfile {
  _id: string;
  name: string;
  age: number;
  gender: string;
  healthNeeds: string;
  healthTags?: string[];
  location: {
    city: string;
  };
  contactPreference: string;
  profilePhoto?: string;
}

export default function VitalProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<VitalProfile | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VitalProfileForm>({
    resolver: zodResolver(createVitalProfileSchema(t)),
  });

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
      setLoading(true);
      setError('');
      const res = await fetch('/api/vital/profile');
      
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setIsCreateMode(false);
        // Populate form with existing data
        reset({
          name: data.name,
          age: data.age,
          gender: data.gender,
          healthNeeds: data.healthNeeds,
          healthTags: data.healthTags?.join(', ') || '',
          city: data.location?.city || '',
          contactPreference: data.contactPreference,
        });
        // Set photo preview if profilePhoto exists and is not empty
        if (data.profilePhoto && data.profilePhoto.trim() !== '') {
          setPhotoPreview(data.profilePhoto);
          console.log('Loaded profile photo:', data.profilePhoto);
        } else {
          setPhotoPreview('');
        }
      } else if (res.status === 404) {
        // Profile doesn't exist - show create mode
        setProfile(null);
        setIsCreateMode(true);
        // Reset form to empty state
        reset({
          name: '',
          age: undefined as any,
          gender: undefined as any,
          healthNeeds: '',
          healthTags: '',
          city: '',
          contactPreference: undefined as any,
        });
        setPhotoPreview('');
        setPhotoFile(null);
      } else {
        // Other error
        const errorData = await res.json().catch(() => ({ error: t('form.validation.failedToLoad') }));
        setError(errorData.error || t('form.validation.failedToLoad'));
        setIsCreateMode(true); // Allow create as fallback
        setPhotoPreview('');
        setPhotoFile(null);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError(t('form.validation.failedToLoadContinue'));
      setIsCreateMode(true); // Allow create as fallback
      // Reset form to empty state
      reset({
        name: '',
        age: undefined as any,
        gender: undefined as any,
        healthNeeds: '',
        healthTags: '',
        city: '',
        contactPreference: undefined as any,
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
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
        e.target.value = ''; // Clear the input
        return;
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError('File size exceeds 10MB limit. Please upload a smaller image.');
        e.target.value = ''; // Clear the input
        return;
      }

      if (file.size === 0) {
        setError('File is empty. Please select a valid image.');
        e.target.value = ''; // Clear the input
        return;
      }

      setError(''); // Clear any previous errors
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.onerror = () => {
        setError('Failed to read file. Please try again.');
        setPhotoFile(null);
        setPhotoPreview('');
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: VitalProfileForm) => {
    if (!session) {
      router.push('/auth/login');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Start with existing photo if in edit mode, otherwise empty
      let profilePhoto = profile?.profilePhoto || '';
      let photoUploadWarning = '';

      // Upload photo if a new one was selected
      if (photoFile) {
        try {
          // Validate file before upload
          if (photoFile.size === 0) {
            throw new Error(t('form.validation.selectedFileEmpty'));
          }

          const formData = new FormData();
          formData.append('file', photoFile);
          
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!uploadRes.ok) {
            let uploadError;
            try {
              uploadError = await uploadRes.json();
            } catch {
              uploadError = { error: `Upload failed with status ${uploadRes.status}` };
            }
            
            // Check if it's a Cloudinary configuration error
            const errorMsg = uploadError.error || t('form.validation.uploadFailed');
            if (errorMsg.includes('Cloudinary') || errorMsg.includes('api_key') || errorMsg.includes('not configured')) {
              // Make photo upload optional - allow profile save without photo
              photoUploadWarning = t('form.validation.uploadSkipped').replace('{error}', errorMsg);
              console.warn('Photo upload failed, continuing without photo:', errorMsg);
              // Keep existing photo if in edit mode, otherwise leave empty
              profilePhoto = profile?.profilePhoto || '';
            } else {
              // For other errors, still allow save but warn user
              photoUploadWarning = t('form.validation.uploadFailedContinue').replace('{error}', errorMsg);
              console.warn('Photo upload failed, continuing without photo:', errorMsg);
              profilePhoto = profile?.profilePhoto || '';
            }
          } else {
            const uploadData = await uploadRes.json();
            if (!uploadData || !uploadData.url) {
              photoUploadWarning = t('form.validation.uploadNoUrl');
              console.warn('Photo upload returned no URL');
              profilePhoto = profile?.profilePhoto || '';
            } else if (typeof uploadData.url !== 'string' || !uploadData.url.startsWith('http')) {
              photoUploadWarning = t('form.validation.invalidPhotoUrl');
              console.warn('Invalid photo URL:', uploadData.url);
              profilePhoto = profile?.profilePhoto || '';
            } else {
              // Success!
              profilePhoto = uploadData.url;
              console.log('Photo uploaded successfully:', profilePhoto);
            }
          }
        } catch (uploadErr: any) {
          console.error('Photo upload error:', uploadErr);
          // Make photo upload optional - don't block profile save
          const errorMsg = uploadErr.message || 'Unknown error';
          photoUploadWarning = `Photo upload failed: ${errorMsg}. Profile will be saved without the new photo.`;
          // Keep existing photo if in edit mode
          profilePhoto = profile?.profilePhoto || '';
        }
      }

      // Prepare health tags
      const healthTags = data.healthTags
        ? data.healthTags.split(',').map((tag) => tag.trim()).filter(tag => tag.length > 0)
        : [];

      // Use POST for create, PUT for update
      const method = isCreateMode ? 'POST' : 'PUT';
      
      // Build request body
      const requestBody: any = {
        ...data,
        healthTags,
        location: {
          city: data.city,
        },
      };

      // Handle profilePhoto based on mode and whether we have a photo
      if (isCreateMode) {
        // Create mode: only include photo if we have one
        if (profilePhoto && profilePhoto.trim() !== '') {
          requestBody.profilePhoto = profilePhoto.trim();
        }
        // If no photo, don't include the field (will default to empty string in DB)
      } else {
        // Edit mode: 
        // - If we have a new photo (uploaded successfully), use it
        // - If no new photo was uploaded, preserve existing (don't include in request)
        if (photoFile) {
          // User selected a new photo
          if (profilePhoto && profilePhoto.trim() !== '') {
            // Upload succeeded
            requestBody.profilePhoto = profilePhoto.trim();
          } else {
            // Upload failed - preserve existing photo by not including it
            // The API will preserve existing if profilePhoto is undefined
          }
        } else {
          // No new photo selected - preserve existing by not including profilePhoto
          // The API will preserve existing if profilePhoto is undefined
        }
      }

      console.log('Saving profile with photo:', requestBody.profilePhoto ? 'Yes' : 'No', requestBody.profilePhoto);

      const res = await fetch('/api/vital/profile', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const result = await res.json();

      if (!res.ok) {
        // If profile already exists error, switch to edit mode and refetch
        if (res.status === 400 && result.error?.includes('already exists')) {
          setError(t('form.validation.profileAlreadyExists'));
          setIsCreateMode(false);
          // Refetch the profile
          await fetchProfile();
          return;
        }
        setError(result.error || (isCreateMode ? t('form.validation.failedToCreate') : t('form.validation.failedToUpdate')));
        return;
      }

      // Verify the photo was saved
      if (profilePhoto && profilePhoto.trim() !== '' && !result.profilePhoto) {
        console.warn('Warning: Photo URL was sent but not returned in response');
      }

      // Update local state with the returned profile data
      setProfile(result);
      setIsCreateMode(false);
      
      // Update photo preview with the saved URL
      if (result.profilePhoto && result.profilePhoto.trim() !== '') {
        setPhotoPreview(result.profilePhoto);
      } else if (profilePhoto && profilePhoto.trim() !== '') {
        // Fallback: use the uploaded URL if response doesn't include it
        setPhotoPreview(profilePhoto);
      } else {
        // No photo - clear preview
        setPhotoPreview('');
      }
      
      setPhotoFile(null);
      
      // Show warning if photo upload had issues but profile was saved
      if (photoUploadWarning) {
        // Show warning but don't block - profile is already saved
        console.warn('Profile saved with photo upload warning:', photoUploadWarning);
        // You could show a toast notification here if you have a toast system
        // For now, we'll just log it and continue
      }
      
      // Redirect to dashboard after successful save
      router.push('/vital/dashboard');
    } catch (err: any) {
      console.error('Profile save error:', err);
      setError(err.message || t('form.validation.anErrorOccurred'));
    } finally {
      setSaving(false);
    }
  };

  // Show loading state
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark transition-colors">
        <VitalNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-text-muted dark:text-text-dark-muted">
              {status === 'loading' ? t('form.validation.checkingAuth') : t('form.validation.loadingProfile')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Route guard - only allow VITAL users
  if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'VITAL')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark transition-colors">
      <VitalNavbar />
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8">
        {/* Back to Dashboard - only show if profile exists */}
        {!isCreateMode && (
          <Link href="/vital/dashboard">
            <Button variant="ghost" className="mb-6 text-sm sm:text-base">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('profile.vital.backToDashboard')}
            </Button>
          </Link>
        )}

        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle className="text-text dark:text-text-dark transition-colors">
              {isCreateMode ? t('profile.vital.createTitle') : t('profile.vital.editTitle')}
            </CardTitle>
            <CardDescription className="text-text-light dark:text-text-dark-light transition-colors">
              {isCreateMode 
                ? t('profile.vital.createDescription')
                : t('profile.vital.editDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-md border border-error/20 bg-error/10 p-3">
                <p className="text-sm font-medium text-error">{error}</p>
              </div>
            )}
            {saving && photoFile && (
              <div className="mb-4 rounded-md border border-primary/20 bg-primary/5 p-3">
                <p className="text-sm text-primary dark:text-primary-dark-mode">
                  {t('form.uploadingPhoto')}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="photo">{t('form.profilePhoto')}</Label>
                <div className="flex items-center gap-4">
                  {photoPreview ? (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Profile preview"
                        className="h-24 w-24 rounded-full object-cover border-2 border-primary/20"
                        onError={(e) => {
                          console.error('Image load error:', photoPreview);
                          // Fallback: clear preview if image fails to load
                          setPhotoPreview('');
                          setPhotoFile(null);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-primary/30 bg-primary/5 dark:bg-primary-dark-mode/10">
                      <Upload className="h-8 w-8 text-primary/50 dark:text-primary-dark-mode/50" />
                    </div>
                  )}
                  <label
                    htmlFor="photo"
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-text hover:bg-background-secondary dark:border-border-dark dark:text-text-dark dark:hover:bg-background-dark-secondary transition-colors"
                  >
                    <Upload className="h-4 w-4 text-text dark:text-text-dark transition-colors" />
                    <span>{photoPreview ? t('form.changePhoto') : t('form.uploadPhoto')}</span>
                    <input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {photoPreview && (
                  <p className="text-xs text-text-muted dark:text-text-dark-muted">
                    {t('form.photoReady')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">{t('form.name')} *</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-sm font-medium text-error dark:text-error transition-colors">{errors.name.message}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="age">{t('form.age')} *</Label>
                  <Input
                    id="age"
                    type="number"
                    {...register('age', { valueAsNumber: true })}
                  />
                  {errors.age && <p className="text-sm font-medium text-error dark:text-error transition-colors">{errors.age.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">{t('form.gender')} *</Label>
                  <Select id="gender" {...register('gender')}>
                    <option value="">{t('form.select')}</option>
                    <option value="Male">{t('guardians.male')}</option>
                    <option value="Female">{t('guardians.female')}</option>
                    <option value="Other">{t('guardians.other')}</option>
                    <option value="Prefer not to say">{t('guardians.preferNotToSay')}</option>
                  </Select>
                  {errors.gender && <p className="text-sm font-medium text-error dark:text-error transition-colors">{errors.gender.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="healthNeeds">{t('form.healthNeeds')} *</Label>
                <Textarea
                  id="healthNeeds"
                  {...register('healthNeeds')}
                  rows={4}
                  placeholder={t('form.healthNeeds.placeholder')}
                />
                {errors.healthNeeds && (
                  <p className="text-sm font-medium text-error dark:text-error transition-colors">{errors.healthNeeds.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="healthTags">{t('form.healthTags')} ({t('form.healthTags.help')})</Label>
                <Input
                  id="healthTags"
                  {...register('healthTags')}
                  placeholder={t('form.healthTags.placeholder')}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">{t('form.city')} *</Label>
                  <Input id="city" {...register('city')} />
                  {errors.city && <p className="text-sm font-medium text-error dark:text-error transition-colors">{errors.city.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPreference">{t('form.contactPreference')} *</Label>
                  <Select id="contactPreference" {...register('contactPreference')}>
                    <option value="">{t('form.select')}</option>
                    <option value="Phone">{t('form.contactPreference.phone')}</option>
                    <option value="Email">{t('form.contactPreference.email')}</option>
                    <option value="Both">{t('form.contactPreference.both')}</option>
                  </Select>
                  {errors.contactPreference && (
                    <p className="text-sm font-medium text-error dark:text-error transition-colors">{errors.contactPreference.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isCreateMode ? t('form.creating') : t('form.saving')}
                    </>
                  ) : (
                    isCreateMode ? t('form.create') : t('form.save')
                  )}
                </Button>
                {!isCreateMode && (
                  <Link href="/vital/dashboard" className="flex-1">
                    <Button type="button" variant="outline" className="w-full">
                      {t('form.cancel')}
                    </Button>
                  </Link>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
