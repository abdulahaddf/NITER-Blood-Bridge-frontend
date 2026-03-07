import { useState, useEffect, useCallback } from 'react';
import type { DonorProfile, DonationLog, ProfileFormData, DonationFormData, Department } from '@/types';
import { calculateEligibility, formatStudentId } from '@/types';
import { mockDonorProfiles, mockSeedDonors } from '@/data/mockData';

const PROFILES_STORAGE_KEY = 'niter_blood_profiles';
const SEED_STORAGE_KEY = 'niter_blood_seeds';

// Initialize storage with mock data
const initializeStorage = () => {
  if (!localStorage.getItem(PROFILES_STORAGE_KEY)) {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(mockDonorProfiles));
  }
  if (!localStorage.getItem(SEED_STORAGE_KEY)) {
    localStorage.setItem(SEED_STORAGE_KEY, JSON.stringify(mockSeedDonors));
  }
};

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [seedMatched, setSeedMatched] = useState(false);

  useEffect(() => {
    initializeStorage();
  }, []);

  const getProfiles = useCallback((): DonorProfile[] => {
    const stored = localStorage.getItem(PROFILES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }, []);

  const getSeeds = useCallback((): typeof mockSeedDonors => {
    const stored = localStorage.getItem(SEED_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }, []);

  const saveProfiles = useCallback((profiles: DonorProfile[]) => {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  }, []);

  const saveSeeds = useCallback((seeds: typeof mockSeedDonors) => {
    localStorage.setItem(SEED_STORAGE_KEY, JSON.stringify(seeds));
  }, []);

  // Load profile for user
  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const profiles = getProfiles();
    const userProfile = profiles.find(p => p.userId === userId);
    
    if (userProfile) {
      setProfile(userProfile);
      setSeedMatched(userProfile.seedMatched);
    }
    setIsLoading(false);
  }, [userId, getProfiles]);

  const checkSeedMatch = useCallback((department: Department, idNumber: string): boolean => {
    const studentId = formatStudentId(department, idNumber);
    const seeds = getSeeds();
    return seeds.some(s => s.studentId === studentId);
  }, [getSeeds]);

  const createProfile = useCallback((data: ProfileFormData): DonorProfile => {
    const studentId = formatStudentId(data.department, data.idNumber);
    const seeds = getSeeds();
    const seedMatch = seeds.find(s => s.studentId === studentId);
    
    const newProfile: DonorProfile = {
      id: `profile-${Date.now()}`,
      userId: userId!,
      fullName: data.fullName,
      department: data.department,
      idNumber: data.idNumber,
      studentId,
      batch: data.batch,
      phone: data.phone,
      email: data.email,
      currentLocation: data.currentLocation,
      hometown: data.hometown,
      bloodGroup: data.bloodGroup,
      lastDonationDate: data.neverDonated ? undefined : data.lastDonationDate,
      totalDonations: 0,
      availabilityStatus: data.willingToDonate ? 'AVAILABLE' : 'UNAVAILABLE',
      availabilityNote: data.availabilityNote,
      willingToDonate: data.willingToDonate,
      seedMatched: !!seedMatch,
      seedMatchedAt: seedMatch ? new Date() : undefined,
      profileComplete: true,
      profilePhoto: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      donationHistory: [],
    };

    const profiles = getProfiles();
    saveProfiles([...profiles, newProfile]);
    
    if (seedMatch) {
      const updatedSeeds = seeds.map(s => 
        s.studentId === studentId ? { ...s, isClaimed: true, claimedAt: new Date() } : s
      );
      saveSeeds(updatedSeeds);
    }

    setProfile(newProfile);
    setSeedMatched(!!seedMatch);
    
    return newProfile;
  }, [userId, getProfiles, getSeeds, saveProfiles, saveSeeds]);

  const updateProfile = useCallback((data: Partial<ProfileFormData>): DonorProfile | null => {
    if (!profile) return null;

    const updates: Partial<DonorProfile> = {};
    
    if (data.fullName !== undefined) updates.fullName = data.fullName;
    if (data.department !== undefined && data.idNumber !== undefined) {
      updates.department = data.department;
      updates.idNumber = data.idNumber;
      updates.studentId = formatStudentId(data.department, data.idNumber);
      
      // Check seed match
      const seeds = getSeeds();
      const seedMatch = seeds.find(s => s.studentId === updates.studentId);
      if (seedMatch && !profile.seedMatched) {
        updates.seedMatched = true;
        updates.seedMatchedAt = new Date();
        const updatedSeeds = seeds.map(s => 
          s.studentId === updates.studentId ? { ...s, isClaimed: true, claimedAt: new Date() } : s
        );
        saveSeeds(updatedSeeds);
      }
    }
    if (data.batch !== undefined) updates.batch = data.batch;
    if (data.phone !== undefined) updates.phone = data.phone;
    if (data.email !== undefined) updates.email = data.email;
    if (data.currentLocation !== undefined) updates.currentLocation = data.currentLocation;
    if (data.hometown !== undefined) updates.hometown = data.hometown;
    if (data.bloodGroup !== undefined) updates.bloodGroup = data.bloodGroup;
    if (data.neverDonated !== undefined) {
      updates.lastDonationDate = data.neverDonated ? undefined : data.lastDonationDate;
    } else if (data.lastDonationDate !== undefined) {
      updates.lastDonationDate = data.lastDonationDate;
    }
    if (data.willingToDonate !== undefined) {
      updates.willingToDonate = data.willingToDonate;
      updates.availabilityStatus = data.willingToDonate ? 'AVAILABLE' : 'UNAVAILABLE';
    }
    if (data.availabilityNote !== undefined) updates.availabilityNote = data.availabilityNote;

    const updatedProfile = { 
      ...profile, 
      ...updates, 
      updatedAt: new Date() 
    };

    const profiles = getProfiles();
    const updatedProfiles = profiles.map(p => p.id === profile.id ? updatedProfile : p);
    saveProfiles(updatedProfiles);
    
    setProfile(updatedProfile);
    if (updates.seedMatched) setSeedMatched(true);
    
    return updatedProfile;
  }, [profile, getProfiles, getSeeds, saveProfiles, saveSeeds]);

  const addDonation = useCallback((data: DonationFormData): DonationLog => {
    if (!profile) throw new Error('No profile found');

    const newDonation: DonationLog = {
      id: `donation-${Date.now()}`,
      profileId: profile.id,
      donationDate: data.donationDate,
      location: data.location,
      notes: data.notes,
      verified: false,
      createdAt: new Date(),
    };

    const updatedProfile = {
      ...profile,
      donationHistory: [newDonation, ...profile.donationHistory],
      lastDonationDate: data.donationDate,
      totalDonations: profile.totalDonations + 1,
      updatedAt: new Date(),
    };

    const profiles = getProfiles();
    const updatedProfiles = profiles.map(p => p.id === profile.id ? updatedProfile : p);
    saveProfiles(updatedProfiles);
    
    setProfile(updatedProfile);
    
    return newDonation;
  }, [profile, getProfiles, saveProfiles]);

  const deleteProfile = useCallback((): boolean => {
    if (!profile) return false;

    const profiles = getProfiles();
    const updatedProfiles = profiles.filter(p => p.id !== profile.id);
    saveProfiles(updatedProfiles);
    
    setProfile(null);
    return true;
  }, [profile, getProfiles, saveProfiles]);

  const uploadPhoto = useCallback((photoUrl: string) => {
    if (!profile) return;

    const updatedProfile = { ...profile, profilePhoto: photoUrl, updatedAt: new Date() };
    const profiles = getProfiles();
    const updatedProfiles = profiles.map(p => p.id === profile.id ? updatedProfile : p);
    saveProfiles(updatedProfiles);
    
    setProfile(updatedProfile);
  }, [profile, getProfiles, saveProfiles]);

  const getEligibility = useCallback(() => {
    if (!profile) return null;
    return calculateEligibility(profile);
  }, [profile]);

  const getProfileCompletion = useCallback((): number => {
    if (!profile) return 0;
    
    const requiredFields = [
      profile.fullName,
      profile.department,
      profile.idNumber,
      profile.batch,
      profile.phone,
      profile.email,
      profile.currentLocation,
      profile.hometown,
      profile.bloodGroup,
    ];
    
    const filledFields = requiredFields.filter(Boolean).length;
    return Math.round((filledFields / requiredFields.length) * 100);
  }, [profile]);

  return {
    profile,
    isLoading,
    seedMatched,
    createProfile,
    updateProfile,
    addDonation,
    deleteProfile,
    uploadPhoto,
    checkSeedMatch,
    getEligibility,
    getProfileCompletion,
  };
}

export function useAllProfiles() {
  const getProfiles = useCallback((): DonorProfile[] => {
    const stored = localStorage.getItem(PROFILES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }, []);

  const getProfileById = useCallback((id: string): DonorProfile | undefined => {
    const profiles = getProfiles();
    return profiles.find(p => p.id === id);
  }, [getProfiles]);

  const getProfileByUserId = useCallback((userId: string): DonorProfile | undefined => {
    const profiles = getProfiles();
    return profiles.find(p => p.userId === userId);
  }, [getProfiles]);

  return {
    getProfiles,
    getProfileById,
    getProfileByUserId,
  };
}
