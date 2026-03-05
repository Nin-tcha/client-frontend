"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";

interface FighterSpriteProps {
	name: string;
	image: string;
	currentHp: number;
	maxHp: number;
	isMyMonster?: boolean;
	animationState: "idle" | "attacking" | "hit" | "dying";
	playbackSpeed?: number;
}

export function FighterSprite({
	name,
	image,
	currentHp,
	maxHp,
	isMyMonster,
	animationState,
	playbackSpeed = 1,
}: FighterSpriteProps) {
	// Tracks which animationState has had its visual effect cleared by the timeout.
	// When animationState changes, this no longer matches, so effects re-activate.
	const [clearedState, setClearedState] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(true);

	// Derive animation booleans — active when the current animationState hasn't been cleared
	const effectActive = (animationState === "hit" || animationState === "attacking") && clearedState !== animationState;
	const shake = animationState === "hit" && effectActive;
	const flash = animationState === "hit" && effectActive;
	const lunge = animationState === "attacking" && effectActive;

	// Schedule clearing the visual effect after a short duration
	useEffect(() => {
		if (animationState === "hit") {
			const timer = setTimeout(() => {
				setClearedState("hit");
			}, 500 / playbackSpeed);
			return () => clearTimeout(timer);
		}
		if (animationState === "attacking") {
			const timer = setTimeout(() => {
				setClearedState("attacking");
			}, 300 / playbackSpeed);
			return () => clearTimeout(timer);
		}
		// For idle/dying, reset cleared tracking via setTimeout (async, not synchronous in effect body)
		const timer = setTimeout(() => setClearedState(null), 0);
		return () => clearTimeout(timer);
	}, [animationState, playbackSpeed]);

	const hpPercentage = (currentHp / maxHp) * 100;
	const hpColor =
		hpPercentage > 50
			? "bg-green-500"
			: hpPercentage > 20
			? "bg-yellow-500"
			: "bg-red-500";

	return (
		<div
			className={cn(
				"relative flex flex-col items-center transition-all",
				isMyMonster ? "items-start" : "items-end"
			)}
			style={{ 
				transitionDuration: `${300 / playbackSpeed}ms`,
				// @ts-expect-error — CSS custom property not in CSSProperties type
				"--playback-speed": playbackSpeed 
			}}
		>
			{/* Hud */}
			<div className="bg-white/90 border-2 border-black p-2 rounded mb-4 w-48 shadow-lg">
				<div className="flex justify-between items-baseline mb-1">
					<span className="font-bold text-xs uppercase truncate">{name}</span>
					<span className="text-[10px] font-mono">Lv.??</span>
				</div>
				<div className="relative h-4 bg-gray-200 rounded-full border border-gray-400 overflow-hidden">
					<div
						className={cn("h-full transition-all", hpColor)}
						style={{ 
							width: `${Math.max(0, hpPercentage)}%`,
							transitionDuration: `${500 / playbackSpeed}ms`
						}}
					/>
				</div>
				<div className="text-right text-[10px] mt-1 font-mono">
					{Math.max(0, currentHp)} / {maxHp}
				</div>
			</div>

			{/* Sprite */}
			<div
				className={cn(
					"relative size-32 sm:size-48 transition-transform flex items-center justify-center",
					isMyMonster ? "scale-x-[-1]" : "", 
					shake ? "animate-shake" : "",
					lunge ? (isMyMonster ? "translate-x-12" : "-translate-x-12") : "",
					flash ? "opacity-50 brightness-200" : "",
					animationState === "dying" ? "grayscale opacity-0 translate-y-12" : ""
				)}
				style={{ transitionDuration: `${300 / playbackSpeed}ms` }}
			>
                {imageLoading && (
                    <div className={cn("absolute inset-0 flex items-center justify-center", isMyMonster ? "scale-x-[-1]" : "")}>
                        <Loader />
                    </div>
                )}
				<img
					src={image || "/placeholder.png"}
					alt={name}
					className={cn("object-contain w-full h-full drop-shadow-xl", imageLoading ? "opacity-0" : "opacity-100")}
                    onLoad={() => setImageLoading(false)}
				/>
			</div>
		
            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px) rotate(-5deg); }
                    75% { transform: translateX(5px) rotate(5deg); }
                }
                .animate-shake {
                    animation: shake calc(0.4s / var(--playback-speed)) ease-in-out;
                }
            `}</style>
        </div>
	);
}
