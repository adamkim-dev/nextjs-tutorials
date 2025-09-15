'use client'

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/redux/hooks';
import { fetchUsers } from '@/app/redux/slices/userSlice';

export default function UserDataProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((state) => state.users);

  useEffect(() => {
    // Fetch users data when the app loads
    if (status === 'idle') {
      dispatch(fetchUsers());
    }
  }, [dispatch, status]);
  
  // Add a second effect to refresh user data when the page is refreshed
  useEffect(() => {
    // Add event listener for page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refresh user data when page becomes visible again (e.g., after refresh or tab switch)
        dispatch(fetchUsers());
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up event listener
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dispatch]);

  return <>{children}</>;
}