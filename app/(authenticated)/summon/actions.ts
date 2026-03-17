"use server";

import { getInvocationStatus, getMonster, summon } from "@/lib/api";

export type SummonState = {
	success: boolean;
	result?: {
		invocationId: number;
		monsterId: number;
		name: string;
		element: string;
		rarity: string | null;
		pictureUrl: string | null;
		baseHp: number;
		baseAtk: number;
		baseDef: number;
		baseVit: number;
		message: string;
	};
	error?: string;
} | null;

const POLL_INTERVAL = 1000; // 1 second
const MAX_POLL_ATTEMPTS = 30; // 30 seconds max

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function summonAction(
	_prevState: SummonState,
	_formData: FormData
): Promise<SummonState> {
	// Step 1: Initiate summon (returns 202 with invocationId)
	const result = await summon();

	if (!result.success || !result.data) {
		return { success: false, error: result.error || "Summon failed" };
	}

	const { invocationId } = result.data;

	// Step 2: Poll for completion
	for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
		await sleep(POLL_INTERVAL);

		const statusRes = await getInvocationStatus(invocationId);
		if (!statusRes.success || !statusRes.data) {
			continue; // retry on transient failure
		}

		const invocation = statusRes.data;

		if (invocation.status === "COMPLETED" && invocation.monsterId) {
			// Step 3: Fetch monster details
			const monsterRes = await getMonster(invocation.monsterId);
			if (monsterRes.success && monsterRes.data) {
				const m = monsterRes.data;
				return {
					success: true,
					result: {
						invocationId,
						monsterId: m.id,
						name: m.name,
						element: m.element,
						rarity: m.rarity ?? null,
						pictureUrl: m.pictureUrl ?? null,
						baseHp: m.hp,
						baseAtk: m.atk,
						baseDef: m.def,
						baseVit: m.vit,
						message: `You summoned ${m.name}!`,
					},
				};
			}
			return {
				success: true,
				result: {
					invocationId,
					monsterId: invocation.monsterId,
					name: "Unknown Monster",
					element: "FEU",
					rarity: null,
					pictureUrl: null,
					baseHp: 0,
					baseAtk: 0,
					baseDef: 0,
					baseVit: 0,
					message: "Monster summoned! Check your collection.",
				},
			};
		}

		if (invocation.status === "FAILED") {
			return {
				success: false,
				error: "Summon failed — not enough stamina or no monsters available.",
			};
		}

		// Still PENDING_STAMINA or PENDING — continue polling
	}

	return {
		success: false,
		error: "Summon is taking too long. Check your collection later.",
	};
}
