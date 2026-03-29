"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { getCombatHistory, replayCombat } from "@/lib/api";
import type {
	CombatHistoryEntry,
	FightResult,
	Monster
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { useEffect, useState, useTransition } from "react";

interface HistoryViewProps {
	onReplayStart: (
		result: FightResult,
		myTeam: Monster[],
		oppTeam: Monster[],
		myUsername: string,
		oppUsername: string
	) => void;
	myUsername: string;
}

export function HistoryView({ onReplayStart, myUsername }: HistoryViewProps) {
	const [history, setHistory] = useState<CombatHistoryEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [replayingId, setReplayingId] = useState<number | null>(null);
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		getCombatHistory(20).then((res) => {
			if (res.success && res.data) {
				setHistory(res.data);
			} else {
				setError(res.error || "Failed to load history");
			}
			setLoading(false);
		});
	}, []);

	const handleReplay = (entry: CombatHistoryEntry) => {
		setReplayingId(entry.id);
		startTransition(async () => {
			const res = await replayCombat(entry.id);
			setReplayingId(null);
			if (res.success && res.data) {
				const { replay, teamA, teamB, original } = res.data;

				const isPlayerA = myUsername === original.playerA;
				const myTeam = isPlayerA ? teamA : teamB;
				const oppTeam = isPlayerA ? teamB : teamA;
				const oppUsername = isPlayerA ? original.playerB : original.playerA;

				onReplayStart(replay, myTeam, oppTeam, myUsername, oppUsername);
			} else {
				setError(res.error || "Replay failed");
			}
		});
	};

	const formatDate = (dateStr: string) => {
		try {
			const d = new Date(dateStr);
			return d.toLocaleDateString(undefined, {
				month: "short",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch {
			return dateStr;
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-48">
				<Loader />
			</div>
		);
	}

	if (error && history.length === 0) {
		return (
			<div className="text-center py-10 space-y-4">
				<p className="text-destructive font-bold">{error}</p>
				<Button
					onClick={() => {
						setError(null);
						setLoading(true);
						getCombatHistory(20).then((res) => {
							if (res.success && res.data) setHistory(res.data);
							else setError(res.error || "Failed");
							setLoading(false);
						});
					}}
				>
					Retry
				</Button>
			</div>
		);
	}

	if (history.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-10 space-y-4">
				<div className="text-4xl">⚔️</div>
				<h2 className="text-xl font-bold text-muted-foreground">
					No battles yet
				</h2>
				<p className="text-muted-foreground text-sm text-center max-w-sm">
					Fight some opponents in the arena and your history will
					appear here!
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			<h2 className="text-lg font-bold text-center mb-4">
				Battle History
			</h2>

			{error && (
				<p className="text-destructive text-sm text-center mb-2">
					{error}
				</p>
			)}

			<div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
				{history.map((entry) => {
					const isWin = entry.winner === myUsername;
					const opponent =
						entry.playerA === myUsername
							? entry.playerB
							: entry.playerA;
					const myElo =
						entry.playerA === myUsername
							? entry.playerAEloAfter
							: entry.playerBEloAfter;

					return (
						<Card
							key={entry.id}
							className={cn(
								"p-4 flex items-center justify-between gap-3 transition-colors border-l-4",
								isWin
									? "border-l-green-500"
									: "border-l-red-500"
							)}
						>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 mb-1">
									<span
										className={cn(
											"text-xs font-extrabold uppercase px-2 py-0.5 rounded",
											isWin
												? "bg-green-500/15 text-green-600"
												: "bg-red-500/15 text-red-600"
										)}
									>
										{isWin ? "WIN" : "LOSS"}
									</span>
									<span className="font-bold text-sm truncate">
										vs {opponent}
									</span>
								</div>
								<div className="flex items-center gap-3 text-xs text-muted-foreground">
									<span>
										Elo:{" "}
										<span className="font-mono font-bold text-foreground">
											{myElo}
										</span>
									</span>
									<span className="opacity-50">•</span>
									<span>{formatDate(entry.foughtAt)}</span>
								</div>
							</div>

							<Button
								variant="outline"
								size="sm"
								className="shrink-0 font-bold text-xs"
								onClick={() => handleReplay(entry)}
								disabled={
									isPending || replayingId === entry.id
								}
							>
								{replayingId === entry.id
									? <Loader size="sm" />
									: "▶ Replay"}
							</Button>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
