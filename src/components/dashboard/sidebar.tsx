"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "cn";
import {
  LayoutDashboard,
  Plus,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  projects?: { id: string; title: string }[];
}

export function Sidebar({ projects = [] }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header / Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-white/10 px-4">
        <Layers className="h-5 w-5 shrink-0 text-indigo-400" />
        {!collapsed && (
          <span className="text-sm font-semibold text-white/90">
            MonoArchitect
          </span>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-16 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-slate-900 text-white/60 transition-colors hover:text-white"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-2 py-3">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
            pathname === "/dashboard"
              ? "bg-white/10 text-white"
              : "text-white/50 hover:bg-white/5 hover:text-white/80",
          )}
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Dashboard</span>}
        </Link>
      </nav>

      {/* New Project */}
      <div className="px-2 pb-2">
        <Button
          variant="default"
          className={cn("w-full gap-2", collapsed && "px-0 justify-center")}
          render={<Link href="/studio/new" />}
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Proyek Baru</span>}
        </Button>
      </div>

      {/* Recent Projects */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-wider text-white/30">
            Proyek Terbaru
          </p>
          <div className="flex flex-col gap-0.5">
            {projects.length === 0 && (
              <p className="px-3 py-2 text-xs text-white/30">
                Belum ada proyek
              </p>
            )}
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/studio/${p.id}`}
                className={cn(
                  "truncate rounded-lg px-3 py-1.5 text-sm transition-colors",
                  pathname === `/studio/${p.id}`
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:bg-white/5 hover:text-white/80",
                )}
              >
                {p.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Spacer */}
      {collapsed && <div className="flex-1" />}

      {/* User Profile */}
      <div className="border-t border-white/10 px-2 py-3">
        <div
          className={cn(
            "flex items-center gap-2",
            collapsed ? "justify-center" : "px-3",
          )}
        >
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt=""
              className="h-7 w-7 shrink-0 rounded-full ring-2 ring-white/10"
            />
          ) : (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500/30 text-[10px] font-medium text-indigo-300">
              {session?.user?.name?.[0] ?? "U"}
            </div>
          )}
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white/80">
                {session?.user?.name ?? "User"}
              </p>
              <p className="truncate text-[10px] text-white/40">
                {session?.user?.email ?? ""}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => signOut()}
              className="shrink-0 rounded p-1 text-white/40 transition-colors hover:text-white/80"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
