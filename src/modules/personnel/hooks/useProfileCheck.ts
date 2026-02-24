import { useEffect } from 'react';
import { useGetMyProfileQuery } from '../services/personnelApi';
import type { PersonnelProfile, ProfileCheckResponse } from '../../../interfaces/personnel';

export const useProfileCheck = () => {
  const { data, isLoading, error, refetch } = useGetMyProfileQuery();

  const isProfileCheckResponse = (data: any): data is ProfileCheckResponse => {
    return data && 'has_profile' in data && data.has_profile === false;
  };

  const isPersonnelProfile = (data: any): data is PersonnelProfile => {
    return data && 'employee_code' in data;
  };

  const needsProfile = isProfileCheckResponse(data);
  const hasProfile = isPersonnelProfile(data);
  const userInfo = needsProfile ? data.user : null;

  return {
    loading: isLoading,
    needsProfile,
    hasProfile,
    userInfo,
    profile: hasProfile ? data : null,
    recheckProfile: refetch,
    error,
  };
};
