"use client";

import { useAuth } from '@/app/context/AuthContext';
import Authform from '@/app/auth/Authform';
import ProfileData from '@/app/auth/ProfileData';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <svg
          className="animate-spin -ml-1 mr-3 h-12 w-12 text-amber-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      </div>
    );
  }

  if (!user) {
    return <Authform />;
  }

  if (!profile) {
    return <ProfileData />;
  }

  return <>{children}</>;
}