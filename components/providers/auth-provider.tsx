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
import { getMyProfile, getStamina, claimStamina as claimStaminaApi } from "@/lib/api";
import type { StaminaStatus } from "@/lib/types";

const AUTH_PAGES = ["/login", "/register"];

export interface PlayerProfile {
	level: number;
	monsterCount: number;
	inventoryLimit: number;
}

interface AuthContextType {
	session: AuthSession | null;
	profile: PlayerProfile | null;
	stamina: StaminaStatus | null;
	isLoading: boolean;
	refresh: () => Promise<void>;
	refreshStamina: () => Promise<void>;
	claimStamina: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [session, setSession] = useState<AuthSession | null>(null);
	const [profile, setProfile] = useState<PlayerProfile | null>(null);
	const [stamina, setStamina] = useState<StaminaStatus | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const pathname = usePathname();
	const prevPathname = useRef<string | null>(null);

	const sessionRef = useRef<AuthSession | null>(null);

	const refreshStamina = useCallback(async () => {
		const staminaResult = await getStamina();
		if (staminaResult.success && staminaResult.data) {
			setStamina(staminaResult.data);
		}
	}, []);

	const claimStamina = useCallback(async () => {
		const result = await claimStaminaApi();
		if (result.success && result.data) {
			setStamina(result.data);
			return { success: true };
		}
		return { success: false, error: result.error };
	}, []);

	const refresh = useCallback(async () => {
		// Only show loading spinner on initial load (no session yet).
		// Background refreshes keep existing data visible to avoid UI flicker.
		if (!sessionRef.current) {
			setIsLoading(true);
		}
		try {
			const newSession = await validateSession();
			setSession(newSession);
			sessionRef.current = newSession;

			// Fetch player profile and stamina if authenticated
			if (newSession) {
				const [profileResult, staminaResult] = await Promise.all([
					getMyProfile(),
					getStamina(),
				]);

				if (profileResult.success && profileResult.data) {
					setProfile({
						level: profileResult.data.level,
						monsterCount: profileResult.data.monsterIds?.length ?? 0,
						inventoryLimit: 10 + profileResult.data.level,
					});
				}

				if (staminaResult.success && staminaResult.data) {
					setStamina(staminaResult.data);
				}
			} else {
				setProfile(null);
				setStamina(null);
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
		<AuthContext.Provider value={{ session, profile, stamina, isLoading, refresh, refreshStamina, claimStamina }}>
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
