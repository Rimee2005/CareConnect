'use client';

import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, FileText } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function PrivacyPolicyPage() {
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
                <Shield className="h-8 w-8 text-primary dark:text-primary-dark-mode" />
              </div>
            </div>
            <h1 className="mb-4 text-3xl font-bold text-text dark:text-text-dark sm:text-4xl md:text-5xl transition-colors">
              {t('pages.privacy.title')}
            </h1>
            <p className="text-sm text-text-muted dark:text-text-dark-muted transition-colors">
              {t('pages.privacy.lastUpdated')}: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Introduction */}
          <Card className="mb-6 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-text dark:text-text-dark transition-colors">
                {t('pages.privacy.introduction')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm sm:text-base leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                {t('pages.privacy.introductionDesc1')}
              </p>
              <p className="text-sm sm:text-base leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                {t('pages.privacy.introductionDesc2')}
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="mb-6 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl text-text dark:text-text-dark transition-colors">
                <FileText className="h-5 w-5 text-primary dark:text-primary-dark-mode" />
                {t('pages.privacy.informationWeCollect')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-text dark:text-text-dark transition-colors">
                  {t('pages.privacy.personalInformation')}
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                  {t('pages.privacy.personalInformationDesc')}
                </p>
                <ul className="mt-2 ml-6 list-disc space-y-2 text-sm sm:text-base text-text-light dark:text-text-dark-light transition-colors">
                  <li>{t('pages.privacy.personalInfoItem1')}</li>
                  <li>{t('pages.privacy.personalInfoItem2')}</li>
                  <li>{t('pages.privacy.personalInfoItem3')}</li>
                  <li>{t('pages.privacy.personalInfoItem4')}</li>
                  <li>{t('pages.privacy.personalInfoItem5')}</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-text dark:text-text-dark transition-colors">
                  {t('pages.privacy.usageInformation')}
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                  {t('pages.privacy.usageInformationDesc')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card className="mb-6 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl text-text dark:text-text-dark transition-colors">
                <Eye className="h-5 w-5 text-primary dark:text-primary-dark-mode" />
                {t('pages.privacy.howWeUse')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm sm:text-base leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                {t('pages.privacy.howWeUseDesc')}
              </p>
              <ul className="ml-6 list-disc space-y-2 text-sm sm:text-base text-text-light dark:text-text-dark-light transition-colors">
                <li>{t('pages.privacy.howWeUseItem1')}</li>
                <li>{t('pages.privacy.howWeUseItem2')}</li>
                <li>{t('pages.privacy.howWeUseItem3')}</li>
                <li>{t('pages.privacy.howWeUseItem4')}</li>
                <li>{t('pages.privacy.howWeUseItem5')}</li>
                <li>{t('pages.privacy.howWeUseItem6')}</li>
                <li>{t('pages.privacy.howWeUseItem7')}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="mb-6 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl text-text dark:text-text-dark transition-colors">
                <Lock className="h-5 w-5 text-primary dark:text-primary-dark-mode" />
                {t('pages.privacy.dataSecurity')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm sm:text-base leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                {t('pages.privacy.dataSecurityDesc')}
              </p>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="mb-6 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-text dark:text-text-dark transition-colors">
                {t('pages.privacy.yourRights')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm sm:text-base leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                {t('pages.privacy.yourRightsDesc')}
              </p>
              <ul className="ml-6 list-disc space-y-2 text-sm sm:text-base text-text-light dark:text-text-dark-light transition-colors">
                <li>{t('pages.privacy.yourRightsItem1')}</li>
                <li>{t('pages.privacy.yourRightsItem2')}</li>
                <li>{t('pages.privacy.yourRightsItem3')}</li>
                <li>{t('pages.privacy.yourRightsItem4')}</li>
                <li>{t('pages.privacy.yourRightsItem5')}</li>
                <li>{t('pages.privacy.yourRightsItem6')}</li>
                <li>{t('pages.privacy.yourRightsItem7')}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Us */}
          <Card className="transition-colors">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-text dark:text-text-dark transition-colors">
                {t('pages.privacy.contactUs')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                {t('pages.privacy.contactUsDesc')}
              </p>
              <div className="mt-4 space-y-2 text-sm sm:text-base text-text-light dark:text-text-dark-light transition-colors">
                <p>
                  <strong>{t('pages.privacy.email')}:</strong> privacy@careconnect.com
                </p>
                <p>
                  <strong>{t('pages.privacy.phone')}:</strong> +91 123 456 7890
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

