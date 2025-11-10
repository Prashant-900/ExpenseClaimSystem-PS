import { create } from 'zustand';
import { useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,

  // Initialize from Clerk
  initializeFromClerk: (clerkUser, clerkToken) => {
    if (clerkUser && clerkToken) {
      const userData = {
        id: clerkUser.id,
        name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : clerkUser.emailAddresses[0].emailAddress,
        email: clerkUser.emailAddresses[0].emailAddress,
        profileImage: clerkUser.profileImageUrl,
      };
      set({ user: userData, token: clerkToken });
    }
  },

  // Logout - clears local store and all auth data
  logout: () => {
    console.log('Clearing auth store...');
    set({ user: null, token: null, isLoading: false });
    
    // Clear localStorage and sessionStorage
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
    } catch (err) {
      console.error('Error clearing storage:', err);
    }
  },

  // Update user
  updateUser: (userData) => {
    set({ user: { ...get().user, ...userData } });
  },

  // Set auth data
  setAuthData: (token, user) => {
    set({ token, user });
  },

  // Get current auth state
  getAuthState: () => {
    return { user: get().user, token: get().token };
  }
}));

// Custom hook to sync Clerk auth with store
export const useClerkAuthSync = () => {
  const { user: clerkUser, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { initializeFromClerk } = useAuthStore();

  useEffect(() => {
    if (isLoaded && clerkUser) {
      getToken({ template: 'expenseclaim' }).then((token) => {
        if (token) {
          initializeFromClerk(clerkUser, token);
        }
      });
    }
  }, [clerkUser, isLoaded, getToken, initializeFromClerk]);

  return { clerkUser, isLoaded };
};