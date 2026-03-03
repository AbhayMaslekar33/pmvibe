"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";
import { useEffect, useState } from "react";
import {
  Newspaper,
  BookOpen,
  Flame,
  Settings,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";

const publicNavItems = [
  { href: "/feed", label: "Feed", icon: Newspaper },
];

const protectedNavItems = [
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/streak", label: "Streak", icon: Flame },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<unknown>(undefined);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/feed");
    router.refresh();
  }

  const navItems = user
    ? [...publicNavItems, ...protectedNavItems]
    : publicNavItems;

  return (
    <aside className="hidden md:flex flex-col w-56 h-screen border-r bg-[var(--card)] px-3 py-6 fixed left-0 top-0">
      <Link href="/feed" className="px-3 mb-8">
        <span className="text-xl font-bold">
          <span className="text-[var(--primary)]">PM</span>VIBE
        </span>
      </Link>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--secondary)] text-[var(--secondary-foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {user ? (
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      ) : (
        <div className="space-y-1">
          <Link
            href="/login"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Log In
          </Link>
          <Link
            href="/signup"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
          >
            <UserPlus className="h-4 w-4" />
            Sign Up
          </Link>
        </div>
      )}
    </aside>
  );
}
