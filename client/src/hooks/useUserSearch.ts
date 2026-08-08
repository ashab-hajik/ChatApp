import { useQuery } from '@tanstack/react-query';
import { searchUsers } from '../services/user.service';
import { useDebouncedValue } from './useDebouncedValue';

export function useUserSearch(query: string) {
  const debouncedQuery = useDebouncedValue(query.trim(), 300);

  return useQuery({
    queryKey: ['user-search', debouncedQuery],
    queryFn: () => searchUsers(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });
}
