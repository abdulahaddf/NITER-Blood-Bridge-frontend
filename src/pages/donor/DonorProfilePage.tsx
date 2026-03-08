import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  MapPin, 
  Droplets, 
  Phone, 
  Mail, 
  Building2,
  GraduationCap,
  Calendar,
  Check,
  Eye,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAllProfiles } from '@/hooks/useProfile';
import { BloodGroupLabels, DepartmentLabels, calculateEligibility, getBatchLabel } from '@/types';
import type { DonorProfile } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

const bloodGroupColors: Record<string, string> = {
  A_POS: 'bg-blue-500',
  A_NEG: 'bg-blue-700',
  B_POS: 'bg-orange-500',
  B_NEG: 'bg-orange-700',
  AB_POS: 'bg-purple-500',
  AB_NEG: 'bg-purple-700',
  O_POS: 'bg-green-500',
  O_NEG: 'bg-green-700',
};

export function DonorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProfileById } = useAllProfiles();
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactRevealed, setContactRevealed] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getProfileById(id).then(data => {
      setProfile(data || null);
      setIsLoading(false);
    }).catch(() => {
      setProfile(null);
      setIsLoading(false);
    });
  }, [id, getProfileById]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Donor Not Found</h2>
          <p className="text-muted-foreground mb-4">The donor profile you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => navigate('/search')} className="btn-primary">
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  const eligibility = calculateEligibility(profile);

  const handleRequestContact = () => {
    // In a real app, this would log the contact reveal
    setContactRevealed(true);
    setShowContactModal(true);
    toast.success('Contact information revealed');
  };

  const daysSinceLastDonation = profile.lastDonationDate 
    ? Math.floor((new Date().getTime() - new Date(profile.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container-max section-padding">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate('/search')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl card-shadow overflow-hidden">
              {/* Cover */}
              <div className="h-24 blood-gradient"></div>
              
              {/* Avatar & Info */}
              <div className="px-6 pb-6">
                <div className="relative -mt-12 mb-4">
                  <div className="w-24 h-24 rounded-full bg-card border-4 border-card flex items-center justify-center overflow-hidden">
                    {profile.profilePhoto ? (
                      <img 
                        src={profile.profilePhoto} 
                        alt={profile.fullName} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full ${bloodGroupColors[profile.bloodGroup]} flex items-center justify-center text-white text-2xl font-bold`}>
                        {profile.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {profile.seedMatched && (
                    <div className="absolute bottom-0 left-16 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h1 className="text-xl font-bold flex items-center gap-2">
                    {profile.fullName}
                    {profile.seedMatched && (
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </h1>
                  <p className="text-muted-foreground">{profile.studentId}</p>
                </div>

                {/* Blood Group Badge */}
                <div className="mb-4">
                  <span className={`blood-group-badge text-lg px-4 py-2 ${bloodGroupColors[profile.bloodGroup]}`}>
                    {BloodGroupLabels[profile.bloodGroup]}
                  </span>
                </div>

                {/* Eligibility Status */}
                <div className="mb-6">
                  {eligibility.status === 'ELIGIBLE' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <Check className="h-6 w-6 text-green-600 mx-auto mb-1" />
                      <p className="font-semibold text-green-700">ELIGIBLE TO DONATE</p>
                      {daysSinceLastDonation !== null && (
                        <p className="text-sm text-green-600">
                          Last donated {daysSinceLastDonation > 30 
                            ? `${Math.floor(daysSinceLastDonation / 30)} months ago`
                            : `${daysSinceLastDonation} days ago`
                          }
                        </p>
                      )}
                    </div>
                  )}
                  {eligibility.status === 'UNCONFIRMED' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                      <AlertTriangle className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                      <p className="font-semibold text-yellow-700">UNCONFIRMED</p>
                      <p className="text-sm text-yellow-600">First-time or unconfirmed donor</p>
                    </div>
                  )}
                  {eligibility.status === 'NOT_YET' && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                      <Calendar className="h-6 w-6 text-gray-600 mx-auto mb-1" />
                      <p className="font-semibold text-gray-700">{eligibility.label}</p>
                    </div>
                  )}
                  {eligibility.status === 'OPTED_OUT' && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                      <p className="font-semibold text-gray-700">NOT ACCEPTING REQUESTS</p>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{DepartmentLabels[profile.department as keyof typeof DepartmentLabels]}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span>{getBatchLabel(profile.batch)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.currentLocation}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">From {profile.hometown}</span>
                  </div>
                </div>

                {/* Availability Note */}
                {profile.availabilityNote && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Note:</strong> {profile.availabilityNote}
                    </p>
                  </div>
                )}

                {/* Request Contact Button */}
                {eligibility.eligible && profile.willingToDonate && (
                  <Button 
                    onClick={handleRequestContact}
                    className="w-full mt-6 btn-primary"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {contactRevealed ? 'View Contact' : 'Request Contact'}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Donation History */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl card-shadow p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Droplets className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Donation History</h2>
                  <p className="text-sm text-muted-foreground">
                    {profile.totalDonations} total donations
                  </p>
                </div>
              </div>

              {profile.donationHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Droplets className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">No donations recorded</h3>
                  <p className="text-sm text-muted-foreground">
                    This donor hasn&apos;t logged any donations yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile.donationHistory.map((donation) => (
                    <div 
                      key={donation.id} 
                      className="flex items-start gap-4 p-4 rounded-lg border"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Droplets className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">Blood Donation</span>
                          {donation.verified && (
                            <Badge variant="secondary" className="text-xs">
                              <Check className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{donation.location}</p>
                        {donation.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{donation.notes}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(donation.donationDate), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Reveal Modal */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Information</DialogTitle>
            <DialogDescription>
              You now have access to {profile.fullName}&apos;s contact details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <a href={`tel:${profile.phone.startsWith('+88') ? profile.phone : `+88${profile.phone}`}`}>
                  <p className="font-medium">{profile.phone.startsWith('+88') ? profile.phone : `+88${profile.phone}`}</p>
                </a>
              </div>  
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-700">
              <strong>Privacy Notice:</strong> This contact information is shared 
              for blood donation purposes only. Please respect the donor&apos;s privacy.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
