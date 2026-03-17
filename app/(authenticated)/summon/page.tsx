"use client";

import { useActionState, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { summonAction, type SummonState } from "./actions";
import { InvocationHistoryView } from "./invocation-history-view";
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

const TABS = [
	{ id: "summon" as const, label: "Summon" },
	{ id: "history" as const, label: "History" },
];

export default function SummonPage() {
	const [view, setView] = useState<"summon" | "history">("summon");
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
		<div className="container px-4 py-8 mx-auto max-w-4xl">
			<h1 className="text-3xl font-extrabold mb-8 text-center uppercase tracking-widest text-primary">
				Summon
			</h1>

			<div className="flex border-b border-border mb-8">
				{TABS.map((tab) => (
					<button
						key={tab.id}
						type="button"
						onClick={() => setView(tab.id)}
						className={`flex-1 py-4 text-center font-bold relative transition-colors ${
							view === tab.id
								? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-primary"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>

			<div className="min-h-[400px] animate-in slide-in-from-bottom-4 fade-in duration-500">
				{view === "summon" ? (
					<div className="flex flex-col gap-4 relative">
						{isPending && <LoadingOverlay />}

						{summonResult && (
							<div className={`border-4 bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden ${rarityBorder} ${elementBorder}`}>
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

								<div className="px-2 py-1.5 border-t border-black">
									<h2 className="text-[10px] font-bold truncate">{summonResult.name}</h2>
								</div>

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

								{summonResult.message && (
									<p className="text-[8px] text-muted-foreground px-2 py-1.5 border-t border-black">
										{summonResult.message}
									</p>
								)}
							</div>
						)}

						{state?.error && (
							<p className="text-destructive text-[10px]">{state.error}</p>
						)}

						{isInventoryFull && (
							<p className="text-destructive text-[10px] text-center">
								Inventory full! Release some monsters first.
							</p>
						)}

						{insufficientStamina && !isInventoryFull && (
							<p className="text-destructive text-[10px] text-center">
								Not enough stamina! Need {SUMMON_STAMINA_COST}, have {stamina?.currentStamina ?? 0}.
							</p>
						)}

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
					</div>
				) : (
					<InvocationHistoryView />
				)}
			</div>
		</div>
	);
}
