"use client";

import {
	createContext,
	useCallback,
	useContext,
	useState,
	useEffect,
	useRef,
} from "react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error";

interface Toast {
	id: number;
	message: string;
	variant: ToastVariant;
	dismissing?: boolean;
}

interface ToastContextValue {
	success: (message: string) => void;
	error: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 3000;
const DISMISS_ANIMATION_MS = 200;
const MAX_VISIBLE = 3;

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);
	const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
		new Map()
	);

	const dismiss = useCallback((id: number) => {
		// Start dismiss animation
		setToasts((prev) =>
			prev.map((t) => (t.id === id ? { ...t, dismissing: true } : t))
		);
		// Remove after animation
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
		}, DISMISS_ANIMATION_MS);
	}, []);

	const addToast = useCallback(
		(message: string, variant: ToastVariant) => {
			const id = nextId++;
			setToasts((prev) => {
				const next = [...prev, { id, message, variant }];
				// Evict oldest if over max
				if (next.length > MAX_VISIBLE) {
					const evicted = next[0];
					// Clear its auto-dismiss timer
					const timer = timersRef.current.get(evicted.id);
					if (timer) {
						clearTimeout(timer);
						timersRef.current.delete(evicted.id);
					}
					return next.slice(1);
				}
				return next;
			});

			const timer = setTimeout(() => {
				timersRef.current.delete(id);
				dismiss(id);
			}, AUTO_DISMISS_MS);
			timersRef.current.set(id, timer);
		},
		[dismiss]
	);

	// Cleanup all timers on unmount
	useEffect(() => {
		const timers = timersRef.current;
		return () => {
			timers.forEach((timer) => {
				clearTimeout(timer);
			});
		};
	}, []);

	const contextValue: ToastContextValue = {
		success: useCallback(
			(message: string) => addToast(message, "success"),
			[addToast]
		),
		error: useCallback(
			(message: string) => addToast(message, "error"),
			[addToast]
		),
	};

	return (
		<ToastContext.Provider value={contextValue}>
			{children}
			<div
				className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
				aria-live="polite"
			>
				{toasts.map((toast) => (
					<div
						key={toast.id}
						className={cn(
							"pointer-events-auto border-2 border-black px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xs font-medium max-w-[320px] transition-all duration-200",
							toast.dismissing
								? "opacity-0 translate-x-4"
								: "animate-in slide-in-from-right-5 fade-in duration-200",
							toast.variant === "success" &&
								"bg-primary text-primary-foreground",
							toast.variant === "error" &&
								"bg-destructive text-white"
						)}
						role={toast.variant === "error" ? "alert" : "status"}
					>
						<div className="flex items-center gap-2">
							<span className="shrink-0">
								{toast.variant === "success" ? "+" : "x"}
							</span>
							<span>{toast.message}</span>
						</div>
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
}

export function useToast(): ToastContextValue {
	const ctx = useContext(ToastContext);
	if (!ctx) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return ctx;
}
