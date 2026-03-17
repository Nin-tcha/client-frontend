"use client";

import { useActionState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";
import { summonAction, type SummonState } from "./actions";
import { LoadingOverlay } from "@/components/ui/loader";
import Image from "next/image";

const RARITY_BORDER: Record<string, string> = {
	COMMON:    "border-t-gray-500   border-l-gray-500",
	RARE:      "border-t-blue-500   border-l-blue-500",
	EPIC:      "border-t-purple-500 border-l-purple-500",
	LEGENDARY: "border-t-amber-400  border-l-amber-400",
	MYTHIC:    "border-t-red-500    border-l-red-500",
};

const ELEMENT_BORDER: Record<string, string> = {
	FEU:   "border-b-red-500     border-r-red-500",
	EAU:   "border-b-blue-500    border-r-blue-500",
	VENT:  "border-b-emerald-500 border-r-emerald-500",
	TERRE: "border-b-amber-700   border-r-amber-700",
};

const SUMMON_STAMINA_COST = 20;

export default function SummonPage() {
	const [state, formAction, isPending] = useActionState<SummonState, FormData>(
		summonAction,
		null
	);
	const formId = useId();
	const { profile, stamina, refresh, refreshStamina } = useAuth();

	const isInventoryFull =
		profile && profile.monsterCount >= profile.inventoryLimit;

	const insufficientStamina =
		stamina && stamina.currentStamina < SUMMON_STAMINA_COST;

	const handleSubmit = async (formData: FormData) => {
		await formAction(formData);
		// Refresh profile and stamina after summon to update header
		refresh();
		refreshStamina();
	};

	const summonResult = state?.success && state.result ? state.result : null;
	const rarityBorder = summonResult?.rarity
		? (RARITY_BORDER[summonResult.rarity] ?? "border-t-black border-l-black")
		: "border-t-black border-l-black";
	const elementBorder = summonResult
		? (ELEMENT_BORDER[summonResult.element] ?? "border-b-black border-r-black")
		: "border-b-black border-r-black";

	return (
		<Card>
			<CardHeader>
				<h1>Summon</h1>
			</CardHeader>
			<CardContent className="flex flex-col gap-4 relative">
                {isPending && <LoadingOverlay />}
				{/* Summon Result Display */}
				{summonResult && (
					<div className={`border-4 bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden ${rarityBorder} ${elementBorder}`}>
						{/* Image area */}
						<div className="relative w-full aspect-square bg-muted overflow-hidden">
							{summonResult.pictureUrl ? (
								<Image
									src={summonResult.pictureUrl}
									alt={summonResult.name}
									fill
									className="object-cover"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center">
									<span className="text-[8px] text-muted-foreground">No Image</span>
								</div>
							)}
						</div>

						{/* Name strip */}
						<div className="px-2 py-1.5 border-t border-black">
							<h2 className="text-[10px] font-bold truncate">
								{summonResult.name}
							</h2>
						</div>

						{/* Stats grid */}
						<div className="grid grid-cols-4 gap-1 text-[8px] px-2 py-1.5 border-t border-black">
							<div className="text-center">
								<div className="font-bold">HP</div>
								<div>{summonResult.baseHp}</div>
							</div>
							<div className="text-center">
								<div className="font-bold">ATK</div>
								<div>{summonResult.baseAtk}</div>
							</div>
							<div className="text-center">
								<div className="font-bold">DEF</div>
								<div>{summonResult.baseDef}</div>
							</div>
							<div className="text-center">
								<div className="font-bold">VIT</div>
								<div>{summonResult.baseVit}</div>
							</div>
						</div>

						{/* Message */}
						{summonResult.message && (
							<p className="text-[8px] text-muted-foreground px-2 py-1.5 border-t border-black">
								{summonResult.message}
							</p>
						)}
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

				{/* Insufficient Stamina Warning */}
				{insufficientStamina && !isInventoryFull && (
					<p className="text-destructive text-[10px] text-center">
						Not enough stamina! Need {SUMMON_STAMINA_COST}, have {stamina?.currentStamina ?? 0}.
					</p>
				)}

				{/* Summon Form */}
				<form id={formId} action={handleSubmit}>
					<Button
						type="submit"
						disabled={isPending || !!isInventoryFull || !!insufficientStamina}
						className="w-full"
					>
						{isPending
							? "Summoning..."
							: isInventoryFull
								? "Inventory Full"
								: insufficientStamina
									? `Need ${SUMMON_STAMINA_COST} Stamina`
									: `Invoke Monster (-${SUMMON_STAMINA_COST} Stamina)`}
					</Button>
				</form>

				<p className="text-[10px] text-muted-foreground text-center">
					Summon a random monster to add to your collection! Costs {SUMMON_STAMINA_COST} stamina.
				</p>
			</CardContent>
		</Card>
	);
}
