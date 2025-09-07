import React from 'react';
import { MapPin, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from '../components/ui/badge';
// Update the path below to the correct relative path where useTranslation is located
import { useTranslation } from '../hooks/useTranslation';

export interface Vital {
  id: string;
  name: string;
  age: number;
  condition: string;
  urgency: 'low' | 'medium' | 'high';
  location: string;
  distance: number;
  image?: string;
  description: string;
  lastActive: string;
}

interface VitalCardProps {
  vital: Vital;
  onViewProfile: (vital: Vital) => void;
}

const VitalCard: React.FC<VitalCardProps> = ({ vital, onViewProfile }) => {
  const { t } = useTranslation();

  const urgencyColors = {
    low: 'status-low',
    medium: 'status-medium',
    high: 'status-high',
  };

  const urgencyIcons = {
    low: '🟢',
    medium: '🟡',
    high: '🔴',
  };

  return (
    <div className={`care-card p-6 h-full flex flex-col ${
      vital.urgency === 'high' ? 'care-card-urgent' : 
      vital.urgency === 'medium' ? 'care-card-moderate' : 
      'care-card-stable'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={vital.image} alt={vital.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {vital.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-card-foreground">{vital.name}</h3>
            <p className="text-sm text-muted-foreground">
              {t('age')}: {vital.age}
            </p>
          </div>
        </div>
        <Badge className={`${urgencyColors[vital.urgency]} text-xs font-medium`}>
          {urgencyIcons[vital.urgency]} {t(vital.urgency)}
        </Badge>
      </div>

      {/* Condition */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-card-foreground">
            {t('condition')}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{vital.condition}</p>
      </div>

      {/* Description */}
      <div className="mb-4 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {vital.description}
        </p>
      </div>

      {/* Location & Last Active */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{vital.location}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {vital.distance}km away
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Active {vital.lastActive}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <Button 
        onClick={() => onViewProfile(vital)}
        className="w-full btn-care"
        size="sm"
      >
        {t('viewProfile')}
      </Button>
    </div>
  );
};

export default VitalCard;