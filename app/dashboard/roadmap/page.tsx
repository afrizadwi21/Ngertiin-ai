"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  Compass,
  Check,
  Trash2,
  Plus,
  Loader2,
  Calendar,
  TrendingUp,
  ChevronRight,
  Sparkles,
  BookOpen,
  Award,
  Clock,
  ArrowRight,
  AlertCircle,
  X,
  MapPin,
  Save,
  CheckCircle2,
  LayoutDashboard,
  MessageSquare,
  Upload,
  Zap,
  Map as MapIcon,
  History,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

interface RoadmapStep {
  title: string;
  explanation: string;
  duration: string;
  difficulty: "Pemula" | "Menengah" | "Mahir";
  completed?: boolean;
}

interface SavedRoadmap {
  id: string;
  goal: string;
  level: string;
  duration: string;
  roadmap_data: {
    steps: RoadmapStep[];
  };
  created_at: string;
  progress?: number;
}

export default function RoadmapPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Form states
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState<"Pemula" | "Menengah" | "Mahir">("Pemula");
  const [duration, setDuration] = useState("3 Bulan");

  // UI/Data states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [currentRoadmap, setCurrentRoadmap] = useState<{
    id?: string;
    goal: string;
    level: string;
    duration: string;
    steps: RoadmapStep[];
  } | null>(null);
  
  const [savedRoadmaps, setSavedRoadmaps] = useState<SavedRoadmap[]>([]);
  const [userId, setUserId] = useState("guest-student-123");

  // Modal & Toast states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roadmapToDelete, setRoadmapToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const loadingMessages = [
    "Menganalisis tujuan belajar...",
    "Memetakan materi paling krusial...",
    "Menentukan tingkat kesulitan & durasi...",
    "Menyusun langkah belajar sistematis...",
    "Afriza AI sedang memoles roadmap belajarmu..."
  ];

  // Fetch user session and saved roadmaps on mount
  useEffect(() => {
    async function initSessionAndData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const currentUserId = user?.id || "guest-student-123";
        setUserId(currentUserId);
        
        await fetchSavedRoadmaps(currentUserId);
      } catch (err) {
        console.error("Error initializing session:", err);
        // Fallback to guest data on compile/network issues
        await fetchSavedRoadmaps("guest-student-123");
      }
    }

    initSessionAndData();
  }, []);

  // Set document title
  useEffect(() => {
    document.title = "Roadmap Belajar — Ngerti.in";
  }, []);

  // Loading animation message switcher
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSavedRoadmaps = async (uId: string) => {
    try {
      const { data, error } = await supabase
        .from("roadmaps")
        .select("*")
        .eq("user_id", uId)
        .order("created_at", { ascending: false });

      if (error) {
        // Fallback to localStorage for guest simulation
        const cached = localStorage.getItem(`saved_roadmaps_${uId}`);
        if (cached) {
          setSavedRoadmaps(JSON.parse(cached));
        }
        return;
      }

      // Calculate progress dynamically
      const roadmapsWithProgress = (data || []).map((rm: any) => {
        const steps = rm.roadmap_data?.steps || [];
        const completedCount = steps.filter((s: RoadmapStep) => s.completed).length;
        const progress = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;
        return { ...rm, progress };
      });

      setSavedRoadmaps(roadmapsWithProgress);
      // Sync localStorage cache
      localStorage.setItem(`saved_roadmaps_${uId}`, JSON.stringify(roadmapsWithProgress));
    } catch (err) {
      console.error("Failed to fetch roadmaps:", err);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) {
      showToast("Tolong ketik tujuan belajar terlebih dahulu", "error");
      return;
    }

    setIsLoading(true);
    setCurrentRoadmap(null);

    try {
      const response = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, level, duration }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate roadmap");
      }

      const data = await response.json();
      setCurrentRoadmap({
        goal: data.goal,
        level: data.level,
        duration: data.duration,
        steps: data.steps.map((s: RoadmapStep) => ({ ...s, completed: false })),
      });
      showToast("Roadmap berhasil dibuat!");
    } catch (err: any) {
      showToast(err.message || "Gagal membuat roadmap", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRoadmap = async () => {
    if (!currentRoadmap) return;

    try {
      const newRm = {
        user_id: userId,
        goal: currentRoadmap.goal,
        level: currentRoadmap.level,
        duration: currentRoadmap.duration,
        roadmap_data: { steps: currentRoadmap.steps },
      };

      const { data, error } = await supabase
        .from("roadmaps")
        .insert([newRm])
        .select()
        .single();

      if (error) {
        // Safe offline simulated storage fallback
        const mockId = `rm-${Date.now()}`;
        const simulatedRm: SavedRoadmap = {
          id: mockId,
          ...newRm,
          created_at: new Date().toISOString(),
          progress: 0,
        };

        const updatedList = [simulatedRm, ...savedRoadmaps];
        setSavedRoadmaps(updatedList);
        localStorage.setItem(`saved_roadmaps_${userId}`, JSON.stringify(updatedList));

        // Update currently displayed roadmap with its newly generated mock ID
        setCurrentRoadmap((prev: any) => ({ ...prev, id: mockId }));
        showToast("Roadmap berhasil disimpan");
        return;
      }

      if (data) {
        setCurrentRoadmap((prev: any) => ({ ...prev, id: data.id }));
        await fetchSavedRoadmaps(userId);
        showToast("Roadmap berhasil disimpan");
      }
    } catch (err) {
      showToast("Gagal menyimpan roadmap", "error");
    }
  };

  const toggleStepCompletion = async (index: number) => {
    if (!currentRoadmap) return;

    const updatedSteps = [...currentRoadmap.steps];
    updatedSteps[index].completed = !updatedSteps[index].completed;
    
    setCurrentRoadmap({
      ...currentRoadmap,
      steps: updatedSteps,
    });

    // If it's a saved roadmap, update in Supabase / LocalStorage
    if (currentRoadmap.id) {
      try {
        const { error } = await supabase
          .from("roadmaps")
          .update({ roadmap_data: { steps: updatedSteps } })
          .eq("id", currentRoadmap.id);

        if (error) {
          // Sync offline storage
          const updatedList = savedRoadmaps.map((rm) => {
            if (rm.id === currentRoadmap.id) {
              const completedCount = updatedSteps.filter((s) => s.completed).length;
              const progress = Math.round((completedCount / updatedSteps.length) * 100);
              return {
                ...rm,
                roadmap_data: { steps: updatedSteps },
                progress,
              };
            }
            return rm;
          });
          setSavedRoadmaps(updatedList);
          localStorage.setItem(`saved_roadmaps_${userId}`, JSON.stringify(updatedList));
          return;
        }

        await fetchSavedRoadmaps(userId);
      } catch (err) {
        console.error("Error updating step completion:", err);
      }
    }
  };

  const triggerDeleteRoadmap = (id: string | undefined) => {
    if (!id) {
      // Just clear unsaved roadmap from view
      setCurrentRoadmap(null);
      showToast("Roadmap dibersihkan");
      return;
    }
    setRoadmapToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteRoadmap = async () => {
    if (!roadmapToDelete) return;

    try {
      const { error } = await supabase
        .from("roadmaps")
        .delete()
        .eq("id", roadmapToDelete);

      if (error) {
        // Sync offline deletion
        const updatedList = savedRoadmaps.filter((rm) => rm.id !== roadmapToDelete);
        setSavedRoadmaps(updatedList);
        localStorage.setItem(`saved_roadmaps_${userId}`, JSON.stringify(updatedList));
      } else {
        await fetchSavedRoadmaps(userId);
      }

      if (currentRoadmap?.id === roadmapToDelete) {
        setCurrentRoadmap(null);
      }

      showToast("Roadmap berhasil dihapus");
    } catch (err) {
      showToast("Gagal menghapus roadmap", "error");
    } finally {
      setShowDeleteModal(false);
      setRoadmapToDelete(null);
    }
  };

  const handleLoadSavedRoadmap = (saved: SavedRoadmap) => {
    setCurrentRoadmap({
      id: saved.id,
      goal: saved.goal,
      level: saved.level,
      duration: saved.duration,
      steps: saved.roadmap_data.steps,
    });
    // Scroll to roadmap view on mobile
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  // Helper for difficulty colors
  const getDiffBadgeStyles = (difficulty: "Pemula" | "Menengah" | "Mahir") => {
    switch (difficulty) {
      case "Pemula":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "Menengah":
        return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
      case "Mahir":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border border-zinc-500/20";
    }
  };

  // Calculate current completion percent
  const getCompletionStats = () => {
    if (!currentRoadmap) return { count: 0, percent: 0 };
    const count = currentRoadmap.steps.filter((s) => s.completed).length;
    const percent = Math.round((count / currentRoadmap.steps.length) * 100);
    return { count, percent };
  };

  const { count: completedStepsCount, percent: completionPercent } = getCompletionStats();

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
              className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-white dark:bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-white/[0.06] flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between h-[60px] px-4 border-b border-zinc-200 dark:border-white/[0.06]">
                <Logo size="sm" href="/dashboard" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
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
                            : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.04]"
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
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Container */}
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-zinc-200 dark:border-zinc-900">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                <Sparkles size={12} />
                AI Learning Planner
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-800 dark:via-zinc-200 to-zinc-600 dark:to-zinc-500 bg-clip-text text-transparent">
              Roadmap Belajar
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
              Bangun jalur belajar sesuai tujuanmu.
            </p>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form & Saved List */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Roadmap Generator Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-white/8 rounded-2xl p-6 relative overflow-hidden"
            >
              <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
              <h2 className="text-lg font-bold flex items-center gap-2 text-zinc-900 dark:text-white mb-6">
                <Compass className="text-cyan-400" size={18} />
                Roadmap Generator
              </h2>

              <form onSubmit={handleGenerate} className="flex flex-col gap-5">
                
                {/* 1. Learning Goal */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Tujuan Belajar</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="Contoh: Frontend Developer, UI/UX Designer, Laravel Developer"
                      className="w-full bg-zinc-100 dark:bg-zinc-950/80 border border-zinc-300 dark:border-zinc-800 focus:border-cyan-500/40 rounded-xl px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-600 outline-none transition-all focus:shadow-[0_0_0_3px_oklch(0.72_0.18_210_/_8%)]"
                    />
                  </div>
                </div>

                {/* 2. Current Skill Level */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Tingkat Kemampuan Saat Ini</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Pemula", "Menengah", "Mahir"] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setLevel(lvl)}
                        className={cn(
                          "py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200",
                          level === lvl
                            ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                            : "bg-zinc-100 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800/80 text-zinc-500 hover:text-zinc-700 dark:text-zinc-300"
                        )}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Target Duration */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Target Durasi Belajar</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["1 Bulan", "3 Bulan", "6 Bulan", "1 Tahun"].map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setDuration(dur)}
                        className={cn(
                          "py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200",
                          duration === dur
                            ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                            : "bg-zinc-100 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800/80 text-zinc-500 hover:text-zinc-700 dark:text-zinc-300"
                        )}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3.5 rounded-xl bg-cyan-500 text-white font-bold text-sm hover:bg-cyan-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/15 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Membuat Roadmap...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate Roadmap
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Saved list: My Roadmaps */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-white/8 rounded-2xl p-6 flex flex-col min-h-[300px]"
            >
              <h2 className="text-lg font-bold flex items-center gap-2 text-zinc-900 dark:text-white mb-6">
                <Calendar className="text-cyan-400" size={18} />
                My Roadmaps ({savedRoadmaps.length})
              </h2>

              <div className="flex flex-col gap-3 flex-grow overflow-y-auto max-h-[350px] pr-1">
                {savedRoadmaps.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl my-auto text-zinc-600">
                    <BookOpen size={24} className="mb-2 text-zinc-700" />
                    <p className="text-xs font-semibold">Belum ada roadmap disimpan</p>
                    <p className="text-[10px] max-w-[180px] mt-0.5">Generate roadmap di atas dan simpan hasil belajarmu!</p>
                  </div>
                ) : (
                  savedRoadmaps.map((rm) => (
                    <div
                      key={rm.id}
                      className={cn(
                        "p-4 rounded-xl border transition-all duration-200 group bg-zinc-50 dark:bg-zinc-950/50 hover:bg-zinc-100 dark:bg-zinc-950/80 cursor-pointer",
                        currentRoadmap?.id === rm.id ? "border-cyan-500/40" : "border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:border-zinc-800"
                      )}
                      onClick={() => handleLoadSavedRoadmap(rm)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate group-hover:text-cyan-400 transition-colors">
                            {rm.goal}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-1 text-[9px] text-zinc-500 font-medium">
                            <span className="capitalize">{rm.level}</span>
                            <span>·</span>
                            <span>{rm.duration}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerDeleteRoadmap(rm.id);
                          }}
                          className="p-1 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-500 hover:text-rose-400 hover:border-rose-500/20 transition-all opacity-0 group-hover:opacity-100"
                          title="Hapus roadmap"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3.5">
                        <div className="flex justify-between items-center text-[9px] text-zinc-500 font-bold mb-1">
                          <span>Kemajuan Belajar</span>
                          <span className="text-cyan-400">{rm.progress}%</span>
                        </div>
                        <div className="w-full h-1 bg-white dark:bg-zinc-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                            style={{ width: `${rm.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Visualizer panel */}
          <div className="lg:col-span-8">
            
            {/* Loading placeholder */}
            <AnimatePresence mode="wait">
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white dark:bg-zinc-900/40 backdrop-blur-xl border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl min-h-[550px] flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full border border-cyan-500/10 border-t-cyan-500 animate-spin flex items-center justify-center" />
                    <Sparkles size={24} className="absolute inset-0 m-auto text-cyan-400 animate-pulse" />
                  </div>
                  
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={loadingStep}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Mengolah Rencana Terbaikmu</h3>
                      <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">{loadingMessages[loadingStep]}</p>
                    </motion.div>
                  </AnimatePresence>
                  
                  <p className="text-[11px] text-zinc-500 max-w-xs mt-6 leading-relaxed">
                    Afriza AI sedang merancang jalur terstruktur langkah demi langkah yang disesuaikan secara khusus dengan tujuan dan durasi belajarmu.
                  </p>
                </motion.div>
              )}

              {/* No roadmap selected placeholder */}
              {!currentRoadmap && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-zinc-50 dark:bg-zinc-900/20 border border-dashed border-zinc-200 dark:border-zinc-900 rounded-2xl min-h-[550px] flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-center text-cyan-500 mb-4 shadow-inner">
                    <Compass size={28} className="animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300">Mulai Perjalanan Belajarmu</h3>
                  <p className="text-xs text-zinc-500 max-w-sm mt-2 leading-relaxed">
                    Ketik tujuan karier atau topik pelajaran di panel kiri (misalnya: "Data Analyst", "Fisika UTBK", atau "Frontend Developer"), pilih level Anda, dan biarkan AI merancang jalan pintas kesuksesan Anda!
                  </p>
                </motion.div>
              )}

              {/* Active Roadmap Visualizer */}
              {currentRoadmap && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-6"
                >
                  {/* Goal Info Card */}
                  <div className="bg-gradient-to-r from-cyan-50 dark:from-cyan-950/20 to-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-white/8 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-cyan-500" />
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-cyan-400">TARGET UTAMA BELAJAR</span>
                      <h2 className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{currentRoadmap.goal}</h2>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Award size={13} className="text-cyan-400" />
                          Tingkat: <strong className="text-zinc-800 dark:text-zinc-200 capitalize">{currentRoadmap.level}</strong>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-cyan-400" />
                          Target Waktu: <strong className="text-zinc-800 dark:text-zinc-200">{currentRoadmap.duration}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Action buttons save/delete */}
                    <div className="flex items-center gap-2 border-t border-zinc-200 dark:border-zinc-800/80 md:border-none pt-4 md:pt-0">
                      {!currentRoadmap.id ? (
                        <button
                          onClick={handleSaveRoadmap}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500 text-white font-bold text-xs hover:bg-cyan-600 transition-all shadow-md shadow-cyan-500/10"
                        >
                          <Save size={14} /> Simpan Roadmap
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
                          <CheckCircle2 size={13} /> Roadmap Tersimpan
                        </div>
                      )}
                      
                      <button
                        onClick={() => triggerDeleteRoadmap(currentRoadmap.id)}
                        className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:text-rose-400 hover:border-rose-500/20 transition-all"
                        title={currentRoadmap.id ? "Hapus dari database" : "Clear roadmap"}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Progress tracking card (WOW Factor!) */}
                  {currentRoadmap.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200 dark:border-zinc-900 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-center text-cyan-400 font-bold text-xs">
                          {completedStepsCount}/{currentRoadmap.steps.length}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Lacak Progres Belajarmu</h4>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Centang langkah-langkah di bawah yang sudah kamu selesaikan.</p>
                        </div>
                      </div>
                      
                      {/* Percent Slider */}
                      <div className="w-full md:w-64 flex items-center gap-3">
                        <div className="flex-1 h-2 bg-zinc-50 dark:bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/50">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${completionPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-cyan-400 min-w-[32px] text-right">{completionPercent}%</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Learning Timeline Visualizer */}
                  <div className="relative pl-6 md:pl-8 flex flex-col gap-6 py-2">
                    
                    {/* Vertical timeline connector */}
                    <div className="absolute top-0 bottom-0 left-[11px] md:left-[15px] w-0.5 border-l-2 border-dashed border-zinc-300 dark:border-zinc-800 pointer-events-none" />

                    {currentRoadmap.steps.map((step, idx) => (
                      <motion.div
                        key={step.title}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className={cn(
                          "relative p-5 rounded-2xl border transition-all duration-300 group cursor-pointer flex flex-col gap-3",
                          step.completed
                            ? "bg-zinc-50 dark:bg-zinc-950/20 border-emerald-500/10"
                            : "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/70"
                        )}
                        onClick={() => toggleStepCompletion(idx)}
                      >
                        {/* Timeline Node Point Indicator */}
                        <div
                          className={cn(
                            "absolute top-6 -left-[20px] md:-left-[24px] w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                            step.completed
                              ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20"
                              : "bg-zinc-50 dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 text-transparent group-hover:border-cyan-500/50"
                          )}
                        >
                          {step.completed && <Check size={10} strokeWidth={3} />}
                        </div>

                        {/* Top Metadata row */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border",
                              step.completed
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                            )}>
                              LANGKAH {idx + 1}
                            </span>
                            
                            <span className={cn("text-[10px] px-2 py-0.5 rounded-md font-bold", getDiffBadgeStyles(step.difficulty))}>
                              {step.difficulty}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-bold bg-zinc-100 dark:bg-zinc-950/60 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-900">
                            <Clock size={11} className="text-cyan-500" />
                            {step.duration}
                          </div>
                        </div>

                        {/* Content text */}
                        <div>
                          <h3 className={cn(
                            "text-sm font-bold text-zinc-900 dark:text-white transition-colors flex items-center gap-2",
                            step.completed ? "text-zinc-500 line-through decoration-zinc-700" : "group-hover:text-cyan-400"
                          )}>
                            {step.title}
                          </h3>
                          <p className={cn(
                            "text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed",
                            step.completed ? "text-zinc-600 line-through decoration-zinc-800" : ""
                          )}>
                            {step.explanation}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* End node badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: currentRoadmap.steps.length * 0.08 }}
                    className="flex items-center gap-3 pl-[18px] md:pl-[22px] mt-2"
                  >
                    <div className="w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                      <Check size={9} className="text-white" strokeWidth={3} />
                    </div>
                    <span className="text-xs font-bold text-zinc-500 tracking-wide uppercase">Tujuan Belajar Tercapai! 🎯</span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
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
              
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Yakin ingin menghapus roadmap?</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                Tindakan ini permanen. Roadmap belajarmu tidak akan dapat diakses kembali dari daftar.
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-800 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-950/40 text-zinc-500 dark:text-zinc-400 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDeleteRoadmap}
                  className="py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-lg shadow-rose-500/10"
                >
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Premium Toast Notification System */}
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
              boxShadow: toast.type === "success" ? "0 0 20px rgba(6, 182, 212, 0.1)" : "0 0 20px rgba(244, 63, 94, 0.1)"
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
        </div>
      </div>
    </div>
  );
}
