"use server";

import { summon } from "@/lib/api";

export type SummonState = {
	success: boolean;
	result?: {
		invocationId: number;
		monsterId: number;
		name: string;
		element: string;
		baseHp: number;
		baseAtk: number;
		baseDef: number;
		baseVit: number;
		message: string;
	};
	error?: string;
} | null;

export async function summonAction(
	_prevState: SummonState,
	_formData: FormData
): Promise<SummonState> {
	const result = await summon();

	if (!result.success || !result.data) {
		return { success: false, error: result.error || "Summon failed" };
	}

	return {
		success: true,
		result: {
			invocationId: result.data.invocationId,
			monsterId: result.data.monsterId,
			name: result.data.name,
			element: result.data.element,
			baseHp: result.data.baseHp,
			baseAtk: result.data.baseAtk,
			baseDef: result.data.baseDef,
			baseVit: result.data.baseVit,
			message: result.data.message,
		},
	};
}
