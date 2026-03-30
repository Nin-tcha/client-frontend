"use client";

import { useState } from "react";
import type { Monster } from "@/lib/types";
import { MonsterCard } from "./monster-card";

interface CollectionGridProps {
	monsters: Monster[];
}

export function CollectionGrid({ monsters }: CollectionGridProps) {
	const [items, setItems] = useState(monsters);

	return (
		<div className="grid grid-cols-2 gap-3">
			{items.map((monster) => (
				<MonsterCard
					key={monster.id}
					monster={monster}
					onMonsterUpdated={() =>
						setItems((prev) => prev.filter((m) => m.id !== monster.id))
					}
				/>
			))}
		</div>
	);
}
