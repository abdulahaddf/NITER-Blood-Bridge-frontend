import { useState, useEffect, useCallback, useRef } from 'react';
import type { DonorProfile, DonorSearchFilters, BloodGroup, Department } from '@/types';
import { BloodCompatibility } from '@/types';
import { api } from '@/lib/api';

interface DonorsApiResponse {
  data: DonorProfile[];
  total: number;
  page: number;
  limit: number;
}

export function useSearch() {
  const [profiles, setProfiles] = useState<DonorProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
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

  // Get compatible blood groups
  const getCompatibleGroups = useCallback((groups: BloodGroup[]): BloodGroup[] => {
    if (groups.length === 0) return [];
    const compatible = new Set<BloodGroup>();
    groups.forEach(group => {
      BloodCompatibility[group].forEach(g => compatible.add(g));
    });
    return Array.from(compatible);
  }, []);

  const abortRef = useRef<AbortController | null>(null);

  // Fetch donors from API whenever filters change
  useEffect(() => {
    // Abort previous request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);

    const bloodGroupsToSend = filters.compatibilityMode && filters.bloodGroups.length > 0
      ? getCompatibleGroups(filters.bloodGroups)
      : filters.bloodGroups;

    const params: Record<string, string | number | boolean | string[] | undefined | null> = {
      search: filters.searchQuery || undefined,
      compatibilityMode: filters.compatibilityMode,
      eligibilityOnly: filters.eligibilityOnly,
      onCampusOnly: filters.onCampusOnly,
      willingToDonate: filters.willingToDonate,
      sortBy: filters.sortBy,
      batchMin: filters.batchRange[0],
      batchMax: filters.batchRange[1],
      page: page,
      limit: 60,
    };

    if (bloodGroupsToSend.length > 0) {
      params.bloodGroups = bloodGroupsToSend;
    }
    if (filters.departments.length > 0) {
      params.departments = filters.departments;
    }

    api.get<DonorsApiResponse | DonorProfile[]>('/api/donors', params)
      .then(response => {
        // Handle both paginated and array responses
        if (Array.isArray(response)) {
          console.log(response);
          setProfiles(response);
          setTotal(response.length);
        } else {
          setProfiles(response.data ?? []);
          // @ts-ignore - The backend returns { data, meta: { total } }
          setTotal(response.meta?.total ?? response.total ?? 0);
        }
      })
      .catch(err => {
        // Ignore aborted requests
        if (err instanceof Error && err.name === 'AbortError') return;
        setProfiles([]);
        setTotal(0);
      })
      .finally(() => setIsLoading(false));
  }, [filters, page, getCompatibleGroups]);

  const updateFilters = useCallback((updates: Partial<DonorSearchFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
    setPage(1);
  }, []);

  const toggleBloodGroup = useCallback((group: BloodGroup) => {
    setFilters(prev => ({
      ...prev,
      bloodGroups: prev.bloodGroups.includes(group)
        ? prev.bloodGroups.filter(g => g !== group)
        : [...prev.bloodGroups, group],
    }));
    setPage(1);
  }, []);

  const toggleDepartment = useCallback((dept: Department) => {
    setFilters(prev => ({
      ...prev,
      departments: prev.departments.includes(dept)
        ? prev.departments.filter(d => d !== dept)
        : [...prev.departments, dept],
    }));
    setPage(1);
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
    setPage(1);
  }, []);

  const hasActiveFilters =
    filters.bloodGroups.length > 0 ||
    filters.compatibilityMode ||
    !filters.eligibilityOnly ||
    filters.departments.length > 0 ||
    filters.batchRange[0] !== 1 ||
    filters.batchRange[1] !== 16 ||
    filters.onCampusOnly ||
    !filters.willingToDonate ||
    filters.searchQuery.length > 0;

  const stats = {
    total,
    eligible: profiles.length,
    byBloodGroup: profiles.reduce((acc, p) => {
      acc[p.bloodGroup] = (acc[p.bloodGroup] || 0) + 1;
      return acc;
    }, {} as Record<BloodGroup, number>),
  };

  return {
    profiles,
    allProfiles: profiles,
    isLoading,
    filters,
    stats,
    page,
    setPage,
    totalPages: Math.ceil(total / 60) || 1,
    updateFilters,
    toggleBloodGroup,
    toggleDepartment,
    clearFilters,
    hasActiveFilters,
  };
}
