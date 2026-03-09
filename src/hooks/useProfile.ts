import { useState, useEffect, useCallback } from 'react';
import type { DonorProfile, DonationLog, ProfileFormData, DonationFormData, Department } from '@/types';
import { calculateEligibility } from '@/types';
import { api } from '@/lib/api';

export function useProfile(_userId: string | undefined) {
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [seedMatched, setSeedMatched] = useState(false);

  // Load profile from server
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    api.get<DonorProfile>('/api/profiles/me')
      .then(data => {
        if (!cancelled) {
          setProfile(data);
          setSeedMatched(data.seedMatched ?? false);
        }
      })
      .catch((err) => {
        // 404 means no profile yet — this is normal for new users
        if (!cancelled) {
          setProfile(null);
          console.log('Profile not found (user may need to create one):', err?.message);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [_userId]);

  const checkSeedMatch = useCallback(async (department: Department, idNumber: string): Promise<boolean> => {
    try {
      const result = await api.get<{ matched: boolean }>('/api/profiles/check-seed', { department, idNumber });
      return result.matched;
    } catch {
      return false;
    }
  }, []);

  const createProfile = useCallback(async (data: ProfileFormData): Promise<DonorProfile> => {
    const payload: Record<string, unknown> = {
      fullName: data.fullName,
      department: data.department,
      idNumber: data.idNumber,
      batch: data.batch,
      phone: data.phone,
      email: data.email,
      currentLocation: data.currentLocation,
      hometown: data.hometown,
      bloodGroup: data.bloodGroup,
      willingToDonate: data.willingToDonate,
      neverDonated: data.neverDonated,
      availabilityNote: data.availabilityNote,
    };
    if (!data.neverDonated && data.lastDonationDate) {
      payload.lastDonationDate = data.lastDonationDate;
    }
    const newProfile = await api.post<DonorProfile>('/api/profiles', payload);
    setProfile(newProfile);
    setSeedMatched(newProfile.seedMatched ?? false);
    return newProfile;
  }, []);

  const updateProfile = useCallback(async (data: Partial<ProfileFormData>): Promise<DonorProfile> => {
    const updated = await api.put<DonorProfile>('/api/profiles/me', data);
    setProfile(updated);
    if (updated.seedMatched) setSeedMatched(true);
    return updated;
  }, []);

  const addDonation = useCallback(async (data: DonationFormData): Promise<DonationLog> => {
    const donation = await api.post<DonationLog>('/api/donations', {
      donationDate: data.donationDate,
      location: data.location,
      notes: data.notes,
    });
    // Refresh profile to get updated donation count
    api.get<DonorProfile>('/api/profiles/me').then(p => setProfile(p)).catch(() => {});
    return donation;
  }, []);

  // Not implemented via API – kept for compatibility
  const deleteProfile = useCallback((): boolean => false, []);

  const uploadPhoto = useCallback((_photoUrl: string) => {
    if (!profile) return;
    api.put<DonorProfile>('/api/profiles/me', { profilePhoto: _photoUrl })
      .then(updated => setProfile(updated))
      .catch(() => {});
  }, [profile]);

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
  const getProfileById = useCallback(async (id: string): Promise<DonorProfile | undefined> => {
    try {
      return await api.get<DonorProfile>(`/api/profiles/${id}`);
    } catch {
      return undefined;
    }
  }, []);

  const getProfileByUserId = useCallback(async (_userId: string): Promise<DonorProfile | undefined> => {
    // No direct endpoint; the caller should use /api/profiles/me for current user
    return undefined;
  }, []);

  // Sync wrapper kept for compatibility where hooks expect synchronous access
  const getProfiles = useCallback((): DonorProfile[] => [], []);

  return {
    getProfiles,
    getProfileById,
    getProfileByUserId,
  };
}
