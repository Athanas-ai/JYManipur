import { useState, useEffect } from "react";

const ADMIN_PASSWORD = "pray";
const AUTH_STORAGE_KEY = "admin_authenticated";

interface AuthUser {
  isAdmin: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated from localStorage
    const isAuthenticated = localStorage.getItem(AUTH_STORAGE_KEY) === "true";
    if (isAuthenticated) {
      setUser({ isAdmin: true });
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const login = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(AUTH_STORAGE_KEY, "true");
      setUser({ isAdmin: true });
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user?.isAdmin,
    login,
    logout,
    isLoggingOut: false,
  };
}
