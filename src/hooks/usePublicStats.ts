import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { BloodGroup } from '@/types';

export interface PublicStats {
  totalDonors: number;
  eligibleDonors: number;
  bloodGroupsAvailable: number;
  byBloodGroup: {
    bloodGroup: BloodGroup;
    count: number;
    eligibleCount: number;
  }[];
}

export function usePublicStats() {
  const [stats, setStats] = useState<PublicStats>({
    totalDonors: 0,
    eligibleDonors: 0,
    bloodGroupsAvailable: 0,
    byBloodGroup: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    api.get<any>('/api/donors/public-stats')
      .then(response => {
        if (mounted) {
          // Backend uses TransformInterceptor, so data is in response.data
          const data = response.data || response;
          setStats({
            totalDonors: data.totalDonors || 0,
            eligibleDonors: data.eligibleDonors || 0,
            bloodGroupsAvailable: data.bloodGroupsAvailable || 0,
            byBloodGroup: data.byBloodGroup || [],
          });
          setError(null);
        }
      })
      .catch(err => {
        if (mounted) {
          console.error('Failed to fetch public stats:', err);
          setError(err instanceof Error ? err : new Error('Failed to fetch stats'));
          // Fallback to seed data count
          setStats(prev => ({
            ...prev,
            totalDonors: 436,
            eligibleDonors: 436,
          }));
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { stats, isLoading, error };
}
