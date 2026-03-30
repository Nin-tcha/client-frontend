import { getMyMonsters, getMyProfile } from "@/lib/api";
import { CollectionGrid } from "./collection-grid";
import { SortControls } from "./sort-controls";
import { TabBar, type CollectionTab } from "./tab-bar";
import { ReleaseHistoryView } from "./release-history-view";
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
	searchParams: Promise<{ sort?: string; dir?: string; tab?: string }>;
}) {
	const sp = await searchParams;

	const activeTab: CollectionTab = sp.tab === "released" ? "released" : "collection";
	const sortKey: MonsterSortKey = VALID_SORT_KEYS.has(sp.sort as MonsterSortKey)
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
		<div className="container px-4 py-8 mx-auto max-w-4xl">
			<h1 className="text-3xl font-extrabold mb-8 text-center uppercase tracking-widest text-primary">
				Collection
			</h1>

			<TabBar activeTab={activeTab} />

			<div className="min-h-[400px] animate-in slide-in-from-bottom-4 fade-in duration-500">
				{activeTab === "collection" ? (
					<>
						{monstersResult.error && (
							<p className="text-destructive text-[10px]">{monstersResult.error}</p>
						)}

						{monstersResult.success &&
							monstersResult.data &&
							monstersResult.data.length === 0 && (
								<div className="flex flex-col items-center justify-center py-10 space-y-4">
									<div className="text-4xl">📦</div>
									<h2 className="text-xl font-bold text-muted-foreground">No monsters yet</h2>
									<p className="text-muted-foreground text-sm text-center max-w-sm">
										Go summon some monsters to fill your collection!
									</p>
								</div>
							)}

						{monstersResult.success && monstersResult.data && sorted.length > 0 && (
							<>
								<SortControls sortKey={sortKey} sortDir={sortDir} />
								<CollectionGrid monsters={sorted} />
							</>
						)}
					</>
				) : (
					<ReleaseHistoryView />
				)}
			</div>

			{activeTab === "collection" && monstersResult.data && (
				<p className="text-center text-xs text-muted-foreground mt-4">
					{monsterCount} / {inventoryLimit} monsters
				</p>
			)}
		</div>
	);
}
