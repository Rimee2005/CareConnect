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
    <footer className="relative w-full border-t border-border/80 dark:border-border-dark/60 bg-gradient-to-b from-[#f3efe6] to-[#f3efe6]/95 dark:from-background-dark-secondary dark:to-background-dark-secondary/95 shadow-[0_-2px_8px_rgba(0,0,0,0.03)] dark:shadow-[0_-2px_8px_rgba(0,0,0,0.2)]">
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid gap-5 sm:gap-6 lg:grid-cols-12 lg:gap-5">
          {/* Brand Column - Takes more space on large screens */}
          <div className="lg:col-span-5">
            {/* Logo */}
            <Link 
              href="/" 
              className="mb-3 inline-block transition-opacity duration-300 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
            >
              <h3 className="text-2xl font-bold tracking-tight text-primary dark:text-primary-dark-mode sm:text-3xl">
                CareConnect
              </h3>
            </Link>
            
            {/* Description */}
            <p className="mb-5 max-w-md text-base leading-relaxed text-text/80 dark:text-text-dark/80 sm:text-lg">
              {t('footer.description')}
            </p>
            
            {/* Contact Info - Better Grouped */}
            <div className="mb-5 space-y-2.5">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary/80 dark:text-primary-dark-mode/80" />
                <a 
                  href="mailto:support@careconnect.com" 
                  className="text-base text-text/70 transition-all duration-300 hover:text-primary hover:underline dark:text-text-dark/70 dark:hover:text-primary-dark-mode focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
                >
                  support@careconnect.com
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary/80 dark:text-primary-dark-mode/80" />
                <a 
                  href="tel:+911234567890" 
                  className="text-base text-text/70 transition-all duration-300 hover:text-primary hover:underline dark:text-text-dark/70 dark:hover:text-primary-dark-mode focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 rounded"
                >
                  +91 123 456 7890
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary/80 dark:text-primary-dark-mode/80" />
                <span className="text-base text-text/70 dark:text-text-dark/70">
                  {t('footer.country')}
                </span>
              </div>
            </div>

            {/* Social Links - Enhanced Styling */}
            <div className="flex items-center gap-2.5">
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
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      "bg-background border border-border/60 dark:bg-background-dark dark:border-border-dark/60",
                      "text-text/60 transition-all duration-300 ease-out",
                      "hover:text-primary hover:border-primary hover:bg-primary/5",
                      "dark:hover:text-primary-dark-mode dark:hover:border-primary-dark-mode dark:hover:bg-primary-dark-mode/10",
                      "hover:-translate-y-0.5 hover:shadow-md",
                      "active:translate-y-0 active:shadow-sm",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2"
                    )}
                    aria-label={`Follow us on ${social.name}`}
                  >
                    <Icon className="h-4 w-4 transition-transform duration-300" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Columns - Better Spacing */}
          <div className="grid gap-5 sm:grid-cols-3 lg:col-span-7 lg:grid-cols-3 lg:gap-4">
            {/* Product Links */}
            <div>
              <h4 className="mb-3.5 text-sm font-bold uppercase tracking-[0.08em] text-text dark:text-text-dark sm:text-base">
                {t('footer.product.title')}
              </h4>
              <ul className="space-y-2">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className={cn(
                        "text-base text-text/70 transition-all duration-300 ease-out inline-block",
                        "hover:text-primary hover:translate-x-1",
                        "dark:text-text-dark/70 dark:hover:text-primary-dark-mode",
                        "active:translate-x-0.5",
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
              <h4 className="mb-3.5 text-sm font-bold uppercase tracking-[0.08em] text-text dark:text-text-dark sm:text-base">
                {t('footer.company.title')}
              </h4>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className={cn(
                        "text-base text-text/70 transition-all duration-300 ease-out inline-block",
                        "hover:text-primary hover:translate-x-1",
                        "dark:text-text-dark/70 dark:hover:text-primary-dark-mode",
                        "active:translate-x-0.5",
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
              <h4 className="mb-3.5 text-sm font-bold uppercase tracking-[0.08em] text-text dark:text-text-dark sm:text-base">
                {t('footer.support.title')}
              </h4>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className={cn(
                        "text-base text-text/70 transition-all duration-300 ease-out inline-block",
                        "hover:text-primary hover:translate-x-1",
                        "dark:text-text-dark/70 dark:hover:text-primary-dark-mode",
                        "active:translate-x-0.5",
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
        <div className="mt-6 border-t border-border/60 dark:border-border-dark/60 pt-5 sm:mt-8 sm:pt-6">
          <div className="flex flex-col items-center justify-center gap-2.5 text-center sm:flex-row sm:justify-between sm:gap-4 sm:text-left">
            <p className="text-sm text-text/60 dark:text-text-dark/60 sm:text-base">
              © {currentYear} CareConnect. {t('footer.copyright')}
            </p>
            <div className="flex items-center gap-1.5 text-sm text-text/60 dark:text-text-dark/60 sm:text-base">
              <span>{t('footer.madeWith')}</span>
              <Heart className="h-3.5 w-3.5 fill-secondary text-secondary transition-transform duration-300 hover:scale-110 dark:fill-secondary-dark-mode dark:text-secondary-dark-mode" />
              <span>{t('footer.forHealthcare')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
