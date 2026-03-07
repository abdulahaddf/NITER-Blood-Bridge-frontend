import { useState, useEffect, useCallback, useMemo } from 'react';
import type { 
  DonorProfile, 
  DonorSearchFilters, 
  BloodGroup, 
  Department
} from '@/types';
import { calculateEligibility, BloodCompatibility } from '@/types';

const PROFILES_STORAGE_KEY = 'niter_blood_profiles';

export function useSearch() {
  const [profiles, setProfiles] = useState<DonorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState<DonorSearchFilters>({
    bloodGroups: [],
    compatibilityMode: false,
    eligibilityOnly: true,
    departments: [],
    batchRange: [1, 16],
    onCampusOnly: false,
    willingToDonate: true,
    searchQuery: '',
    sortBy: 'eligible',
  });

  // Load profiles
  useEffect(() => {
    const stored = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (stored) {
      setProfiles(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  // Get compatible blood groups
  const getCompatibleGroups = useCallback((groups: BloodGroup[]): BloodGroup[] => {
    if (groups.length === 0) return [];
    
    const compatible = new Set<BloodGroup>();
    groups.forEach(group => {
      BloodCompatibility[group].forEach(g => compatible.add(g));
    });
    
    return Array.from(compatible);
  }, []);

  // Filter and sort profiles
  const filteredProfiles = useMemo(() => {
    let result = [...profiles];

    // Filter by search query (name or student ID)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(p => 
        p.fullName.toLowerCase().includes(query) ||
        p.studentId.toLowerCase().includes(query)
      );
    }

    // Filter by blood group
    if (filters.bloodGroups.length > 0) {
      const groupsToFilter = filters.compatibilityMode 
        ? getCompatibleGroups(filters.bloodGroups)
        : filters.bloodGroups;
      result = result.filter(p => groupsToFilter.includes(p.bloodGroup));
    }

    // Filter by eligibility
    if (filters.eligibilityOnly) {
      result = result.filter(p => {
        const eligibility = calculateEligibility(p);
        return eligibility.eligible;
      });
    }

    // Filter by department
    if (filters.departments.length > 0) {
      result = result.filter(p => filters.departments.includes(p.department));
    }

    // Filter by batch range
    result = result.filter(p => 
      p.batch >= filters.batchRange[0] && p.batch <= filters.batchRange[1]
    );

    // Filter by on-campus
    if (filters.onCampusOnly) {
      result = result.filter(p => 
        p.currentLocation.toLowerCase().includes('niter') ||
        p.currentLocation.toLowerCase().includes('campus') ||
        p.currentLocation.toLowerCase().includes('hall')
      );
    }

    // Filter by willing to donate
    if (filters.willingToDonate) {
      result = result.filter(p => p.willingToDonate);
    }

    // Sort results
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'eligible': {
          const eligibilityA = calculateEligibility(a);
          const eligibilityB = calculateEligibility(b);
          if (eligibilityA.eligible && !eligibilityB.eligible) return -1;
          if (!eligibilityA.eligible && eligibilityB.eligible) return 1;
          return 0;
        }
        case 'donations':
          return b.totalDonations - a.totalDonations;
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'batch':
          return b.batch - a.batch;
        default:
          return 0;
      }
    });

    return result;
  }, [profiles, filters, getCompatibleGroups]);

  // Stats
  const stats = useMemo(() => {
    const total = profiles.length;
    const eligible = profiles.filter(p => calculateEligibility(p).eligible).length;
    const byBloodGroup = profiles.reduce((acc, p) => {
      acc[p.bloodGroup] = (acc[p.bloodGroup] || 0) + 1;
      return acc;
    }, {} as Record<BloodGroup, number>);

    return { total, eligible, byBloodGroup };
  }, [profiles]);

  const updateFilters = useCallback((updates: Partial<DonorSearchFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleBloodGroup = useCallback((group: BloodGroup) => {
    setFilters(prev => ({
      ...prev,
      bloodGroups: prev.bloodGroups.includes(group)
        ? prev.bloodGroups.filter(g => g !== group)
        : [...prev.bloodGroups, group]
    }));
  }, []);

  const toggleDepartment = useCallback((dept: Department) => {
    setFilters(prev => ({
      ...prev,
      departments: prev.departments.includes(dept)
        ? prev.departments.filter(d => d !== dept)
        : [...prev.departments, dept]
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      bloodGroups: [],
      compatibilityMode: false,
      eligibilityOnly: true,
      departments: [],
      batchRange: [1, 16],
      onCampusOnly: false,
      willingToDonate: true,
      searchQuery: '',
      sortBy: 'eligible',
    });
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.bloodGroups.length > 0 ||
      filters.compatibilityMode ||
      !filters.eligibilityOnly ||
      filters.departments.length > 0 ||
      filters.batchRange[0] !== 1 ||
      filters.batchRange[1] !== 16 ||
      filters.onCampusOnly ||
      !filters.willingToDonate ||
      filters.searchQuery.length > 0
    );
  }, [filters]);

  return {
    profiles: filteredProfiles,
    allProfiles: profiles,
    isLoading,
    filters,
    stats,
    updateFilters,
    toggleBloodGroup,
    toggleDepartment,
    clearFilters,
    hasActiveFilters,
  };
}
