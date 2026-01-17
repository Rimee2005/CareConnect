'use client';

import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, Search, MessageCircle, Book, Phone, Mail } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import Link from 'next/link';
import { useState } from 'react';

export default function HelpCenterPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    {
      title: t('help.categories.gettingStarted'),
      icon: Book,
      questions: [
        {
          q: t('help.faq.gettingStarted.q1'),
          a: t('help.faq.gettingStarted.a1'),
        },
        {
          q: t('help.faq.gettingStarted.q2'),
          a: t('help.faq.gettingStarted.a2'),
        },
        {
          q: t('help.faq.gettingStarted.q3'),
          a: t('help.faq.gettingStarted.a3'),
        },
      ],
    },
    {
      title: t('help.categories.forVitals'),
      icon: HelpCircle,
      questions: [
        {
          q: t('help.faq.forVitals.q1'),
          a: t('help.faq.forVitals.a1'),
        },
        {
          q: t('help.faq.forVitals.q2'),
          a: t('help.faq.forVitals.a2'),
        },
        {
          q: t('help.faq.forVitals.q3'),
          a: t('help.faq.forVitals.a3'),
        },
        {
          q: t('help.faq.forVitals.q4'),
          a: t('help.faq.forVitals.a4'),
        },
      ],
    },
    {
      title: t('help.categories.forGuardians'),
      icon: MessageCircle,
      questions: [
        {
          q: t('help.faq.forGuardians.q1'),
          a: t('help.faq.forGuardians.a1'),
        },
        {
          q: t('help.faq.forGuardians.q2'),
          a: t('help.faq.forGuardians.a2'),
        },
        {
          q: t('help.faq.forGuardians.q3'),
          a: t('help.faq.forGuardians.a3'),
        },
        {
          q: t('help.faq.forGuardians.q4'),
          a: t('help.faq.forGuardians.a4'),
        },
      ],
    },
    {
      title: t('help.categories.account'),
      icon: Phone,
      questions: [
        {
          q: t('help.faq.account.q1'),
          a: t('help.faq.account.a1'),
        },
        {
          q: t('help.faq.account.q2'),
          a: t('help.faq.account.a2'),
        },
        {
          q: t('help.faq.account.q3'),
          a: t('help.faq.account.a3'),
        },
        {
          q: t('help.faq.account.q4'),
          a: t('help.faq.account.a4'),
        },
      ],
    },
  ];

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      qa => qa.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            qa.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark transition-colors">
      <Navbar />

      <div className="container mx-auto px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-8 text-center sm:mb-12">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-dark-mode/20">
                <HelpCircle className="h-8 w-8 text-primary dark:text-primary-dark-mode" />
              </div>
            </div>
            <h1 className="mb-4 text-3xl font-bold text-text dark:text-text-dark sm:text-4xl md:text-5xl transition-colors">
              {t('pages.help.title')}
            </h1>
            <p className="text-base text-text-light dark:text-text-dark-light sm:text-lg transition-colors">
              {t('pages.help.description')}
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted dark:text-text-dark-muted" />
              <input
                type="text"
                placeholder={t('pages.help.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark px-12 py-4 text-text dark:text-text-dark placeholder:text-text-muted dark:placeholder:text-text-dark-muted focus:border-primary dark:focus:border-primary-dark-mode focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary-dark-mode/20 transition-colors"
              />
            </div>
          </div>

          {/* Quick Contact */}
          <div className="mb-12 grid gap-4 sm:grid-cols-2">
            <Card className="transition-colors">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-text dark:text-text-dark transition-colors">
                    <Phone className="h-5 w-5 text-primary dark:text-primary-dark-mode" />
                    {t('help.contact.callUs')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm sm:text-base text-text-light dark:text-text-dark-light transition-colors">
                    +91 123 456 7890
                  </p>
                  <p className="mt-1 text-xs text-text-muted dark:text-text-dark-muted transition-colors">
                    {t('pages.contact.phoneHours')}
                  </p>
                </CardContent>
              </Card>
            <Card className="transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-text dark:text-text-dark transition-colors">
                  <Mail className="h-5 w-5 text-primary dark:text-primary-dark-mode" />
                  {t('help.contact.emailUs')}
                </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm sm:text-base text-text-light dark:text-text-dark-light transition-colors">
                    support@careconnect.com
                  </p>
                  <p className="mt-1 text-xs text-text-muted dark:text-text-dark-muted transition-colors">
                    {t('pages.contact.respond24h')}
                  </p>
                </CardContent>
              </Card>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {filteredFAQs.map((category, categoryIndex) => {
              const Icon = category.icon;
              return (
                <Card key={categoryIndex} className="transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl text-text dark:text-text-dark transition-colors">
                      <Icon className="h-5 w-5 text-primary dark:text-primary-dark-mode" />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {category.questions.map((qa, qaIndex) => (
                      <div key={qaIndex} className="border-b border-border dark:border-border-dark pb-4 last:border-0 transition-colors">
                        <h3 className="mb-2 text-base font-semibold text-text dark:text-text-dark sm:text-lg transition-colors">
                          {qa.q}
                        </h3>
                        <p className="text-sm leading-relaxed text-text-light dark:text-text-dark-light sm:text-base transition-colors">
                          {qa.a}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Still Need Help */}
          <Card className="mt-12 transition-colors">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-text dark:text-text-dark transition-colors">
                {t('help.stillNeedHelp')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm sm:text-base leading-relaxed text-text-light dark:text-text-dark-light transition-colors">
                {t('help.stillNeedHelpDesc')}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/contact" className="w-full sm:w-auto">
                  <Button className="w-full">
                    {t('help.contactSupport')}
                  </Button>
                </Link>
                <a href="mailto:support@careconnect.com" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full">
                    {t('help.contact.sendEmail')}
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

