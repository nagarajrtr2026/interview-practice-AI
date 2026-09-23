import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BrainCircuit,
  History,
  LayoutDashboard,
  Menu,
  Mic,
  Moon,
  Settings,
  Sun,
  UserRound,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/practice", label: "Practice Interview", icon: Mic },
  { to: "/history", label: "Interview History", icon: History },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/12 text-primary"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="h-4.5 w-4.5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-4 py-5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
        <BrainCircuit className="h-5 w-5" />
      </span>
      <span className="font-display text-lg font-semibold tracking-tight">InterviewAI</span>
    </Link>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-sidebar lg:flex">
        <Brand />
        <NavLinks />
        <div className="mt-auto m-3 rounded-xl border bg-card p-4">
          <p className="text-sm font-medium">Practice makes offers</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Run one answer through the analyzer every day.
          </p>
          <Button asChild size="sm" className="mt-3 w-full">
            <Link to="/practice">Start Interview</Link>
          </Button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Brand />
              <NavLinks onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <span className="font-display text-base font-semibold lg:hidden">InterviewAI</span>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-2 rounded-full border bg-card py-1 pl-1 pr-3">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/15 text-primary">
                <UserRound className="h-4 w-4" />
              </span>
              <span className="hidden text-sm font-medium sm:inline">Guest candidate</span>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full min-w-0 max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
