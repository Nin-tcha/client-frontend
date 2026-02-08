"use server";

import { login, logout, register } from "@/lib/auth";
import { redirect } from "next/navigation";

export type ActionState = { error: string } | null;

export async function loginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  const result = await login(username, password);

  if (!result.success) {
    return { error: result.error || "Login failed" };
  }

  redirect("/collection");
}

export async function registerAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  if (password.length < 4) {
    return { error: "Password must be at least 4 characters" };
  }

  const result = await register(username, password);

  if (!result.success) {
    return { error: result.error || "Registration failed" };
  }

  redirect("/collection");
}

export async function logoutAction() {
  await logout();
  redirect("/login");
}
