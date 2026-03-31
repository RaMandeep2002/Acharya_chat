"use client";

import {
  LayoutDashboard,
  Package,
  ArrowUpDown,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,

  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { NavLink } from "./NavLink";
import { useAuth } from "@/app/context/AuthContext";



export function AppSidebar() {
  const {profile, signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";


  const baseNavItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "History", url: "/dashboard/History", icon: Package },
    { title: "Settings", url: "/dashboard/Settings", icon: Settings },
  ];

  const navItems = [...baseNavItems];
  if (profile?.credits === 0) {
    navItems.splice(2, 0, { title: "Credit", url: "/dashboard/credits", icon: ArrowUpDown });
  }


  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/30"
    >
      <SidebarHeader className="p-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <span className="font-heading text-base font-semibold tracking-wider text-white text-transparent">
              Acharya
            </span>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active =
                  typeof window !== "undefined"
                    ? window.location.pathname === item.url
                    : false;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        href={item.url}
                        end={item.url === "/dashboard"}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          active
                            ? "bg-primary/15 text-primary mystic-glow"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        }`}
                        activeClassName=""
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span className="font-medium">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-4 py-4 border-t border-border/30">
        <div className="mb-6 flex flex-col items-center">
          {/* User Avatar */}
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/15 mb-2 border-2 border-primary shadow-inner">
            <span className="text-2xl font-black text-primary">
              {profile?.full_name?.[0]?.toUpperCase() ?? "A"}
            </span>
          </div>
          {/* User Info */}
          <div className="flex flex-col items-center text-center gap-0.5">
            <div className="font-semibold text-sm text-primary max-w-[110px]">
              {profile?.full_name}
            </div>
            <div className="bg-primary/10 mt-1 px-3 py-0.5 rounded-full text-xs font-medium text-primary shadow-sm border border-primary/10">
              Credits: <span className="font-bold">{profile?.credits ?? "--"}</span>
            </div>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut()}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg
                text-muted-foreground hover:bg-red-100 hover:text-red-700
                transition-colors duration-150
                font-medium
              `}
              title="Sign Out"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="text-base">Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
