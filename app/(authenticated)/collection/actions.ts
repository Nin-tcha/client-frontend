"use server";

import { revalidatePath } from "next/cache";
import { releaseMonster, getMonster, upgradeSkill } from "@/lib/api";
import type { Monster } from "@/lib/types";

export async function releaseMonsterAction(
	monsterId: number
): Promise<{ success: boolean; error?: string }> {
	const result = await releaseMonster(monsterId);

	if (result.success) {
		revalidatePath("/collection");
	}

	return result;
}

export async function getMonsterAction(
	monsterId: number
): Promise<{ success: boolean; data?: Monster; error?: string }> {
	return getMonster(monsterId);
}

export async function upgradeSkillAction(
	monsterId: number,
	skillNumber: number
): Promise<{ success: boolean; data?: Monster; error?: string }> {
	const result = await upgradeSkill(monsterId, skillNumber);

	if (result.success) {
		revalidatePath("/collection");
	}

	return result;
}
