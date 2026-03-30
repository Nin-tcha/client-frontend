"use client";

import { useState } from "react";
import type { Monster } from "@/lib/types";
import { MonsterCard } from "./monster-card";

interface CollectionGridProps {
	monsters: Monster[];
}

export function CollectionGrid({ monsters }: CollectionGridProps) {
	const [releasedIds, setReleasedIds] = useState<Set<number>>(new Set());
	const visible = monsters.filter((m) => !releasedIds.has(m.id));

	return (
		<div className="grid grid-cols-2 gap-3">
			{visible.map((monster) => (
				<MonsterCard
					key={monster.id}
					monster={monster}
					onMonsterUpdated={() =>
						setReleasedIds((prev) => new Set([...prev, monster.id]))
					}
				/>
			))}
		</div>
	);
}
