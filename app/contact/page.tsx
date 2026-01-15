'use client';

import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useState } from 'react';

export default function ContactPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would send the form data to your backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
                <Mail className="h-8 w-8 text-primary dark:text-primary-dark-mode" />
              </div>
            </div>
            <h1 className="mb-4 text-3xl font-bold text-text dark:text-text-dark sm:text-4xl md:text-5xl transition-colors">
              {t('pages.contact.title')}
            </h1>
            <p className="text-base text-text-light dark:text-text-dark-light sm:text-lg transition-colors">
              {t('pages.contact.description')}
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-text dark:text-text-dark transition-colors">
                    <Mail className="h-5 w-5 text-primary dark:text-primary-dark-mode" />
                    {t('pages.contact.email')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href="mailto:support@careconnect.com"
                    className="text-sm sm:text-base text-text-light hover:text-primary dark:text-text-dark-light dark:hover:text-primary-dark-mode transition-colors"
                  >
                    support@careconnect.com
                  </a>
                  <p className="mt-2 text-xs text-text-muted dark:text-text-dark-muted transition-colors">
                    {t('pages.contact.respond24h')}
                  </p>
                </CardContent>
              </Card>

              <Card className="transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-text dark:text-text-dark transition-colors">
                    <Phone className="h-5 w-5 text-primary dark:text-primary-dark-mode" />
                    {t('form.phone')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href="tel:+911234567890"
                    className="text-sm sm:text-base text-text-light hover:text-primary dark:text-text-dark-light dark:hover:text-primary-dark-mode transition-colors"
                  >
                    +91 123 456 7890
                  </a>
                  <p className="mt-2 text-xs text-text-muted dark:text-text-dark-muted transition-colors">
                    {t('pages.contact.phoneHours')}
                  </p>
                </CardContent>
              </Card>

              <Card className="transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-text dark:text-text-dark transition-colors">
                    <MapPin className="h-5 w-5 text-primary dark:text-primary-dark-mode" />
                    {t('form.address')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm sm:text-base text-text-light dark:text-text-dark-light transition-colors">
                    India
                  </p>
                  <p className="mt-2 text-xs text-text-muted dark:text-text-dark-muted transition-colors">
                    {t('pages.contact.servingNationwide')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="transition-colors">
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl text-text dark:text-text-dark transition-colors">
                    {t('pages.contact.sendMessage')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 dark:bg-success/20">
                        <CheckCircle className="h-8 w-8 text-success" />
                      </div>
                      <h3 className="mb-2 text-xl font-semibold text-text dark:text-text-dark transition-colors">
                        {t('pages.contact.success')}
                      </h3>
                      <p className="text-sm text-text-light dark:text-text-dark-light transition-colors">
                        {t('pages.contact.successMessage')}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="name" className="mb-2">
                            {t('pages.contact.name')}
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={t('form.name.placeholder')}
                            className="transition-colors"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="mb-2">
                            {t('pages.contact.email')}
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={t('form.email.placeholder')}
                            className="transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="subject" className="mb-2">
                          {t('pages.contact.subject')}
                        </Label>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder={t('pages.contact.subjectPlaceholder')}
                          className="transition-colors"
                        />
                      </div>
                      <div>
                        <Label htmlFor="message" className="mb-2">
                          {t('pages.contact.message')}
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          required
                          value={formData.message}
                          onChange={handleChange}
                          placeholder={t('pages.contact.messagePlaceholder')}
                          rows={6}
                          className="transition-colors"
                        />
                      </div>
                      <Button type="submit" className="w-full sm:w-auto">
                        <Send className="mr-2 h-4 w-4" />
                        {t('pages.contact.send')}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

