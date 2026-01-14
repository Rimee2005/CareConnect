import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { Heart, Shield, Clock, Users } from 'lucide-react';
import { featureFlags } from '@/lib/feature-flags';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-sage/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-5xl font-bold text-text">
            Care with compassion, anytime, anywhere.
          </h1>
          <p className="mb-8 text-xl text-text-light">
            Connecting Vitals with compassionate Guardians for quality healthcare
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/register?role=VITAL">
              <Button size="lg" className="text-lg">
                I am a Vital
              </Button>
            </Link>
            <Link href="/auth/register?role=GUARDIAN">
              <Button size="lg" variant="secondary" className="text-lg">
                I am a Guardian
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-4xl font-bold text-text">How it Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>1. Create Profile</CardTitle>
                <CardDescription>
                  Sign up as a Vital or Guardian and create your detailed profile
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
                  <Heart className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle>2. Connect</CardTitle>
                <CardDescription>
                  Browse and connect with verified Guardians or receive booking requests
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage/10">
                  <Shield className="h-8 w-8 text-sage" />
                </div>
                <CardTitle>3. Care</CardTitle>
                <CardDescription>
                  Receive compassionate care or provide quality healthcare services
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Flags */}
      {(featureFlags.SOS_EMERGENCY || featureFlags.AI_MATCHING) && (
        <section className="bg-background-secondary py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-4xl font-bold text-text">Coming Soon</h2>
            <div className="grid gap-8 md:grid-cols-2">
              {featureFlags.SOS_EMERGENCY && (
                <Card>
                  <CardHeader>
                    <CardTitle>Emergency Support</CardTitle>
                    <CardDescription>24/7 emergency care assistance</CardDescription>
                  </CardHeader>
                </Card>
              )}
              {featureFlags.AI_MATCHING && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI Matching</CardTitle>
                    <CardDescription>Smart matching based on your needs</CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-4xl font-bold text-text">What People Say</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4 italic text-text">
                  "CareConnect helped me find the perfect caregiver for my mother. The platform is
                  easy to use and the Guardians are truly compassionate."
                </p>
                <p className="font-semibold text-text">— Priya S.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="mb-4 italic text-text">
                  "As a Guardian, I love how organized the booking system is. It makes managing my
                  care services so much easier."
                </p>
                <p className="font-semibold text-text">— Rajesh K.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="mb-4 italic text-text">
                  "The verification system gives me peace of mind. I know I'm connecting with
                  trusted professionals."
                </p>
                <p className="font-semibold text-text">— Anjali M.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-background-secondary py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-semibold text-text">Verified Guardians</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              <span className="font-semibold text-text">24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              <span className="font-semibold text-text">Compassionate Care</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

