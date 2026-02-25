import { ReactNode, useState, useRef, useEffect } from "react";
import {
  History,
  CreditCard,
  Settings,
  LogOut,
  Shield,
  MessageCircle,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

// Properly type navigation union so "admin" is valid
type ViewType = "predict" | "history" | "credits" | "settings" | "admin";

interface DashboardLayoutProps {
  children: ReactNode;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function DashboardLayout({
  children,
  currentView,
  onViewChange,
}: DashboardLayoutProps) {
  const { setTheme } = useTheme();
  const { profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(288); // Default 18rem (72*4)
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const [isResizingActive, setIsResizingActive] = useState(false);
  const minSidebarWidth = 180; // px
  const maxSidebarWidth = 440; // px

  // Mouse move handler for resizing
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isResizing.current) return;
      let newWidth = e.clientX;
      // compute sidebar's left
      if (sidebarRef.current) {
        const sidebarLeft = sidebarRef.current.getBoundingClientRect().left;
        newWidth = e.clientX - sidebarLeft;
        // Because sidebar is at leftmost (left=0), so just use clientX if sidebarLeft is 0. But safe this way.
        newWidth = e.clientX - sidebarLeft;
      }
      // Clamp width
      newWidth = Math.max(minSidebarWidth, Math.min(maxSidebarWidth, newWidth));
      setSidebarWidth(newWidth);
    }
    function onMouseUp() {
      isResizing.current = false;
      setIsResizingActive(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }
    if (isResizing.current) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isResizingActive]);

  const handleDragStart = (e: React.MouseEvent) => {
    isResizing.current = true;
    setIsResizingActive(true);
    e.preventDefault();
  };

  const greeting =
    profile?.faith === "sikhism"
      ? "Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh"
      : "Namaste";

  const baseNav = [
    { id: "predict" as ViewType, name: "Chat", icon: MessageCircle },
    { id: "history" as ViewType, name: "History", icon: History },
    { id: "credits" as ViewType, name: "Buy Credits", icon: CreditCard },
    { id: "settings" as ViewType, name: "Settings", icon: Settings },
  ];
  const adminNav = { id: "admin" as ViewType, name: "Admin", icon: Shield };
  const navigation = profile?.is_admin ? [...baseNav, adminNav] : baseNav;

  return (
    <div className="h-screen w-full flex flex-col bg-linear-to-br from-amber-50 via-orange-50 to-amber-100 dark:bg-linear-to-br dark:from-neutral-900 dark:via-gray-900 dark:to-neutral-950 dark:text-neutral-100">
      {/* Header (Top Bar, like ChatGPT) */}
      <header className="flex items-center justify-between px-4 sm:px-10 h-16 border-b border-amber-200 bg-white/70 dark:bg-neutral-900/80 dark:border-neutral-800 backdrop-blur sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Sparkles className="w-7 h-7 text-amber-500 dark:text-yellow-300" />
          <span className="font-bold text-xl text-amber-900 dark:text-yellow-100 tracking-tight">
            Acharya
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <div className="text-right">
            <p className="text-sm text-gray-900 italic dark:text-neutral-300">
              {greeting}
            </p>
            <p className="font-semibold text-amber-900 dark:text-yellow-50">
              {profile?.full_name}
            </p>
          </div>
          <div className="ml-4 flex items-center gap-2 bg-amber-100 dark:bg-neutral-800 px-4 py-2 rounded-xl border border-amber-300 dark:border-neutral-700 shadow-inner">
            <span className="text-xs text-amber-700 dark:text-yellow-300 uppercase font-semibold tracking-tight">
              Credits
            </span>
            <span className="text-lg font-bold text-amber-800 dark:text-yellow-200">
              {profile?.credits ?? "--"}
            </span>
          </div>
          <button
            onClick={() => signOut()}
            className="ml-3 p-2 bg-amber-50 dark:bg-neutral-800 hover:bg-red-50 dark:hover:bg-red-900 text-amber-900 dark:text-yellow-100 hover:text-red-600 dark:hover:text-red-400 rounded-full border border-transparent hover:border-red-400 transition"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="md:hidden p-2 ml-2 rounded-lg bg-amber-50 dark:bg-neutral-800 text-amber-800 dark:text-neutral-200 hover:bg-orange-100 dark:hover:bg-neutral-700 border border-amber-200 dark:border-neutral-700"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? (
            <X className="w-7 h-7" />
          ) : (
            <Menu className="w-7 h-7" />
          )}
        </button>
      </header>

      {/* Main Layout Flex Row */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar (left - like ChatGPT) */}
        {/* Resizeable container */}
        <div
          className="hidden md:flex h-full"
          style={{ width: `${sidebarWidth}px`, minWidth: minSidebarWidth, maxWidth: maxSidebarWidth }}
        >
          <aside
            ref={sidebarRef}
            className="flex flex-col h-full bg-white/90 dark:bg-neutral-900/90 border-r border-amber-200 dark:border-neutral-800 py-6 px-4 space-y-2"
            style={{ width: "100%" }}
          >
            {/* User Panel Top */}
            <div className="mb-6">
              <div className="flex flex-col items-center text-center gap-1">
                <div className="font-semibold text-amber-900 dark:text-yellow-100">
                  {profile?.full_name}
                </div>
                <div className="text-xs text-gray-500 dark:text-neutral-400">
                  {greeting}
                </div>
                <div className="bg-amber-100 dark:bg-neutral-800 mt-1 px-3 py-1 rounded text-xs font-bold text-amber-700 dark:text-yellow-200">
                  Credits: {profile?.credits ?? "--"}
                </div>
              </div>
            </div>
            {/* Navigation */}
            <nav className="flex flex-col gap-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm ${
                      currentView === item.id
                        ? "bg-amber-600 text-white dark:bg-yellow-600 dark:text-black font-semibold shadow"
                        : "text-gray-800 dark:text-neutral-200 hover:bg-amber-50 dark:hover:bg-neutral-800"
                    } transition-all justify-start`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </button>
                );
              })}
            </nav>
            {/* Spacer */}
            <div className="flex-1" />
            {/* Sign out (bottom left) */}
            <div>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="lg"
                      className="relative w-full flex items-center justify-center rounded-full border border-amber-200 dark:border-yellow-700 bg-amber-50 dark:bg-neutral-900 hover:bg-amber-100 dark:hover:bg-yellow-900 transition-all shadow focus:ring-2 focus:ring-amber-400 dark:focus:ring-yellow-400 mb-2"
                      aria-label="Toggle theme"
                    >
                      <span className="relative flex items-center w-7 h-7">
                        <Sun className="h-full w-full text-amber-500 dark:text-yellow-400 transition-all duration-300 scale-100 rotate-0 dark:scale-0 dark:-rotate-90" />
                        <Moon className="absolute h-full w-full text-amber-600 dark:text-yellow-200 transition-all duration-300 scale-0 rotate-90 dark:scale-100 dark:rotate-0" />
                      </span>
                      <span className="sr-only">Toggle theme</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="center"
                    className="max-w-full bg-white border-amber-200 dark:bg-neutral-900 dark:border-yellow-700 shadow-xl rounded-lg"
                  >
                    <DropdownMenuItem
                      onClick={() => setTheme("light")}
                      className="text-amber-700 dark:text-yellow-300 hover:bg-amber-100 dark:hover:bg-neutral-800"
                    >
                      Light
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTheme("dark")}
                      className="text-amber-800 dark:text-yellow-200 hover:bg-amber-100 dark:hover:bg-neutral-800"
                    >
                      Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTheme("system")}
                      className="text-amber-600 dark:text-yellow-500 hover:bg-amber-100 dark:hover:bg-neutral-800"
                    >
                      System
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div>
                <button
                  onClick={() => signOut()}
                  className="flex w-full items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-neutral-300 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400 text-sm font-medium transition-all mb-2"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </aside>
          {/* Resize handle */}
          <div
            onMouseDown={handleDragStart}
            className={`flex items-center justify-center w-2 cursor-ew-resize select-none transition bg-transparent hover:bg-amber-100 dark:hover:bg-neutral-800 ${
              isResizingActive
                ? "bg-amber-200 dark:bg-neutral-700"
                : ""
            }`}
            style={{
              cursor: "col-resize",
              userSelect: "none",
              height: "100%",
              zIndex: 20,
            }}
            aria-label="Resize navigation"
            tabIndex={-1}
            role="separator"
          >
            <div className="h-20 w-[8px] mx-auto rounded bg-amber-300 dark:bg-neutral-700 opacity-60" />
          </div>
        </div>

        {/* Mobile Drawer (overlay, slides in) */}
        {/* Covers the sidebar functionality in mobile, like ChatGPT */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 flex">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-[2px]"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <aside className="relative z-50 w-64 bg-white dark:bg-neutral-900 shadow-xl border-r border-amber-200 dark:border-neutral-800 h-full flex flex-col py-6 px-4 animate-slide-in-left space-y-2">
              <div className="mb-6">
                <div className="flex flex-col items-center text-center gap-1">
                  <div className="font-semibold text-amber-900 dark:text-yellow-100">
                    {profile?.full_name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-neutral-400">
                    {greeting}
                  </div>
                  <div className="bg-amber-100 dark:bg-neutral-800 mt-1 px-3 py-1 rounded text-xs font-bold text-amber-700 dark:text-yellow-200">
                    Credits: {profile?.credits ?? "--"}
                  </div>
                </div>
              </div>
              <nav className="flex flex-col gap-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onViewChange(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm ${
                        currentView === item.id
                          ? "bg-amber-600 text-white dark:bg-yellow-600 dark:text-black font-semibold shadow"
                          : "text-gray-800 dark:text-neutral-200 hover:bg-amber-50 dark:hover:bg-neutral-800"
                      } transition-all justify-start`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </button>
                  );
                })}
              </nav>
              <div className="flex-1" />

              <div>
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="lg"
                        className="relative w-full flex items-center justify-center rounded-full border border-amber-200 dark:border-yellow-700 bg-amber-50 dark:bg-neutral-900 hover:bg-amber-100 dark:hover:bg-yellow-900 transition-all shadow focus:ring-2 focus:ring-amber-400 dark:focus:ring-yellow-400 mb-2"
                        aria-label="Toggle theme"
                      >
                        <span className="relative flex items-center w-7 h-7">
                          <Sun className="h-full w-full text-amber-500 dark:text-yellow-400 transition-all duration-300 scale-100 rotate-0 dark:scale-0 dark:-rotate-90" />
                          <Moon className="absolute h-full w-full text-amber-600 dark:text-yellow-200 transition-all duration-300 scale-0 rotate-90 dark:scale-100 dark:rotate-0" />
                        </span>
                        <span className="sr-only">Toggle theme</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="center"
                      className="max-w-full bg-white border-amber-200 dark:bg-neutral-900 dark:border-yellow-700 shadow-xl rounded-lg"
                    >
                      <DropdownMenuItem
                        onClick={() => setTheme("light")}
                        className="text-amber-700 dark:text-yellow-300 hover:bg-amber-100 dark:hover:bg-neutral-800"
                      >
                        Light
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setTheme("dark")}
                        className="text-amber-800 dark:text-yellow-200 hover:bg-amber-100 dark:hover:bg-neutral-800"
                      >
                        Dark
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setTheme("system")}
                        className="text-amber-600 dark:text-yellow-500 hover:bg-amber-100 dark:hover:bg-neutral-800"
                      >
                        System
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-neutral-300 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400 text-sm font-medium transition-all mb-2"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main conversation area */}
        <main className="relative flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-col h-full max-h-full overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
