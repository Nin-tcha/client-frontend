"use server";

import { authFetch } from "./auth";
import type { Monster, CombatHistoryEntry, ReplayResponse, StaminaStatus, FightStartResponse, FightStatusResponse, InvocationStatusResponse } from "./types";

const INVOCATION_API_URL =
	process.env.INVOCATION_API_URL || "http://localhost:8084";
const MONSTER_API_URL =
	process.env.MONSTER_API_URL || "http://localhost:8083";

/**
 * Summon a new monster (POST /invocations)
 * Now returns 202 with invocationId + status for async polling.
 */
export async function summon(): Promise<{
	success: boolean;
	data?: { invocationId: number; status: string; message: string };
	error?: string;
}> {
	try {
		const response = await authFetch(`${INVOCATION_API_URL}/invocations`, {
			method: "POST",
		});

		if (!response.ok && response.status !== 202) {
			const error = await response.text();
			return { success: false, error: error || "Summon failed" };
		}

		const data = await response.json();
		return { success: true, data };
	} catch {
		return { success: false, error: "Network error" };
	}
}

/**
 * Poll invocation status (GET /invocations/{id})
 */
export async function getInvocationStatus(
	invocationId: number
): Promise<{ success: boolean; data?: InvocationStatusResponse; error?: string }> {
	try {
		const response = await fetch(`${INVOCATION_API_URL}/invocations/${invocationId}`);

		if (!response.ok) {
			return { success: false, error: "Failed to get invocation status" };
		}

		const data = await response.json();
		return { success: true, data };
	} catch {
		return { success: false, error: "Network error" };
	}
}

const PLAYER_API_URL = process.env.PLAYER_API_URL || "http://localhost:8082";

/**
 * Get all monsters owned by the current user (GET /monsters/my-monsters)
 */
export async function getMyMonsters(): Promise<{
	success: boolean;
	data?: Monster[];
	error?: string;
}> {
	try {
		const response = await authFetch(`${MONSTER_API_URL}/monsters/my-monsters`);

		if (!response.ok) {
			return { success: false, error: "Failed to fetch monsters" };
		}

		const data = await response.json();
		return { success: true, data };
	} catch {
		return { success: false, error: "Network error" };
	}
}

/**
 * Get current player's profile (GET /players/me)
 */
export async function getMyProfile(): Promise<{
	success: boolean;
	data?: {
		username: string;
		level: number;
		monsterIds: number[];
		teamIds?: number[];
	};
	error?: string;
}> {
	try {
		const response = await authFetch(`${PLAYER_API_URL}/players/me`);

		if (!response.ok) {
			return { success: false, error: "Failed to fetch profile" };
		}

		const data = await response.json();
		return { success: true, data };
	} catch {
		return { success: false, error: "Network error" };
	}
}

/**
 * Release a monster from inventory (DELETE /players/me/monsters/{monsterId})
 */
export async function releaseMonster(
	monsterId: number
): Promise<{ success: boolean; error?: string }> {
	try {
		const response = await authFetch(
			`${PLAYER_API_URL}/players/me/monsters/${monsterId}`,
			{ method: "DELETE" }
		);

		if (!response.ok) {
			const error = await response.text();
			return { success: false, error: error || "Release failed" };
		}

		return { success: true };
	} catch {
		return { success: false, error: "Network error" };
	}
}

/**
 * Get a specific monster by ID (GET /monsters/{id})
 */
export async function getMonster(
	monsterId: number
): Promise<{ success: boolean; data?: Monster; error?: string }> {
	try {
		const response = await authFetch(
			`${MONSTER_API_URL}/monsters/${monsterId}`
		);

		if (!response.ok) {
			return { success: false, error: "Failed to fetch monster" };
		}

		const data = await response.json();
		return { success: true, data };
	} catch {
		return { success: false, error: "Network error" };
	}
}

/**
 * Upgrade a skill on a monster (POST /monsters/{id}/upgrade-skill?skillNumber={1,2,3})
 */
export async function upgradeSkill(
	monsterId: number,
	skillNumber: number
): Promise<{ success: boolean; data?: Monster; error?: string }> {
	try {
		const response = await authFetch(
			`${MONSTER_API_URL}/monsters/${monsterId}/upgrade-skill?skillNumber=${skillNumber}`,
			{ method: "POST" }
		);

		if (!response.ok) {
			const error = await response.text();
			return { success: false, error: error || "Upgrade failed" };
		}

		const data = await response.json();
		return { success: true, data };
	} catch {
		return { success: false, error: "Network error" };
	}
}
const FIGHT_API_URL = process.env.FIGHT_API_URL || "http://localhost:8085";
const STAMINA_API_URL = process.env.STAMINA_API_URL || "http://localhost:8086";

/**
 * Update player's team (PUT /players/me/team)
 */
export async function setTeam(
	monsterIds: number[]
): Promise<{ success: boolean; error?: string }> {
	try {
		const response = await authFetch(`${PLAYER_API_URL}/players/me/team`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(monsterIds),
		});

		if (!response.ok) {
			const error = await response.text();
			return { success: false, error: error || "Failed to set team" };
		}

		return { success: true };
	} catch (e) {
		return { success: false, error: "Network error" };
	}
}

