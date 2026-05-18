"use client";

import { useState, useEffect } from "react";
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
  Flame,
  BookOpen,
  Target,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Presentation,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";
import { DashboardNavbar } from "@/components/dashboard-navbar";
import { Logo } from "@/components/logo";
import { supabase } from "@/lib/supabase";

const mobileMenuItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/chat?mode=chat", icon: MessageSquare, label: "AI Chat" },
  { href: "/dashboard/chat?mode=solve", icon: Upload, label: "Tanya Soal" },
  { href: "/dashboard/quiz-generator", icon: Zap, label: "Quiz Generator" },
  { href: "/dashboard/roadmap", icon: Map, label: "Roadmap" },
  { href: "/dashboard/presentation-generator", icon: Presentation, label: "AI Presentasi" },
  { href: "/dashboard/history", icon: History, label: "Riwayat" },
  { href: "/dashboard/settings", icon: Settings, label: "Pengaturan" },
];

const quickActions = [
  { icon: Upload, label: "Tanya Soal", href: "/dashboard/chat?mode=solve", color: "from-blue-500/10 to-blue-600/5 dark:from-blue-500/15 dark:to-blue-600/5", border: "border-blue-500/15 dark:border-blue-500/20", text: "text-blue-600 dark:text-blue-400", glow: "hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10" },
  { icon: Zap, label: "Buat Quiz", href: "/dashboard/quiz-generator", color: "from-violet-500/10 to-violet-600/5 dark:from-violet-500/15 dark:to-violet-600/5", border: "border-violet-500/15 dark:border-violet-500/20", text: "text-violet-600 dark:text-violet-400", glow: "hover:shadow-violet-500/5 dark:hover:shadow-violet-500/10" },
  { icon: Map, label: "Roadmap", href: "/dashboard/roadmap", color: "from-emerald-500/10 to-emerald-600/5 dark:from-emerald-500/15 dark:to-emerald-600/5", border: "border-emerald-500/15 dark:border-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400", glow: "hover:shadow-emerald-500/5 dark:hover:shadow-emerald-500/10" },
  { icon: MessageSquare, label: "Chat AI", href: "/dashboard/chat?mode=chat", color: "from-cyan-500/10 to-cyan-600/5 dark:from-cyan-500/15 dark:to-cyan-600/5", border: "border-cyan-500/15 dark:border-cyan-500/20", text: "text-cyan-600 dark:text-cyan-400", glow: "hover:shadow-cyan-500/5 dark:hover:shadow-cyan-500/10" },
];

