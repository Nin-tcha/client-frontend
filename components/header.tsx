"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { ProgressBar } from "./ui/progress-bar";
import { Button } from "./ui/button";
import { useAuth } from "./providers/auth-provider";
import { logoutAction } from "@/lib/auth/actions";
import { RiLogoutBoxRLine, RiFlashlightFill } from "@remixicon/react";

interface StaminaDisplay {
	displayStamina: number;
	countdown: string | null;
	regenHint: string | null;
}

function computeStaminaDisplay(stamina: { currentStamina: number; maxStamina: number; lastRegenTime: string; nextClaimAt?: string | null }): StaminaDisplay {
	const now = Date.now();

	// Countdown to next claim
	let countdown: string | null = null;
	if (stamina.nextClaimAt) {
		const diff = new Date(stamina.nextClaimAt).getTime() - now;
		if (diff > 0) {
			const minutes = Math.floor(diff / 60000);
			const seconds = Math.floor((diff % 60000) / 1000);
			countdown = `${minutes}:${seconds.toString().padStart(2, "0")}`;
		}
	}

	// Estimated current stamina (with client-side regen)
	const elapsed = (now - new Date(stamina.lastRegenTime).getTime()) / 60000;
	const regenned = Math.floor(elapsed);
	const displayStamina = Math.min(stamina.maxStamina, stamina.currentStamina + regenned);

	// Regen hint
	let regenHint: string | null = null;
	if (displayStamina < stamina.maxStamina) {
		const elapsedMs = now - new Date(stamina.lastRegenTime).getTime();
		const msIntoCurrentMinute = elapsedMs % 60000;
		const secsLeft = Math.ceil((60000 - msIntoCurrentMinute) / 1000);
		regenHint = `+1 in ${secsLeft}s`;
	}

	return { displayStamina, countdown, regenHint };
}

export function Header() {
	const { session, profile, stamina, isLoading, claimStamina, refreshStamina } = useAuth();
	const [claiming, setClaiming] = useState(false);
	const [staminaDisplay, setStaminaDisplay] = useState<StaminaDisplay>({ displayStamina: 0, countdown: null, regenHint: null });

	// Recompute stamina display every second — all Date.now() calls happen inside the interval callback (async context)
	useEffect(() => {
		if (!stamina) return;
		const compute = () => setStaminaDisplay(computeStaminaDisplay(stamina));
		// Immediate compute via setTimeout so it is NOT synchronous setState in the effect body
		const immediate = setTimeout(compute, 0);
		const interval = setInterval(compute, 1000);
		return () => { clearTimeout(immediate); clearInterval(interval); };
	}, [stamina]);

	const { displayStamina, countdown, regenHint } = staminaDisplay;

	// Refresh stamina from server every 60s to stay in sync
	useEffect(() => {
		if (!session) return;
		const interval = setInterval(refreshStamina, 60000);
		return () => clearInterval(interval);
	}, [session, refreshStamina]);

	const handleClaim = async () => {
		setClaiming(true);
		await claimStamina();
		setClaiming(false);
	};

	if (!session && !isLoading) {
		return null;
	}

	const canClaim = stamina?.canClaim && !countdown;
	const maxStamina = stamina?.maxStamina ?? 100;

	return (
		<header>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex flex-col gap-1">
							<h2>{isLoading ? "..." : session?.username}</h2>
							{profile && (
								<span className="text-[8px] text-muted-foreground">
									Lv.{profile.level} • {profile.monsterCount}/{profile.inventoryLimit} monsters
								</span>
							)}
						</div>
						<form action={logoutAction}>
							<Button
								type="submit"
								variant="ghost"
								size="icon"
								className="size-6"
							>
								<RiLogoutBoxRLine className="size-4" />
							</Button>
						</form>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex items-end gap-2">
						<div className="flex-1">
							<ProgressBar
								value={stamina ? displayStamina : 0}
								max={maxStamina}
								label="stamina"
								hint={regenHint ?? undefined}
							/>
						</div>
						<Button
							type="button"
							size="sm"
							disabled={!canClaim || claiming}
							onClick={handleClaim}
							className="text-[8px] h-6 px-2 shrink-0"
						>
							<RiFlashlightFill className="size-3 mr-1" />
							{claiming
								? "..."
								: countdown
									? countdown
									: "Claim"}
						</Button>
					</div>
				</CardContent>
			</Card>
		</header>
	);
}