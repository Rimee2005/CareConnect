import React from 'react';
import { MapPin, Star, Award, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { useTranslation } from '../hooks/useTranslation';

export interface Companion {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  reviews: number;
  location: string;
  distance: number;
  image?: string;
  hourlyRate: number;
  bio: string;
  verified: boolean;
  availableNow: boolean;
}

interface CompanionCardProps {
  companion: Companion;
  onHire: (companion: Companion) => void;
}

const CompanionCard: React.FC<CompanionCardProps> = ({ companion, onHire }) => {
  const { t } = useTranslation();

  return (
    <div className="care-card p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={companion.image} alt={companion.name} />
              <AvatarFallback className="bg-secondary/10 text-secondary">
                {companion.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {companion.verified && (
              <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1">
                <Award className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">{companion.name}</h3>
            <p className="text-sm text-muted-foreground">
              {companion.experience} {t('years')} {t('experience')}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-1 mb-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{companion.rating}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {companion.reviews} reviews
          </p>
        </div>
      </div>

      {/* Specialization */}
      <div className="mb-4">
        <Badge variant="secondary" className="text-xs">
          {companion.specialization}
        </Badge>
        {companion.availableNow && (
          <Badge variant="outline" className="text-xs ml-2 border-success text-success">
            <div className="w-2 h-2 bg-success rounded-full mr-1" />
            Available Now
          </Badge>
        )}
      </div>

      {/* Bio */}
      <div className="mb-4 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {companion.bio}
        </p>
      </div>

      {/* Location & Rate */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{companion.location}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {companion.distance}km away
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-card-foreground">
            ${companion.hourlyRate}/hour
          </span>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Quick response
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Button 
        onClick={() => onHire(companion)}
        className="w-full btn-secondary-care"
        size="sm"
      >
        {t('hireContact')}
      </Button>
    </div>
  );
};

export default CompanionCard;