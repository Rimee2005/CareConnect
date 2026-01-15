'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { Heart, Shield, Clock, Users, CheckCircle, Lock, Headphones, Star, ArrowRight } from 'lucide-react';
import { featureFlags } from '@/lib/feature-flags';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

// Enhanced Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
};

const slideInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const slideInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const floatAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function HomePage() {
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role) {
      const dashboardUrl = `/${session.user.role.toLowerCase()}/dashboard`;
      router.push(dashboardUrl);
    }
  }, [session, status, router]);
  
  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark transition-colors">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-text dark:text-text-dark transition-colors">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render home page content if user is authenticated (will redirect)
  if (status === 'authenticated' && session?.user?.role) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-background dark:bg-background-dark transition-colors">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-sage/10 to-secondary/5 dark:from-primary-dark-mode/10 dark:via-sage-dark-mode/10 dark:to-secondary-dark-mode/5 py-16 sm:py-20 md:py-28">
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Abstract medical visual - soft circles */}
        <div className="absolute right-0 top-0 -mr-32 -mt-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl dark:bg-primary-dark-mode/10"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 h-96 w-96 rounded-full bg-sage/5 blur-3xl dark:bg-sage-dark-mode/10"></div>

        <div className="container relative mx-auto px-4 text-center sm:px-6">
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="mx-auto max-w-4xl"
          >
            <motion.h1
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              className="mb-6 text-4xl font-bold leading-tight text-text dark:text-text-dark sm:text-5xl sm:mb-8 md:text-6xl md:leading-tight transition-colors"
            >
              {t('home.hero.title')}
            </motion.h1>
            <motion.p
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              className="mb-8 text-lg leading-relaxed text-text-light dark:text-text-dark-light sm:text-xl sm:mb-10 md:text-2xl md:mb-12 transition-colors"
            >
              {t('home.hero.subtitle')}
            </motion.p>

            {/* Trust Indicators */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="mb-8 flex flex-wrap items-center justify-center gap-4 sm:mb-10 sm:gap-6 md:mb-12"
            >
              <motion.div variants={scaleIn} className="flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 backdrop-blur-sm dark:bg-background-dark-secondary/60">
                <Shield className="h-4 w-4 text-primary dark:text-primary-dark-mode sm:h-5 sm:w-5 transition-colors" />
                <span className="text-sm font-medium text-text dark:text-text-dark sm:text-base transition-colors">{t('home.hero.trust.verified')}</span>
              </motion.div>
              <motion.div variants={scaleIn} className="flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 backdrop-blur-sm dark:bg-background-dark-secondary/60">
                <Lock className="h-4 w-4 text-primary dark:text-primary-dark-mode sm:h-5 sm:w-5 transition-colors" />
                <span className="text-sm font-medium text-text dark:text-text-dark sm:text-base transition-colors">{t('home.hero.trust.secure')}</span>
              </motion.div>
              <motion.div variants={scaleIn} className="flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 backdrop-blur-sm dark:bg-background-dark-secondary/60">
                <Clock className="h-4 w-4 text-primary dark:text-primary-dark-mode sm:h-5 sm:w-5 transition-colors" />
                <span className="text-sm font-medium text-text dark:text-text-dark sm:text-base transition-colors">{t('home.hero.trust.support')}</span>
              </motion.div>
            </motion.div>

            {/* CTAs with micro-copy */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
            >
              <motion.div
                initial="initial"
                animate="animate"
                variants={slideInLeft}
                className="w-full sm:w-auto"
              >
                <Link href="/auth/register?role=VITAL" className="block w-full sm:w-auto">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" className="w-full text-base shadow-medium hover:shadow-lg transition-all sm:text-lg group">
                      {t('home.hero.cta.vital')}
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </motion.div>
                </Link>
                <p className="mt-2 text-xs text-text-muted dark:text-text-dark-muted sm:text-sm transition-colors">
                  {t('home.hero.cta.vital.desc')}
                </p>
              </motion.div>
              <motion.div
                initial="initial"
                animate="animate"
                variants={slideInRight}
                className="w-full sm:w-auto"
              >
                <Link href="/auth/register?role=GUARDIAN" className="block w-full sm:w-auto">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" variant="secondary" className="w-full text-base shadow-medium hover:shadow-lg transition-all sm:text-lg group">
                      {t('home.hero.cta.guardian')}
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </motion.div>
                </Link>
                <p className="mt-2 text-xs text-text-muted dark:text-text-dark-muted sm:text-sm transition-colors">
                  {t('home.hero.cta.guardian.desc')}
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 sm:py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h2 className="mb-4 text-center text-3xl font-bold text-text dark:text-text-dark sm:text-4xl sm:mb-6 md:text-5xl transition-colors">
              {t('home.howItWorks.title')}
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-center text-base text-text-light dark:text-text-dark-light sm:text-lg md:mb-16 transition-colors">
              {t('home.howItWorks.subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 md:gap-10"
          >
            {/* Step 1 */}
            <motion.div variants={scaleIn}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="group relative h-full text-center transition-all duration-300 hover:shadow-medium dark:hover:shadow-dark-medium border-2 hover:border-primary/20 dark:hover:border-primary-dark-mode/20">
                  <CardHeader className="px-6 pb-4 pt-8 sm:px-8 sm:pt-10">
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary-dark-mode/20 transition-all duration-300 group-hover:bg-primary/20 dark:group-hover:bg-primary-dark-mode/30 sm:h-24 sm:w-24"
                    >
                      <Users className="h-10 w-10 text-primary dark:text-primary-dark-mode sm:h-12 sm:w-12 transition-colors" />
                    </motion.div>
                    <CardTitle className="mb-3 text-xl font-bold text-text dark:text-text-dark sm:text-2xl transition-colors">
                      {t('home.howItWorks.step1.title')}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed text-text-light dark:text-text-dark-light sm:text-lg transition-colors">
                      {t('home.howItWorks.step1.desc')}
                    </CardDescription>
                </CardHeader>
              </Card>
              </motion.div>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={scaleIn}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="group relative h-full text-center transition-all duration-300 hover:shadow-medium dark:hover:shadow-dark-medium border-2 hover:border-secondary/20 dark:hover:border-secondary-dark-mode/20">
                  <CardHeader className="px-6 pb-4 pt-8 sm:px-8 sm:pt-10">
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: -5 }}
                      className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary/10 dark:bg-secondary-dark-mode/20 transition-all duration-300 group-hover:bg-secondary/20 dark:group-hover:bg-secondary-dark-mode/30 sm:h-24 sm:w-24"
                    >
                      <Heart className="h-10 w-10 text-secondary dark:text-secondary-dark-mode sm:h-12 sm:w-12 transition-colors" />
                    </motion.div>
                    <CardTitle className="mb-3 text-xl font-bold text-text dark:text-text-dark sm:text-2xl transition-colors">
                      {t('home.howItWorks.step2.title')}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed text-text-light dark:text-text-dark-light sm:text-lg transition-colors">
                      {t('home.howItWorks.step2.desc')}
                    </CardDescription>
                </CardHeader>
              </Card>
              </motion.div>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={scaleIn} className="sm:col-span-2 md:col-span-1">
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="group relative h-full text-center transition-all duration-300 hover:shadow-medium dark:hover:shadow-dark-medium border-2 hover:border-sage/20 dark:hover:border-sage-dark-mode/20">
                  <CardHeader className="px-6 pb-4 pt-8 sm:px-8 sm:pt-10">
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-sage/10 dark:bg-sage-dark-mode/20 transition-all duration-300 group-hover:bg-sage/20 dark:group-hover:bg-sage-dark-mode/30 sm:h-24 sm:w-24"
                    >
                      <Shield className="h-10 w-10 text-sage dark:text-sage-dark-mode sm:h-12 sm:w-12 transition-colors" />
                    </motion.div>
                    <CardTitle className="mb-3 text-xl font-bold text-text dark:text-text-dark sm:text-2xl transition-colors">
                      {t('home.howItWorks.step3.title')}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed text-text-light dark:text-text-dark-light sm:text-lg transition-colors">
                      {t('home.howItWorks.step3.desc')}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why CareConnect Trust Section */}
      <section className="bg-background-secondary dark:bg-background-dark-secondary py-16 sm:py-20 md:py-24 transition-colors">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="mb-12 text-center md:mb-16"
          >
            <h2 className="mb-4 text-3xl font-bold text-text dark:text-text-dark sm:text-4xl sm:mb-6 md:text-5xl transition-colors">
              Why CareConnect?
            </h2>
            <p className="mx-auto max-w-2xl text-base text-text-light dark:text-text-dark-light sm:text-lg transition-colors">
              Built on trust, designed for care
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 md:gap-8"
          >
            <motion.div variants={scaleIn}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full text-center transition-all duration-300 hover:shadow-medium dark:hover:shadow-dark-medium border-2 hover:border-primary/20 dark:hover:border-primary-dark-mode/20">
                  <CardHeader className="px-6 pb-4 pt-8 sm:px-8 sm:pt-10">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-dark-mode/20 sm:h-20 sm:w-20"
                    >
                      <Shield className="h-8 w-8 text-primary dark:text-primary-dark-mode sm:h-10 sm:w-10 transition-colors" />
                    </motion.div>
                  <CardTitle className="mb-2 text-lg font-bold text-text dark:text-text-dark sm:text-xl transition-colors">
                    {t('home.why.verification.title')}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-text-light dark:text-text-dark-light sm:text-base transition-colors">
                    {t('home.why.verification.desc')}
                  </CardDescription>
                </CardHeader>
              </Card>
              </motion.div>
            </motion.div>

            <motion.div variants={scaleIn}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full text-center transition-all duration-300 hover:shadow-medium dark:hover:shadow-dark-medium border-2 hover:border-sage/20 dark:hover:border-sage-dark-mode/20">
                  <CardHeader className="px-6 pb-4 pt-8 sm:px-8 sm:pt-10">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage/10 dark:bg-sage-dark-mode/20 sm:h-20 sm:w-20"
                    >
                      <Lock className="h-8 w-8 text-sage dark:text-sage-dark-mode sm:h-10 sm:w-10 transition-colors" />
                    </motion.div>
                  <CardTitle className="mb-2 text-lg font-bold text-text dark:text-text-dark sm:text-xl transition-colors">
                    {t('home.why.safety.title')}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-text-light dark:text-text-dark-light sm:text-base transition-colors">
                    {t('home.why.safety.desc')}
                  </CardDescription>
                </CardHeader>
              </Card>
              </motion.div>
            </motion.div>

            <motion.div variants={scaleIn}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full text-center transition-all duration-300 hover:shadow-medium dark:hover:shadow-dark-medium border-2 hover:border-secondary/20 dark:hover:border-secondary-dark-mode/20">
                  <CardHeader className="px-6 pb-4 pt-8 sm:px-8 sm:pt-10">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 dark:bg-secondary-dark-mode/20 sm:h-20 sm:w-20"
                    >
                      <Headphones className="h-8 w-8 text-secondary dark:text-secondary-dark-mode sm:h-10 sm:w-10 transition-colors" />
                    </motion.div>
                  <CardTitle className="mb-2 text-lg font-bold text-text dark:text-text-dark sm:text-xl transition-colors">
                    {t('home.why.support.title')}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-text-light dark:text-text-dark-light sm:text-base transition-colors">
                    {t('home.why.support.desc')}
                  </CardDescription>
                </CardHeader>
              </Card>
              </motion.div>
            </motion.div>

            <motion.div variants={scaleIn}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full text-center transition-all duration-300 hover:shadow-medium dark:hover:shadow-dark-medium border-2 hover:border-primary/20 dark:hover:border-primary-dark-mode/20">
                  <CardHeader className="px-6 pb-4 pt-8 sm:px-8 sm:pt-10">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-dark-mode/20 sm:h-20 sm:w-20"
                    >
                      <CheckCircle className="h-8 w-8 text-primary dark:text-primary-dark-mode sm:h-10 sm:w-10 transition-colors" />
                    </motion.div>
                    <CardTitle className="mb-2 text-lg font-bold text-text dark:text-text-dark sm:text-xl transition-colors">
                      {t('home.why.reviews.title')}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed text-text-light dark:text-text-dark-light sm:text-base transition-colors">
                      {t('home.why.reviews.desc')}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Feature Flags */}
      {(featureFlags.SOS_EMERGENCY || featureFlags.AI_MATCHING) && (
        <section className="py-16 sm:py-20 md:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="mb-12 text-center text-3xl font-bold text-text dark:text-text-dark sm:text-4xl md:mb-16 transition-colors">
              {t('home.comingSoon.title')}
            </h2>
            <div className="grid gap-8 sm:grid-cols-2">
              {featureFlags.SOS_EMERGENCY && (
                <Card className="transition-colors">
                  <CardHeader>
                    <CardTitle>Emergency Support</CardTitle>
                    <CardDescription>24/7 emergency care assistance</CardDescription>
                  </CardHeader>
                </Card>
              )}
              {featureFlags.AI_MATCHING && (
                <Card className="transition-colors">
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
      <section className="py-16 sm:py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="mb-12 text-center md:mb-16"
          >
            <h2 className="mb-4 text-3xl font-bold text-text dark:text-text-dark sm:text-4xl sm:mb-6 md:text-5xl transition-colors">
              What People Say
            </h2>
            <p className="mx-auto max-w-2xl text-base text-text-light dark:text-text-dark-light sm:text-lg transition-colors">
              Real stories from our community
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8"
          >
            {/* Testimonial 1 - Taller */}
            <motion.div variants={scaleIn}>
              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="flex h-full flex-col transition-all duration-300 hover:shadow-medium dark:hover:shadow-dark-medium border-2 hover:border-primary/20 dark:hover:border-primary-dark-mode/20">
                <CardContent className="flex flex-1 flex-col px-6 pt-8 sm:px-8 sm:pt-10">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary dark:bg-primary-dark-mode/20 dark:text-primary-dark-mode sm:h-14 sm:w-14 sm:text-xl transition-colors">
                      PS
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-text dark:text-text-dark sm:text-base transition-colors">Priya S.</p>
                      <Badge variant="outline" className="mt-1 text-xs">Vital</Badge>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-warning text-warning sm:h-5 sm:w-5" />
                      ))}
                    </div>
                  </div>
                  <p className="mb-4 flex-1 text-sm italic leading-relaxed text-text dark:text-text-dark sm:text-base transition-colors">
                    "{t('home.testimonials.priya')}"
                  </p>
                </CardContent>
              </Card>
              </motion.div>
            </motion.div>

            {/* Testimonial 2 - Medium */}
            <motion.div variants={scaleIn}>
              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="flex h-full flex-col transition-all duration-300 hover:shadow-medium dark:hover:shadow-dark-medium border-2 hover:border-secondary/20 dark:hover:border-secondary-dark-mode/20">
                <CardContent className="flex flex-1 flex-col px-6 pt-8 sm:px-8 sm:pt-10">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary/10 text-lg font-bold text-secondary dark:bg-secondary-dark-mode/20 dark:text-secondary-dark-mode sm:h-14 sm:w-14 sm:text-xl transition-colors">
                      RK
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-text dark:text-text-dark sm:text-base transition-colors">Rajesh K.</p>
                      <Badge variant="outline" className="mt-1 text-xs">Guardian</Badge>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-warning text-warning sm:h-5 sm:w-5" />
                      ))}
                    </div>
                  </div>
                  <p className="mb-4 flex-1 text-sm italic leading-relaxed text-text dark:text-text-dark sm:text-base transition-colors">
                    "{t('home.testimonials.rajesh')}"
                  </p>
                </CardContent>
              </Card>
              </motion.div>
            </motion.div>

            {/* Testimonial 3 - Taller */}
            <motion.div variants={scaleIn} className="sm:col-span-2 md:col-span-1">
              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="flex h-full flex-col transition-all duration-300 hover:shadow-medium dark:hover:shadow-dark-medium border-2 hover:border-sage/20 dark:hover:border-sage-dark-mode/20">
                <CardContent className="flex flex-1 flex-col px-6 pt-8 sm:px-8 sm:pt-10">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-sage/10 text-lg font-bold text-sage dark:bg-sage-dark-mode/20 dark:text-sage-dark-mode sm:h-14 sm:w-14 sm:text-xl transition-colors">
                      AM
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-text dark:text-text-dark sm:text-base transition-colors">Anjali M.</p>
                      <Badge variant="outline" className="mt-1 text-xs">Vital</Badge>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-warning text-warning sm:h-5 sm:w-5" />
                      ))}
                    </div>
                  </div>
                  <p className="mb-4 flex-1 text-sm italic leading-relaxed text-text dark:text-text-dark sm:text-base transition-colors">
                    "{t('home.testimonials.anjali')}"
                  </p>
                </CardContent>
              </Card>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pre-footer CTA */}
      <section className="bg-gradient-to-br from-primary/10 via-sage/10 to-secondary/5 dark:from-primary-dark-mode/10 dark:via-sage-dark-mode/10 dark:to-secondary-dark-mode/5 py-16 sm:py-20 md:py-24">
        <div className="container mx-auto px-4 text-center sm:px-6">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="mx-auto max-w-3xl"
          >
            <h2 className="mb-4 text-3xl font-bold text-text dark:text-text-dark sm:text-4xl sm:mb-6 md:text-5xl transition-colors">
              Ready to Get Started?
            </h2>
            <p className="mb-8 text-lg text-text-light dark:text-text-dark-light sm:text-xl sm:mb-10 md:mb-12 transition-colors">
              Join thousands of Vitals and Guardians building meaningful connections through compassionate care
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <Link href="/auth/register?role=VITAL" className="w-full sm:w-auto">
                <Button size="lg" className="group w-full text-base shadow-medium hover:shadow-lg transition-all sm:text-lg">
                  Find a Guardian
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/auth/register?role=GUARDIAN" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="group w-full text-base shadow-medium hover:shadow-lg transition-all sm:text-lg">
                  Become a Guardian
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
