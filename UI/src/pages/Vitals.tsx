import React, { useState } from 'react';
import { Search, Filter, Map as MapIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import VitalCard, { Vital } from '../components/VitalCard';
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
const mockVitals: Vital[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    age: 78,
    condition: 'Post-surgery recovery, needs assistance with daily activities',
    urgency: 'high',
    location: 'Downtown Medical District',
    distance: 2.3,
    description: 'Recovering from hip replacement surgery. Need help with mobility, medication reminders, and light housekeeping. Gentle and patient care needed.',
    lastActive: '5 minutes ago',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face'
  },
  {
    id: '2',
    name: 'Robert Chen',
    age: 65,
    condition: 'Diabetes management and companionship',
    urgency: 'medium',
    location: 'Riverside District',
    distance: 4.7,
    description: 'Type 2 diabetes requiring meal planning assistance and blood sugar monitoring. Looking for companionship and help with grocery shopping.',
    lastActive: '1 hour ago',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
  },
  {
    id: '3',
    name: 'Maria Rodriguez',
    age: 45,
    condition: 'Recovering from illness, temporary assistance needed',
    urgency: 'low',
    location: 'Suburban Heights',
    distance: 6.1,
    description: 'Recovering from pneumonia, need temporary help with childcare pickup and meal preparation for 2 weeks.',
    lastActive: '3 hours ago',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'
  },
  {
    id: '4',
    name: 'William Thompson',
    age: 82,
    condition: 'Alzheimer\'s care and supervision',
    urgency: 'high',
    location: 'Garden District',
    distance: 3.2,
    description: 'Early-stage Alzheimer\'s, needs supervision and cognitive stimulation activities. Family seeks experienced, compassionate caregiver.',
    lastActive: '2 hours ago',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face'
  }
];

const Vitals = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVital, setSelectedVital] = useState<Vital | null>(null);
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [showMap, setShowMap] = useState(false);

  const filteredVitals = mockVitals.filter(vital => {
    const matchesSearch = vital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vital.condition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUrgency = urgencyFilter === 'all' || vital.urgency === urgencyFilter;
    return matchesSearch && matchesUrgency;
  });

  const handleViewProfile = (vital: Vital) => {
    setSelectedVital(vital);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border/50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {t('vitals')} - Patients in Need
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with patients who need compassionate care and support
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
                placeholder="Search by name or condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency Levels</SelectItem>
                <SelectItem value="high">High Urgency</SelectItem>
                <SelectItem value="medium">Medium Urgency</SelectItem>
                <SelectItem value="low">Low Urgency</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowMap(!showMap)}
            className="w-full md:w-auto"
          >
            <MapIcon className="h-4 w-4 mr-2" />
            {showMap ? 'Hide Map' : 'Show Map'}
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 pb-12">
        {showMap && (
          <div className="mb-8 bg-card rounded-lg border border-border/50 p-4">
            <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
              <p className="text-muted-foreground">Map integration would be implemented here</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVitals.map((vital) => (
            <VitalCard
              key={vital.id}
              vital={vital}
              onViewProfile={handleViewProfile}
            />
          ))}
        </div>

        {filteredVitals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No patients found matching your criteria.
            </p>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      <Dialog open={selectedVital !== null} onOpenChange={() => setSelectedVital(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Patient Profile</DialogTitle>
          </DialogHeader>
          {selectedVital && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedVital.image}
                  alt={selectedVital.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-xl font-semibold">{selectedVital.name}</h3>
                  <p className="text-muted-foreground">Age: {selectedVital.age}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Condition</h4>
                <p className="text-muted-foreground">{selectedVital.condition}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{selectedVital.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-1">Location</h4>
                  <p className="text-muted-foreground">{selectedVital.location}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Distance</h4>
                  <p className="text-muted-foreground">{selectedVital.distance}km away</p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button className="flex-1 btn-care">
                  Connect with Patient
                </Button>
                <Button variant="outline" className="flex-1">
                  Message Family
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Vitals;