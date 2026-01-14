'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { useTranslation } from '@/lib/i18n';
import { Upload } from 'lucide-react';

const guardianProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().min(18).max(100),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']),
  experience: z.number().min(0),
  specialization: z.string().min(1, 'At least one specialization is required'),
  serviceRadius: z.number().min(1),
  availabilityDays: z.string().min(1, 'Select at least one day'),
  availabilityStart: z.string().min(1, 'Start time is required'),
  availabilityEnd: z.string().min(1, 'End time is required'),
});

type GuardianProfileForm = z.infer<typeof guardianProfileSchema>;

export default function CreateGuardianProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [certFiles, setCertFiles] = useState<File[]>([]);
  const [certPreviews, setCertPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuardianProfileForm>({
    resolver: zodResolver(guardianProfileSchema),
  });

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

  const onSubmit = async (data: GuardianProfileForm) => {
    if (!session) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
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

      // Create profile
      const specialization = data.specialization.split(',').map((s) => s.trim());
      const availabilityDays = data.availabilityDays.split(',').map((d) => d.trim());

      const res = await fetch('/api/guardian/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
          certifications,
          profilePhoto,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Failed to create profile');
        return;
      }

      router.push('/guardian/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Create Your Guardian Profile</CardTitle>
            <CardDescription>
              Tell us about your experience and availability to start receiving bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="photo">Profile Photo</Label>
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
                    className="flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 hover:bg-background-secondary"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload Photo</span>
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

              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-sm text-error">{errors.name.message}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    {...register('age', { valueAsNumber: true })}
                  />
                  {errors.age && <p className="text-sm text-error">{errors.age.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select id="gender" {...register('gender')}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </Select>
                  {errors.gender && <p className="text-sm text-error">{errors.gender.message}</p>}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Input
                    id="experience"
                    type="number"
                    {...register('experience', { valueAsNumber: true })}
                  />
                  {errors.experience && (
                    <p className="text-sm text-error">{errors.experience.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceRadius">Service Radius (km) *</Label>
                  <Input
                    id="serviceRadius"
                    type="number"
                    {...register('serviceRadius', { valueAsNumber: true })}
                  />
                  {errors.serviceRadius && (
                    <p className="text-sm text-error">{errors.serviceRadius.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization * (comma-separated)</Label>
                <Input
                  id="specialization"
                  {...register('specialization')}
                  placeholder="e.g., Elderly Care, Post-Surgery Care, Medication Management"
                />
                {errors.specialization && (
                  <p className="text-sm text-error">{errors.specialization.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="availabilityDays">Available Days * (comma-separated)</Label>
                <Input
                  id="availabilityDays"
                  {...register('availabilityDays')}
                  placeholder="e.g., Monday, Tuesday, Wednesday, Thursday, Friday"
                />
                <p className="text-xs text-text-muted">
                  Enter days: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
                </p>
                {errors.availabilityDays && (
                  <p className="text-sm text-error">{errors.availabilityDays.message}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="availabilityStart">Available From *</Label>
                  <Input
                    id="availabilityStart"
                    type="time"
                    {...register('availabilityStart')}
                  />
                  {errors.availabilityStart && (
                    <p className="text-sm text-error">{errors.availabilityStart.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availabilityEnd">Available Until *</Label>
                  <Input id="availabilityEnd" type="time" {...register('availabilityEnd')} />
                  {errors.availabilityEnd && (
                    <p className="text-sm text-error">{errors.availabilityEnd.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="certifications">Certifications (Optional)</Label>
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
                  className="flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 hover:bg-background-secondary"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Certifications</span>
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

              {error && <p className="text-sm text-error">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('common.loading') : 'Create Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

