"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Upload,
  Zap,
  Map,
  Presentation,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, Suspense } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { supabase } from "@/lib/supabase";

const menuItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/chat", icon: MessageSquare, label: "AI Chat" },
  { href: "/dashboard/chat?mode=solve", icon: Upload, label: "Tanya Soal" },
  { href: "/dashboard/quiz-generator", icon: Zap, label: "Quiz Generator" },
  { href: "/dashboard/roadmap", icon: Map, label: "Roadmap" },
  { href: "/dashboard/presentation-generator", icon: Presentation, label: "AI Presentasi" },
  { href: "/dashboard/history", icon: History, label: "Riwayat" },
  { href: "/dashboard/settings", icon: Settings, label: "Pengaturan" },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <Suspense fallback={
      <aside className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 border-r border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-zinc-950 w-64 flex-shrink-0 z-20",
        className
      )} />
    }>
      <SidebarContent className={className} />
    </Suspense>
  );
}

function SidebarContent({ className }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [activeHref, setActiveHref] = useState("");
  const [user, setUser] = useState<any>(null);
  const [chatCount, setChatCount] = useState(0);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setActiveHref(window.location.pathname + window.location.search);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    // Instantly load cached user from localStorage to prevent profile flashing
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("ngertiin-user");
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch (e) {}
      }
    }

    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          localStorage.setItem("ngertiin-user", JSON.stringify(user));
          
          const { count } = await supabase
            .from("chat_history")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);
          setChatCount(count || 0);
        }
      } catch (err) {
        console.error("Error fetching user in Sidebar:", err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 border-r border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-zinc-950 overflow-hidden flex-shrink-0 z-20",
        className
      )}
    >
      {/* Logo Header */}
      <div className="flex items-center justify-between h-[60px] px-4 border-b border-zinc-200 dark:border-white/[0.06]">
        <AnimatePresence initial={false} mode="wait">
          {collapsed ? (
            <motion.div
              key="icon"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20"
            >
              <span className="text-white font-bold text-sm">N</span>
            </motion.div>
          ) : (
            <motion.div
              key="logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Logo size="sm" href="/dashboard" />
            </motion.div>
          )}
        </AnimatePresence>
 
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all flex-shrink-0"
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </motion.button>
      </div>
 
      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
        {/* AI Badge */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-3 py-2 mb-3 rounded-xl bg-cyan-500/5 dark:bg-gradient-to-r dark:from-cyan-500/10 dark:to-blue-500/5 border border-cyan-500/15"
          >
            <Sparkles size={13} className="text-cyan-500 dark:text-cyan-400" />
            <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400">AI Study Buddy</span>
          </motion.div>
        )}
 
        {menuItems.map((item) => {
          // Fallback to pathname-only match if activeHref hasn't mounted client-side yet (preventing SSR mismatch)
          const isActive = activeHref 
            ? activeHref === item.href || (item.href === "/dashboard/chat" && activeHref === "/dashboard/chat?mode=chat")
            : pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 3 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.04]"
                )}
              >
                {/* Active glow */}
                {isActive && (
                  <motion.div
                    layoutId="active-sidebar"
                    className="absolute inset-0 rounded-xl bg-cyan-500/5"
                    style={{ boxShadow: "inset 0 0 20px oklch(0.72 0.18 210 / 8%)" }}
                  />
                )}

                <item.icon
                  size={18}
                  className={cn(
                    "flex-shrink-0 transition-colors",
                    isActive ? "text-cyan-500 dark:text-cyan-400" : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300"
                  )}
                />

                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Active dot */}
                {isActive && !collapsed && (
                  <motion.div
                    layoutId="active-dot"
                    className="absolute right-3 w-1.5 h-1.5 rounded-full bg-cyan-50 dark:bg-cyan-400 shadow-sm shadow-cyan-400/60"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile + Logout */}
      <div className={cn("border-t border-zinc-200 dark:border-white/[0.06] p-3", collapsed ? "flex justify-center" : "")}>
        {collapsed ? (
          <button
            onClick={handleLogout}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center hover:from-red-500/20 hover:to-red-600/20 hover:border-red-500/20 transition-all group"
            title="Logout"
          >
            {!imageError && (user?.user_metadata?.avatar_url || user?.user_metadata?.picture) ? (
              <img 
                src={user.user_metadata.avatar_url || user.user_metadata.picture} 
                className="w-7 h-7 rounded-lg object-cover" 
                alt="" 
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-cyan-500 dark:text-cyan-400 font-bold text-sm">
                {(user?.user_metadata?.full_name || user?.user_metadata?.name || "S").charAt(0).toUpperCase()}
              </span>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-3 p-2.5 rounded-xl transition-all group">
            <div className="flex-shrink-0">
              {!imageError && (user?.user_metadata?.avatar_url || user?.user_metadata?.picture) ? (
                <img
                  src={user.user_metadata.avatar_url || user.user_metadata.picture}
                  className="w-9 h-9 rounded-xl object-cover shadow-md"
                  alt=""
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
                  <span className="text-white font-bold text-sm">
                    {(user?.user_metadata?.full_name || user?.user_metadata?.name || "S").charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                {(user?.user_metadata?.full_name || user?.user_metadata?.name || "Siswa").split(" ")[0]}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {chatCount} sesi chat
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 dark:text-zinc-600 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-all flex-shrink-0"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
