"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  MessageSquare,
  Zap,
  Map as MapIcon,
  Search,
  Trash2,
  AlertCircle,
  X,
  Check,
  Calendar,
  ChevronRight,
  Sparkles,
  BookOpen,
  Award,
  ArrowRight,
  TrendingUp,
  Clock,
  LayoutDashboard,
  Upload,
  History,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { DashboardNavbar } from "@/components/dashboard-navbar";
import { Logo } from "@/components/logo";

const mobileMenuItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/chat?mode=chat", icon: MessageSquare, label: "AI Chat" },
  { href: "/dashboard/chat?mode=solve", icon: Upload, label: "Tanya Soal" },
  { href: "/dashboard/quiz-generator", icon: Zap, label: "Quiz Generator" },
  { href: "/dashboard/roadmap", icon: MapIcon, label: "Roadmap" },
  { href: "/dashboard/history", icon: History, label: "Riwayat" },
  { href: "/dashboard/settings", icon: Settings, label: "Pengaturan" },
];

type TabType = "chat" | "quiz" | "roadmap";

interface ChatHistory {
  id: string;
  title: string;
  preview: string;
  created_at: string;
}

interface QuizHistory {
  id: string;
  topic: string;
  score: number;
  created_at: string;
}

interface RoadmapHistory {
  id: string;
  goal: string;
  progress: number;
  created_at: string;
}

