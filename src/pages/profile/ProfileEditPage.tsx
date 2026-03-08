import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Droplets, 
  Camera, 
  Check, 
  ChevronLeft,
  Upload,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { useAuthContext } from '@/App';
import { useProfile } from '@/hooks/useProfile';
import { BloodGroupLabels, type BloodGroup, type Department, type ProfileFormData } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

const bloodGroups: BloodGroup[] = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];
const departments: Department[] = ['IP', 'TE', 'EE', 'CS', 'FD'];
const batches = Array.from({ length: 16 }, (_, i) => i + 1);

export function ProfileEditPage() {
  const navigate = useNavigate();
  const auth = useAuthContext();
  const { profile, isLoading, createProfile, updateProfile, checkSeedMatch, getProfileCompletion } = useProfile(auth.user?.id);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    department: 'IP',
    idNumber: '',
    batch: 10,
    phone: '',
    email: auth.user?.email || '',
    currentLocation: '',
    hometown: '',
    bloodGroup: 'O_POS',
    lastDonationDate: undefined,
    neverDonated: true,
    willingToDonate: true,
    availabilityNote: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const [localSeedMatch, setLocalSeedMatch] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        department: profile.department || 'TE',
        idNumber: profile.idNumber || '',
        batch: profile.batch || 10,
        phone: profile.phone || '',
        email: profile.email || auth.user?.email || '',
        currentLocation: profile.currentLocation || '',
        hometown: profile.hometown || '',
        bloodGroup: profile.bloodGroup || 'O_POS',
        lastDonationDate: profile.lastDonationDate,
        neverDonated: !profile.lastDonationDate,
        willingToDonate: profile.willingToDonate ?? true,
        availabilityNote: profile.availabilityNote || '',
      });
      setLocalSeedMatch(profile.seedMatched);
      if (profile.profilePhoto) {
        setPhotoPreview(profile.profilePhoto);
      }
    }
  }, [profile, auth.user?.email]);

  // Check seed match when department or idNumber changes
  useEffect(() => {
    if (formData.department && formData?.idNumber?.length >= 5) {
      const timer = setTimeout(async () => {
        const matched = await checkSeedMatch(formData.department, formData.idNumber);
        setLocalSeedMatch(matched);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData.department, formData.idNumber, checkSeedMatch]);

  const completion = getProfileCompletion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (profile) {
        // Profile exists (could be auto-created or complete) — always update
        await updateProfile(formData);
        toast.success('Profile updated successfully!');
      } else {
        await createProfile(formData);
        toast.success('Profile created successfully!');
      }
      navigate('/profile');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container-max section-padding">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {profile ? 'Edit Profile' : 'Complete Your Profile'}
            </h1>
            {!profile && (
              <p className="text-sm text-muted-foreground">
                Fill in your details to become a donor
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {!profile && (
          <div className="mb-8 bg-card rounded-xl card-shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Profile Completion</span>
              <span className="text-sm text-muted-foreground">{completion}%</span>
            </div>
            <Progress value={completion} className="h-2" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Identity */}
          <div className="bg-card rounded-xl card-shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Identity Information</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Student ID */}
              <div className="space-y-2">
                <Label>Student ID</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value as Department })}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    placeholder="e.g. 2010071"
                    className="flex-1"
                    required
                  />
                </div>
                {localSeedMatch && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <Check className="h-4 w-4" />
                    <span>Verified NITER Student</span>
                  </div>
                )}
              </div>

              {/* Batch */}
              <div className="space-y-2">
                <Label>Batch</Label>
                <Select
                  value={formData.batch?.toString()}
                  onValueChange={(value) => setFormData({ ...formData, batch: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch} value={batch.toString()}>
                        {batch}th Batch
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    +88
                  </span>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    className="pl-14"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Location */}
          <div className="bg-card rounded-xl card-shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Location</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="currentLocation">Current Location</Label>
                <Input
                  id="currentLocation"
                  value={formData.currentLocation}
                  onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                  placeholder="e.g. Mymensingh, Hall-3, NITER Campus"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hometown">Hometown</Label>
                <Input
                  id="hometown"
                  value={formData.hometown}
                  onChange={(e) => setFormData({ ...formData, hometown: e.target.value })}
                  placeholder="e.g. Cumilla, Chittagong"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Blood & Donation */}
          <div className="bg-card rounded-xl card-shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Droplets className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Blood & Donation Information</h2>
            </div>

            <div className="space-y-6">
              {/* Blood Group */}
              <div className="space-y-2">
                <Label>Blood Group</Label>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {bloodGroups.map((group) => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setFormData({ ...formData, bloodGroup: group })}
                      className={cn(
                        'py-3 px-2 rounded-lg text-sm font-bold transition-all',
                        formData.bloodGroup === group
                          ? 'bg-primary text-white'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      {BloodGroupLabels[group]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Last Donation Date */}
              <div className="space-y-2">
                <Label>Last Donation Date</Label>
                <div className="flex items-center gap-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-1/2 justify-start text-left font-normal',
                          !formData.lastDonationDate && 'text-muted-foreground'
                        )}
                        disabled={formData.neverDonated}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.lastDonationDate ? (
                          format(new Date(formData.lastDonationDate), 'PPP')
                        ) : (
                          'Select date'
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={formData.lastDonationDate}
                        onSelect={(date) => setFormData({ ...formData, lastDonationDate: date })}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.neverDonated}
                      onCheckedChange={(checked) => 
                        setFormData({ 
                          ...formData, 
                          neverDonated: checked,
                          lastDonationDate: checked ? undefined : formData.lastDonationDate 
                        })
                      }
                    />
                    <Label className="text-sm cursor-pointer whitespace-nowrap">
                      Never donated
                    </Label>
                  </div>
                </div>
              </div>

              {/* Willing to Donate */}
              <div className="space-y-6 md:w-1/2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Willing to Donate</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle this off if you&apos;re not available for donation requests
                    </p>
                  </div>
                  <Switch
                    checked={formData.willingToDonate}
                    onCheckedChange={(checked) => setFormData({ ...formData, willingToDonate: checked })}
                  />
                </div>

                {formData.willingToDonate && (
                  <div className="space-y-2">
                    <Label htmlFor="availabilityNote">Availability Note (Optional)</Label>
                    <Textarea
                      id="availabilityNote"
                      value={formData.availabilityNote}
                      onChange={(e) => setFormData({ ...formData, availabilityNote: e.target.value })}
                      placeholder="e.g. Available on weekends only, or Busy till June exam"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Profile Photo */}
          {/* <div className="bg-card rounded-xl card-shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Camera className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Profile Photo</h2>
            </div>

            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <Label htmlFor="photo" className="btn-outline cursor-pointer inline-flex">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </Label>
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Optional. You can skip this for now.
                </p>
              </div>
            </div>
          </div> */}

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/profile')}
            >
              Cancel
            </Button>
            <Button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              {profile ? 'Save Changes' : 'Create Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
