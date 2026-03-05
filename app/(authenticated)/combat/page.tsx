"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { FightResult, LeaderboardEntry, Monster, CombatEvent } from "@/lib/types";
import { TeamSelector } from "./team-selector";
import { MatchmakingView } from "./matchmaking-view";
import { HistoryView } from "./history-view";
import { BattleScene } from "./battle-scene/index";
import { getMyProfile, getBatchMonsters, getFightStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

const POLL_INTERVAL = 1000; // 1 second
const MAX_POLL_ATTEMPTS = 60; // 60 seconds max

export default function CombatPage() {
	const [view, setView] = useState<"team" | "arena" | "history">("team");
	const [fightResult, setFightResult] = useState<FightResult | null>(null);
	const [fightOpponent, setFightOpponent] =
		useState<LeaderboardEntry | null>(null);
	const [myMonster, setMyMonster] = useState<Monster | null>(null);
	const [oppMonster, setOppMonster] = useState<Monster | null>(null);
	const [myUsername, setMyUsername] = useState<string>("");
	const [oppUsername, setOppUsername] = useState<string>("");
	const [loadingTeam, setLoadingTeam] = useState(false);
	const [isReplay, setIsReplay] = useState(false);

	// Async fight polling state
	const [pendingFightId, setPendingFightId] = useState<number | null>(null);
	const [fightError, setFightError] = useState<string | null>(null);
	const pollCountRef = useRef(0);
	const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Fetch my active monster when entering arena
	useEffect(() => {
		if (view !== "arena") return;
		let cancelled = false;
		async function fetchTeam() {
			setLoadingTeam(true);
			const p = await getMyProfile();
			if (cancelled) return;
			if (p.data) {
				setMyUsername(p.data.username);
				if (p.data.teamIds && p.data.teamIds.length > 0) {
					const res = await getBatchMonsters([
						p.data.teamIds[0],
					]);
					if (!cancelled && res.data && res.data.length > 0) {
						setMyMonster(res.data[0]);
					}
				}
			}
			if (!cancelled) setLoadingTeam(false);
		}
		fetchTeam();
		return () => { cancelled = true; };
	}, [view]);

	// Also fetch username for history tab
	useEffect(() => {
		if (view === "history" && !myUsername) {
			getMyProfile().then((p) => {
				if (p.data) setMyUsername(p.data.username);
			});
		}
	}, [view, myUsername]);

	// Cleanup poll timer on unmount
	useEffect(() => {
		return () => {
			if (pollTimerRef.current) {
				clearTimeout(pollTimerRef.current);
			}
		};
	}, []);

	// Poll for fight completion — use a ref to avoid self-reference lint error
	const pollFightRef = useRef<((fightId: number) => Promise<void>) | null>(null);

	const pollFight = useCallback(async (fightId: number) => {
		pollCountRef.current++;

		if (pollCountRef.current > MAX_POLL_ATTEMPTS) {
			setFightError("Fight timed out. Please check your history later.");
			setPendingFightId(null);
			return;
		}

		const res = await getFightStatus(fightId);
		if (!res.success || !res.data) {
			setFightError(res.error || "Failed to check fight status");
			setPendingFightId(null);
			return;
		}

		const fight = res.data;

		if (fight.status === "COMPLETED") {
			// Parse events from JSON string
			let events: CombatEvent[] = [];
			if (fight.events) {
				try {
					events = JSON.parse(fight.events);
				} catch {
					events = [];
				}
			}

			const result: FightResult = {
				winner: fight.winner || "",
				events,
			};

			setPendingFightId(null);
			setFightResult(result);
			setIsReplay(false);
			return;
		}

		if (fight.status === "FAILED") {
			setFightError(fight.failureReason || "Fight failed");
			setPendingFightId(null);
			return;
		}

		// Still pending/processing — poll again
		pollTimerRef.current = setTimeout(() => pollFightRef.current?.(fightId), POLL_INTERVAL);
	}, []);

	// Keep ref in sync with latest pollFight callback
	useEffect(() => {
		pollFightRef.current = pollFight;
	}, [pollFight]);

	const handleFightInitiated = (
		fightId: number,
		opponent: LeaderboardEntry,
		oppMonsterData: Monster
	) => {
		setFightOpponent(opponent);
		setOppMonster(oppMonsterData);
		setOppUsername(opponent.username);
		setFightError(null);
		setPendingFightId(fightId);
		pollCountRef.current = 0;

		// Start polling
		pollTimerRef.current = setTimeout(() => pollFight(fightId), POLL_INTERVAL);
	};

	const handleReplayStart = (
		result: FightResult,
		replayMyMonster: Monster,
		replayOppMonster: Monster,
		replayMyUsername: string,
		replayOppUsername: string
	) => {
		setFightResult(result);
		setMyMonster(replayMyMonster);
		setOppMonster(replayOppMonster);
		setMyUsername(replayMyUsername);
		setOppUsername(replayOppUsername);
		setIsReplay(true);
	};

	const handleBattleClosed = () => {
		setFightResult(null);
		setFightOpponent(null);
		setOppMonster(null);
		setOppUsername("");
		setIsReplay(false);
	};

	const handleCancelWait = () => {
		if (pollTimerRef.current) {
			clearTimeout(pollTimerRef.current);
		}
		setPendingFightId(null);
		setFightError(null);
		setFightOpponent(null);
		setOppMonster(null);
		setOppUsername("");
	};

	// Show battle scene when fight result is ready
	if (fightResult && myMonster && oppMonster) {
		return (
			<BattleScene
				result={fightResult}
				myMonster={myMonster}
				oppMonster={oppMonster}
				myUsername={myUsername}
				oppUsername={isReplay ? oppUsername : fightOpponent?.username || oppUsername}
				onClose={handleBattleClosed}
			/>
		);
	}

	// Show waiting screen while fight is being processed
	if (pendingFightId !== null) {
		return (
			<div className="container px-4 py-8 mx-auto max-w-4xl">
				<div className="flex flex-col items-center justify-center py-16 space-y-6">
					<h2 className="text-2xl font-bold text-center uppercase tracking-wider text-primary">
						Battle in Progress
					</h2>
					<div className="border-2 border-black p-8 bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
						<div className="flex flex-col items-center space-y-4">
							<Loader size="xl" centered={false} />
							<p className="text-center text-sm font-medium">
								{myUsername} vs {fightOpponent?.username || oppUsername}
							</p>
							<p className="text-center text-xs text-muted-foreground animate-pulse">
								Waiting for battle results...
							</p>
						</div>
					</div>
					{fightError && (
						<div className="text-center space-y-3">
							<p className="text-destructive font-bold">{fightError}</p>
							<Button variant="outline" onClick={handleCancelWait}>
								Back to Arena
							</Button>
						</div>
					)}
				</div>
			</div>
		);
	}

	// Show fight error (after polling ended)
	if (fightError) {
		return (
			<div className="container px-4 py-8 mx-auto max-w-4xl">
				<div className="flex flex-col items-center justify-center py-16 space-y-6">
					<h2 className="text-2xl font-bold text-center uppercase tracking-wider text-destructive">
						Battle Failed
					</h2>
					<p className="text-destructive">{fightError}</p>
					<Button onClick={handleCancelWait}>Back to Arena</Button>
				</div>
			</div>
		);
	}

	const tabs = [
		{ id: "team" as const, label: "My Team" },
		{ id: "arena" as const, label: "Find Match" },
		{ id: "history" as const, label: "History" },
	];

	return (
		<div className="container px-4 py-8 mx-auto max-w-4xl">
			<h1 className="text-3xl font-extrabold mb-8 text-center uppercase tracking-widest text-primary">
				Battle Arena
			</h1>

			<div className="flex border-b border-border mb-8">
				{tabs.map((tab) => (
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
				{view === "team" ? (
					<TeamSelector />
				) : view === "history" ? (
					myUsername ? (
						<HistoryView
							onReplayStart={handleReplayStart}
							myUsername={myUsername}
						/>
					) : (
						<div className="flex justify-center items-center h-48">
							<p className="text-muted-foreground animate-pulse">
								Loading...
							</p>
						</div>
					)
				) : loadingTeam ? (
					<div className="flex justify-center items-center h-48">
						<p className="text-muted-foreground animate-pulse">
							Preparing your team...
						</p>
					</div>
				) : myMonster ? (
					<MatchmakingView onFightInitiated={handleFightInitiated} />
				) : (
					<div className="text-center py-10 space-y-4">
						<p className="text-red-500 font-bold">
							You have no team selected!
						</p>
						<p className="text-muted-foreground">
							Please go to &quot;My Team&quot; and select at least one
							monster to fight.
						</p>
						<Button onClick={() => setView("team")}>
							Go to Team Selection
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
