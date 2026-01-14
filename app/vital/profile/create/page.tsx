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

const vitalProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().min(1).max(120),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']),
  healthNeeds: z.string().min(10, 'Please provide at least 10 characters'),
  healthTags: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  contactPreference: z.enum(['Phone', 'Email', 'Both']),
});

type VitalProfileForm = z.infer<typeof vitalProfileSchema>;

export default function CreateVitalProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VitalProfileForm>({
    resolver: zodResolver(vitalProfileSchema),
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

  const onSubmit = async (data: VitalProfileForm) => {
    if (!session) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let profilePhoto = '';

      // Upload photo if provided
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

      // Create profile
      const healthTags = data.healthTags
        ? data.healthTags.split(',').map((tag) => tag.trim())
        : [];

      const res = await fetch('/api/vital/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          healthTags,
          profilePhoto,
          location: {
            city: data.city,
          },
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Failed to create profile');
        return;
      }

      router.push('/vital/dashboard');
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
            <CardTitle>Create Your Vital Profile</CardTitle>
            <CardDescription>
              Tell us about yourself so we can connect you with the right Guardians
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

              <div className="space-y-2">
                <Label htmlFor="healthNeeds">Health Needs *</Label>
                <Textarea
                  id="healthNeeds"
                  {...register('healthNeeds')}
                  rows={4}
                  placeholder="Describe your health needs and requirements..."
                />
                {errors.healthNeeds && (
                  <p className="text-sm text-error">{errors.healthNeeds.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="healthTags">Health Tags (comma-separated)</Label>
                <Input
                  id="healthTags"
                  {...register('healthTags')}
                  placeholder="e.g., diabetes, mobility assistance, medication management"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" {...register('city')} />
                  {errors.city && <p className="text-sm text-error">{errors.city.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPreference">Contact Preference *</Label>
                  <Select id="contactPreference" {...register('contactPreference')}>
                    <option value="">Select</option>
                    <option value="Phone">Phone</option>
                    <option value="Email">Email</option>
                    <option value="Both">Both</option>
                  </Select>
                  {errors.contactPreference && (
                    <p className="text-sm text-error">{errors.contactPreference.message}</p>
                  )}
                </div>
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