const subjectColors: Record<string, { color: string; bg: string }> = {
  programming: { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
  mathematics: { color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10" },
  science: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  english: { color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-500/10" },
  history: { color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10" },
  design: { color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-500/10" },
  default: { color: "text-zinc-600 dark:text-zinc-400", bg: "bg-zinc-500/10" },
};

const progressColors = ["bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-cyan-500", "bg-orange-500", "bg-pink-500"];

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Baru saja";
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays === 1) return "Kemarin";
  return `${diffDays} hari lalu`;
}

export default function DashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [userName, setUserName] = useState("Siswa");
  const [isLoading, setIsLoading] = useState(true);

  // Real stats from DB
  const [chatCount, setChatCount] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [roadmapCount, setRoadmapCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [favoriteSubjects, setFavoriteSubjects] = useState<string[]>([]);
  const [quizScores, setQuizScores] = useState<{ topic: string; score: number }[]>([]);
  const [displayStreak, setDisplayStreak] = useState(0);
  const [showPlusOne, setShowPlusOne] = useState(false);

  useEffect(() => {
    // Instantly load user name from cache to avoid flashing
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("ngertiin-user");
      if (cached) {
        try {
          const u = JSON.parse(cached);
          const name = u.user_metadata?.full_name || u.user_metadata?.name || "Siswa";
          setUserName(name.split(" ")[0]);
        } catch (e) {}
      }
    }
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || "guest-student-123";

      if (user) {
        const name = user.user_metadata?.full_name || user.user_metadata?.name || "Siswa";
        setUserName(name.split(" ")[0]);
      }

      // Fetch in parallel
      const [chatRes, quizRes, roadmapRes, prefRes] = await Promise.allSettled([
        supabase.from("chat_history").select("id, title, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("quiz_history").select("topic, score, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("roadmaps").select("id").eq("user_id", userId),
        supabase.from("user_preferences").select("favorite_subjects").eq("user_id", userId).single(),
      ]);

      let finalChatCount = 0;
      let finalQuizCount = 0;
      const activeDates = new Set<string>();

      if (chatRes.status === "fulfilled" && chatRes.value.data) {
        finalChatCount = chatRes.value.data.length;
        setChatCount(finalChatCount);
        setRecentChats(chatRes.value.data.slice(0, 4));
        chatRes.value.data.forEach((c: any) => {
          if (c.created_at) {
            const localDateStr = new Date(c.created_at).toLocaleDateString('en-CA');
            activeDates.add(localDateStr);
          }
        });
      }

      let scores: { topic: string; score: number }[] = [];
      if (quizRes.status === "fulfilled" && quizRes.value.data) {
        finalQuizCount = quizRes.value.data.length;
        setQuizCount(finalQuizCount);
        quizRes.value.data.forEach((q: any) => {
          if (q.created_at) {
            const localDateStr = new Date(q.created_at).toLocaleDateString('en-CA');
            activeDates.add(localDateStr);
          }
        });

        // Build per-topic average scores
        const topicMap: Record<string, { total: number; count: number }> = {};
        quizRes.value.data.forEach((q: any) => {
          if (!topicMap[q.topic]) topicMap[q.topic] = { total: 0, count: 0 };
          topicMap[q.topic].total += q.score;
          topicMap[q.topic].count += 1;
        });
        scores = Object.entries(topicMap).map(([topic, v]) => ({
          topic,
          score: Math.round(v.total / v.count),
        })).slice(0, 4);
        setQuizScores(scores);
      }

      if (roadmapRes.status === "fulfilled" && roadmapRes.value.data) {
        setRoadmapCount(roadmapRes.value.data.length);
      }

      if (prefRes.status === "fulfilled" && prefRes.value.data) {
        setFavoriteSubjects(prefRes.value.data.favorite_subjects || []);
      }

      // Calculate streak dynamically using local timezone YYYY-MM-DD strings
      let calculatedStreak = 0;
      let hasActivityToday = false;

      if (activeDates.size > 0) {
        const todayStr = new Date().toLocaleDateString('en-CA');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString('en-CA');

        hasActivityToday = activeDates.has(todayStr);

        let checkStr = todayStr;
        if (!hasActivityToday && activeDates.has(yesterdayStr)) {
          checkStr = yesterdayStr;
        }

        if (activeDates.has(checkStr)) {
          let checkDate = new Date(checkStr);
          while (activeDates.has(checkDate.toLocaleDateString('en-CA'))) {
            calculatedStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          }
        }
      }
      setStreak(calculatedStreak);

      if (hasActivityToday) {
        // Ticking effect and +1 animation if active today
        const initialDisplay = Math.max(0, calculatedStreak - 1);
        setDisplayStreak(initialDisplay);

        setTimeout(() => {
          setDisplayStreak(calculatedStreak);
          setShowPlusOne(true);
        }, 1000);
      } else {
        setDisplayStreak(calculatedStreak);
      }

    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const statsItems = [
    { icon: Flame, value: String(displayStreak), label: "Hari berturut", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10", isStreak: true },
    { icon: BookOpen, value: String(chatCount + quizCount), label: "Sesi belajar", color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-500/10" },
    { icon: Target, value: String(roadmapCount), label: "Roadmap dibuat", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  const isEmpty = chatCount === 0 && quizCount === 0 && roadmapCount === 0;

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-[#0a0a0a] overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-white/[0.06] flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between h-[60px] px-4 border-b border-zinc-200 dark:border-white/[0.06]">
                <Logo size="sm" href="/dashboard" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
                >
                  <X size={18} />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
                {mobileMenuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                          isActive
                            ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
                            : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.04]"
                        )}
                      >
                        <item.icon size={18} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardNavbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* Dashboard Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-800 dark:text-white flex items-center gap-2">
                Selamat Datang{isEmpty ? "" : " Kembali"}, {userName}! 👋
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                {isEmpty
                  ? "Mulai perjalanan belajarmu sekarang bersama Afriza AI!"
                  : "Kamu sudah membuat kemajuan. Mari lanjutkan belajar!"}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/15 text-cyan-600 dark:text-cyan-400 text-xs font-semibold self-start md:self-auto">
              <Sparkles size={14} /> AI Study Buddy Aktif
            </div>
          </div>

          {/* Loading state */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
              <p className="text-sm text-zinc-500">Memuat dashboard...</p>
            </div>
          ) : (
            <>
              {/* 1. Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statsItems.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.08 }}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border border-zinc-200 dark:border-white/[0.06] shadow-sm dark:shadow-none transition-all duration-300 relative overflow-visible",
                      stat.bg
                    )}
                  >
                    {stat.isStreak && (
                      <AnimatePresence>
                        {showPlusOne && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                            animate={{ opacity: [0, 1, 1, 0], y: -50, scale: [0.8, 1.2, 1.2, 1] }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.8, ease: "easeOut" }}
                            className="absolute top-3 right-5 font-extrabold text-orange-500 dark:text-orange-400 text-sm flex items-center gap-0.5 pointer-events-none select-none drop-shadow-md z-20"
                            onAnimationComplete={() => setShowPlusOne(false)}
                          >
                            +1 <Flame size={14} className="fill-orange-500 text-orange-500 animate-pulse" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}

                    <motion.div
                      animate={stat.isStreak && showPlusOne ? { scale: [1, 1.35, 1] } : {}}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    >
                      <stat.icon size={24} className={stat.color} />
                    </motion.div>

                    <span className="text-3xl font-bold text-zinc-800 dark:text-white leading-none mt-1">
                      {stat.value}
                    </span>
                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 text-center">
                      {stat.label}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* 2. Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT COLUMN */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="rounded-2xl border border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-zinc-900/40 p-5 shadow-sm dark:shadow-none"
                  >
                    <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Zap size={14} className="text-cyan-500" /> AKSI CEPAT
                    </h3>
                    <div className="grid grid-cols-2 gap-3.5">
                      {quickActions.map((action) => (
                        <Link key={action.label} href={action.href}>
                          <motion.div
                            whileHover={{ y: -3, transition: { duration: 0.15 } }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                              "flex flex-col items-center justify-center gap-3 p-5 rounded-xl border bg-gradient-to-br cursor-pointer transition-all hover:shadow-md",
                              action.color, action.border, action.glow
                            )}
                          >
                            <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-950/60 shadow-sm border border-zinc-100 dark:border-white/[0.04]">
                              <action.icon size={20} className={action.text} />
                            </div>
                            <span className={cn("text-xs font-bold text-center leading-tight mt-1", action.text)}>
                              {action.label}
                            </span>
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>

                  {/* Recent Chat History */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25 }}
                    className="rounded-2xl border border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-zinc-900/40 p-5 shadow-sm dark:shadow-none"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                        <Clock size={14} className="text-cyan-500" /> TERAKHIR DIPELAJARI
                      </h3>
                      <Link
                        href="/dashboard/history"
                        className="text-xs text-cyan-600 dark:text-cyan-500 hover:text-cyan-800 dark:hover:text-cyan-300 font-semibold transition-colors flex items-center gap-1"
                      >
                        Semua <ArrowRight size={12} />
                      </Link>
                    </div>
                    
                    {recentChats.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                          <BookOpen size={20} className="text-zinc-400" />
                        </div>
                        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Belum ada riwayat chat</p>
                        <p className="text-xs text-zinc-400 mt-1 max-w-xs">Mulai tanya sesuatu ke Afriza AI!</p>
                        <Link href="/dashboard/chat?mode=chat">
                          <button className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 transition-colors">
                            Mulai Chat
                          </button>
                        </Link>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {recentChats.map((chat) => (
                          <motion.div
                            key={chat.id}
                            whileHover={{ x: 3 }}
                            className="flex items-center gap-3.5 p-3.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/[0.03] cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-white/[0.04] transition-all group"
                          >
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm bg-cyan-500/10">
                              <BookOpen size={16} className="text-cyan-600 dark:text-cyan-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors truncate">
                                {chat.title}
                              </p>
                              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Chat AI</p>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium flex-shrink-0">
                              {formatRelativeTime(chat.created_at)}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-5">
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="rounded-2xl border border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-zinc-900/40 p-5 shadow-sm dark:shadow-none h-full"
                  >
                    <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-5 flex items-center gap-2">
                      <TrendingUp size={14} className="text-cyan-500" /> PROGRESS QUIZ
                    </h3>
                    
                    {quizScores.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                          <Zap size={20} className="text-zinc-400" />
                        </div>
                        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Belum ada quiz</p>
                        <p className="text-xs text-zinc-400 mt-1 max-w-xs">Selesaikan quiz untuk melihat progres kamu di sini.</p>
                        <Link href="/dashboard/quiz-generator">
                          <button className="mt-4 px-4 py-2 text-xs font-bold rounded-xl bg-violet-500 text-white hover:bg-violet-600 transition-colors">
                            Buat Quiz
                          </button>
                        </Link>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-5">
                        {quizScores.map((item, i) => (
                          <div key={item.topic} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs md:text-sm font-semibold text-zinc-600 dark:text-zinc-400 truncate max-w-[70%]">
                                {item.topic}
                              </span>
                              <span className="text-xs md:text-sm font-bold text-zinc-800 dark:text-zinc-300">
                                {item.score}%
                              </span>
                            </div>
                            <div className="h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 overflow-hidden border border-zinc-200/50 dark:border-white/[0.03]">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.score}%` }}
                                transition={{ duration: 1, delay: 0.4 + i * 0.1, ease: "easeOut" }}
                                className={cn("h-full rounded-full shadow-inner", progressColors[i % progressColors.length])}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Mata Pelajaran Favorit */}
                    {favoriteSubjects.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-white/[0.05]">
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Mata Pelajaran Favorit</p>
                        <div className="flex flex-wrap gap-2">
                          {favoriteSubjects.map((subj) => {
                            const style = subjectColors[subj] || subjectColors.default;
                            return (
                              <span
                                key={subj}
                                className={cn("px-2.5 py-1 rounded-full text-xs font-semibold capitalize", style.bg, style.color)}
                              >
                                {subj}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/10 flex items-start gap-3">
                      <Sparkles size={16} className="text-cyan-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-tight">
                          Tips Belajar Hari Ini:
                        </h4>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mt-1">
                          Konsistensi adalah kunci! Coba luangkan 20 menit setiap hari untuk berlatih soal bersama Afriza AI.
                        </p>
                      </div>
                    </div>

                  </motion.div>
                </div>

              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
