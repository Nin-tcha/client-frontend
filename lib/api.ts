"use server";

import { authFetch } from "./auth";
import type { Monster, SummonResult } from "./types";

const INVOCATION_API_URL =
	process.env.INVOCATION_API_URL || "http://localhost:8084";
const MONSTER_API_URL =
	process.env.MONSTER_API_URL || "http://localhost:8083";

/**
 * Summon a new monster (POST /invocations)
 */
export async function summon(): Promise<{
	success: boolean;
	data?: SummonResult;
	error?: string;
}> {
	try {
		const response = await authFetch(`${INVOCATION_API_URL}/invocations`, {
			method: "POST",
		});

		if (!response.ok) {
			const error = await response.text();
			return { success: false, error: error || "Summon failed" };
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
	data?: { username: string; level: number; monsterIds: number[] };
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
