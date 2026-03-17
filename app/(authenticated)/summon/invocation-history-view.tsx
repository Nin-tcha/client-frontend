"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { getInvocationHistory } from "@/lib/api";
import type { InvocationHistoryEntry } from "@/lib/types";
import Image from "next/image";

const RARITY_BORDER: Record<string, string> = {
	COMMON:    "border-l-gray-500",
	RARE:      "border-l-blue-500",
	EPIC:      "border-l-purple-500",
	LEGENDARY: "border-l-amber-400",
	MYTHIC:    "border-l-red-500",
};

const RARITY_TEXT: Record<string, string> = {
	COMMON:    "text-gray-400",
	RARE:      "text-blue-400",
	EPIC:      "text-purple-400",
	LEGENDARY: "text-amber-400",
	MYTHIC:    "text-red-400",
};

function formatDate(dateStr: string) {
	try {
		const d = new Date(dateStr);
		return d.toLocaleDateString(undefined, {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return dateStr;
	}
}

export function InvocationHistoryView() {
	const [history, setHistory] = useState<InvocationHistoryEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		getInvocationHistory(20).then((res) => {
			if (res.success && res.data) setHistory(res.data);
			else setError(res.error || "Failed to load history");
			setLoading(false);
		});
	}, []);

	const handleRetry = () => {
		setError(null);
		setLoading(true);
		getInvocationHistory(20).then((res) => {
			if (res.success && res.data) setHistory(res.data);
			else setError(res.error || "Failed to load history");
			setLoading(false);
		});
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-48">
				<Loader />
			</div>
		);
	}

	if (error && history.length === 0) {
		return (
			<div className="text-center py-10 space-y-4">
				<p className="text-destructive font-bold">{error}</p>
				<button
					type="button"
					onClick={handleRetry}
					className="text-xs underline text-muted-foreground hover:text-foreground"
				>
					Retry
				</button>
			</div>
		);
	}

	if (history.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-10 space-y-4">
				<div className="text-4xl">✨</div>
				<h2 className="text-xl font-bold text-muted-foreground">No pulls yet</h2>
				<p className="text-muted-foreground text-sm text-center max-w-sm">
					Summon some monsters and your pull history will appear here!
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
			{history.map((entry) => {
				const borderColor = entry.monsterRarity
					? (RARITY_BORDER[entry.monsterRarity] ?? "border-l-gray-500")
					: "border-l-gray-500";
				const textColor = entry.monsterRarity
					? (RARITY_TEXT[entry.monsterRarity] ?? "text-gray-400")
					: "text-gray-400";

				return (
					<Card
						key={entry.id}
						className={`p-3 flex items-center gap-3 border-l-4 ${borderColor}`}
					>
						{entry.pictureUrl ? (
							<Image
								src={entry.pictureUrl}
								alt={entry.monsterName ?? ""}
								width={32}
								height={32}
								className="shrink-0 object-cover"
							/>
						) : (
							<div className="size-8 shrink-0 bg-muted border border-border" />
						)}

						<div className="flex-1 min-w-0">
							<span className="text-xs font-bold truncate block">
								{entry.monsterName ?? "???"}
							</span>
							{entry.monsterElement && (
								<span className="text-[10px] text-muted-foreground">
									{entry.monsterElement}
								</span>
							)}
						</div>

						{entry.monsterRarity && (
							<span className={`text-[10px] font-bold shrink-0 ${textColor}`}>
								{entry.monsterRarity}
							</span>
						)}

						<span className="text-[10px] text-muted-foreground shrink-0">
							{formatDate(entry.createdAt)}
						</span>
					</Card>
				);
			})}
		</div>
	);
}
