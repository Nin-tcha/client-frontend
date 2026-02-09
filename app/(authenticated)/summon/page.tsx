"use client";

import { useActionState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";
import { summonAction, type SummonState } from "./actions";

const ELEMENT_COLORS: Record<string, string> = {
	FEU: "bg-red-500",
	EAU: "bg-blue-500",
	AIR: "bg-green-500",
};

export default function SummonPage() {
	const [state, formAction, isPending] = useActionState<SummonState, FormData>(
		summonAction,
		null
	);
	const formId = useId();
	const { profile, refresh } = useAuth();

	const isInventoryFull =
		profile && profile.monsterCount >= profile.inventoryLimit;

	const handleSubmit = async (formData: FormData) => {
		await formAction(formData);
		// Refresh profile after summon to update header
		refresh();
	};

	return (
		<Card>
			<CardHeader>
				<h1>Summon</h1>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				{/* Summon Result Display */}
				{state?.success && state.result && (
					<div className="border-2 border-black p-4 bg-card animate-pulse">
						<div className="flex items-center gap-2 mb-2">
							<span
								className={`w-3 h-3 rounded-full ${ELEMENT_COLORS[state.result.element] || "bg-gray-400"}`}
							/>
							<h2 className="text-sm">{state.result.name}</h2>
						</div>
						<p className="text-[10px] text-muted-foreground">
							{state.result.message}
						</p>
						<div className="mt-2 grid grid-cols-4 gap-1 text-[8px]">
							<div className="text-center">
								<div className="font-bold">HP</div>
								<div>{state.result.baseHp}</div>
							</div>
							<div className="text-center">
								<div className="font-bold">ATK</div>
								<div>{state.result.baseAtk}</div>
							</div>
							<div className="text-center">
								<div className="font-bold">DEF</div>
								<div>{state.result.baseDef}</div>
							</div>
							<div className="text-center">
								<div className="font-bold">VIT</div>
								<div>{state.result.baseVit}</div>
							</div>
						</div>
					</div>
				)}

				{/* Error Display */}
				{state?.error && (
					<p className="text-destructive text-[10px]">{state.error}</p>
				)}

				{/* Inventory Full Warning */}
				{isInventoryFull && (
					<p className="text-destructive text-[10px] text-center">
						Inventory full! Release some monsters first.
					</p>
				)}

				{/* Summon Form */}
				<form id={formId} action={handleSubmit}>
					<Button
						type="submit"
						disabled={isPending || isInventoryFull}
						className="w-full"
					>
						{isPending
							? "Summoning..."
							: isInventoryFull
								? "Inventory Full"
								: "Invoke Monster"}
					</Button>
				</form>

				<p className="text-[10px] text-muted-foreground text-center">
					Summon a random monster to add to your collection!
				</p>
			</CardContent>
		</Card>
	);
}
