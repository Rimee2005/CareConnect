'use client';

import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, DollarSign, Heart, Users } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import Link from 'next/link';

export default function PricingPage() {
  const { t } = useTranslation();

  const pricingPlans = [
    {
      name: t('pages.pricing.forVitals'),
      description: t('pages.pricing.forVitalsDesc'),
      icon: Heart,
      price: t('pages.pricing.forVitalsPrice'),
      period: t('pages.pricing.forVitalsPeriod'),
      features: [
        t('pages.pricing.forVitalsFeature1'),
        t('pages.pricing.forVitalsFeature2'),
        t('pages.pricing.forVitalsFeature3'),
        t('pages.pricing.forVitalsFeature4'),
        t('pages.pricing.forVitalsFeature5'),
        t('pages.pricing.forVitalsFeature6'),
      ],
      cta: t('pages.pricing.forVitalsCta'),
      href: '/auth/register?role=VITAL',
      popular: false,
    },
    {
      name: t('pages.pricing.forGuardians'),
      description: t('pages.pricing.forGuardiansDesc'),
      icon: Users,
      price: t('pages.pricing.forGuardiansPrice'),
      period: t('pages.pricing.forGuardiansPeriod'),
      features: [
        t('pages.pricing.forGuardiansFeature1'),
        t('pages.pricing.forGuardiansFeature2'),
        t('pages.pricing.forGuardiansFeature3'),
        t('pages.pricing.forGuardiansFeature4'),
        t('pages.pricing.forGuardiansFeature5'),
        t('pages.pricing.forGuardiansFeature6'),
      ],
      cta: t('pages.pricing.forGuardiansCta'),
      href: '/auth/register?role=GUARDIAN',
      popular: true,
    },
  ];

  const pricingInfo = {
    howItWorks: [
      {
        title: t('pages.pricing.noSubscriptionFees'),
        description: t('pages.pricing.noSubscriptionFeesDesc'),
      },
      {
        title: t('pages.pricing.transparentPricing'),
        description: t('pages.pricing.transparentPricingDesc'),
      },
      {
        title: t('pages.pricing.securePayments'),
        description: t('pages.pricing.securePaymentsDesc'),
      },
    ],
    serviceFee: {
      title: t('pages.pricing.serviceFee'),
      description: t('pages.pricing.serviceFeeDesc'),
    },
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark transition-colors">
      <Navbar />

      <div className="container mx-auto px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-12 text-center sm:mb-16">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-dark-mode/20">
                <DollarSign className="h-8 w-8 text-primary dark:text-primary-dark-mode" />
              </div>
            </div>
            <h1 className="mb-4 text-3xl font-bold text-text dark:text-text-dark sm:text-4xl md:text-5xl transition-colors">
              {t('pages.pricing.header')}
            </h1>
            <p className="mx-auto max-w-2xl text-base text-text-light dark:text-text-dark-light sm:text-lg transition-colors">
              {t('pages.pricing.subheader')}
            </p>
          </div>

          {/* Pricing Plans */}
          <div className="mb-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
            {pricingPlans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <Card
                  key={index}
                  className={`relative transition-all duration-300 hover:shadow-medium dark:hover:shadow-dark-medium ${
                    plan.popular
                      ? 'border-2 border-primary dark:border-primary-dark-mode shadow-medium dark:shadow-dark-medium'
                      : 'border-2 hover:border-primary/20 dark:hover:border-primary-dark-mode/20'
                  } transition-colors`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-white dark:bg-primary-dark-mode">
                        {t('pages.pricing.mostPopular')}
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <div className="mb-4 flex justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-dark-mode/20">
                        <Icon className="h-8 w-8 text-primary dark:text-primary-dark-mode" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-text dark:text-text-dark transition-colors">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="mt-2 text-base text-text-light dark:text-text-dark-light transition-colors">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-6">
                      <span className="text-4xl font-bold text-text dark:text-text-dark transition-colors">
                        {plan.price}
                      </span>
                      <span className="ml-2 text-sm text-text-muted dark:text-text-dark-muted transition-colors">
                        {plan.period}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-success/10 dark:bg-success/20">
                            <Check className="h-3 w-3 text-success" />
                          </div>
                          <span className="text-sm sm:text-base text-text-light dark:text-text-dark-light transition-colors">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Link href={plan.href} className="block">
                      <Button
                        className={`w-full ${
                          plan.popular
                            ? ''
                            : 'bg-background-secondary hover:bg-background-secondary/80 dark:bg-background-dark-secondary dark:hover:bg-background-dark-secondary/80'
                        }`}
                        size="lg"
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* How It Works */}
          <div className="mb-12">
            <h2 className="mb-8 text-center text-2xl font-bold text-text dark:text-text-dark sm:text-3xl transition-colors">
              {t('pages.pricing.howItWorks')}
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {pricingInfo.howItWorks.map((info, index) => (
                <Card key={index} className="transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg text-text dark:text-text-dark transition-colors">
                      {info.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm sm:text-base leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                      {info.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Service Fee Info */}
          <Card className="transition-colors">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-text dark:text-text-dark transition-colors">
                {pricingInfo.serviceFee.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                {pricingInfo.serviceFee.description}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

