"use client";

import { useTheme } from "next-themes";
import { Bell, Search, Sun, Moon, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface DashboardNavbarProps {
  onMobileMenuToggle: () => void;
}

export function DashboardNavbar({ onMobileMenuToggle }: DashboardNavbarProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Instantly load cached user from localStorage to prevent flashing
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("ngertiin-user");
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch (e) {
          console.error("Error parsing cached user:", e);
        }
      }
    }

    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          localStorage.setItem("ngertiin-user", JSON.stringify(user));
        }
      } catch (err) {
        console.error("Error fetching user in Navbar:", err);
      }
    };
    fetchUser();
  }, []);

  return (
    <header className="h-[60px] flex-shrink-0 border-b border-zinc-200 dark:border-white/[0.06] bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl flex items-center px-4 md:px-5 gap-3 sticky top-0 z-30">
      {/* Mobile: hamburger + logo area */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all flex-shrink-0"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className={cn(
        "flex-1 max-w-sm relative transition-all duration-200",
        searchFocused ? "max-w-md" : ""
      )}>
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Cari topik, soal, atau riwayat..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="w-full pl-8 pr-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.07] rounded-xl text-zinc-800 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/40 focus:bg-white dark:focus:bg-zinc-900 transition-all"
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        {/* Notification */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="relative p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-cyan-400 rounded-full" />
        </motion.button>

        {/* Theme toggle */}
        {mounted && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
          >
            {resolvedTheme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </motion.button>
        )}

        {/* Divider */}
        <div className="w-px h-5 bg-zinc-200 dark:bg-white/[0.08] mx-1" />

        {/* Avatar */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2.5 pl-1 pr-2.5 py-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
        >
          {user ? (
            <>
              {!imageError && (user.user_metadata?.avatar_url || user.user_metadata?.picture) ? (
                <img 
                  src={user.user_metadata?.avatar_url || user.user_metadata?.picture} 
                  alt="" 
                  onError={() => setImageError(true)}
                  className="w-7 h-7 rounded-lg object-cover shadow-sm"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-sm shadow-cyan-500/20">
                  <span className="text-white font-bold text-xs">
                    {(user.user_metadata?.full_name || user.user_metadata?.name || "S").charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="hidden sm:block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {(user.user_metadata?.full_name || user.user_metadata?.name || "Student").split(" ")[0]}
              </span>
            </>
          ) : (
            <>
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-sm shadow-cyan-500/20">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span className="hidden sm:block text-sm font-medium text-zinc-700 dark:text-zinc-300">Siswa</span>
            </>
          )}
        </motion.button>
      </div>
    </header>
  );
}

// Inline cn helper to avoid import issues in this file
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
