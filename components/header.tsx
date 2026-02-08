"use client";

import { Card, CardContent, CardHeader } from "./ui/card";
import { ProgressBar } from "./ui/progress-bar";
import { Button } from "./ui/button";
import { useAuth } from "./providers/auth-provider";
import { logoutAction } from "@/lib/auth/actions";
import { RiLogoutBoxRLine } from "@remixicon/react";

export function Header() {
  const { session, isLoading } = useAuth();

  // Don't render header on auth pages (when no session and not loading)
  if (!session && !isLoading) {
    return null;
  }

  return (
    <header>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2>{isLoading ? "..." : session?.username}</h2>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="icon" className="size-6">
                <RiLogoutBoxRLine className="size-4" />
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          <ProgressBar value={100} max={100} label="stamina" />
        </CardContent>
      </Card>
    </header>
  );
}