"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CombatEvent, FightResult, Monster } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useEffect, useReducer, useRef, useState } from "react";
import { FighterSprite } from "./fighter-sprite";

interface BattleSceneProps {
	result: FightResult;
	myMonster: Monster;
	oppMonster: Monster;
	myUsername?: string;
	oppUsername?: string;
	onClose: () => void;
}

interface FighterState {
	currentHp: number;
	maxHp: number;
	animation: "idle" | "attacking" | "hit" | "dying";
}

const ELEMENT_COLORS: Record<string, string> = {
	FEU: "text-red-500",
	EAU: "text-blue-500",
	VENT: "text-emerald-500",
	TERRE: "text-amber-600",
};

const ELEMENT_LABELS: Record<string, string> = {
	FEU: "🔥 FEU",
	EAU: "💧 EAU",
	VENT: "🌪️ VENT",
	TERRE: "🪨 TERRE",
};

// --- Reducer types ---

interface BattleState {
	eventIndex: number;
	dialogue: string;
	isFinished: boolean;
	currentTurn: number;
	dialogueEffect: "NORMAL" | "STRONG" | "WEAK";
	currentElement: string | null;
	myFighter: FighterState;
	oppFighter: FighterState;
	/** Delay (ms) the effect should wait before advancing to next event */
	stepDelay: number;
}

type BattleAction =
	| { type: "PROCESS_EVENT"; event: CombatEvent; myUsername?: string; myMonsterName: string }
	| { type: "FINISH"; winner: string; myUsername?: string }
	| { type: "ADVANCE" }
	| { type: "SKIP"; events: CombatEvent[]; myUsername?: string; myMonsterHp: number; oppMonsterHp: number };

function battleReducer(state: BattleState, action: BattleAction): BattleState {
	switch (action.type) {
		case "FINISH":
			return {
				...state,
				isFinished: true,
				dialogue: action.winner === action.myUsername ? "You won!" : "You were defeated...",
				dialogueEffect: "NORMAL",
			};

		case "ADVANCE":
			return {
				...state,
				eventIndex: state.eventIndex + 1,
			};

		case "SKIP": {
			let myHP = action.myMonsterHp;
			let oppHP = action.oppMonsterHp;

			action.events.forEach((e) => {
				if (e.type === "DAMAGE") {
					const isMe = e.targetOwner === action.myUsername;
					if (isMe) myHP = e.data.hpAfter as number;
					else oppHP = e.data.hpAfter as number;
				} else if (e.type === "KO") {
					const isMe = e.actorOwner === action.myUsername;
					if (isMe) myHP = 0;
					else oppHP = 0;
				}
			});

			return {
				...state,
				eventIndex: action.events.length,
				myFighter: {
					...state.myFighter,
					currentHp: myHP,
					animation: myHP === 0 ? "dying" : "idle",
				},
				oppFighter: {
					...state.oppFighter,
					currentHp: oppHP,
					animation: oppHP === 0 ? "dying" : "idle",
				},
			};
		}

		case "PROCESS_EVENT": {
			const { event, myUsername, myMonsterName } = action;

			// Base reset for every new event step
			const next: BattleState = {
				...state,
				dialogueEffect: "NORMAL",
				currentElement: null,
				myFighter: { ...state.myFighter, animation: "idle" },
				oppFighter: { ...state.oppFighter, animation: "idle" },
				stepDelay: 1500,
			};

			switch (event.type) {
				case "TURN_START":
					next.currentTurn = event.turn ?? next.currentTurn;
					next.dialogue = `Turn ${event.turn || next.currentTurn} begins!`;
					next.stepDelay = 1000;
					break;

				case "SKILL_USE":
				case "SKIP":
					next.dialogue = event.message || `${event.actor} acts!`;
					if (event.type === "SKILL_USE") {
						const el = event.data.skillElement as string;
						if (el) next.currentElement = el;

						let isActorMe = false;
						if (event.actorOwner && myUsername) {
							isActorMe = event.actorOwner === myUsername;
						} else {
							const actorName = event.actor?.trim();
							isActorMe = actorName === myMonsterName.trim();
						}

						if (isActorMe) {
							next.myFighter = { ...next.myFighter, animation: "attacking" };
						} else {
							next.oppFighter = { ...next.oppFighter, animation: "attacking" };
						}
					}
					next.stepDelay = 1500;
					break;

				case "DAMAGE": {
					next.dialogue = event.message || `${event.target} takes damage!`;
					const hpAfter = event.data.hpAfter as number;

					let isTargetMe = false;
					if (event.targetOwner && myUsername) {
						isTargetMe = event.targetOwner === myUsername;
					} else {
						const targetName = event.target?.trim();
						isTargetMe = targetName === myMonsterName.trim();
					}

					if (isTargetMe) {
						next.myFighter = { ...next.myFighter, currentHp: hpAfter, animation: "hit" };
					} else {
						next.oppFighter = { ...next.oppFighter, currentHp: hpAfter, animation: "hit" };
					}
					next.stepDelay = 1500;

					const damageEl = event.data.skillElement as string;
					if (damageEl) next.currentElement = damageEl;

					const eff = event.data.effectiveness as "NORMAL" | "STRONG" | "WEAK";
					if (eff && eff !== "NORMAL") {
						next.dialogueEffect = eff;
						next.dialogue = `${next.dialogue} — ${eff === "STRONG" ? "It's super effective!" : "It's not very effective..."}`;
					}
					break;
				}

				case "KO":
					next.dialogue = event.message || `${event.target} works!`;
					if (event.target === myMonsterName) {
						next.myFighter = { ...next.myFighter, animation: "dying" };
					} else {
						next.oppFighter = { ...next.oppFighter, animation: "dying" };
					}
					next.stepDelay = 2000;
					break;

				case "VICTORY":
					next.dialogue = event.message || `${event.data.winner} wins!`;
					next.stepDelay = 3000;
					break;
			}

			return next;
		}

		default:
			return state;
	}
}

export function BattleScene({
	result,
	myMonster,
	oppMonster,
	myUsername,
	oppUsername,
	onClose,
}: BattleSceneProps) {
	const [playbackSpeed, setPlaybackSpeed] = useState(1);

	const [state, dispatch] = useReducer(battleReducer, {
		eventIndex: 0,
		dialogue: "Battle Start!",
		isFinished: false,
		currentTurn: 1,
		dialogueEffect: "NORMAL" as const,
		currentElement: null,
		myFighter: { currentHp: myMonster.hp, maxHp: myMonster.hp, animation: "idle" as const },
		oppFighter: { currentHp: oppMonster.hp, maxHp: oppMonster.hp, animation: "idle" as const },
		stepDelay: 1500,
	});

	const {
		eventIndex,
		dialogue,
		isFinished,
		currentTurn,
		dialogueEffect,
		currentElement,
		myFighter,
		oppFighter,
		stepDelay,
	} = state;

	// Use ref to clear timeout on unmount or finish
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (eventIndex >= result.events.length) {
			if (!isFinished) {
				dispatch({ type: "FINISH", winner: result.winner, myUsername });
			}
			return;
		}

		// Process current event — all state updates happen inside the reducer (no direct setState)
		dispatch({
			type: "PROCESS_EVENT",
			event: result.events[eventIndex],
			myUsername,
			myMonsterName: myMonster.name,
		});
	}, [eventIndex, result.events, result.winner, isFinished, myUsername, myMonster.name]);

	// Schedule advancement to next event based on stepDelay from reducer
	useEffect(() => {
		if (isFinished || eventIndex >= result.events.length) return;

		const timer = setTimeout(() => {
			dispatch({ type: "ADVANCE" });
		}, stepDelay / playbackSpeed);
		timeoutRef.current = timer;

		return () => {
			clearTimeout(timer);
			timeoutRef.current = null;
		};
	}, [eventIndex, isFinished, result.events.length, stepDelay, playbackSpeed]);

	const skipBattle = () => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		dispatch({
			type: "SKIP",
			events: result.events,
			myUsername,
			myMonsterHp: myMonster.hp,
			oppMonsterHp: oppMonster.hp,
		});
	};

	return (
		<Card className="flex flex-col items-center justify-center w-full max-w-md mx-auto aspect-[9/16] max-h-[85vh] relative rounded-xl overflow-hidden bg-background">
			{/* Battlefield */}
			<div className="flex-1 w-full relative bg-[url('/battle-bg.png')] bg-cover bg-center overflow-hidden">
				{/* Fallback bg color if image missing */}
				<div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 to-green-900/50 -z-10" />

				{/* Enemy (Top Right) */}
				<div className="absolute top-[10%] right-[10%] flex flex-col items-center z-10 scale-75 sm:scale-100">
					<FighterSprite
						name={oppMonster.name}
						image={oppMonster.pictureUrl || ""}
						currentHp={oppFighter.currentHp}
						maxHp={oppFighter.maxHp}
						isMyMonster={false}
						animationState={oppFighter.animation}
						playbackSpeed={playbackSpeed}
					/>
				</div>

				{/* Player (Bottom Left) */}
				<div className="absolute bottom-[10%] left-[10%] flex flex-col items-center z-20 scale-100 sm:scale-110">
					<FighterSprite
						name={myMonster.name}
						image={myMonster.pictureUrl || ""}
						currentHp={myFighter.currentHp}
						maxHp={myFighter.maxHp}
						isMyMonster={true}
						animationState={myFighter.animation}
						playbackSpeed={playbackSpeed}
					/>
				</div>
			</div>

			{/* Dialogue Box */}
			<div className="w-full border-t border-border bg-card text-card-foreground p-4 h-32 flex flex-col justify-between shrink-0 relative z-30">
				<div className="flex justify-between items-center mb-2">
					<span className="text-xs font-bold text-muted-foreground uppercase tracking-widest border border-border px-2 py-0.5 rounded bg-background">
						Turn {currentTurn}
					</span>

<div className="flex gap-1">
								{[1, 2, 4].map((speed) => (
									<Button
										key={speed}
										variant={playbackSpeed === speed ? "default" : "outline"}
										size="sm"
										className="h-6 w-8 text-[10px] px-0"
										onClick={() => setPlaybackSpeed(speed)}
									>
										{speed}x
									</Button>
								))}
							</div>
				</div>
				<div className="flex justify-between items-start h-full">
					<div className="flex-1 overflow-hidden mr-2">
						{currentElement && (
							<span className={cn(
								"text-[10px] font-bold uppercase mr-1 inline-block mb-0.5",
								ELEMENT_COLORS[currentElement] || "text-muted-foreground"
							)}>
								{ELEMENT_LABELS[currentElement] || currentElement}
							</span>
						)}
						<p className={cn(
							"text-xs font-mono leading-tight line-clamp-3 animate-in fade-in slide-in-from-bottom-1",
							dialogueEffect === "STRONG" && "text-green-500 font-bold",
							dialogueEffect === "WEAK" && "text-red-400",
						dialogueEffect === "NORMAL" && currentElement && ELEMENT_COLORS[currentElement]
						)}>
							{dialogue}
						</p>
					</div>
					{isFinished && (
						<Button
							onClick={onClose}
							variant="default"
							size="sm"
							className="animate-bounce shrink-0 font-bold"
						>
							{result.winner === myUsername ? "REWARD" : "EXIT"}
						</Button>
					)}
					{!isFinished && (
						<div className="flex flex-col items-end gap-1.5">
							
							<div className="flex flex-col items-end">
								<div className="text-[10px] text-muted-foreground animate-pulse text-right">
									Auto-playing
								</div>
								<Button
									variant="ghost"
									size="sm"
									className="h-5 text-[10px] text-muted-foreground hover:text-foreground underline px-0"
									onClick={skipBattle}
								>
									Skip Animation
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
		</Card>
	);
}
