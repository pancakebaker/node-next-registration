// src/hooks/useMe.ts
import useSWR from 'swr';
import { UserService } from '@/services/user.service';
import { UserPersonalInfo } from '@/schemas/user.schema';

const fetcher = () => UserService.getMe();

export function useMe() {
  const { data, error, isLoading, mutate } = useSWR<UserPersonalInfo>('me', fetcher);
  return { user: data ?? null, error, loading: isLoading, refresh: mutate };
}
