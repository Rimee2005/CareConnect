'use client';

import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Scale, AlertCircle, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function TermsOfServicePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark transition-colors">
      <Navbar />

      <div className="container mx-auto px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 text-center sm:mb-12">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-dark-mode/20">
                <Scale className="h-8 w-8 text-primary dark:text-primary-dark-mode" />
              </div>
            </div>
            <h1 className="mb-4 text-3xl font-bold text-text dark:text-text-dark sm:text-4xl md:text-5xl transition-colors">
              {t('pages.terms.title')}
            </h1>
            <p className="text-sm text-text-muted dark:text-text-dark-muted transition-colors">
              {t('pages.terms.lastUpdated')}: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Introduction */}
          <Card className="mb-6 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-text dark:text-text-dark transition-colors">
                {t('pages.terms.agreementToTerms')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm sm:text-base leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                {t('pages.terms.agreementToTermsDesc')}
              </p>
            </CardContent>
          </Card>

          {/* Use License */}
          <Card className="mb-6 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl text-text dark:text-text-dark transition-colors">
                <FileText className="h-5 w-5 text-primary dark:text-primary-dark-mode" />
                {t('pages.terms.useLicense')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm sm:text-base leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                {t('pages.terms.useLicenseDesc')}
              </p>
              <ul className="ml-6 list-disc space-y-2 text-sm sm:text-base text-text-light dark:text-text-dark-light transition-colors">
                <li>{t('pages.terms.useLicenseItem1')}</li>
                <li>{t('pages.terms.useLicenseItem2')}</li>
                <li>{t('pages.terms.useLicenseItem3')}</li>
                <li>{t('pages.terms.useLicenseItem4')}</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card className="mb-6 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl text-text dark:text-text-dark transition-colors">
                <CheckCircle className="h-5 w-5 text-primary dark:text-primary-dark-mode" />
                {t('pages.terms.userAccounts')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm sm:text-base leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                {t('pages.terms.userAccountsDesc')}
              </p>
              <ul className="ml-6 list-disc space-y-2 text-sm sm:text-base text-text-light dark:text-text-dark-light transition-colors">
                <li>{t('pages.terms.userAccountsItem1')}</li>
                <li>{t('pages.terms.userAccountsItem2')}</li>
                <li>{t('pages.terms.userAccountsItem3')}</li>
                <li>{t('pages.terms.userAccountsItem4')}</li>
                <li>{t('pages.terms.userAccountsItem5')}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Prohibited Uses */}
          <Card className="mb-6 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl text-text dark:text-text-dark transition-colors">
                <AlertCircle className="h-5 w-5 text-primary dark:text-primary-dark-mode" />
                {t('pages.terms.prohibitedUses')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm sm:text-base leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                {t('pages.terms.prohibitedUsesDesc')}
              </p>
              <ul className="ml-6 list-disc space-y-2 text-sm sm:text-base text-text-light dark:text-text-dark-light transition-colors">
                <li>{t('pages.terms.prohibitedUsesItem1')}</li>
                <li>{t('pages.terms.prohibitedUsesItem2')}</li>
                <li>{t('pages.terms.prohibitedUsesItem3')}</li>
                <li>{t('pages.terms.prohibitedUsesItem4')}</li>
                <li>{t('pages.terms.prohibitedUsesItem5')}</li>
                <li>{t('pages.terms.prohibitedUsesItem6')}</li>
                <li>{t('pages.terms.prohibitedUsesItem7')}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Service Availability */}
          <Card className="mb-6 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-text dark:text-text-dark transition-colors">
                {t('pages.terms.serviceAvailability')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm sm:text-base leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                {t('pages.terms.serviceAvailabilityDesc')}
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="mb-6 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-text dark:text-text-dark transition-colors">
                {t('pages.terms.limitationOfLiability')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm sm:text-base leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                {t('pages.terms.limitationOfLiabilityDesc')}
              </p>
            </CardContent>
          </Card>

          {/* Contact Us */}
          <Card className="transition-colors">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-text dark:text-text-dark transition-colors">
                {t('pages.terms.contactUs')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                {t('pages.terms.contactUsDesc')}
              </p>
              <div className="mt-4 space-y-2 text-sm sm:text-base text-text-light dark:text-text-dark-light transition-colors">
                <p>
                  <strong>{t('pages.terms.email')}:</strong> legal@careconnect.com
                </p>
                <p>
                  <strong>{t('pages.terms.phone')}:</strong> +91 123 456 7890
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

