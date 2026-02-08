"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { validateSession, type AuthSession } from "@/lib/auth";

const AUTH_PAGES = ["/login", "/register"];

interface AuthContextType {
  session: AuthSession | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const prevPathname = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const newSession = await validateSession();
      setSession(newSession);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const wasOnAuthPage = prevPathname.current && AUTH_PAGES.includes(prevPathname.current);
    const isFirstLoad = prevPathname.current === null;
    
    // Only refresh if: first load, no session yet, or coming FROM an auth page
    if (isFirstLoad || !session || wasOnAuthPage) {
      refresh();
    }
    
    prevPathname.current = pathname;
  }, [pathname, session, refresh]);

  return (
    <AuthContext.Provider value={{ session, isLoading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
