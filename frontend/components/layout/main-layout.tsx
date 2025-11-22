'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Sidebar } from './sidebar';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check both Zustand state and localStorage as fallback
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const hasToken = localStorage.getItem('accessToken');
        const authState = isAuthenticated || !!hasToken;
        
        if (!authState) {
          router.push('/login');
        } else {
          setIsChecking(false);
        }
      }
    };

    // Small delay to ensure state is loaded from localStorage
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Double check authentication before rendering
  if (!isAuthenticated && typeof window !== 'undefined' && !localStorage.getItem('accessToken')) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

