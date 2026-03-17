"use client";

import { useRouter, useSearchParams } from "next/navigation";

const TABS = [
	{ id: "collection", label: "My Monsters" },
	{ id: "released", label: "Released" },
] as const;

export type CollectionTab = (typeof TABS)[number]["id"];

export function TabBar({ activeTab }: { activeTab: CollectionTab }) {
	const router = useRouter();
	const params = useSearchParams();

	function switchTab(tab: CollectionTab) {
		const sp = new URLSearchParams(params.toString());
		sp.set("tab", tab);
		// Reset sort params when switching tabs
		if (tab === "released") {
			sp.delete("sort");
			sp.delete("dir");
		}
		router.replace(`?${sp.toString()}`);
	}

	return (
		<div className="flex border-b border-border mb-8">
			{TABS.map((tab) => (
				<button
					key={tab.id}
					type="button"
					onClick={() => switchTab(tab.id)}
					className={`flex-1 py-4 text-center font-bold relative transition-colors ${
						activeTab === tab.id
							? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-primary"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					{tab.label}
				</button>
			))}
		</div>
	);
}
