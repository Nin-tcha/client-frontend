"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { ProgressBar } from "./ui/progress-bar";
import { Button } from "./ui/button";
import { useAuth } from "./providers/auth-provider";
import { logoutAction } from "@/lib/auth/actions";
import { RiLogoutBoxRLine, RiFlashlightFill } from "@remixicon/react";

function formatCountdown(nextClaimAt: string | null): string | null {
	if (!nextClaimAt) return null;
	const diff = new Date(nextClaimAt).getTime() - Date.now();
	if (diff <= 0) return null;
	const minutes = Math.floor(diff / 60000);
	const seconds = Math.floor((diff % 60000) / 1000);
	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function Header() {
	const { session, profile, stamina, isLoading, claimStamina, refreshStamina } = useAuth();
	const [claiming, setClaiming] = useState(false);
	const [countdown, setCountdown] = useState<string | null>(null);

	// Compute the displayed stamina including client-side regen estimate
	const computeDisplayStamina = useCallback(() => {
		if (!stamina) return 0;
		const elapsed = (Date.now() - new Date(stamina.lastRegenTime).getTime()) / 60000;
		const regenned = Math.floor(elapsed);
		return Math.min(stamina.maxStamina, stamina.currentStamina + regenned);
	}, [stamina]);

	const [displayStamina, setDisplayStamina] = useState(0);
	const [regenHint, setRegenHint] = useState<string | null>(null);

	// Update countdown, display stamina, and regen hint every second
	useEffect(() => {
		if (!stamina) return;
		const update = () => {
			setCountdown(formatCountdown(stamina.nextClaimAt));
			const current = computeDisplayStamina();
			setDisplayStamina(current);

			// Compute seconds until next +1 regen
			if (current < (stamina.maxStamina)) {
				const elapsedMs = Date.now() - new Date(stamina.lastRegenTime).getTime();
				const msIntoCurrentMinute = elapsedMs % 60000;
				const secsLeft = Math.ceil((60000 - msIntoCurrentMinute) / 1000);
				setRegenHint(`+1 in ${secsLeft}s`);
			} else {
				setRegenHint(null);
			}
		};
		update();
		const interval = setInterval(update, 1000);
		return () => clearInterval(interval);
	}, [stamina, computeDisplayStamina]);

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