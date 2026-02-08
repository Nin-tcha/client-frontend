"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  RiArchiveDrawerLine,
  RiArchiveDrawerFill,
  RiMagicLine,
  RiMagicFill,
  RiSwordLine,
  RiSwordFill,
} from "@remixicon/react";

const navItems = [
  {
    href: "/collection",
    label: "Collection",
    icon: RiArchiveDrawerLine,
    activeIcon: RiArchiveDrawerFill,
  },
  {
    href: "/summon",
    label: "Summon",
    icon: RiMagicLine,
    activeIcon: RiMagicFill,
  },
  {
    href: "/fight",
    label: "Fight",
    icon: RiSwordLine,
    activeIcon: RiSwordFill,
  },
];

export function Footer() {
  const pathname = usePathname();

  return (
    <footer className="mt-auto border-t-2 border-black bg-card">
      <nav className="flex">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = isActive ? item.activeIcon : item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="size-5" />
              <span className="text-[8px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}