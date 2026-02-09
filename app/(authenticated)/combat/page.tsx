"use client";

import { useState } from "react";
import type { FightResult, LeaderboardEntry } from "@/lib/types";
import { TeamSelector } from "./team-selector";
import { MatchmakingView } from "./matchmaking-view";
import { BattleView } from "./battle-view";

export default function CombatPage() {
	const [view, setView] = useState<"team" | "arena">("team");
	const [fightResult, setFightResult] = useState<FightResult | null>(null);
	const [fightOpponent, setFightOpponent] = useState<LeaderboardEntry | null>(null);

	const handleFightStart = (result: FightResult, opponent: LeaderboardEntry) => {
		setFightResult(result);
		setFightOpponent(opponent);
	};

	const handleBattleClosed = () => {
		setFightResult(null);
		setFightOpponent(null);
	};

	if (fightResult && fightOpponent) {
		return (
			<div className="container px-4 py-8 mx-auto">
				<BattleView
					result={fightResult}
					opponent={fightOpponent}
					onClose={handleBattleClosed}
				/>
			</div>
		);
	}

	return (
		<div className="container px-4 py-8 mx-auto max-w-4xl">
			<h1 className="text-3xl font-extrabold mb-8 text-center uppercase tracking-widest text-primary">
				Battle Arena
			</h1>

			<div className="flex border-b border-border mb-8">
				<button
					type="button"
					onClick={() => setView("team")}
					className={`flex-1 py-4 text-center font-bold relative transition-colors ${
						view === "team"
							? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-primary"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					My Team
				</button>
				<button
					type="button"
					onClick={() => setView("arena")}
					className={`flex-1 py-4 text-center font-bold relative transition-colors ${
						view === "arena"
							? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-primary"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					Find Match
				</button>
			</div>

			<div className="min-h-[400px] animate-in slide-in-from-bottom-4 fade-in duration-500">
				{view === "team" ? (
					<TeamSelector />
				) : (
					<MatchmakingView onFightStart={handleFightStart} />
				)}
			</div>
		</div>
	);
}
