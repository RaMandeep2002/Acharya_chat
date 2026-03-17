"use client";

// import { useState } from 'react';
import { LogOut, Sparkles } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/app/context/AuthContext';

export function DashboardHeader() {
  const { profile, signOut } = useAuth();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const greeting =
    profile?.faith === 'sikhism'
      ? 'Waheguru Ji Ka Khalsa, Waheguru Ji Ki Fateh'
      : 'Namaste';

  return (
    <>
      <header className="flex items-center justify-between px-2 sm:px-10 h-16 border-b backdrop-blur sticky top-0 z-20
        border-amber-200 bg-amber-200
        dark:bg-neutral-900/95 dark:border-neutral-800">
        <div className="flex items-center gap-5 justify-center">
          <SidebarTrigger className="text-amber-900 dark:text-yellow-100 focus:outline-none focus:ring-2 focus:ring-amber-400" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-amber-500 dark:text-yellow-200 drop-shadow-md animate-pulse" />
            <span className="font-extrabold text-2xl md:text-2xl tracking-wide bg-linear-to-r from-amber-700 via-amber-900 to-yellow-600 dark:from-yellow-100 dark:via-yellow-200 dark:to-yellow-400 text-transparent bg-clip-text select-none">
              Acharya
            </span>
          </div>
        </div>

        {/* Desktop view */}
        <div className="hidden md:flex items-center gap-8">
          <div className="text-right">
            <p className="text-sm italic 
              text-gray-900 dark:text-gray-200">
              {greeting}
            </p>
            <p className="font-semibold 
              text-amber-900 dark:text-yellow-100">
              {profile?.full_name}
            </p>
          </div>
          <div className="ml-4 flex items-center gap-2 px-4 py-2 rounded-xl shadow-inner
            bg-amber-100 border border-amber-300 
            dark:bg-neutral-800 dark:border-neutral-700">
            <span className="text-xs uppercase font-semibold tracking-tight
              text-amber-700 dark:text-yellow-300">
              Credits
            </span>
            <span className="text-lg font-bold
              text-amber-800 dark:text-yellow-200">
              {profile?.credits ?? '--'}
            </span>
          </div>
          <ThemeToggle />
          <button
            onClick={() => signOut()}
            className="
              ml-3 p-2 rounded-full border border-transparent transition
              bg-amber-50 text-amber-900 hover:bg-red-50 hover:text-red-600 hover:border-red-400
              dark:bg-neutral-800 dark:text-yellow-100 
              dark:hover:bg-red-900 dark:hover:text-red-400"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile menu button */}
        {/* <button
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="md:hidden p-2 ml-2 rounded-lg border
            bg-amber-50 text-amber-800 hover:bg-orange-100 border-amber-200
            dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:border-neutral-700"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button> */}
      </header>
    </>
  );
}