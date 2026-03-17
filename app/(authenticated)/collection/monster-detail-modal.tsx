"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useAuth } from "@/components/providers/auth-provider";
import type { Monster, Skill } from "@/lib/types";
import { upgradeSkillAction, releaseMonsterAction } from "./actions";
import Image from "next/image";
import { RiAddLine, RiCloseLine, RiDeleteBin6Line } from "@remixicon/react";
import { LoadingOverlay } from "@/components/ui/loader";
import { useToast } from "@/components/ui/toast";

const ELEMENT_NAMES: Record<string, string> = {
	FEU: "FIRE",
	EAU: "WATER",
	AIR: "WIND",
	TERRE: "EARTH",
};

const RARITY_COLORS: Record<string, string> = {
	COMMON: "text-gray-400",
	RARE: "text-blue-400",
	EPIC: "text-purple-400",
	LEGENDARY: "text-amber-400",
	MYTHIC: "text-red-400",
};

interface MonsterDetailModalProps {
	monster: Monster;
	onClose: () => void;
	onUpdate: (monster: Monster) => void;
	onRelease: () => void;
}

function SkillCard({
	skill,
	onUpgrade,
	canUpgrade,
	isPending,
}: {
	skill: Skill;
	onUpgrade: () => void;
	canUpgrade: boolean;
	isPending: boolean;
}) {
	return (
		<div className="border border-muted p-2 rounded">
			<div className="flex justify-between items-center mb-1">
				<span className="text-[10px] font-bold">{skill.name}</span>
				<span className="text-[8px] text-muted-foreground">
					Lv.{skill.upgradeLevel}/{skill.maxUpgradeLevel}
				</span>
			</div>
			<div className="text-[8px] text-muted-foreground mb-1">
				DMG: {skill.baseDamage} • {skill.scalingStat} ×{skill.scalingRatio} • CD: {skill.cooldown}
			</div>
			<ProgressBar
				value={skill.upgradeLevel}
				max={skill.maxUpgradeLevel}
				label=""
			/>
			{canUpgrade && skill.upgradeLevel < skill.maxUpgradeLevel && (
				<Button
					size="sm"
					variant="outline"
					className="w-full mt-1 h-6 text-[8px]"
					onClick={onUpgrade}
					disabled={isPending}
				>
					<RiAddLine className="size-3 mr-1" />
					Upgrade
				</Button>
			)}
		</div>
	);
}

