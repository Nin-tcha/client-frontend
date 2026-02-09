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
import { getMyProfile } from "@/lib/api";

const AUTH_PAGES = ["/login", "/register"];

export interface PlayerProfile {
	level: number;
	monsterCount: number;
	inventoryLimit: number;
}

interface AuthContextType {
	session: AuthSession | null;
	profile: PlayerProfile | null;
	isLoading: boolean;
	refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [session, setSession] = useState<AuthSession | null>(null);
	const [profile, setProfile] = useState<PlayerProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const pathname = usePathname();
	const prevPathname = useRef<string | null>(null);

	const refresh = useCallback(async () => {
		setIsLoading(true);
		try {
			const newSession = await validateSession();
			setSession(newSession);

			// Fetch player profile if authenticated
			if (newSession) {
				const profileResult = await getMyProfile();
				if (profileResult.success && profileResult.data) {
					setProfile({
						level: profileResult.data.level,
						monsterCount: profileResult.data.monsterIds?.length ?? 0,
						inventoryLimit: 10 + profileResult.data.level,
					});
				}
			} else {
				setProfile(null);
			}
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		const wasOnAuthPage =
			prevPathname.current && AUTH_PAGES.includes(prevPathname.current);
		const isFirstLoad = prevPathname.current === null;

		// Only refresh if: first load, no session yet, or coming FROM an auth page
		if (isFirstLoad || !session || wasOnAuthPage) {
			refresh();
		}

		prevPathname.current = pathname;
	}, [pathname, session, refresh]);

	return (
		<AuthContext.Provider value={{ session, profile, isLoading, refresh }}>
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
