"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Newspaper, BookOpen, Flame, LogIn } from "lucide-react";

const publicNavItems = [
  { href: "/feed", label: "Feed", icon: Newspaper },
];

const protectedNavItems = [
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/streak", label: "Streak", icon: Flame },
];

export function MobileNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<unknown>(undefined);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const navItems = user
    ? [...publicNavItems, ...protectedNavItems]
    : [...publicNavItems, { href: "/login", label: "Log In", icon: LogIn }];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-[var(--card)] px-2 py-1 z-50">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "text-[var(--primary)]"
                  : "text-[var(--muted-foreground)]"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
