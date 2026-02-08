"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { loginAction } from "@/lib/auth/actions";

export default function LoginPage() {
	const [state, formAction, isPending] = useActionState(loginAction, null);
	const usernameId = useId();
	const passwordId = useId();

	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh]">
			<Card className="w-full">
				<CardHeader>
					<h1 className="text-center">Login</h1>
				</CardHeader>
				<CardContent>
					<form action={formAction} className="flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<label htmlFor={usernameId} className="text-[10px]">
								Username
							</label>
							<input
								id={usernameId}
								name="username"
								type="text"
								required
								className="border-2 border-black px-3 py-2 text-xs bg-input"
								placeholder="Enter username"
							/>
						</div>

						<div className="flex flex-col gap-2">
							<label htmlFor={passwordId} className="text-[10px]">
								Password
							</label>
							<input
								id={passwordId}
								name="password"
								type="password"
								required
								className="border-2 border-black px-3 py-2 text-xs bg-input"
								placeholder="Enter password"
							/>
						</div>

						{state?.error && (
							<p className="text-destructive text-[10px]">{state.error}</p>
						)}

						<Button type="submit" disabled={isPending}>
							{isPending ? "Loading..." : "Login"}
						</Button>

						<p className="text-center text-[10px] text-muted-foreground">
							No account?{" "}
							<Link href="/register" className="underline text-primary">
								Register
							</Link>
						</p>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
