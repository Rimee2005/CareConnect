import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Shield, Users, Clock, Star, MapPin, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import VitalCard, { Vital } from '../components/VitalCard';
import CompanionCard, { Companion } from '../components/CompanionCard';
import { useTranslation } from '../hooks/useTranslation';

// Mock featured data
const featuredVitals: Vital[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    age: 78,
    condition: 'Post-surgery recovery support needed',
    urgency: 'high',
    location: 'Downtown Medical',
    distance: 2.3,
    description: 'Recovering from hip replacement surgery. Need help with daily activities and medication reminders.',
    lastActive: '5 minutes ago',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face'
  },
  {
    id: '2',
    name: 'Robert Chen',
    age: 65,
    condition: 'Diabetes management and companionship',
    urgency: 'medium',
    location: 'Riverside District',
    distance: 4.7,
    description: 'Type 2 diabetes requiring meal planning assistance and companionship.',
    lastActive: '1 hour ago',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
  }
];

const featuredCompanions: Companion[] = [
  {
    id: '1',
    name: 'Emily Rodriguez',
    specialization: 'Elder Care',
    experience: 8,
    rating: 4.9,
    reviews: 127,
    location: 'Downtown Medical',
    distance: 1.8,
    hourlyRate: 25,
    bio: 'Certified nursing assistant with 8 years of experience in elder care and post-surgical recovery.',
    verified: true,
    availableNow: true,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face'
  },
  {
    id: '2',
    name: 'Michael Chen',
    specialization: 'Physiotherapy',
    experience: 12,
    rating: 4.8,
    reviews: 203,
    location: 'Riverside District',
    distance: 3.5,
    hourlyRate: 35,
    bio: 'Licensed physical therapist with expertise in mobility rehabilitation and recovery.',
    verified: true,
    availableNow: false,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face'
  }
];

const Index = () => {
  const { t } = useTranslation();

  const handleViewProfile = (vital: Vital) => {
    console.log('View vital profile:', vital);
  };

  const handleHire = (companion: Companion) => {
    console.log('Hire companion:', companion);
  };

  const howItWorksSteps = [
    {
      icon: Users,
      title: t('step1Title'),
      description: t('step1Desc')
    },
    {
      icon: Heart,
      title: t('step2Title'),
      description: t('step2Desc')
    },
    {
      icon: CheckCircle,
      title: t('step3Title'),
      description: t('step3Desc')
    }
  ];

  const testimonials = [
    {
      name: 'Maria Santos',
      role: 'Patient Family Member',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      content: 'CareConnect helped us find the perfect caretaker for my elderly mother. The process was simple and the care has been exceptional.',
      rating: 5
    },
    {
      name: 'Dr. James Wilson',
      role: 'Healthcare Professional',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face',
      content: 'As a physician, I recommend CareConnect to my patients. The quality of caretakers and the platform\'s reliability are outstanding.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                {t('heroTitle')}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                {t('heroSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/signup">
                  <Button size="lg" className="btn-hero px-8">
                    {t('getStarted')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="lg" className="px-8">
                    {t('learnMore')}
                  </Button>
                </Link>
              </div>
              
              {/* Stats */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-8 mt-12">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">10,000+</div>
                  <div className="text-sm text-muted-foreground">Patients Helped</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">5,000+</div>
                  <div className="text-sm text-muted-foreground">Trusted Caretakers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Cities Served</div>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl p-8 h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Connecting Hearts
                  </h3>
                  <p className="text-muted-foreground">
                    Building bridges of compassionate care
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('howItWorks')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Getting started with CareConnect is simple and straightforward
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vitals */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {t('featuredVitals')}
              </h2>
              <p className="text-muted-foreground">
                Patients in need of compassionate care
              </p>
            </div>
            <Link to="/vitals">
              <Button variant="outline">
                {t('viewAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredVitals.map((vital) => (
              <VitalCard
                key={vital.id}
                vital={vital}
                onViewProfile={handleViewProfile}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Companions */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {t('featuredCompanions')}
              </h2>
              <p className="text-muted-foreground">
                Trusted caretakers ready to help
              </p>
            </div>
            <Link to="/companions">
              <Button variant="outline">
                {t('viewAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredCompanions.map((companion) => (
              <CompanionCard
                key={companion.id}
                companion={companion}
                onHire={handleHire}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Map Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Find Care Near You
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Use our interactive map to discover patients and caretakers in your area
            </p>
          </div>
          
          <div className="care-card p-8 max-w-4xl mx-auto">
            <div className="bg-muted rounded-lg h-64 flex items-center justify-center relative overflow-hidden">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Interactive map with real-time locations
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Click on pins to view profiles
                </p>
              </div>
              {/* Mock map pins */}
              <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-primary rounded-full animate-pulse" />
              <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-secondary rounded-full animate-pulse" />
              <div className="absolute bottom-1/3 left-1/2 w-4 h-4 bg-primary rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              What People Say
            </h2>
            <p className="text-muted-foreground">
              Hear from our community of patients and caretakers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="care-card p-6">
                <div className="flex space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center space-x-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of families who trust CareConnect for their care needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="px-8">
                  Sign Up Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="px-8 text-white border-white hover:bg-white hover:text-primary">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
