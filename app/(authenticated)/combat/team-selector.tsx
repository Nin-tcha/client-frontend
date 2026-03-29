"use client";

import { useEffect, useState, useTransition } from "react";
import type { Monster } from "@/lib/types";
import { getMyMonsters, getMyProfile, setTeam } from "@/lib/api";
import { MonsterCard } from "../collection/monster-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
	DEFAULT_DIR,
	SORT_OPTIONS,
	type MonsterSortDir,
	type MonsterSortKey,
	sortMonsters,
} from "@/lib/monster-sort";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export function TeamSelector() {
	const [monsters, setMonsters] = useState<Monster[]>([]);
	const [selectedIds, setSelectedIds] = useState<number[]>([]);
	const [sortKey, setSortKey] = useState<MonsterSortKey>("level");
	const [sortDir, setSortDir] = useState<MonsterSortDir>(DEFAULT_DIR["level"]);
	const [isPending, startTransition] = useTransition();
	const toast = useToast();

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
			toast.error("Please select at least one monster!");
			return;
		}
		startTransition(async () => {
			const res = await setTeam(selectedIds);
			if (res.success) {
				toast.success("Team saved successfully!");
			} else {
				toast.error("Failed to save team: " + res.error);
			}
		});
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-bold mb-2">My Team ({selectedIds.length}/3)</h2>
				<div className="flex gap-4">
					{selectedIds.map((id) => {
						const monster = monsters.find((m) => m.id === id);
						if (!monster) return null;
						return (
							<div key={id} className="w-1/3">
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
								className="w-1/3 border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/10 text-muted-foreground text-sm font-medium aspect-square"
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
				<div className="flex items-center gap-3 mb-2">
					<h2 className="text-xl font-bold">Available Monsters</h2>
					<Select
						value={sortKey}
						onValueChange={(v) => {
							const key = v as MonsterSortKey;
							setSortKey(key);
							setSortDir(DEFAULT_DIR[key]);
						}}
					>
						<SelectTrigger size="sm">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{SORT_OPTIONS.map((opt) => (
								<SelectItem key={opt.value} value={opt.value}>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<button
						type="button"
						className="text-[10px] text-muted-foreground border border-input px-1.5 py-1 hover:text-foreground transition-colors"
						onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
						title="Toggle sort direction"
					>
						{sortDir === "asc" ? "↑" : "↓"}
					</button>
				</div>
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{sortMonsters(monsters, sortKey, sortDir)
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
