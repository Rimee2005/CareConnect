import React, { useState } from 'react';
import { Search, Filter, Map as MapIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import CompanionCard, { Companion } from '../components/CompanionCard';
import { useTranslation } from '../hooks/useTranslation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

// Mock data
const mockCompanions: Companion[] = [
  {
    id: '1',
    name: 'Emily Rodriguez',
    specialization: 'Elder Care',
    experience: 8,
    rating: 4.9,
    reviews: 127,
    location: 'Downtown Medical District',
    distance: 1.8,
    hourlyRate: 25,
    bio: 'Certified nursing assistant with 8 years of experience in elder care. Specializes in dementia care and post-surgical recovery. Bilingual (English/Spanish).',
    verified: true,
    availableNow: true,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face'
  },
  {
    id: '2',
    name: 'Michael Chen',
    specialization: 'Physiotherapy',
    experience: 12,
    rating: 4.8,
    reviews: 203,
    location: 'Riverside District',
    distance: 3.5,
    hourlyRate: 35,
    bio: 'Licensed physical therapist with expertise in mobility rehabilitation. Helped 200+ patients regain independence after injury or surgery.',
    verified: true,
    availableNow: false,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face'
  },
  {
    id: '3',
    name: 'Sarah Thompson',
    specialization: 'Mental Health',
    experience: 6,
    rating: 4.7,
    reviews: 89,
    location: 'Garden District',
    distance: 4.2,
    hourlyRate: 40,
    bio: 'Licensed clinical social worker specializing in anxiety and depression care for seniors. Provides companionship and emotional support.',
    verified: true,
    availableNow: true,
    image: 'https://images.unsplash.com/photo-1594824388647-82b3d4b9a372?w=400&h=400&fit=crop&crop=face'
  },
  {
    id: '4',
    name: 'David Johnson',
    specialization: 'Nursing Care',
    experience: 15,
    rating: 4.9,
    reviews: 156,
    location: 'Suburban Heights',
    distance: 5.1,
    hourlyRate: 45,
    bio: 'Registered nurse with extensive experience in home healthcare. Skilled in medication management, wound care, and chronic disease monitoring.',
    verified: true,
    availableNow: true,
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face'
  }
];

const Companions = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(null);
  const [specializationFilter, setSpecializationFilter] = useState<string>('all');
  const [showMap, setShowMap] = useState(false);

  const filteredCompanions = mockCompanions.filter(companion => {
    const matchesSearch = companion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         companion.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = specializationFilter === 'all' || 
                                 companion.specialization.toLowerCase() === specializationFilter.toLowerCase();
    return matchesSearch && matchesSpecialization;
  });

  const handleHire = (companion: Companion) => {
    setSelectedCompanion(companion);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary/10 to-primary/10 border-b border-border/50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {t('companions')} - {t('trustedCaretakers')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('findExperienced')}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t('filterBySpecialization')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allSpecializations')}</SelectItem>
                <SelectItem value="elder care">{t('elderCare')}</SelectItem>
                <SelectItem value="physiotherapy">{t('physiotherapy')}</SelectItem>
                <SelectItem value="mental health">{t('mentalHealth')}</SelectItem>
                <SelectItem value="nursing care">{t('nursingCare')}</SelectItem>
                <SelectItem value="child care">{t('childCare')}</SelectItem>
                <SelectItem value="disability care">{t('disabilityCare')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowMap(!showMap)}
            className="w-full md:w-auto"
          >
            <MapIcon className="h-4 w-4 mr-2" />
            {showMap ? t('hideMap') : t('showMap')}
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 pb-12">
        {showMap && (
          <div className="mb-8 bg-card rounded-lg border border-border/50 p-4">
            <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
              <p className="text-muted-foreground">{t('mapIntegration')}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCompanions.map((companion) => (
            <CompanionCard
              key={companion.id}
              companion={companion}
              onHire={handleHire}
            />
          ))}
        </div>

        {filteredCompanions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {t('noCaretakersFound')}
            </p>
          </div>
        )}
      </div>

      {/* Hire Modal */}
      <Dialog open={selectedCompanion !== null} onOpenChange={() => setSelectedCompanion(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('caretakerProfile')}</DialogTitle>
          </DialogHeader>
          {selectedCompanion && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedCompanion.image}
                  alt={selectedCompanion.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-xl font-semibold">{selectedCompanion.name}</h3>
                  <p className="text-muted-foreground">{selectedCompanion.specialization}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCompanion.experience} {t('yearsExperience')} • ⭐ {selectedCompanion.rating}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">{t('aboutSection')}</h4>
                <p className="text-muted-foreground">{selectedCompanion.bio}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1">{t('location')}</h4>
                  <p className="text-muted-foreground">{selectedCompanion.location}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{t('hourlyRate')}</h4>
                  <p className="text-muted-foreground">${selectedCompanion.hourlyRate}/{t('hour')}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">{t('reviews')} ({selectedCompanion.reviews})</h4>
                <div className="space-y-2">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm">"{t('excellent')}"</p>
                    <p className="text-xs text-muted-foreground mt-1">- Sarah M. ⭐⭐⭐⭐⭐</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button className="flex-1 btn-secondary-care">
                  {t('hireNow')}
                </Button>
                <Button variant="outline" className="flex-1">
                  {t('sendMessage')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Companions;