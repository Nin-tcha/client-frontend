"use client";

import { useState } from "react";
import type { Monster } from "@/lib/types";
import Image from "next/image";
import { MonsterDetailModal } from "./monster-detail-modal";

const RARITY_BORDER: Record<string, string> = {
	COMMON:    "border-t-gray-500   border-l-gray-500",
	RARE:      "border-t-blue-500   border-l-blue-500",
	EPIC:      "border-t-purple-500 border-l-purple-500",
	LEGENDARY: "border-t-amber-400  border-l-amber-400",
	MYTHIC:    "border-t-red-500    border-l-red-500",
};

const ELEMENT_BORDER: Record<string, string> = {
	FEU:   "border-b-red-500     border-r-red-500",
	EAU:   "border-b-blue-500    border-r-blue-500",
	VENT:  "border-b-emerald-500 border-r-emerald-500",
	TERRE: "border-b-amber-700   border-r-amber-700",
};

interface MonsterCardProps {
	monster: Monster;
	onMonsterUpdated?: () => void;
	onClick?: () => void;
	selected?: boolean;
}

export function MonsterCard({
	monster,
	onMonsterUpdated,
	onClick,
	selected,
}: MonsterCardProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentMonster, setCurrentMonster] = useState(monster);

	const xpPercent =
		currentMonster.xpThreshold > 0
			? (currentMonster.experience / currentMonster.xpThreshold) * 100
			: 0;

	const handleClick = () => {
		if (onClick) {
			onClick();
		} else {
			setIsModalOpen(true);
		}
	};

	const rarityBorder = currentMonster.rarity
		? (RARITY_BORDER[currentMonster.rarity] ?? "border-t-black border-l-black")
		: "border-t-black border-l-black";
	const elementBorder = ELEMENT_BORDER[currentMonster.element] ?? "border-b-black border-r-black";

	return (
		<>
			<button
				type="button"
				onClick={handleClick}
				className={`border-4 bg-card relative text-left w-full h-full flex flex-col hover:bg-muted transition-colors cursor-pointer overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] ${
					selected
						? "border-primary ring-2 ring-primary"
						: `${rarityBorder} ${elementBorder}`
				}`}
			>
				{/* Image area */}
				<div className="relative w-full aspect-square bg-muted overflow-hidden">
					{currentMonster.pictureUrl ? (
						<Image
							src={currentMonster.pictureUrl}
							alt={currentMonster.name}
							fill
							className="object-cover"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center">
							<span className="text-[8px] text-muted-foreground">No Image</span>
						</div>
					)}

					{/* Level — bottom-left overlay */}
					<span className="absolute bottom-3 left-1 z-10 px-1 py-0.5 bg-black/75 text-white text-[8px] font-bold border border-black">
						Lv.{currentMonster.level}
					</span>

					{/* XP bar — bottom of image */}
					<div className="absolute bottom-0 left-0 right-0 h-2 bg-black/60 z-10">
						<div
							className="h-full bg-green-400"
							style={{ width: `${Math.min(xpPercent, 100)}%` }}
						/>
					</div>
				</div>

				{/* Name strip */}
				<div className="px-2 py-1.5 border-t border-black">
					<h3 className="text-[10px] font-bold truncate">
						{currentMonster.name}
					</h3>
				</div>
			</button>

			{isModalOpen && (
				<MonsterDetailModal
					monster={currentMonster}
					onClose={() => setIsModalOpen(false)}
					onUpdate={(updatedMonster) => {
						setCurrentMonster(updatedMonster);
					}}
					onRelease={() => {
						onMonsterUpdated?.();
					}}
				/>
			)}
		</>
	);
}
