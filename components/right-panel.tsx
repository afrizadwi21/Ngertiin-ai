"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Upload,
  Zap,
  Map,
  MessageSquare,
  History,
  TrendingUp,
  BookOpen,
  Target,
  ArrowRight,
  Flame,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const recentTopics = [
  { label: "Fotosintesis", subject: "Biologi", time: "2 jam lalu", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  { label: "Integral Substitusi", subject: "Matematika", time: "Kemarin", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
  { label: "Hukum Newton III", subject: "Fisika", time: "2 hari lalu", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10" },
  { label: "Reaksi Redoks", subject: "Kimia", time: "3 hari lalu", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10" },
];

const quickActions = [
  { icon: Upload, label: "Tanya Soal", href: "/dashboard/chat?mode=solve", color: "from-blue-500/10 to-blue-600/5 dark:from-blue-500/15 dark:to-blue-600/5", border: "border-blue-500/15 dark:border-blue-500/20", text: "text-blue-600 dark:text-blue-400", glow: "hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10" },
  { icon: Zap, label: "Buat Quiz", href: "/dashboard/quiz-generator", color: "from-violet-500/10 to-violet-600/5 dark:from-violet-500/15 dark:to-violet-600/5", border: "border-violet-500/15 dark:border-violet-500/20", text: "text-violet-600 dark:text-violet-400", glow: "hover:shadow-violet-500/5 dark:hover:shadow-violet-500/10" },
  { icon: Map, label: "Roadmap", href: "/dashboard/roadmap", color: "from-emerald-500/10 to-emerald-600/5 dark:from-emerald-500/15 dark:to-emerald-600/5", border: "border-emerald-500/15 dark:border-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400", glow: "hover:shadow-emerald-500/5 dark:hover:shadow-emerald-500/10" },
  { icon: MessageSquare, label: "Chat AI", href: "/dashboard/chat?mode=chat", color: "from-cyan-500/10 to-cyan-600/5 dark:from-cyan-500/15 dark:to-cyan-600/5", border: "border-cyan-500/15 dark:border-cyan-500/20", text: "text-cyan-600 dark:text-cyan-400", glow: "hover:shadow-cyan-500/5 dark:hover:shadow-cyan-500/10" },
];

const progressItems = [
  { label: "Matematika", value: 78, color: "bg-blue-500" },
  { label: "Fisika", value: 55, color: "bg-orange-500" },
  { label: "Kimia", value: 42, color: "bg-violet-500" },
  { label: "Biologi", value: 90, color: "bg-emerald-500" },
];

interface RightPanelProps {
  className?: string;
}

export function RightPanel({ className }: RightPanelProps) {
  return (
    <div className={cn("flex flex-col gap-4 overflow-y-auto", className)}>

      {/* Streak / Stats compact */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-2"
      >
        {[
          { icon: Flame, value: "7", label: "Hari berturut", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10" },
          { icon: BookOpen, value: "24", label: "Sesi belajar", color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-500/10" },
          { icon: Target, value: "18", label: "Topik dikuasai", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
        ].map((stat) => (
          <div
            key={stat.label}
            className={cn("flex flex-col items-center gap-1 p-3 rounded-xl border border-zinc-200 dark:border-white/[0.06]", stat.bg)}
          >
            <stat.icon size={16} className={stat.color} />
            <span className="text-lg font-bold text-zinc-800 dark:text-white leading-none">{stat.value}</span>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 text-center leading-tight">{stat.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-zinc-900/40 p-4 shadow-sm dark:shadow-none"
      >
        <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Zap size={11} /> Aksi Cepat
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, i) => (
            <Link key={action.label} href={action.href}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "flex flex-col items-center gap-2 p-3.5 rounded-xl border bg-gradient-to-br cursor-pointer transition-all hover:shadow-lg",
                  action.color,
                  action.border,
                  action.glow
                )}
              >
                <action.icon size={18} className={action.text} />
                <span className={cn("text-xs font-semibold text-center leading-tight", action.text)}>
                  {action.label}
                </span>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Topics */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-zinc-900/40 p-4 shadow-sm dark:shadow-none"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock size={11} /> Terakhir Dipelajari
          </h3>
          <Link href="/dashboard/history" className="text-[11px] text-cyan-600 dark:text-cyan-500 hover:text-cyan-800 dark:hover:text-cyan-300 transition-colors flex items-center gap-0.5">
            Semua <ArrowRight size={10} />
          </Link>
        </div>
        <div className="flex flex-col gap-1">
          {recentTopics.map((topic, i) => (
            <motion.div
              key={topic.label}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.06 }}
              whileHover={{ x: 2 }}
              className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/[0.03] cursor-pointer transition-all group"
            >
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", topic.bg)}>
                <BookOpen size={12} className={topic.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors truncate">
                  {topic.label}
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-600">{topic.subject}</p>
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-700 flex-shrink-0">{topic.time}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Learning Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl border border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-zinc-900/40 p-4 shadow-sm dark:shadow-none"
      >
        <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <TrendingUp size={11} /> Progress Belajar
        </h3>
        <div className="flex flex-col gap-3">
          {progressItems.map((item, i) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{item.label}</span>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">{item.value}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ duration: 0.8, delay: 0.4 + i * 0.1, ease: "easeOut" }}
                  className={cn("h-full rounded-full", item.color)}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
