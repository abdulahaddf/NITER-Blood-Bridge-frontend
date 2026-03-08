import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Droplets, 
  Edit2, 
  Plus, 
  Trash2, 
  Check, 
  Calendar,
  Phone,
  Mail,
  Eye,
  AlertTriangle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useNotifications } from '@/hooks/useNotifications';
import { BloodGroupLabels, DepartmentLabels, calculateEligibility, getBatchLabel } from '@/types';
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

export function ProfilePage() {
  const navigate = useNavigate();
  const auth = useAuthContext();
  const { profile, isLoading, seedMatched, addDonation, deleteProfile } = useProfile(auth.user?.id);
  useNotifications(auth.user?.id);
  
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showContactViews, setShowContactViews] = useState(false);
  const [donationData, setDonationData] = useState({
    donationDate: new Date(),
    location: '',
    notes: '',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground mb-4">Please complete your profile first.</p>
          <Button onClick={() => navigate('/profile/edit')} className="btn-primary">
            Create Profile
          </Button>
        </div>
      </div>
    );
  }

  // Auto-created profile (e.g. from Google login) - redirect to edit
  if (!profile.profileComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <Droplets className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Complete Your Profile</h2>
          <p className="text-muted-foreground mb-6">
            Your account has been created! Please fill in your details to start connecting with blood donors.
          </p>
          <Button onClick={() => navigate('/profile/edit')} className="btn-primary">
            <Edit2 className="h-4 w-4 mr-2" />
            Complete Profile
          </Button>
        </div>
      </div>
    );
  }

  const eligibility = calculateEligibility(profile);

  const handleAddDonation = async () => {
    try {
      await addDonation({
        donationDate: donationData.donationDate,
        location: donationData.location,
        notes: donationData.notes,
      });
      toast.success('Donation logged successfully!');
      setShowDonationModal(false);
      setDonationData({ donationDate: new Date(), location: '', notes: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to log donation');
    }
  };

  const handleDeleteProfile = () => {
    try {
      deleteProfile();
      toast.success('Profile deleted successfully');
      setShowDeleteModal(false);
      navigate('/search');
    } catch {
      toast.error('Failed to delete profile');
    }
  };

  // No contact reveals API yet
  const contactReveals: any[] = [];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container-max section-padding">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Profile Card */}
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
                          {profile?.fullName?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    {seedMatched && (
                      <div className="absolute bottom-0 left-16 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                      {profile.fullName}
                      {seedMatched && (
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
                      </div>
                    )}
                    {eligibility.status === 'UNCONFIRMED' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                        <AlertTriangle className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                        <p className="font-semibold text-yellow-700">UNCONFIRMED</p>
                        <p className="text-sm text-yellow-600">Update last donation date</p>
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
                        <X className="h-6 w-6 text-gray-600 mx-auto mb-1" />
                        <p className="font-semibold text-gray-700">NOT ACCEPTING REQUESTS</p>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-medium">{profile.department ? DepartmentLabels[profile.department] : 'Not specified'}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Batch</p>
                      <p className="font-medium">{profile.batch ? getBatchLabel(profile.batch) : 'Not specified'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.currentLocation}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">From {profile.hometown}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.email}</span>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <Button 
                    onClick={() => navigate('/profile/edit')}
                    variant="outline" 
                    className="w-full mt-6"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>

              {/* Settings */}
              <div className="bg-card rounded-xl card-shadow p-6">
                <h3 className="font-semibold mb-4">Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive eligibility reminders
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <button
                    onClick={() => setShowContactViews(true)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Who viewed my contact?</span>
                    </div>
                    <Badge variant="secondary">{contactReveals.length}</Badge>
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-card rounded-xl card-shadow p-6 border border-destructive/20">
                <h3 className="font-semibold text-destructive mb-4">Danger Zone</h3>
                <Button 
                  variant="outline" 
                  className="w-full border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete My Profile
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Donation History */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl card-shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
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
                <Button onClick={() => setShowDonationModal(true)} className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Log Donation
                </Button>
              </div>

              {profile?.donationHistory?.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Droplets className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">No donations yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Log your donations to track your contribution
                  </p>
                  <Button onClick={() => setShowDonationModal(true)} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Log First Donation
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile?.donationHistory?.map((donation) => (
                    <div 
                      key={donation.id} 
                      className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
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

      {/* Log Donation Modal */}
      <Dialog open={showDonationModal} onOpenChange={setShowDonationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log a Donation</DialogTitle>
            <DialogDescription>
              Record your blood donation to update your eligibility status
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Donation Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(donationData.donationDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={donationData.donationDate}
                    onSelect={(date) => date && setDonationData({ ...donationData, donationDate: date })}
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location / Organization</Label>
              <Input
                id="location"
                value={donationData.location}
                onChange={(e) => setDonationData({ ...donationData, location: e.target.value })}
                placeholder="e.g. NITER Medical Center"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={donationData.notes}
                onChange={(e) => setDonationData({ ...donationData, notes: e.target.value })}
                placeholder="Any additional information..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDonationModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddDonation}
              disabled={!donationData.location}
              className="btn-primary"
            >
              Log Donation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Profile Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Delete Profile
            </DialogTitle>
            <DialogDescription>
              {seedMatched ? (
                <>
                  Your profile matches NITER student records. Deletion requires admin confirmation. 
                  Your profile will be hidden from search while under review.
                </>
              ) : (
                <>
                  Are you sure? This permanently deletes your donor profile. 
                  Your account remains active.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteProfile}
              variant="destructive"
            >
              {seedMatched ? 'Submit Deletion Request' : 'Delete Profile'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Views Modal */}
      <Dialog open={showContactViews} onOpenChange={setShowContactViews}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Who Viewed My Contact</DialogTitle>
            <DialogDescription>
              Users who requested to see your contact information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            {contactReveals.map((reveal) => (
              <div key={reveal.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{reveal.name}</p>
                  <p className="text-sm text-muted-foreground">{reveal.purpose}</p>
                  <p className="text-xs text-muted-foreground mt-1">{reveal.date}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
