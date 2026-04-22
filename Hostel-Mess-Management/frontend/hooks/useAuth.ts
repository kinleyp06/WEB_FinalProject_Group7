"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout } from "@/lib/api";

export function useAuth(requiredRole?: "STUDENT" | "ADMIN") {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = getCurrentUser();
    
    if (!userData) {
      router.push("/auth/login");
      return;
    }
    
    if (requiredRole && userData.role !== requiredRole) {
      // Redirect to appropriate dashboard
      if (userData.role === "STUDENT") {
        router.push("/dashboard/student");
      } else {
        router.push("/dashboard/admin");
      }
      return;
    }
    
    setUser(userData);
    setIsLoading(false);
  }, [router, requiredRole]);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return { user, isLoading, logout: handleLogout };
}