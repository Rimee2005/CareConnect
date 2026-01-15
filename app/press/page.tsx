'use client';

import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Mail, Download, Calendar } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import Link from 'next/link';

export default function PressPage() {
  const { t } = useTranslation();

  const pressReleases = [
    {
      title: t('pages.press.release1.title'),
      date: '2024-01-15',
      description: t('pages.press.release1.desc'),
    },
    {
      title: t('pages.press.release2.title'),
      date: '2024-02-20',
      description: t('pages.press.release2.desc'),
    },
    {
      title: t('pages.press.release3.title'),
      date: '2024-03-10',
      description: t('pages.press.release3.desc'),
    },
  ];

  const mediaKit = {
    logo: t('pages.press.logoDesc'),
    photos: t('pages.press.photosDesc'),
    factSheet: t('pages.press.factSheetDesc'),
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark transition-colors">
      <Navbar />

      <div className="container mx-auto px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-8 text-center sm:mb-12">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-dark-mode/20">
                <FileText className="h-8 w-8 text-primary dark:text-primary-dark-mode" />
              </div>
            </div>
            <h1 className="mb-4 text-3xl font-bold text-text dark:text-text-dark sm:text-4xl md:text-5xl transition-colors">
              {t('pages.press.title')}
            </h1>
            <p className="text-base text-text-light dark:text-text-dark-light sm:text-lg transition-colors">
              {t('pages.press.description')}
            </p>
          </div>

          {/* Contact Information */}
          <Card className="mb-8 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-text dark:text-text-dark transition-colors">
                {t('pages.press.mediaInquiries')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm sm:text-base leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                {t('pages.press.mediaInquiriesDesc')}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary dark:text-primary-dark-mode" />
                  <div>
                    <p className="text-sm font-medium text-text dark:text-text-dark transition-colors">
                      press@careconnect.com
                    </p>
                    <p className="text-xs text-text-muted dark:text-text-dark-muted transition-colors">
                      {t('pages.press.mediaInquiriesLabel')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary dark:text-primary-dark-mode" />
                  <div>
                    <p className="text-sm font-medium text-text dark:text-text-dark transition-colors">
                      {t('pages.press.responseTime')}
                    </p>
                    <p className="text-xs text-text-muted dark:text-text-dark-muted transition-colors">
                      {t('pages.press.responseTimeValue')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Press Releases */}
          <div className="mb-8">
            <h2 className="mb-6 text-2xl font-bold text-text dark:text-text-dark sm:text-3xl transition-colors">
              {t('pages.press.pressReleases')}
            </h2>
            <div className="space-y-4">
              {pressReleases.map((release, index) => (
                <Card key={index} className="transition-colors">
                  <CardHeader>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <CardTitle className="text-lg sm:text-xl text-text dark:text-text-dark transition-colors">
                        {release.title}
                      </CardTitle>
                      <span className="text-xs text-text-muted dark:text-text-dark-muted transition-colors">
                        {new Date(release.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm sm:text-base leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                      {release.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Media Kit */}
          <Card className="transition-colors">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-text dark:text-text-dark transition-colors">
                {t('pages.press.mediaKit')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm sm:text-base leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                {t('pages.press.mediaKitDesc')}
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="transition-colors">
                  <CardContent className="pt-6">
                    <div className="mb-3 flex items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-dark-mode/20">
                        <Download className="h-6 w-6 text-primary dark:text-primary-dark-mode" />
                      </div>
                    </div>
                    <h3 className="mb-2 text-center text-sm font-semibold text-text dark:text-text-dark transition-colors">
                      {t('pages.press.logo')}
                    </h3>
                    <p className="text-center text-xs text-text-light dark:text-text-dark-light transition-colors">
                      {t('pages.press.logoDesc')}
                    </p>
                    <Button variant="outline" size="sm" className="mt-4 w-full">
                      {t('pages.press.download')}
                    </Button>
                  </CardContent>
                </Card>
                <Card className="transition-colors">
                  <CardContent className="pt-6">
                    <div className="mb-3 flex items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-dark-mode/20">
                        <Download className="h-6 w-6 text-primary dark:text-primary-dark-mode" />
                      </div>
                    </div>
                    <h3 className="mb-2 text-center text-sm font-semibold text-text dark:text-text-dark transition-colors">
                      {t('pages.press.photos')}
                    </h3>
                    <p className="text-center text-xs text-text-light dark:text-text-dark-light transition-colors">
                      {t('pages.press.photosDesc')}
                    </p>
                    <Button variant="outline" size="sm" className="mt-4 w-full">
                      {t('pages.press.download')}
                    </Button>
                  </CardContent>
                </Card>
                <Card className="transition-colors">
                  <CardContent className="pt-6">
                    <div className="mb-3 flex items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-dark-mode/20">
                        <Download className="h-6 w-6 text-primary dark:text-primary-dark-mode" />
                      </div>
                    </div>
                    <h3 className="mb-2 text-center text-sm font-semibold text-text dark:text-text-dark transition-colors">
                      {t('pages.press.factSheet')}
                    </h3>
                    <p className="text-center text-xs text-text-light dark:text-text-dark-light transition-colors">
                      {t('pages.press.factSheetDesc')}
                    </p>
                    <Button variant="outline" size="sm" className="mt-4 w-full">
                      {t('pages.press.download')}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Contact CTA */}
          <Card className="mt-8 transition-colors">
            <CardContent className="pt-6 text-center">
              <h3 className="mb-4 text-xl font-semibold text-text dark:text-text-dark transition-colors">
                {t('pages.press.needMoreInfo')}
              </h3>
              <p className="mb-6 text-sm sm:text-base text-text-light dark:text-text-dark-light transition-colors">
                {t('pages.press.needMoreInfoDesc')}
              </p>
              <Link href="/contact">
                <Button>
                  <Mail className="mr-2 h-4 w-4" />
                  {t('pages.press.contactPressTeam')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

