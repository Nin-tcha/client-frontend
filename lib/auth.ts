"use server";

import { cookies } from "next/headers";

const AUTH_COOKIE_NAME = "nintcha_token";
const AUTH_API_URL = process.env.AUTH_API_URL || "http://localhost:8081";

export interface AuthSession {
  username: string;
  role: "USER" | "ADMIN";
  token: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  session?: AuthSession;
}

/**
 * Get the current auth token from cookies
 */
export async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

/**
 * Set the auth token in an HttpOnly cookie
 */
export async function setToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60, // 1 hour (matches backend token expiry)
    path: "/",
  });
}

/**
 * Clear the auth token cookie
 */
export async function clearToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

/**
 * Validate the current session with the backend
 */
export async function validateSession(): Promise<AuthSession | null> {
  const token = await getToken();
  if (!token) return null;

  try {
    const response = await fetch(`${AUTH_API_URL}/auth/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      await clearToken();
      return null;
    }

    const data = await response.json();
    return {
      username: data.username,
      role: data.role || "USER",
      token,
    };
  } catch {
    return null;
  }
}

/**
 * Login with username and password
 */
export async function login(
  username: string,
  password: string
): Promise<AuthResult> {
  try {
    const response = await fetch(`${AUTH_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifiant: username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || "Login failed" };
    }

    const data = await response.json();
    await setToken(data.token);

    // Validate to get user info
    const session = await validateSession();
    if (!session) {
      return { success: false, error: "Failed to validate session" };
    }

    return { success: true, session };
  } catch {
    return { success: false, error: "Network error" };
  }
}

/**
 * Register a new user
 */
export async function register(
  username: string,
  password: string
): Promise<AuthResult> {
  try {
    const response = await fetch(`${AUTH_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifiant: username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || "Registration failed" };
    }

    // Auto-login after registration
    return login(username, password);
  } catch {
    return { success: false, error: "Network error" };
  }
}

/**
 * Logout - clear the session
 */
export async function logout(): Promise<void> {
  await clearToken();
}

/**
 * Make an authenticated API request
 * Use this for all API calls that require authentication
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getToken();

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", token);
  }
  headers.set("Content-Type", "application/json");

  return fetch(url, {
    ...options,
    headers,
  });
}
