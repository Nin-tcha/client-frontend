"use client";

import { useState } from "react";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { Monster } from "@/lib/types";
import Image from "next/image";
import { MonsterDetailModal } from "./monster-detail-modal";

const ELEMENT_NAMES: Record<string, string> = {
	FEU: "FIRE",
	EAU: "WATER",
	AIR: "WIND",
	TERRE: "EARTH",
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

	return (
		<>
			<button
				type="button"
				onClick={handleClick}
				className={`border-2 p-3 bg-card relative text-left w-full hover:bg-muted transition-colors cursor-pointer ${
					selected ? "border-primary ring-2 ring-primary" : "border-black"
				}`}
			>
				{currentMonster.pictureUrl && (
					<div className="mb-2 flex justify-center">
						<Image
							src={currentMonster.pictureUrl}
							alt={currentMonster.name}
							width={48}
							height={48}
							className="rounded"
						/>
					</div>
				)}

				<div className="flex flex-col mb-1">
					<h3 className="text-[10px] font-bold truncate">{currentMonster.name}</h3>
					<span className="text-[10px] text-muted-foreground">
						type: {ELEMENT_NAMES[currentMonster.element] || currentMonster.element}
					</span>
				</div>

				<div className="text-[8px] text-muted-foreground mb-1">
					Lv.{currentMonster.level}
				</div>

				<ProgressBar value={xpPercent} max={100} label="" />
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
