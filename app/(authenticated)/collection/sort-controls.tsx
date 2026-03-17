"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
	DEFAULT_DIR,
	SORT_OPTIONS,
	type MonsterSortDir,
	type MonsterSortKey,
} from "@/lib/monster-sort";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export function SortControls({
	sortKey,
	sortDir,
}: {
	sortKey: MonsterSortKey;
	sortDir: MonsterSortDir;
}) {
	const router = useRouter();
	const params = useSearchParams();

	function navigate(key: MonsterSortKey, dir: MonsterSortDir) {
		const sp = new URLSearchParams(params.toString());
		sp.set("sort", key);
		sp.set("dir", dir);
		router.replace(`?${sp.toString()}`);
	}

	return (
		<div className="flex items-center gap-2 mb-3">
			<span className="text-[10px] text-muted-foreground">Sort:</span>
			<Select
				value={sortKey}
				onValueChange={(v) => {
					const key = v as MonsterSortKey;
					navigate(key, DEFAULT_DIR[key]);
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
				onClick={() => navigate(sortKey, sortDir === "asc" ? "desc" : "asc")}
				title="Toggle sort direction"
			>
				{sortDir === "asc" ? "↑" : "↓"}
			</button>
		</div>
	);
}
