"use client";

import { useState, useTransition } from "react";
import {
	findOpponent,
	getPublicProfile,
	getBatchMonsters,
	startFight,
} from "@/lib/api";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import type { LeaderboardEntry, Monster } from "@/lib/types";
import { MonsterCard } from "../collection/monster-card";

const FIGHT_STAMINA_COST = 10;

interface MatchmakingViewProps {
	onFightInitiated: (
		fightId: number,
		opponent: LeaderboardEntry,
		oppMonster: Monster
	) => void;
}

export function MatchmakingView({ onFightInitiated }: MatchmakingViewProps) {
	const { stamina, refreshStamina } = useAuth();
	const [opponent, setOpponent] = useState<LeaderboardEntry | null>(null);
	const [oppTeam, setOppTeam] = useState<Monster[]>([]);
	const [isSearching, startSearch] = useTransition();
	const [isStarting, startBattle] = useTransition();
	const [error, setError] = useState<string | null>(null);

	const insufficientStamina =
		stamina && stamina.currentStamina < FIGHT_STAMINA_COST;

	const handleSearch = () => {
		setError(null);
		setOpponent(null);
		setOppTeam([]);

		startSearch(async () => {
			const res = await findOpponent();
			if (res.success && res.data) {
				const oppData = res.data;
				setOpponent(oppData);
				// Fetch team
				const profileRes = await getPublicProfile(oppData.username);
				if (profileRes.success && profileRes.data?.teamIds) {
					const monstersRes = await getBatchMonsters(profileRes.data.teamIds);
					if (monstersRes.success && monstersRes.data) {
						setOppTeam(monstersRes.data);
					}
				}
			} else {
				setError(res.error || "Failed to find opponent");
			}
		});
	};

	const handleStartFight = () => {
		if (!opponent) return;

		if (oppTeam.length === 0) {
			setError("Opponent has no valid monsters!");
			return;
		}

		startBattle(async () => {
			const res = await startFight(opponent.username);
			if (res.success && res.data) {
				refreshStamina();
				onFightInitiated(res.data.fightId, opponent, oppTeam[0]);
			} else {
				setError(res.error || "Failed to start fight");
				refreshStamina();
			}
		});
	};

	if (!opponent) {
		return (
			<div className="flex flex-col items-center justify-center py-10 space-y-4">
				<h2 className="text-2xl font-bold">Ready to Battle?</h2>
				<p className="text-muted-foreground text-center max-w-md">
					Find a worthy opponent and test your team&apos;s strength in the arena!
				</p>
				<Button onClick={handleSearch} disabled={isSearching} size="lg">
					{isSearching ? "Searching..." : "Find Opponent"}
				</Button>
				{error && <p className="text-destructive mt-2">{error}</p>}
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="text-2xl font-bold mb-2">Opponent Found!</h2>
				<div className="inline-block border p-4 rounded-lg bg-card text-card-foreground shadow-sm min-w-[300px]">
					<h3 className="text-xl font-bold">{opponent.username}</h3>
					<div className="flex justify-center gap-4 text-sm mt-2">
						<span className="font-medium">
							Elo: <span className="font-bold">{opponent.elo}</span>
						</span>
						<span className="text-green-600 font-medium">
							W: <span className="font-bold">{opponent.wins}</span>
						</span>
						<span className="text-red-600 font-medium">
							L: <span className="font-bold">{opponent.losses}</span>
						</span>
					</div>
				</div>
			</div>

			<div>
				<h4 className="font-semibold mb-3 text-center">Enemy Team</h4>
				<div className="flex justify-center gap-4">
					{oppTeam.length > 0 ? (
						oppTeam.map((m) => (
							<div key={m.id} className="w-1/3 max-w-[180px]">
								{/* Only use MonsterCard for display, disable interactions */}
								<div className="pointer-events-none">
									<MonsterCard monster={m} />
								</div>
							</div>
						))
					) : (
						<p className="text-muted-foreground italic text-center w-full">
							Wait, this opponent has no team?! Easy win!
						</p>
					)}
				</div>
			</div>

			<div className="flex justify-center gap-4 mt-8">
				<Button
					variant="outline"
					onClick={handleSearch}
					disabled={isStarting}
					className="w-32"
				>
					Next
				</Button>
				<Button
					variant="destructive"
					size="lg"
					onClick={handleStartFight}
					disabled={isStarting || !!insufficientStamina}
					className="w-40 font-bold"
				>
					{isStarting
						? "FIGHTING..."
						: insufficientStamina
							? `Need ${FIGHT_STAMINA_COST} Stamina`
							: `FIGHT! (-${FIGHT_STAMINA_COST})`}
				</Button>
			</div>
			{insufficientStamina && (
				<p className="text-destructive text-center text-sm mt-2">
					Not enough stamina! Need {FIGHT_STAMINA_COST}, have {stamina?.currentStamina ?? 0}.
				</p>
			)}
			{error && <p className="text-destructive text-center mt-2">{error}</p>}
		</div>
	);
}
