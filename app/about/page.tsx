'use client';

import { useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Target, Users, Eye, Shield, CheckCircle, Clock, Star, Sparkles } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function AboutPage() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Update HTML lang attribute when language changes
    if (typeof document !== 'undefined') {
      document.documentElement.lang = i18n.language;
    }
  }, [i18n.language]);

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark transition-colors">
      <Navbar />

      <div className="container mx-auto px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          {/* Hero Section */}
          <div className="mb-12 text-center sm:mb-16">
            <h1 className="mb-4 text-3xl font-bold text-text dark:text-text-dark sm:text-4xl sm:mb-6 md:text-5xl transition-colors">
              {t('about.title')}
            </h1>
            <p className="mx-auto max-w-3xl text-base text-text-light dark:text-text-dark-light sm:text-lg md:text-xl transition-colors">
              {t('about.mission.content')}
            </p>
          </div>

          {/* Mission Section */}
          <Card className="mb-8 sm:mb-12 transition-colors">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl md:text-3xl text-text dark:text-text-dark transition-colors">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary dark:text-primary-dark-mode transition-colors flex-shrink-0" />
                {t('about.mission.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                {t('about.mission.content')}
              </p>
            </CardContent>
          </Card>

          {/* Vision Section */}
          <Card className="mb-8 sm:mb-12 transition-colors">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl md:text-3xl text-text dark:text-text-dark transition-colors">
                <Eye className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-secondary dark:text-secondary-dark-mode transition-colors flex-shrink-0" />
                {t('about.vision.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <p className="text-sm sm:text-base md:text-lg leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                {t('about.vision.content')}
              </p>
            </CardContent>
          </Card>

          {/* For Vitals and Guardians */}
          <div className="mb-8 grid gap-6 sm:mb-12 sm:grid-cols-2 md:gap-8">
            <Card className="transition-colors">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl text-text dark:text-text-dark transition-colors">
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-secondary dark:text-secondary-dark-mode transition-colors flex-shrink-0" />
                  {t('about.forVitals.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <p className="text-sm sm:text-base leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                  {t('about.forVitals.content')}
                </p>
              </CardContent>
            </Card>

            <Card className="transition-colors">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl text-text dark:text-text-dark transition-colors">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-sage dark:text-sage-dark-mode transition-colors flex-shrink-0" />
                  {t('about.forGuardians.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <p className="text-sm sm:text-base leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                  {t('about.forGuardians.content')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Our Story */}
          <Card className="mb-8 sm:mb-12 transition-colors">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl md:text-3xl text-text dark:text-text-dark transition-colors">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary dark:text-primary-dark-mode transition-colors flex-shrink-0" />
                {t('about.story.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 space-y-4">
              <p className="text-sm sm:text-base leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                {t('about.story.content1')}
              </p>
              <p className="text-sm sm:text-base leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                {t('about.story.content2')}
              </p>
              <p className="text-sm sm:text-base leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                {t('about.story.content3')}
              </p>
            </CardContent>
          </Card>

          {/* Our Values */}
          <Card className="mb-8 sm:mb-12 transition-colors">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl text-text dark:text-text-dark transition-colors">
                {t('about.values.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-lg sm:text-xl font-semibold text-primary dark:text-primary-dark-mode transition-colors">
                    <Heart className="h-5 w-5 flex-shrink-0" />
                    {t('about.values.compassion')}
                  </h3>
                  <p className="text-sm sm:text-base text-text-light dark:text-text-dark-light transition-colors">
                    {t('about.values.compassion.desc')}
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-lg sm:text-xl font-semibold text-primary dark:text-primary-dark-mode transition-colors">
                    <Shield className="h-5 w-5 flex-shrink-0" />
                    {t('about.values.trust')}
                  </h3>
                  <p className="text-sm sm:text-base text-text-light dark:text-text-dark-light transition-colors">
                    {t('about.values.trust.desc')}
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-lg sm:text-xl font-semibold text-primary dark:text-primary-dark-mode transition-colors">
                    <Star className="h-5 w-5 flex-shrink-0" />
                    {t('about.values.excellence')}
                  </h3>
                  <p className="text-sm sm:text-base text-text-light dark:text-text-dark-light transition-colors">
                    {t('about.values.excellence.desc')}
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-lg sm:text-xl font-semibold text-primary dark:text-primary-dark-mode transition-colors">
                    <Users className="h-5 w-5 flex-shrink-0" />
                    {t('about.values.community')}
                  </h3>
                  <p className="text-sm sm:text-base text-text-light dark:text-text-dark-light transition-colors">
                    {t('about.values.community.desc')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Why CareConnect */}
          <Card className="transition-colors">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl text-text dark:text-text-dark transition-colors">
                {t('about.why.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-dark-mode/20 transition-colors flex-shrink-0">
                      <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary dark:text-primary-dark-mode transition-colors" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-text dark:text-text-dark transition-colors">
                      {t('about.why.verified')}
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-text-light dark:text-text-dark-light transition-colors">
                    {t('about.why.verified.desc')}
                  </p>
                </div>
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-secondary/10 dark:bg-secondary-dark-mode/20 transition-colors flex-shrink-0">
                      <Star className="h-5 w-5 sm:h-6 sm:w-6 text-secondary dark:text-secondary-dark-mode transition-colors" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-text dark:text-text-dark transition-colors">
                      {t('about.why.transparent')}
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-text-light dark:text-text-dark-light transition-colors">
                    {t('about.why.transparent.desc')}
                  </p>
                </div>
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-sage/10 dark:bg-sage-dark-mode/20 transition-colors flex-shrink-0">
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-sage dark:text-sage-dark-mode transition-colors" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-text dark:text-text-dark transition-colors">
                      {t('about.why.easy')}
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-text-light dark:text-text-dark-light transition-colors">
                    {t('about.why.easy.desc')}
                  </p>
                </div>
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-dark-mode/20 transition-colors flex-shrink-0">
                      <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary dark:text-primary-dark-mode transition-colors" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-text dark:text-text-dark transition-colors">
                      {t('about.why.support')}
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-text-light dark:text-text-dark-light transition-colors">
                    {t('about.why.support.desc')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
