"use client";

import { useActionState, useId } from "react";
import Link from "next/link";
import { registerAction } from "@/lib/auth/actions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
	const [state, formAction, isPending] = useActionState(registerAction, null);
	const usernameId = useId();
	const passwordId = useId();
	const confirmPasswordId = useId();

	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh]">
			<Card className="w-full">
				<CardHeader>
					<h1 className="text-center">Register</h1>
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
								placeholder="Choose a username"
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
								placeholder="Choose a password"
							/>
						</div>

						<div className="flex flex-col gap-2">
							<label htmlFor={confirmPasswordId} className="text-[10px]">
								Confirm Password
							</label>
							<input
								id={confirmPasswordId}
								name="confirmPassword"
								type="password"
								required
								className="border-2 border-black px-3 py-2 text-xs bg-input"
								placeholder="Confirm password"
							/>
						</div>

						{state?.error && (
							<p className="text-destructive text-[10px]">{state.error}</p>
						)}

						<Button type="submit" disabled={isPending}>
							{isPending ? "Loading..." : "Register"}
						</Button>

						<p className="text-center text-[10px] text-muted-foreground">
							Already have an account?{" "}
							<Link href="/login" className="underline text-primary">
								Login
							</Link>
						</p>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
