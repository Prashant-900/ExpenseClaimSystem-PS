import { useEffect, useState } from 'react';
import { useAuthStore } from '../../features/authentication/authStore';
import { API_URL } from '../../config/api';

// Hook to fetch user role from backend
export const useUserRole = () => {
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user role');
        }

        const data = await response.json();
        setRole(data.role);
      } catch (err) {
        console.error('Error fetching user role:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [token]);

  return { role, isLoading, error };
};