export default function HistoryPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [chatList, setChatList] = useState<ChatHistory[]>([]);
  const [quizList, setQuizList] = useState<QuizHistory[]>([]);
  const [roadmapList, setRoadmapList] = useState<RoadmapHistory[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState("guest-student-123");

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: TabType } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    document.title = "Riwayat Belajar — Ngerti.in";
    initData();
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const initData = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id || "guest-student-123";
      setUserId(currentUserId);
      
      await Promise.all([
        fetchChatHistory(currentUserId),
        fetchQuizHistory(currentUserId),
        fetchRoadmapHistory(currentUserId)
      ]);
    } catch (error) {
      console.error("Error initializing:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChatHistory = async (uId: string) => {
    try {
      const { data, error } = await supabase
        .from("chat_history")
        .select("id, title, preview, created_at")
        .eq("user_id", uId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setChatList(data || []);
    } catch (err) {
      console.error("Error fetching chat history:", err);
      setChatList([]);
    }
  };

  const fetchQuizHistory = async (uId: string) => {
    try {
      const { data, error } = await supabase
        .from("quiz_history")
        .select("id, topic, score, created_at")
        .eq("user_id", uId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuizList(data || []);
    } catch (err) {
      console.error("Error fetching quiz history:", err);
      setQuizList([]);
    }
  };

  const fetchRoadmapHistory = async (uId: string) => {
    try {
      const { data, error } = await supabase
        .from("roadmaps")
        .select("id, goal, roadmap_data, created_at")
        .eq("user_id", uId)
        .order("created_at", { ascending: false });

      if (error) {
        // Fallback to local storage simulating roadmap table
        const cached = localStorage.getItem(`saved_roadmaps_${uId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          setRoadmapList(parsed.map((rm: any) => ({
            id: rm.id,
            goal: rm.goal,
            progress: rm.progress || 0,
            created_at: rm.created_at,
          })));
        }
        return;
      }

      const formatted = (data || []).map((rm: any) => {
        const steps = rm.roadmap_data?.steps || [];
        const completedCount = steps.filter((s: any) => s.completed).length;
        const progress = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;
        return {
          id: rm.id,
          goal: rm.goal,
          progress,
          created_at: rm.created_at,
        };
      });
      setRoadmapList(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  const triggerDelete = (id: string, type: TabType) => {
    setItemToDelete({ id, type });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const { id, type } = itemToDelete;
    
    try {
      let tableName = "";
      if (type === "chat") tableName = "chat_history";
      else if (type === "quiz") tableName = "quiz_history";
      else if (type === "roadmap") tableName = "roadmaps";

      if (tableName) {
        const { error } = await supabase.from(tableName).delete().eq("id", id);
        if (error) throw error;
      }

      // Update UI optimistically
      if (type === "chat") setChatList(prev => prev.filter(item => item.id !== id));
      if (type === "quiz") setQuizList(prev => prev.filter(item => item.id !== id));
      if (type === "roadmap") {
        setRoadmapList(prev => prev.filter(item => item.id !== id));
        // sync local fallback
        const cached = localStorage.getItem(`saved_roadmaps_${userId}`);
        if (cached) {
          const updated = JSON.parse(cached).filter((rm: any) => rm.id !== id);
          localStorage.setItem(`saved_roadmaps_${userId}`, JSON.stringify(updated));
        }
      }

      showToast("Riwayat berhasil dihapus");
    } catch (err) {
      showToast("Gagal menghapus riwayat", "error");
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const filteredChat = chatList.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.preview.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredQuiz = quizList.filter(q => q.topic.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredRoadmap = roadmapList.filter(r => r.goal.toLowerCase().includes(searchQuery.toLowerCase()));

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
              className="fixed inset-0 z-40 bg-black/40 dark:bg-black/70 backdrop-blur-sm lg:hidden"
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

        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-4 md:p-8 relative overflow-hidden">
            
            {/* Dynamic Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
              
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-900">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold border border-cyan-500/20">
                      <History size={12} />
                      Activity Log
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                    Riwayat Belajar
                  </h1>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                    Lihat kembali perjalanan dan aktivitas belajarmu di Ngerti.in.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-64">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Cari riwayat..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Tabs System */}
              <div className="flex items-center gap-2 mb-8 bg-zinc-200/50 dark:bg-zinc-900/50 p-1 rounded-2xl w-full md:w-fit overflow-x-auto">
                <button
                  onClick={() => setActiveTab("chat")}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                    activeTab === "chat"
                      ? "bg-white dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  )}
                >
                  <MessageSquare size={16} />
                  Chat AI
                </button>
                <button
                  onClick={() => setActiveTab("quiz")}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                    activeTab === "quiz"
                      ? "bg-white dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  )}
                >
                  <Zap size={16} />
                  Quiz
                </button>
                <button
                  onClick={() => setActiveTab("roadmap")}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                    activeTab === "roadmap"
                      ? "bg-white dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  )}
                >
                  <MapIcon size={16} />
                  Roadmap
                </button>
              </div>

              {/* Content Area */}
              <div className="min-h-[400px]">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin mb-4" />
                    <p className="text-sm font-medium text-zinc-500">Memuat riwayat...</p>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    
                    {/* Chat History */}
                    {activeTab === "chat" && (
                      <motion.div
                        key="chat"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        {filteredChat.length === 0 ? (
                          <EmptyState 
                            title="Belum ada riwayat obrolan"
                            desc="Mulai diskusi dengan AI untuk mencatat perjalanan belajarmu."
                            icon={MessageSquare}
                            actionLink="/dashboard/chat?mode=chat"
                            actionText="Mulai Chat"
                          />
                        ) : (
                          filteredChat.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-white/5 hover:border-cyan-500/30 dark:hover:border-cyan-500/30 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-sm hover:shadow-md">
                              <div>
                                <div className="flex items-start justify-between gap-4 mb-3">
                                  <h3 className="font-bold text-zinc-900 dark:text-white line-clamp-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                    {item.title}
                                  </h3>
                                  <span className="text-[10px] font-semibold text-zinc-500 whitespace-nowrap bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                                    {formatDate(item.created_at)}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-6">
                                  {item.preview}
                                </p>
                              </div>
                              <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-4 mt-auto">
                                <button
                                  onClick={() => router.push(`/dashboard/chat?id=${item.id}`)}
                                  className="text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1.5 transition-colors"
                                >
                                  Buka Obrolan <ArrowRight size={14} />
                                </button>
                                <button
                                  onClick={() => triggerDelete(item.id, "chat")}
                                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </motion.div>
                    )}

                    {/* Quiz History */}
                    {activeTab === "quiz" && (
                      <motion.div
                        key="quiz"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        {filteredQuiz.length === 0 ? (
                          <EmptyState 
                            title="Belum ada riwayat kuis"
                            desc="Uji kemampuanmu dengan kuis interaktif yang disesuaikan untukmu."
                            icon={Zap}
                            actionLink="/dashboard/quiz-generator"
                            actionText="Buat Kuis"
                          />
                        ) : (
                          filteredQuiz.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-white/5 hover:border-cyan-500/30 dark:hover:border-cyan-500/30 rounded-2xl p-5 transition-all group shadow-sm hover:shadow-md">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                                    <BookOpen size={20} />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-zinc-900 dark:text-white text-sm group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                      {item.topic}
                                    </h3>
                                    <span className="text-[11px] text-zinc-500 font-medium flex items-center gap-1 mt-0.5">
                                      <Calendar size={12} /> {formatDate(item.created_at)}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-black text-zinc-900 dark:text-white">
                                    {item.score}<span className="text-xs text-zinc-500 font-semibold">/100</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Progress Badge */}
                              <div className="mb-5">
                                {item.score >= 80 ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                                    <Award size={12} /> Excellent
                                  </span>
                                ) : item.score >= 60 ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20">
                                    <TrendingUp size={12} /> Good
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold border border-rose-500/20">
                                    <AlertCircle size={12} /> Needs Practice
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
                                <button
                                  className="text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                                >
                                  Lihat Hasil Lengkap
                                </button>
                                <button
                                  onClick={() => triggerDelete(item.id, "quiz")}
                                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </motion.div>
                    )}

                    {/* Roadmap History */}
                    {activeTab === "roadmap" && (
                      <motion.div
                        key="roadmap"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        {filteredRoadmap.length === 0 ? (
                          <EmptyState 
                            title="Belum ada roadmap disimpan"
                            desc="Buat peta jalan belajarmu sendiri dan raih tujuan dengan langkah yang terstruktur."
                            icon={MapIcon}
                            actionLink="/dashboard/roadmap"
                            actionText="Generate Roadmap"
                          />
                        ) : (
                          filteredRoadmap.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-white/5 hover:border-cyan-500/30 dark:hover:border-cyan-500/30 rounded-2xl p-5 transition-all group shadow-sm hover:shadow-md">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                                    <MapIcon size={20} />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-zinc-900 dark:text-white text-sm group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
                                      {item.goal}
                                    </h3>
                                    <span className="text-[11px] text-zinc-500 font-medium flex items-center gap-1 mt-0.5">
                                      <Calendar size={12} /> {formatDate(item.created_at)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mb-6">
                                <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold mb-2">
                                  <span>Progres Belajar</span>
                                  <span className="text-cyan-600 dark:text-cyan-400">{item.progress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${item.progress}%` }}
                                  />
                                </div>
                              </div>

                              <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-4">
                                <button
                                  onClick={() => router.push('/dashboard/roadmap')}
                                  className="text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1 transition-colors"
                                >
                                  Lanjutkan Belajar <ChevronRight size={14} />
                                </button>
                                <button
                                  onClick={() => triggerDelete(item.id, "roadmap")}
                                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
              onClick={() => setShowDeleteModal(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/8 rounded-2xl p-6 max-w-sm w-full relative z-10 shadow-2xl text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={22} />
              </div>
              
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Hapus Riwayat?</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                Data yang dihapus tidak dapat dikembalikan. Yakin ingin menghapus item ini?
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-800 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-950/40 text-zinc-500 dark:text-zinc-400 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-lg shadow-rose-500/10"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-md shadow-2xl border"
            style={{
              backgroundColor: toast.type === "success" ? "rgba(6, 182, 212, 0.15)" : "rgba(244, 63, 94, 0.15)",
              borderColor: toast.type === "success" ? "rgba(6, 182, 212, 0.3)" : "rgba(244, 63, 94, 0.3)",
            }}
          >
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white",
              toast.type === "success" ? "bg-cyan-500" : "bg-rose-500"
            )}>
              {toast.type === "success" ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
            </div>
            <span className="text-xs font-bold text-zinc-900 dark:text-white">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Empty State Component
function EmptyState({ title, desc, icon: Icon, actionLink, actionText }: any) {
  return (
    <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800/80 rounded-3xl bg-white/50 dark:bg-zinc-900/20">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 mb-5 shadow-inner">
        <Icon size={28} />
      </div>
      <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-8 leading-relaxed">
        {desc}
      </p>
      <Link href={actionLink}>
        <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 text-white font-bold text-sm hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20">
          <Sparkles size={16} />
          {actionText}
        </button>
      </Link>
    </div>
  );
}
