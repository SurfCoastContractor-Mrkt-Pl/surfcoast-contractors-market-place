import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export const useLocationStats = (locationName, locationType = 'swap_meet') => {
  return useQuery({
    queryKey: ['locationStats', locationName, locationType],
    queryFn: async () => {
      const response = await base44.functions.invoke('getLocationStats', {
        locationName,
        locationType
      });
      return response.data;
    },
    enabled: !!locationName,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTopLocations = (locationType = 'swap_meet', limit = 10) => {
  return useQuery({
    queryKey: ['topLocations', locationType, limit],
    queryFn: async () => {
      const response = await base44.functions.invoke('getTopLocations', {
        locationType,
        limit
      });
      return response.data.locations;
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const useLocationHistory = (locationName, locationType = 'swap_meet', limit = 50) => {
  return useQuery({
    queryKey: ['locationHistory', locationName, locationType, limit],
    queryFn: async () => {
      const response = await base44.functions.invoke('getLocationHistory', {
        locationName,
        locationType,
        limit
      });
      return response.data.ratings;
    },
    enabled: !!locationName,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserRatings = () => {
  return useQuery({
    queryKey: ['userRatings'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getUserRatings', {});
      return response.data.ratings;
    },
    staleTime: 3 * 60 * 1000,
  });
};