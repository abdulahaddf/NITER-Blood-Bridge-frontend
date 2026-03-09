import { useState, useEffect, useCallback, useRef } from 'react';
import type { DonorProfile, DonorSearchFilters, BloodGroup, Department } from '@/types';
import { api } from '@/lib/api';

const ITEMS_PER_PAGE = 39;

interface PaginatedResponse {
  data: DonorProfile[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useSearch() {
  const [profiles, setProfiles] = useState<DonorProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState<DonorSearchFilters>({
    bloodGroups: [],
    compatibilityMode: false,
    eligibilityOnly: false,
    departments: [],
    batchRange: [1, 16],
    onCampusOnly: false,
    willingToDonate: true,
    searchQuery: '',
    sortBy: 'eligible',
  });

  const abortRef = useRef<AbortController | null>(null);

  // Fetch donors from API whenever filters or page changes
  useEffect(() => {
    // Abort previous request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);

    // Build params — let the backend handle compatibility expansion
    const params: Record<string, string | number | boolean | string[] | undefined | null> = {
      search: filters.searchQuery || undefined,
      compatibilityMode: filters.compatibilityMode || undefined,
      eligibilityOnly: filters.eligibilityOnly,
      onCampusOnly: filters.onCampusOnly || undefined,
      willingToDonate: filters.willingToDonate,
      sortBy: filters.sortBy,
      batchMin: filters.batchRange[0],
      batchMax: filters.batchRange[1],
      page: page,
      limit: ITEMS_PER_PAGE,
    };

    if (filters.bloodGroups.length > 0) {
      params.bloodGroups = filters.bloodGroups;
    }
    if (filters.departments.length > 0) {
      params.departments = filters.departments;
    }

    api.get<PaginatedResponse>('/api/donors', params)
      .then(response => {
        if (response && response.data) {
          setProfiles(response.data);
          setTotal(response.meta?.total ?? response.data.length);
          setTotalPages(response.meta?.totalPages ?? 1);
        } else if (Array.isArray(response)) {
          // Fallback for unexpected response shape
          setProfiles(response as unknown as DonorProfile[]);
          setTotal((response as unknown as DonorProfile[]).length);
          setTotalPages(1);
        } else {
          setProfiles([]);
          setTotal(0);
          setTotalPages(1);
        }
      })
      .catch(err => {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('Search error:', err);
        setProfiles([]);
        setTotal(0);
        setTotalPages(1);
      })
      .finally(() => setIsLoading(false));
  }, [filters, page]);

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
      eligibilityOnly: false,
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
    filters.eligibilityOnly ||
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
    totalPages,
    updateFilters,
    toggleBloodGroup,
    toggleDepartment,
    clearFilters,
    hasActiveFilters,
  };
}
