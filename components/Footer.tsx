'use client';

import Link from 'next/link';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: t('footer.product.forVitals'), href: '/auth/register?role=VITAL' },
      { name: t('footer.product.forGuardians'), href: '/auth/register?role=GUARDIAN' },
      { name: t('footer.product.howItWorks'), href: '/#how-it-works' },
      { name: t('footer.product.pricing'), href: '/pricing' },
    ],
    company: [
      { name: t('footer.company.about'), href: '/about' },
      { name: t('footer.company.press'), href: '/press' },
    ],
    support: [
      { name: t('footer.support.help'), href: '/help' },
      { name: t('footer.support.contact'), href: '/contact' },
      { name: t('footer.support.privacy'), href: '/privacy' },
      { name: t('footer.support.terms'), href: '/terms' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
  ];

  return (
    <footer className="relative w-full border-t border-border/80 dark:border-border-dark/60 bg-[#f3efe6] dark:bg-background-dark-secondary shadow-[0_-2px_8px_rgba(0,0,0,0.03)] dark:shadow-[0_-2px_8px_rgba(0,0,0,0.2)]">
      <div className="container mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid gap-10 sm:gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand Column - Takes more space on large screens */}
          <div className="lg:col-span-5">
            {/* Logo */}
            <Link 
              href="/" 
              className="mb-5 inline-block transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
            >
              <h3 className="text-2xl font-bold tracking-tight text-primary dark:text-primary-dark-mode sm:text-3xl">
                CareConnect
              </h3>
            </Link>
            
            {/* Description */}
            <p className="mb-8 max-w-md text-sm leading-relaxed text-text/80 dark:text-text-dark/80 sm:text-base">
              {t('footer.description')}
            </p>
            
            {/* Contact Info - Better Grouped */}
            <div className="mb-8 space-y-3.5">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary/80 dark:text-primary-dark-mode/80" />
                <a 
                  href="mailto:support@careconnect.com" 
                  className="text-sm text-text/70 transition-all duration-200 hover:text-primary hover:underline dark:text-text-dark/70 dark:hover:text-primary-dark-mode focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
                >
                  support@careconnect.com
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary/80 dark:text-primary-dark-mode/80" />
                <a 
                  href="tel:+911234567890" 
                  className="text-sm text-text/70 transition-all duration-200 hover:text-primary hover:underline dark:text-text-dark/70 dark:hover:text-primary-dark-mode focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
                >
                  +91 123 456 7890
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary/80 dark:text-primary-dark-mode/80" />
                <span className="text-sm text-text/70 dark:text-text-dark/70">
                  {t('footer.country')}
                </span>
              </div>
            </div>

            {/* Social Links - Enhanced Styling */}
            <div className="flex items-center gap-3">
              <span className="sr-only">Follow us on social media</span>
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      "bg-background border border-border/60 dark:bg-background-dark dark:border-border-dark/60",
                      "text-text/60 transition-all duration-200",
                      "hover:text-primary hover:border-primary hover:bg-primary/5",
                      "dark:hover:text-primary-dark-mode dark:hover:border-primary-dark-mode dark:hover:bg-primary-dark-mode/10",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
                    )}
                    aria-label={`Follow us on ${social.name}`}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Columns - Better Spacing */}
          <div className="grid gap-8 sm:grid-cols-3 lg:col-span-7 lg:grid-cols-3 lg:gap-6">
            {/* Product Links */}
            <div>
              <h4 className="mb-5 text-xs font-semibold uppercase tracking-wider text-text dark:text-text-dark sm:text-sm">
                {t('footer.product.title')}
              </h4>
              <ul className="space-y-3.5">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className={cn(
                        "text-sm text-text/70 transition-all duration-200",
                        "hover:text-primary hover:translate-x-0.5",
                        "dark:text-text-dark/70 dark:hover:text-primary-dark-mode",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
                      )}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="mb-5 text-xs font-semibold uppercase tracking-wider text-text dark:text-text-dark sm:text-sm">
                {t('footer.company.title')}
              </h4>
              <ul className="space-y-3.5">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className={cn(
                        "text-sm text-text/70 transition-all duration-200",
                        "hover:text-primary hover:translate-x-0.5",
                        "dark:text-text-dark/70 dark:hover:text-primary-dark-mode",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
                      )}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="mb-5 text-xs font-semibold uppercase tracking-wider text-text dark:text-text-dark sm:text-sm">
                {t('footer.support.title')}
              </h4>
              <ul className="space-y-3.5">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className={cn(
                        "text-sm text-text/70 transition-all duration-200",
                        "hover:text-primary hover:translate-x-0.5",
                        "dark:text-text-dark/70 dark:hover:text-primary-dark-mode",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
                      )}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Enhanced */}
        <div className="mt-12 border-t border-border/60 dark:border-border-dark/60 pt-8 sm:mt-16 sm:pt-10">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-6">
            <p className="text-sm text-text/70 dark:text-text-dark/70 sm:text-base">
              © {currentYear} CareConnect. {t('footer.copyright')}
            </p>
            <div className="flex items-center gap-2 text-sm text-text/70 dark:text-text-dark/70 sm:text-base">
              <span>{t('footer.madeWith')}</span>
              <Heart className="h-4 w-4 fill-secondary text-secondary transition-transform duration-200 hover:scale-110 dark:fill-secondary-dark-mode dark:text-secondary-dark-mode" />
              <span>{t('footer.forHealthcare')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
