import { useCallback } from 'react';
import { useAuth } from './useAuth';

export function useApi() {
  const { logout } = useAuth();

  const request = useCallback(
    async (apiFn) => {
      try {
        return await apiFn();
      } catch (err) {
        if (err.status === 401) {
          logout();
          window.location.replace('/login');
        }
        throw err;
      }
    },
    [logout]
  );

  return { request };
}
