
"use client";

import { cn } from "@/lib/utils";
import { RiLoader4Line } from "@remixicon/react";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
	size?: "sm" | "md" | "lg" | "xl";
	centered?: boolean;
}

export function Loader({ 
	className, 
	size = "md", 
	centered = true,
	...props 
}: LoaderProps) {
	const sizeClasses = {
		sm: "size-4",
		md: "size-6",
		lg: "size-8",
		xl: "size-12",
	};

	return (
		<div
			className={cn(
				"flex items-center",
				centered && "justify-center w-full h-full min-h-[100px]",
				className
			)}
			{...props}
		>
			<RiLoader4Line 
				className={cn("animate-spin text-primary", sizeClasses[size])} 
			/>
			<span className="sr-only">Loading...</span>
		</div>
	);
}

/**
 * Full-area overlay with a centered spinner.
 * Drop this inside any `relative` container to cover it while loading.
 */
export function LoadingOverlay({ className }: { className?: string }) {
	return (
		<div className={cn("absolute inset-0 z-50 flex items-center justify-center", className)}>
			<RiLoader4Line className="size-6 animate-spin text-primary" />
		</div>
	);
}
