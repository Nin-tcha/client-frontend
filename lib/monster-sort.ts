import type { Monster } from "./types";

export type MonsterSortKey =
	| "level"
	| "rarity"
	| "element"
	| "name"
	| "hp"
	| "atk"
	| "def"
	| "vit";

export type MonsterSortDir = "asc" | "desc";

export const SORT_OPTIONS: { value: MonsterSortKey; label: string }[] = [
	{ value: "level", label: "Level" },
	{ value: "rarity", label: "Rarity" },
	{ value: "element", label: "Element" },
	{ value: "name", label: "Name" },
	{ value: "hp", label: "HP" },
	{ value: "atk", label: "ATK" },
	{ value: "def", label: "DEF" },
	{ value: "vit", label: "VIT" },
];

export const DEFAULT_DIR: Record<MonsterSortKey, MonsterSortDir> = {
	level: "desc",
	rarity: "desc",
	hp: "desc",
	atk: "desc",
	def: "desc",
	vit: "desc",
	element: "asc",
	name: "asc",
};

const RARITY_ORDER: Record<string, number> = {
	MYTHIC: 5,
	LEGENDARY: 4,
	EPIC: 3,
	RARE: 2,
	COMMON: 1,
};

const ELEMENT_ORDER: Record<string, number> = {
	EAU: 0,
	FEU: 1,
	TERRE: 2,
	VENT: 3,
};

export function sortMonsters(
	monsters: Monster[],
	key: MonsterSortKey,
	dir: MonsterSortDir = "desc",
): Monster[] {
	return [...monsters].sort((a, b) => {
		let cmp = 0;
		switch (key) {
			case "level":
				cmp = a.level - b.level;
				break;
			case "hp":
				cmp = a.hp - b.hp;
				break;
			case "atk":
				cmp = a.atk - b.atk;
				break;
			case "def":
				cmp = a.def - b.def;
				break;
			case "vit":
				cmp = a.vit - b.vit;
				break;
			case "rarity": {
				const ra = a.rarity != null ? (RARITY_ORDER[a.rarity] ?? 0) : -1;
				const rb = b.rarity != null ? (RARITY_ORDER[b.rarity] ?? 0) : -1;
				cmp = ra - rb;
				break;
			}
			case "element":
				cmp =
					(ELEMENT_ORDER[a.element] ?? 99) - (ELEMENT_ORDER[b.element] ?? 99);
				break;
			case "name":
				cmp = a.name.localeCompare(b.name);
				break;
		}
		return dir === "asc" ? cmp : -cmp;
	});
}
