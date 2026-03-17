import { getMyMonsters, getMyProfile } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MonsterCard } from "./monster-card";
import { SortControls } from "./sort-controls";
import {
	DEFAULT_DIR,
	SORT_OPTIONS,
	type MonsterSortDir,
	type MonsterSortKey,
	sortMonsters,
} from "@/lib/monster-sort";

const VALID_SORT_KEYS = new Set(SORT_OPTIONS.map((o) => o.value));

export default async function CollectionPage({
	searchParams,
}: {
	searchParams: Promise<{ sort?: string; dir?: string }>;
}) {
	const sp = await searchParams;
	const sortKey: MonsterSortKey = VALID_SORT_KEYS.has(sp.sort ?? "")
		? (sp.sort as MonsterSortKey)
		: "level";
	const sortDir: MonsterSortDir =
		sp.dir === "asc" || sp.dir === "desc" ? sp.dir : DEFAULT_DIR[sortKey];

	const [monstersResult, profileResult] = await Promise.all([
		getMyMonsters(),
		getMyProfile(),
	]);

	const monsterCount = monstersResult.data?.length ?? 0;
	const inventoryLimit = profileResult.data
		? 10 + profileResult.data.level
		: 11;

	const sorted = monstersResult.data
		? sortMonsters(monstersResult.data, sortKey, sortDir)
		: [];

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<h1>Collection</h1>
					<span className="text-[10px] text-muted-foreground">
						{monsterCount} / {inventoryLimit}
					</span>
				</div>
			</CardHeader>
			<CardContent>
				{monstersResult.error && (
					<p className="text-destructive text-[10px]">{monstersResult.error}</p>
				)}

				{monstersResult.success &&
					monstersResult.data &&
					monstersResult.data.length === 0 && (
						<p className="text-muted-foreground text-[10px] text-center">
							No monsters yet. Go summon some!
						</p>
					)}

				{monstersResult.success && monstersResult.data && sorted.length > 0 && (
					<>
						<SortControls sortKey={sortKey} sortDir={sortDir} />
						<div className="grid grid-cols-2 gap-3">
							{sorted.map((monster) => (
								<MonsterCard key={monster.id} monster={monster} />
							))}
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
}
