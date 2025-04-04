import { useState, useEffect } from 'react';
import { useGetClaimTypesQuery } from '../store/claim/claimApi';

export const useClaimType = (claimTypeId: number | string | null) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { data, isLoading: isFetching } = useGetClaimTypesQuery(
    { id: typeof claimTypeId === 'number' ? claimTypeId : undefined },
    { skip: !claimTypeId || typeof claimTypeId !== 'number' }
  );

  useEffect(() => {
    setIsLoading(isFetching);
    
    if (data && data.results.length > 0) {
      setName(data.results[0].name);
    } else if (typeof claimTypeId === 'string') {
      // Legacy support for string claim types
      setName(claimTypeId);
    }
  }, [data, claimTypeId, isFetching]);

  return { name, isLoading };
};