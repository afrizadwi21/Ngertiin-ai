"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Upload,
  Zap,
  Map,
  Presentation,
  History,
  Settings,
  X,
  LogOut,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
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

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [chatCount, setChatCount] = useState(0);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Load cached user instantly
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
        console.error("Error fetching user in MobileMenu:", err);
      }
    };
    fetchUser();
  }, [isOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
    router.push("/login");
    router.refresh();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        exit={{ x: -280 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="fixed left-0 top-0 bottom-0 z-50 w-68 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-white/[0.06] flex flex-col lg:hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between h-[60px] px-4 border-b border-zinc-200 dark:border-white/[0.06]">
          <Logo size="sm" href="/dashboard" />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {/* AI Badge */}
          <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-xl bg-cyan-500/5 dark:bg-gradient-to-r dark:from-cyan-500/10 dark:to-blue-500/5 border border-cyan-500/15">
            <Sparkles size={13} className="text-cyan-500 dark:text-cyan-400" />
            <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400">AI Study Buddy</span>
          </div>

          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/dashboard/chat" && pathname.startsWith("/dashboard/chat"));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
              >
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group",
                    isActive
                      ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.04]"
                  )}
                >
                  <item.icon
                    size={18}
                    className={cn(
                      "flex-shrink-0 transition-colors",
                      isActive ? "text-cyan-500 dark:text-cyan-400" : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300"
                    )}
                  />
                  <span className="text-sm font-medium">{item.label}</span>

                  {isActive && (
                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 shadow-sm" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer Profile + Logout */}
        <div className="border-t border-zinc-200 dark:border-white/[0.06] p-4 bg-zinc-50/50 dark:bg-zinc-950/50 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {!imageError && (user?.user_metadata?.avatar_url || user?.user_metadata?.picture) ? (
                <img
                  src={user.user_metadata.avatar_url || user.user_metadata.picture}
                  className="w-10 h-10 rounded-xl object-cover shadow-sm border border-zinc-200 dark:border-white/[0.08]"
                  alt=""
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-sm">
                    {(user?.user_metadata?.full_name || user?.user_metadata?.name || "S").charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                {user?.user_metadata?.full_name || user?.user_metadata?.name || "Siswa"}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {chatCount} sesi chat
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:text-white dark:text-rose-400 dark:hover:text-white bg-rose-500/10 hover:bg-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-600 transition-all duration-200 border border-rose-500/20 hover:border-transparent cursor-pointer"
          >
            <LogOut size={16} />
            <span>Keluar Akun</span>
          </button>
        </div>
      </motion.div>
    </>
  );
}