/**
 * Get a public profile (GET /players/{username})
 */
export async function getPublicProfile(username: string): Promise<{
	success: boolean;
	data?: { username: string; teamIds: number[] };
	error?: string;
}> {
	try {
		const response = await authFetch(`${PLAYER_API_URL}/players/${username}`);

		if (!response.ok) {
			return { success: false, error: "Failed to fetch profile" };
		}

		const data = await response.json();
		return { success: true, data };
	} catch {
		return { success: false, error: "Network error" };
	}
}

/**
 * Get multiple monsters by ID (POST /monsters/batch)
 */
export async function getBatchMonsters(
	ids: number[]
): Promise<{ success: boolean; data?: Monster[]; error?: string }> {
	try {
		const response = await authFetch(`${MONSTER_API_URL}/monsters/batch`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(ids),
		});

		if (!response.ok) {
			return { success: false, error: "Failed to fetch monsters" };
		}

		const data = await response.json();
		return { success: true, data };
	} catch {
		return { success: false, error: "Network error" };
	}
}

/**
 * Find an opponent (GET /fight/matchmaking)
 */
export async function findOpponent(): Promise<{
	success: boolean;
	data?: any; // LeaderboardEntry (typed in types.ts but generic here to avoid circular dep if needed, or import)
	error?: string;
}> {
	try {
		const response = await authFetch(`${FIGHT_API_URL}/fight/matchmaking`);

		if (!response.ok) {
			const error = await response.text();
			return { success: false, error: error || "No opponent found" };
		}

		const data = await response.json();
		return { success: true, data };
	} catch {
		return { success: false, error: "Network error" };
	}
}

/**
 * Start a fight (POST /fight/start)
 * Now returns 202 with fightId + status for async polling.
 */
export async function startFight(
	opponent: string
): Promise<{ success: boolean; data?: FightStartResponse; error?: string }> {
	try {
		const response = await authFetch(`${FIGHT_API_URL}/fight/start`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ opponent }),
		});

		if (!response.ok && response.status !== 202) {
			const error = await response.text();
			return { success: false, error: error || "Failed to start fight" };
		}

		const data = await response.json();
		return { success: true, data };
	} catch {
		return { success: false, error: "Network error" };
	}
}

/**
 * Poll fight status (GET /fight/{id})
 */
export async function getFightStatus(
	fightId: number
): Promise<{ success: boolean; data?: FightStatusResponse; error?: string }> {
	try {
		const response = await authFetch(`${FIGHT_API_URL}/fight/${fightId}`);

		if (!response.ok) {
			const error = await response.text();
			return { success: false, error: error || "Failed to get fight status" };
		}

		const data = await response.json();
		return { success: true, data };
	} catch {
		return { success: false, error: "Network error" };
	}
}

/**
 * Get combat history for the current player (GET /fight/history)
 */
export async function getCombatHistory(
	limit = 20
): Promise<{ success: boolean; data?: CombatHistoryEntry[]; error?: string }> {
	try {
		const response = await authFetch(
			`${FIGHT_API_URL}/fight/history?limit=${limit}`
		);

		if (!response.ok) {
			return { success: false, error: "Failed to fetch combat history" };
		}

		const data = await response.json();
		return { success: true, data };
	} catch {
		return { success: false, error: "Network error" };
	}
}

/**
 * Replay a past fight (POST /fight/replay/{historyId})
 */
export async function replayCombat(
	historyId: number
): Promise<{ success: boolean; data?: ReplayResponse; error?: string }> {
	try {
		const response = await authFetch(
			`${FIGHT_API_URL}/fight/replay/${historyId}`,
			{ method: "POST" }
		);

		if (!response.ok) {
			const error = await response.text();
			return { success: false, error: error || "Replay failed" };
		}

		const data = await response.json();
		return { success: true, data };
	} catch {
		return { success: false, error: "Network error" };
	}
}

/**
 * Get current stamina status (GET /stamina/me)
 */
export async function getStamina(): Promise<{
	success: boolean;
	data?: StaminaStatus;
	error?: string;
}> {
	try {
		const response = await authFetch(`${STAMINA_API_URL}/stamina/me`);

		if (!response.ok) {
			return { success: false, error: "Failed to fetch stamina" };
		}

		const data = await response.json();
		return { success: true, data };
	} catch {
		return { success: false, error: "Network error" };
	}
}

/**
 * Claim free stamina (POST /stamina/claim)
 */
export async function claimStamina(): Promise<{
	success: boolean;
	data?: StaminaStatus;
	error?: string;
}> {
	try {
		const response = await authFetch(`${STAMINA_API_URL}/stamina/claim`, {
			method: "POST",
		});

		if (!response.ok) {
			const error = await response.text();
			return { success: false, error: error || "Claim failed" };
		}

		const data = await response.json();
		return { success: true, data };
	} catch {
		return { success: false, error: "Network error" };
	}
}
