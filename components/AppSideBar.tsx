"use client";

import {
  LayoutDashboard,
  Package,
  ArrowUpDown,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "./NavLink";
import { useAuth } from "@/app/context/AuthContext";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "History", url: "/dashboard/History", icon: Package },
  { title: "Credit", url: "/dashboard/credits", icon: ArrowUpDown },
  { title: "Settings", url: "/dashboard/Settings", icon: Settings },
];

export function AppSidebar() {
  const {profile, signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar
      collapsible="icon"
      className="bg-linear-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-neutral-950 dark:via-gray-900 dark:to-neutral-900 shadow-lg border-r border-amber-200 dark:border-neutral-800"
    >
      <SidebarContent>
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-lg font-bold uppercase tracking-wider px-4 pt-5 mb-2 text-amber-900 dark:text-yellow-200 transition-colors">
              Acharya
            </SidebarGroupLabel>
          )}
        
          <SidebarGroupContent>
            <SidebarMenu className="mt-5">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      href={item.url}
                      end={item.url === "/dashboard"}
                      className={`
                        flex items-center gap-3 px-4 py-2 rounded-lg 
                        transition-colors duration-150
                        hover:bg-yellow-300/80 hover:text-amber-900
                        dark:hover:bg-yellow-950 dark:hover:text-yellow-200
                        text-amber-800 dark:text-yellow-100
                        font-medium
                      `}
                      activeClassName="bg-amber-200 dark:bg-yellow-900 font-bold shadow-inner border-l-4 border-amber-500 dark:border-yellow-400"
                    >
                      <item.icon className="h-5 w-5 shrink-0 text-amber-700 dark:text-yellow-300" />
                      {!collapsed && (
                        <span className="text-base">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-4 py-4 bg-amber-100/40 dark:bg-neutral-900/20 border-t border-amber-200 dark:border-neutral-800">
      <div className="mb-6 flex flex-col items-center">
        {/* User Avatar */}
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-amber-300/60 dark:bg-yellow-900 mb-2 border-2 border-amber-200 dark:border-yellow-700 shadow-inner">
          <span className="text-2xl font-black text-amber-900 dark:text-yellow-100">
            {profile?.full_name?.[0]?.toUpperCase() ?? "A"}
          </span>
        </div>
        {/* User Info */}
        <div className="flex flex-col items-center text-center gap-0.5">
          <div className="font-semibold text-sm text-amber-900 dark:text-yellow-100  max-w-[110px]">
            {profile?.full_name}
          </div>
          {/* Placeholder for greeting or role */}
          {/* <div className="text-xs text-gray-500 dark:text-neutral-400">Welcome, Acharya!</div> */}
          <div className="bg-amber-200/70 dark:bg-neutral-800 mt-1 px-3 py-0.5 rounded-full text-xs font-medium text-amber-700 dark:text-yellow-200 shadow-sm border border-amber-100 dark:border-yellow-900">
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
                text-amber-700 dark:text-yellow-300
                hover:bg-red-100 dark:hover:bg-red-900
                hover:text-red-700 dark:hover:text-red-400
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
