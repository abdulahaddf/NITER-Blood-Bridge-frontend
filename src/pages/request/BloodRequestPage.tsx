import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  HeartPulse, 
  MapPin, 
  Calendar, 
  Phone,
  AlertCircle,
  Check,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Calendar as CalendarComponent,
} from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuthContext } from '@/App';
import { useProfile } from '@/hooks/useProfile';
import { BloodGroupLabels, type BloodGroup, type BloodRequestFormData } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

const bloodGroups: BloodGroup[] = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];

const urgencyLevels = [
  { 
    value: 'routine', 
    label: 'Routine', 
    description: 'Within a few days',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Clock
  },
  { 
    value: 'urgent', 
    label: 'Urgent', 
    description: 'Within 24 hours',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: AlertCircle
  },
  { 
    value: 'critical', 
    label: 'Critical', 
    description: 'Immediate need',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: AlertTriangle
  },
];

export function BloodRequestPage() {
  const navigate = useNavigate();
  const auth = useAuthContext();
  const { profile } = useProfile(auth.user?.id);
  
  const [formData, setFormData] = useState<BloodRequestFormData>({
    bloodGroup: 'O_POS',
    urgency: 'routine',
    location: '',
    hospital: '',
    neededBy: undefined,
    contactPhone: profile?.phone || '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    
    if (formData.urgency === 'critical') {
      toast.success('Critical request submitted! Admins have been notified.');
    } else {
      toast.success('Blood request submitted successfully!');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container-max section-padding">
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-xl card-shadow p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Request Submitted!</h1>
              <p className="text-muted-foreground mb-6">
                Your blood request has been posted. Eligible donors with matching 
                blood types will be notified.
              </p>
              
              <div className="bg-muted rounded-lg p-4 mb-6 text-left">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Blood Group:</span>
                    <p className="font-medium">{BloodGroupLabels[formData.bloodGroup]}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Urgency:</span>
                    <p className="font-medium capitalize">{formData.urgency}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Location:</span>
                    <p className="font-medium">{formData.location}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate('/search')} className="btn-primary">
                  Find Donors
                </Button>
                <Button variant="outline" onClick={() => navigate('/profile')}>
                  Go to Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container-max section-padding">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Request Blood</h1>
              <p className="text-sm text-muted-foreground">
                Post a blood request to reach eligible donors
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Blood Group */}
            <div className="bg-card rounded-xl card-shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <HeartPulse className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Blood Group Needed</h2>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {bloodGroups.map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setFormData({ ...formData, bloodGroup: group })}
                    className={`py-3 px-2 rounded-lg text-sm font-bold transition-all ${
                      formData.bloodGroup === group
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {BloodGroupLabels[group]}
                  </button>
                ))}
              </div>
            </div>

            {/* Urgency */}
            <div className="bg-card rounded-xl card-shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Urgency Level</h2>
              </div>
              
              <div className="grid gap-3">
                {urgencyLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, urgency: level.value as typeof formData.urgency })}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                      formData.urgency === level.value
                        ? level.color
                        : 'border-muted hover:border-muted-foreground/20'
                    }`}
                  >
                    <level.icon className="h-6 w-6" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{level.label}</span>
                        {formData.urgency === level.value && (
                          <Check className="h-4 w-4" />
                        )}
                      </div>
                      <p className="text-sm opacity-80">{level.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Location & Details */}
            <div className="bg-card rounded-xl card-shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Location Details</h2>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location / Address *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Mymensingh Medical College"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hospital">Hospital Name (Optional)</Label>
                  <Input
                    id="hospital"
                    value={formData.hospital}
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                    placeholder="e.g. MMCH"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Needed By (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.neededBy ? format(formData.neededBy, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={formData.neededBy}
                        onSelect={(date) => setFormData({ ...formData, neededBy: date })}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Contact & Message */}
            <div className="bg-card rounded-xl card-shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Contact Information</h2>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      +880
                    </span>
                    <Input
                      id="contactPhone"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="1XXXXXXXXX"
                      className="pl-14"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Any additional information about the request..."
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="btn-primary"
                disabled={isSubmitting || !formData.location || !formData.contactPhone}
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <HeartPulse className="h-4 w-4 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