export function MonsterDetailModal({
	monster,
	onClose,
	onUpdate,
	onRelease,
}: MonsterDetailModalProps) {
	const [isPending, startTransition] = useTransition();
	const { refresh } = useAuth();
	const [currentMonster, setCurrentMonster] = useState(monster);
	const toast = useToast();

	const handleUpgradeSkill = (skillNumber: number) => {
		// Validation checks
		const skill = currentMonster.skills.find((s) => s.skillNumber === skillNumber);
		if (
			!skill ||
			skill.upgradeLevel >= skill.maxUpgradeLevel ||
			currentMonster.availableSkillPoints <= 0
		) {
			return;
		}

		// Optimistic update
		const previousMonster = currentMonster;
		const updatedSkills = currentMonster.skills.map((s) =>
			s.skillNumber === skillNumber
				? { ...s, upgradeLevel: s.upgradeLevel + 1 }
				: s
		);
		const optimisticMonster = {
			...currentMonster,
			availableSkillPoints: currentMonster.availableSkillPoints - 1,
			skills: updatedSkills,
		};

		setCurrentMonster(optimisticMonster);

		startTransition(async () => {
			const result = await upgradeSkillAction(currentMonster.id, skillNumber);
			if (result.success && result.data) {
				setCurrentMonster(result.data);
				onUpdate(result.data);
				refresh();
			} else {
				// Revert on failure
				setCurrentMonster(previousMonster);
				toast.error(result.error || "Failed to upgrade skill");
			}
		});
	};

	const handleRelease = () => {
		if (confirm(`Release ${currentMonster.name}? This cannot be undone!`)) {
			startTransition(async () => {
				const result = await releaseMonsterAction(currentMonster.id);
				if (result.success) {
					onRelease();
					onClose();
					refresh();
				} else {
					toast.error(result.error || "Failed to release monster");
				}
			});
		}
	};

	const xpPercent = currentMonster.xpThreshold > 0
		? (currentMonster.experience / currentMonster.xpThreshold) * 100
		: 0;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            {isPending && <LoadingOverlay />}
			<Card className="w-full max-w-sm max-h-[90vh] overflow-auto relative">
				<CardHeader>
					<div className="flex justify-between items-start">
						<div className="flex flex-col">
							<h2 className="text-sm font-bold">{currentMonster.name}</h2>
							<div className="flex gap-2 text-[10px] text-muted-foreground">
								<span>
									type:{" "}
									{ELEMENT_NAMES[currentMonster.element] ||
										currentMonster.element}
								</span>
								<span>•</span>
								<span>Lv.{currentMonster.level}</span>
							</div>
							{currentMonster.rarity && (
								<span className={`text-[9px] font-bold uppercase ${RARITY_COLORS[currentMonster.rarity] ?? "text-gray-400"}`}>
									{currentMonster.rarity}
								</span>
							)}
						</div>
						<Button variant="ghost" size="icon" onClick={onClose}>
							<RiCloseLine className="size-4" />
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Monster Image */}
					{currentMonster.pictureUrl && (
						<div className="flex justify-center">
							<Image
								src={currentMonster.pictureUrl}
								alt={currentMonster.name}
								width={96}
								height={96}
								className="rounded"
							/>
						</div>
					)}

					{/* XP Bar */}
					<div>
						<div className="flex justify-between text-[8px] text-muted-foreground mb-1">
							<span>XP</span>
							<span>
								{Math.floor(currentMonster.experience)}/{Math.floor(currentMonster.xpThreshold)}
							</span>
						</div>
						<ProgressBar value={xpPercent} max={100} label="" />
					</div>

					{/* Stats */}
					<div className="grid grid-cols-4 gap-2 text-[10px]">
						<div className="text-center p-2 bg-muted rounded">
							<div className="font-bold">HP</div>
							<div>{currentMonster.hp}</div>
						</div>
						<div className="text-center p-2 bg-muted rounded">
							<div className="font-bold">ATK</div>
							<div>{currentMonster.atk}</div>
						</div>
						<div className="text-center p-2 bg-muted rounded">
							<div className="font-bold">DEF</div>
							<div>{currentMonster.def}</div>
						</div>
						<div className="text-center p-2 bg-muted rounded">
							<div className="font-bold">VIT</div>
							<div>{currentMonster.vit}</div>
						</div>
					</div>

					{/* Skill Points */}
					{currentMonster.availableSkillPoints > 0 && (
						<div className="text-center text-[10px] text-primary font-bold">
							{currentMonster.availableSkillPoints} Skill Point{currentMonster.availableSkillPoints > 1 ? "s" : ""} Available!
						</div>
					)}

					{/* Skills */}
					<div className="space-y-2">
						<h3 className="text-[10px] font-bold">Skills</h3>
						{currentMonster.skills?.length > 0 ? (
							[...currentMonster.skills].sort((a, b) => a.skillNumber - b.skillNumber).map((skill) => (
								<SkillCard
									key={skill.id}
									skill={skill}
									onUpgrade={() => handleUpgradeSkill(skill.skillNumber)}
									canUpgrade={currentMonster.availableSkillPoints > 0}
									isPending={isPending}
								/>
							))
						) : (
							<p className="text-[10px] text-muted-foreground">No skills</p>
						)}
					</div>

					{/* Release Button */}
					<Button
						variant="destructive"
						size="sm"
						className="w-full"
						onClick={handleRelease}
						disabled={isPending}
					>
						<RiDeleteBin6Line className="size-3 mr-1" />
						Release Monster
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
