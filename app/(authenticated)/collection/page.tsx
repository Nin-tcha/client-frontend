import { getMyMonsters, getMyProfile } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MonsterCard } from "./monster-card";

export default async function CollectionPage() {
	const [monstersResult, profileResult] = await Promise.all([
		getMyMonsters(),
		getMyProfile(),
	]);

	const monsterCount = monstersResult.data?.length ?? 0;
	const inventoryLimit = profileResult.data
		? 10 + profileResult.data.level
		: 11;

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

				{monstersResult.success &&
					monstersResult.data &&
					monstersResult.data.length > 0 && (
						<div className="grid grid-cols-2 gap-3">
							{monstersResult.data.map((monster) => (
								<MonsterCard key={monster.id} monster={monster} />
							))}
						</div>
					)}
			</CardContent>
		</Card>
	);
}
