import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../auth/authStore';
import API from '../api/axios';

const AuthSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthData } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      // Fetch user data with the token
      const fetchUser = async () => {
        try {
          const { data } = await API.get('/auth/me');
          setAuthData(token, data);
          navigate('/dashboard');
        } catch (error) {
          console.error('Failed to fetch user:', error);
          navigate('/login');
        }
      };
      fetchUser();
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, setAuthData]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Signing you in...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthSuccessPage;