"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { FightResult, Monster } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
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

export function BattleScene({
	result,
	myMonster,
	oppMonster,
	myUsername,
	oppUsername,
	onClose,
}: BattleSceneProps) {
	const [eventIndex, setEventIndex] = useState(0);
	const [dialogue, setDialogue] = useState("Battle Start!");
	const [isFinished, setIsFinished] = useState(false);
	const [currentTurn, setCurrentTurn] = useState(1);
	const [playbackSpeed, setPlaybackSpeed] = useState(1);
	const [dialogueEffect, setDialogueEffect] = useState<"NORMAL" | "STRONG" | "WEAK">("NORMAL");
	const [currentElement, setCurrentElement] = useState<string | null>(null);

	// Fighter states
	const [myFighter, setMyFighter] = useState<FighterState>({
		currentHp: myMonster.hp,
		maxHp: myMonster.hp,
		animation: "idle",
	});
	const [oppFighter, setOppFighter] = useState<FighterState>({
		currentHp: oppMonster.hp,
		maxHp: oppMonster.hp,
		animation: "idle",
	});

	// Use ref to clear timeout on unmount or finish
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (eventIndex >= result.events.length) {
			if (!isFinished) {
				setIsFinished(true);
				setDialogue(
					result.winner === myUsername
						? "You won!"
						: "You were defeated..."
				);
				setDialogueEffect("NORMAL");
			}
			return;
		}

		// Reset animations and effect for new step
		setDialogueEffect("NORMAL");
		setCurrentElement(null);
		setMyFighter((prev) => ({ ...prev, animation: "idle" }));
		setOppFighter((prev) => ({ ...prev, animation: "idle" }));

		const event = result.events[eventIndex];
		let delay = 1500;

		switch (event.type) {
			case "TURN_START":
				if (event.turn) setCurrentTurn(event.turn);
				setDialogue(`Turn ${event.turn || currentTurn} begins!`);
				delay = 1000;
				break;

			case "SKILL_USE":
			case "SKIP":
				setDialogue(event.message || `${event.actor} acts!`);
				if (event.type === "SKILL_USE") {
					const el = event.data.skillElement as string;
					if (el) setCurrentElement(el);
					// Use strict comparison but allow trim just in case
					let isActorMe = false;
					if (event.actorOwner && myUsername) {
						isActorMe = event.actorOwner === myUsername;
					} else {
						const actorName = event.actor?.trim();
						const myName = myMonster.name.trim();
						isActorMe = actorName === myName;
					}

					if (isActorMe) {
						setMyFighter((prev) => ({ ...prev, animation: "attacking" }));
					} else {
						setOppFighter((prev) => ({ ...prev, animation: "attacking" }));
					}
				}
				delay = 1500;
				break;

			case "DAMAGE":
				setDialogue(event.message || `${event.target} takes damage!`);
				// event.data has finalDamage, hpAfter
				const hpAfter = event.data.hpAfter as number;
				// const damage = event.data.finalDamage as number;

				let isTargetMe = false;
				if (event.targetOwner && myUsername) {
					isTargetMe = event.targetOwner === myUsername;
				} else {
					const targetName = event.target?.trim();
					isTargetMe = targetName === myMonster.name.trim();
				}

				if (isTargetMe) {
					setMyFighter((prev) => ({
						...prev,
						currentHp: hpAfter,
						animation: "hit",
					}));
				} else {
					setOppFighter((prev) => ({
						...prev,
						currentHp: hpAfter,
						animation: "hit",
					}));
				}
				delay = 1500;

				const damageEl = event.data.skillElement as string;
				if (damageEl) setCurrentElement(damageEl);

				const eff = event.data.effectiveness as "NORMAL" | "STRONG" | "WEAK";
				if (eff && eff !== "NORMAL") {
					setDialogueEffect(eff);
					setDialogue((prev) => `${prev} — ${eff === "STRONG" ? "It's super effective!" : "It's not very effective..."}`);
				}
				break;

			case "KO":
				setDialogue(event.message || `${event.target} works!`);
				if (event.target === myMonster.name) {
					setMyFighter((prev) => ({ ...prev, animation: "dying" }));
				} else {
					setOppFighter((prev) => ({ ...prev, animation: "dying" }));
				}
				delay = 2000;
				break;

			case "VICTORY":
				setDialogue(event.message || `${event.data.winner} wins!`);
				delay = 3000;
				break;
		}

		const timer = setTimeout(() => {
			setEventIndex((prev) => prev + 1);
		}, delay / playbackSpeed);
		timeoutRef.current = timer;

		return () => {
			clearTimeout(timer);
			timeoutRef.current = null;
		};
	}, [eventIndex, result.events, isFinished, myUsername, myMonster.name, currentTurn, playbackSpeed]);

	const skipBattle = () => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current);

		let myHP = myMonster.hp;
		let oppHP = oppMonster.hp;

		result.events.forEach((e) => {
			if (e.type === "DAMAGE") {
				const isMe = e.targetOwner === myUsername;
				if (isMe) myHP = e.data.hpAfter as number;
				else oppHP = e.data.hpAfter as number;
			} else if (e.type === "KO") {
				const isMe = e.actorOwner === myUsername;
				if (isMe) myHP = 0;
				else oppHP = 0;
			}
		});

		setMyFighter((p) => ({
			...p,
			currentHp: myHP,
			animation: myHP === 0 ? "dying" : "idle",
		}));
		setOppFighter((p) => ({
			...p,
			currentHp: oppHP,
			animation: oppHP === 0 ? "dying" : "idle",
		}));
		setEventIndex(result.events.length);
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
