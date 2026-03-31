"use client";

import { AuthProvider, useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function HomePageInner() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/dashboard");
      } else {
        router.replace("/auth");
      }
    }
  }, [user, loading, router]);

  return null;
}

export default function HomePage() {
  return (
    <AuthProvider>
      <HomePageInner />
    </AuthProvider>
  );
}