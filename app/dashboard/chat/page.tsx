"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Upload,
  Zap,
  Map,
  History,
  Settings,
  LayoutDashboard,
  X,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";
import { DashboardNavbar } from "@/components/dashboard-navbar";
import { ChatBox, ExplainMode } from "@/components/chat-box";
import { MobileMenu } from "@/components/mobile-menu";

const MODES: { label: ExplainMode; emoji: string; desc: string }[] = [
  { label: "Formal", emoji: "", desc: "Profesional" },
  { label: "Santai", emoji: "", desc: "Friendly" },
  { label: "Anak SMK", emoji: "", desc: "Gaul" },
  { label: "Super Singkat", emoji: "", desc: "2–3 kalimat" },
];

export default function ChatPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mode, setMode] = useState<ExplainMode>("Santai");
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const pathname = usePathname();

  const currentMode = MODES.find((m) => m.label === mode)!;

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-[#0a0a0a] overflow-hidden">

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardNavbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* 3-Column Layout */}
        <div className="flex-1 flex overflow-hidden">

          {/* ============ MAIN CHAT AREA ============ */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

            {/* Chat Header */}
            <div className="flex-shrink-0 px-4 md:px-6 pt-4 pb-3 border-b border-zinc-200 dark:border-white/[0.04]">
              <div className="flex items-center justify-between gap-4">
                {/* Title */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={16} className="text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-base font-semibold text-zinc-800 dark:text-white leading-tight">AI Study Chat</h1>
                    <p className="text-xs text-zinc-500 truncate">Tanya pelajaran apa pun dalam Bahasa Indonesia</p>
                  </div>
                </div>

                {/* Mode Selector — Premium Segmented */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Desktop: full segmented tabs */}
                  <div className="hidden md:flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.07] rounded-2xl p-1 gap-0.5">
                    {MODES.map((m) => (
                      <motion.button
                        key={m.label}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setMode(m.label)}
                        className={cn(
                          "relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200",
                          mode === m.label
                            ? "text-cyan-600 dark:text-white font-semibold"
                            : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                        )}
                      >
                        {mode === m.label && (
                          <motion.div
                            layoutId="mode-pill"
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/15 border border-cyan-500/25 shadow-sm"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                          />
                        )}
                        <span className="relative z-10">{m.emoji}</span>
                        <span className="relative z-10 whitespace-nowrap">{m.label}</span>
                      </motion.button>
                    ))}
                  </div>

                  {/* Mobile: dropdown */}
                  <div className="md:hidden relative">
                    <button
                      onClick={() => setShowModeDropdown(!showModeDropdown)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-cyan-500/25 text-cyan-600 dark:text-cyan-400 text-xs font-medium"
                    >
                      <span>{currentMode.emoji}</span>
                      <span>{currentMode.label}</span>
                      <ChevronDown size={13} className={cn("transition-transform", showModeDropdown && "rotate-180")} />
                    </button>
                    <AnimatePresence>
                      {showModeDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/8 rounded-2xl p-1.5 shadow-xl z-50"
                        >
                          {MODES.map((m) => (
                            <button
                              key={m.label}
                              onClick={() => { setMode(m.label); setShowModeDropdown(false); }}
                              className={cn(
                                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all",
                                mode === m.label
                                  ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
                              )}
                            >
                              <span>{m.emoji}</span>
                              <div className="text-left">
                                <p className="font-medium leading-tight">{m.label}</p>
                                <p className="text-xs text-zinc-600">{m.desc}</p>
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Box — takes all remaining space */}
            <div className="flex-1 min-h-0">
              <ChatBox mode={mode} className="h-full" />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
