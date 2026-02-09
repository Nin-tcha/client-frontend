"use client";

import type { FightResult, LeaderboardEntry } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface BattleViewProps {
	result: FightResult;
	opponent: LeaderboardEntry;
	onClose: () => void;
}

export function BattleView({ result, opponent, onClose }: BattleViewProps) {
	const isWin = result.winner !== opponent.username;

	return (
		<div className="space-y-6 text-center max-w-2xl mx-auto">
			<div className="py-8 animate-in fade-in zoom-in duration-500">
				<h1
					className={`text-5xl font-extrabold mb-2 tracking-tighter ${
						isWin ? "text-green-600 drop-shadow-md" : "text-red-600 drop-shadow-md"
					}`}
				>
					{isWin ? "VICTORY!" : "DEFEAT"}
				</h1>
				<p className="text-muted-foreground text-lg">
					Winner:{" "}
					<span className="font-bold text-foreground">{result.winner}</span>
				</p>
			</div>

			<div className="text-left">
				<h3 className="font-bold mb-2 flex justify-between items-center">
					<span>Combat Log</span>
					<span className="text-xs font-normal text-muted-foreground">
						{result.events.length} events
					</span>
				</h3>
				<div className="bg-black/90 text-green-400 p-4 rounded-lg h-[400px] overflow-auto text-xs font-mono space-y-1 border border-border shadow-inner">
					{result.events.length === 0 ? (
						<p className="text-muted-foreground italic">No events recorded.</p>
					) : (
						result.events.map((e, i) => (
							<div
								key={`event-${
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									i
								}`}
								className={`border-b border-green-900/30 pb-1 mb-1 last:border-0 ${
									e.type === "TURN_START"
										? "mt-4 pt-2 border-t border-green-500/50 font-bold text-yellow-400"
										: ""
								} ${e.type === "DAMAGE" ? "text-red-400" : ""} ${
									e.type === "HEAL" ? "text-blue-400" : ""
								} ${e.type === "DEATH" ? "text-red-600 font-bold" : ""}`}
							>
								<span className="opacity-50 mr-2">[{e.type}]</span>
								<span>{e.message}</span>
							</div>
						))
					)}
				</div>
			</div>

			<div className="pt-4">
				<Button
					onClick={onClose}
					size="lg"
					className="w-full sm:w-auto min-w-[200px]"
				>
					Return to Arena
				</Button>
			</div>
		</div>
	);
}
