import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { API_URL } from '../../config/api';

// Hook to fetch user role from backend
export const useUserRole = () => {
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();
        
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
  }, [getToken]);

  return { role, isLoading, error };
};
