import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Target, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-center text-5xl font-bold text-text">About CareConnect</h1>

          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-3xl">
                <Target className="h-8 w-8 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-text">
                Connecting lives through care. At CareConnect, we believe that everyone deserves
                access to compassionate, quality healthcare. Our platform bridges the gap between
                those in need of care (Vitals) and dedicated caregivers (Guardians), creating a
                trusted community built on empathy and professionalism.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-secondary" />
                  For Vitals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text">
                  Find verified, compassionate Guardians who understand your unique health needs.
                  Browse profiles, read reviews, and connect with caregivers who are committed to
                  your wellbeing.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-sage" />
                  For Guardians
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text">
                  Join a community of dedicated caregivers. Manage your bookings, build your
                  reputation through reviews, and make a meaningful difference in people's lives.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-12">
            <CardHeader>
              <CardTitle>Our Story</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text">
                CareConnect was born from a simple observation: healthcare shouldn't be fragmented
                across multiple platforms, phone calls, and WhatsApp messages. We envisioned a
                unified, trust-driven platform where Vitals and Guardians can connect seamlessly,
                with verified profiles, structured workflows, and compassionate care at the heart
                of everything we do.
              </p>
              <p className="mt-4 text-text">
                Today, we're proud to be building a platform that not only connects people but also
                ensures that every interaction is built on trust, transparency, and genuine care.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

