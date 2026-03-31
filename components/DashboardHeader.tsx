"use client";

import { LogOut, Sparkles, Coins } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface DashboardHeaderProps {
  title?: string;
}

export function DashboardHeader({ title = "Acharya" }: DashboardHeaderProps) {
  const { profile, signOut } = useAuth();
  const router = useRouter();

  const credits = profile?.credits ?? 0;
  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "AS";

  return (
    <header className="h-14 border-b border-border/50 bg-card/60 backdrop-blur-xl flex items-center justify-between px-4 z-10 relative">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-mystic-gold" />
          <h1 className="font-heading text-lg font-semibold tracking-wide">
            {title}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* Credits view */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/credits")}
          className="mystic-border hover:bg-primary/10 gap-2"
        >
          <Coins className="h-4 w-4 text-mystic-gold" />
          <span className="font-semibold text-mystic-gold">{credits}</span>
          <span className="text-muted-foreground hidden sm:inline">
            Credits
          </span>
        </Button>
        <ThemeToggle />
        {/* Simple Avatar implementation matching the design */}
        <div className="h-8 w-8 rounded-full border border-primary/30 flex items-center justify-center bg-primary/20 text-primary text-xs font-heading">
          {initials}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOut()}
          className="text-muted-foreground hover:text-destructive h-8 w-8"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
