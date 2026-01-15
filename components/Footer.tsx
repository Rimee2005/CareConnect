'use client';

import Link from 'next/link';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { motion } from 'framer-motion';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'For Vitals', href: '/auth/register?role=VITAL' },
      { name: 'For Guardians', href: '/auth/register?role=GUARDIAN' },
      { name: 'How it Works', href: '/#how-it-works' },
      { name: 'Pricing', href: '/#pricing' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/#careers' },
      { name: 'Blog', href: '/#blog' },
      { name: 'Press', href: '/#press' },
    ],
    support: [
      { name: 'Help Center', href: '/#help' },
      { name: 'Contact Us', href: '/#contact' },
      { name: 'Privacy Policy', href: '/#privacy' },
      { name: 'Terms of Service', href: '/#terms' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
  ];

  return (
    <footer className="w-full border-t-2 border-border dark:border-border-dark bg-background-secondary dark:bg-background-dark-secondary py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 inline-block">
              <h3 className="text-2xl font-bold text-primary dark:text-primary-dark-mode">
                CareConnect
              </h3>
            </Link>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-text dark:text-text-dark">
              {t('footer.description')}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-text dark:text-text-dark">
                <Mail className="h-4 w-4 text-primary dark:text-primary-dark-mode" />
                <a href="mailto:support@careconnect.com" className="hover:text-primary dark:hover:text-primary-dark-mode transition-colors">
                  support@careconnect.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-text dark:text-text-dark">
                <Phone className="h-4 w-4 text-primary dark:text-primary-dark-mode" />
                <a href="tel:+911234567890" className="hover:text-primary dark:hover:text-primary-dark-mode transition-colors">
                  +91 123 456 7890
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-text dark:text-text-dark">
                <MapPin className="h-4 w-4 text-primary dark:text-primary-dark-mode" />
                <span>India</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border dark:bg-background-dark dark:border-border-dark text-text hover:text-primary hover:border-primary dark:hover:text-primary-dark-mode dark:hover:border-primary-dark-mode transition-all"
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text dark:text-text-dark">
              {t('footer.product.title')}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/auth/register?role=VITAL"
                  className="text-sm text-text hover:text-primary dark:text-text-dark dark:hover:text-primary-dark-mode transition-colors"
                >
                  {t('footer.product.forVitals')}
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/register?role=GUARDIAN"
                  className="text-sm text-text hover:text-primary dark:text-text-dark dark:hover:text-primary-dark-mode transition-colors"
                >
                  {t('footer.product.forGuardians')}
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="text-sm text-text hover:text-primary dark:text-text-dark dark:hover:text-primary-dark-mode transition-colors"
                >
                  {t('footer.product.howItWorks')}
                </Link>
              </li>
              <li>
                <Link
                  href="/#pricing"
                  className="text-sm text-text hover:text-primary dark:text-text-dark dark:hover:text-primary-dark-mode transition-colors"
                >
                  {t('footer.product.pricing')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text dark:text-text-dark">
              {t('footer.company.title')}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-text hover:text-primary dark:text-text-dark dark:hover:text-primary-dark-mode transition-colors"
                >
                  {t('footer.company.about')}
                </Link>
              </li>
              <li>
                <Link
                  href="/#careers"
                  className="text-sm text-text hover:text-primary dark:text-text-dark dark:hover:text-primary-dark-mode transition-colors"
                >
                  {t('footer.company.careers')}
                </Link>
              </li>
              <li>
                <Link
                  href="/#blog"
                  className="text-sm text-text hover:text-primary dark:text-text-dark dark:hover:text-primary-dark-mode transition-colors"
                >
                  {t('footer.company.blog')}
                </Link>
              </li>
              <li>
                <Link
                  href="/#press"
                  className="text-sm text-text hover:text-primary dark:text-text-dark dark:hover:text-primary-dark-mode transition-colors"
                >
                  {t('footer.company.press')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text dark:text-text-dark">
              {t('footer.support.title')}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/#help"
                  className="text-sm text-text hover:text-primary dark:text-text-dark dark:hover:text-primary-dark-mode transition-colors"
                >
                  {t('footer.support.help')}
                </Link>
              </li>
              <li>
                <Link
                  href="/#contact"
                  className="text-sm text-text hover:text-primary dark:text-text-dark dark:hover:text-primary-dark-mode transition-colors"
                >
                  {t('footer.support.contact')}
                </Link>
              </li>
              <li>
                <Link
                  href="/#privacy"
                  className="text-sm text-text hover:text-primary dark:text-text-dark dark:hover:text-primary-dark-mode transition-colors"
                >
                  {t('footer.support.privacy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/#terms"
                  className="text-sm text-text hover:text-primary dark:text-text-dark dark:hover:text-primary-dark-mode transition-colors"
                >
                  {t('footer.support.terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border dark:border-border-dark pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-text dark:text-text-dark">
              © {currentYear} CareConnect. {t('footer.copyright')}
            </p>
            <div className="flex items-center gap-2 text-sm text-text dark:text-text-dark">
              <span>{t('footer.madeWith')}</span>
              <Heart className="h-4 w-4 fill-secondary text-secondary dark:fill-secondary-dark-mode" />
              <span>{t('footer.forHealthcare')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
