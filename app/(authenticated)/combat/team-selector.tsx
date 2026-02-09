"use client";

import { useEffect, useState, useTransition } from "react";
import type { Monster } from "@/lib/types";
import { getMyMonsters, getMyProfile, setTeam } from "@/lib/api";
import { MonsterCard } from "../collection/monster-card";
import { Button } from "@/components/ui/button";

export function TeamSelector() {
	const [monsters, setMonsters] = useState<Monster[]>([]);
	const [selectedIds, setSelectedIds] = useState<number[]>([]);
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		async function fetchData() {
			const [monstersRes, profileRes] = await Promise.all([
				getMyMonsters(),
				getMyProfile(),
			]);

			if (monstersRes.success && monstersRes.data) {
				setMonsters(monstersRes.data);
			}

			if (profileRes.success && profileRes.data) {
				// Ensure IDs are valid (user still owns them)
				const ownedIds = monstersRes.data?.map((m) => m.id) || [];
				const validTeam = (profileRes.data.teamIds || []).filter((id) =>
					ownedIds.includes(id)
				);
				setSelectedIds(validTeam);
			}
		}
		fetchData();
	}, []);

	const toggleSelection = (id: number) => {
		if (selectedIds.includes(id)) {
			setSelectedIds((prev) => prev.filter((mid) => mid !== id));
		} else {
			if (selectedIds.length >= 3) return;
			setSelectedIds((prev) => [...prev, id]);
		}
	};

	const handleSave = () => {
		if (selectedIds.length === 0) {
			alert("Please select at least one monster!");
			return;
		}
		startTransition(async () => {
			const res = await setTeam(selectedIds);
			if (res.success) {
				alert("Team saved successfully!");
			} else {
				alert("Failed to save team: " + res.error);
			}
		});
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-bold mb-2">My Team ({selectedIds.length}/3)</h2>
				<div className="flex gap-4 min-h-[140px]">
					{selectedIds.map((id) => {
						const monster = monsters.find((m) => m.id === id);
						if (!monster) return null;
						return (
							<div key={id} className="w-1/3 max-w-[200px]">
								<MonsterCard
									monster={monster}
									onClick={() => toggleSelection(id)}
									selected={true}
								/>
							</div>
						);
					})}
					{Array.from({ length: Math.max(0, 3 - selectedIds.length) }).map(
						(_, i) => (
							<div
								key={`empty-${
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									i
								}`}
								className="w-1/3 max-w-[200px] border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/10 text-muted-foreground text-sm font-medium"
							>
								Empty Slot
							</div>
						)
					)}
				</div>
                <div className="mt-4">
                     <Button 
                        onClick={handleSave} 
                        disabled={isPending || selectedIds.length === 0} 
                        className="w-full sm:w-auto"
                    >
                        {isPending ? "Saving..." : "Save Team"}
                    </Button>
                </div>
			</div>

			<hr className="border-border" />

			<div>
				<h2 className="text-xl font-bold mb-2">Available Monsters</h2>
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{monsters
                        .sort((a, b) => b.level - a.level) // Sort by level desc
                        .map((monster) => (
						<div key={monster.id} className="relative">
							<MonsterCard
								monster={monster}
								selected={selectedIds.includes(monster.id)}
								onClick={() => toggleSelection(monster.id)}
							/>
                            {selectedIds.includes(monster.id) && (
                                <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-bold shadow-sm pointer-events-none">
                                    In Team
                                </div>
                            )}
						</div>
					))}
				</div>
                {monsters.length === 0 && (
                    <p className="text-muted-foreground italic">No monsters found. Go summon some!</p>
                )}
			</div>
		</div>
	);
}
