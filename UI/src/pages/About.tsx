import React from 'react';
import { Heart, Users, Shield, Award, Clock, Globe } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const About = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Heart,
      title: 'Compassionate Care',
      description: 'Every interaction is guided by empathy and understanding'
    },
    {
      icon: Shield,
      title: 'Verified Professionals',
      description: 'All caretakers undergo thorough background checks and verification'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock assistance when you need it most'
    },
    {
      icon: Globe,
      title: 'Accessible Platform',
      description: 'Available in multiple languages for diverse communities'
    },
    {
      icon: Users,
      title: 'Community Focused',
      description: 'Building stronger, more caring communities together'
    },
    {
      icon: Award,
      title: 'Quality Assured',
      description: 'Highest standards of care and service excellence'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Patients Helped' },
    { number: '5,000+', label: 'Verified Caretakers' },
    { number: '500+', label: 'Cities Served' },
    { number: '4.9/5', label: 'Average Rating' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border/50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About CareConnect
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We believe that every life deserves compassionate care. Our mission is to connect 
              those in need with trusted caretakers, creating a community where no one faces 
              health challenges alone.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
            <p className="text-muted-foreground mb-6">
              CareConnect was founded with a simple but powerful vision: to make quality healthcare 
              and companionship accessible to everyone, regardless of their circumstances or location.
            </p>
            <p className="text-muted-foreground mb-6">
              We understand that caring for loved ones can be overwhelming, and finding the right 
              support shouldn't add to that stress. That's why we've created a platform that 
              prioritizes trust, transparency, and human connection.
            </p>
            <p className="text-muted-foreground">
              Through technology and community, we're building bridges between those who need care 
              and those who provide it, ensuring that compassion is always within reach.
            </p>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-8 h-96 flex items-center justify-center">
              <div className="text-center">
                <Heart className="h-24 w-24 text-primary mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground">
                  Connecting Hearts, Caring Souls
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose CareConnect?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've built our platform with the highest standards of care, safety, and accessibility in mind.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="care-card p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Impact by Numbers</h2>
            <p className="text-muted-foreground">
              See how we're making a difference in communities worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Story</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              CareConnect was born from personal experience. Our founders witnessed firsthand the 
              challenges families face when seeking quality care for their loved ones. Frustrated 
              by the lack of transparent, accessible options, they set out to create a solution 
              that puts people first.
            </p>
          </div>
          
          <div className="bg-card rounded-2xl p-8 max-w-4xl mx-auto">
            <blockquote className="text-center">
              <p className="text-lg text-muted-foreground italic mb-6">
                "When my grandmother needed care after her surgery, finding the right person felt 
                impossible. We knew there had to be a better way to connect families with trusted 
                caretakers. That's when CareConnect was born."
              </p>
              <footer className="text-foreground font-semibold">
                — The CareConnect Founding Team
              </footer>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Values</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Compassion First</h3>
              <p className="text-muted-foreground">
                Every decision we make is guided by empathy and understanding for those we serve.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-10 w-10 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Trust & Safety</h3>
              <p className="text-muted-foreground">
                We maintain the highest standards to ensure safe, reliable connections.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Community</h3>
              <p className="text-muted-foreground">
                We believe in the power of community to create positive change.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;