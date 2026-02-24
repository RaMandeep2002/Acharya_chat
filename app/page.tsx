"use client";
import { Loader2 } from "lucide-react";
import Dashboard from "./components/Dashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Authform from "./components/auth/Authform";
import ProfileData from "./components/auth/ProfileData";

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}



function AppContent() {
  const { user, profile, loading } = useAuth();
  console.log({ user, profile, loading });

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!user) {
    return <Authform />;
  }

  if (!profile) {
    return <ProfileData />;
  }

  return <Dashboard />;
}