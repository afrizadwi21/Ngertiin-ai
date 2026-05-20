"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Settings,
  User,
  LogOut,
  Mail,
  Palette,
  BookOpen,
  History,
  Map,
  Trash2,
  AlertCircle,
  ExternalLink,
  Laptop,
  Moon,
  Sun,
  Sparkles,
  Bot,
  LayoutDashboard,
  MessageSquare,
  Upload,
  Zap,
  X
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { DashboardNavbar } from "@/components/dashboard-navbar";
import { MobileMenu } from "@/components/mobile-menu";

const EXPLAIN_MODES = [
  { id: "formal", label: "Formal", desc: "Bahasa baku dan terstruktur" },
  { id: "santai", label: "Santai", desc: "Bahasa sehari-hari yang ramah" },
  { id: "smk", label: "Anak SMK", desc: "Praktis dan to the point" },
  { id: "singkat", label: "Super Singkat", desc: "Hanya intisari tanpa basa-basi" },
];

const SUBJECTS = [
  { id: "programming", label: "Programming" },
  { id: "mathematics", label: "Mathematics" },
  { id: "science", label: "Science" },
  { id: "english", label: "Bahasa Inggris" },
  { id: "history", label: "History" },
  { id: "design", label: "Design" },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Preferences State
  const [explainMode, setExplainMode] = useState("santai");
  const [favoriteSubjects, setFavoriteSubjects] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Profile Edit State
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Instantly load cached user from localStorage to prevent profile flashing
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("ngertiin-user");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setUser(parsed);
          setNewName(parsed.user_metadata?.full_name || parsed.user_metadata?.name || "");
        } catch (e) {}
      }
    }
    fetchUserAndPreferences();
  }, []);

  const fetchUserAndPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fallback for demo
      if (user) {
        setUser(user);
        setNewName(user.user_metadata?.full_name || user.user_metadata?.name || "");
      } else {
        const dummyUser = {
          id: "guest-student-123",
          user_metadata: {
            full_name: "Guest Student",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest",
          },
          email: "guest@student.com",
          app_metadata: { provider: "google" }
        };
        setUser(dummyUser);
        setNewName(dummyUser.user_metadata.full_name);
      }

      // Fetch preferences
      const userId = user?.id || 'guest-student-123';
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (data) {
        if (data.explain_mode) setExplainMode(data.explain_mode);
        if (data.favorite_subjects) setFavoriteSubjects(data.favorite_subjects);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSaveName = async () => {
    if (!newName.trim()) {
      toast.error("Nama tidak boleh kosong!");
      return;
    }
    
    setIsSavingName(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: newName.trim(),
        }
      });
      
      if (error) throw error;
      
      if (data?.user) {
        setUser(data.user);
        // Cache the updated user metadata so navbar/sidebar update immediately
        localStorage.setItem("ngertiin-user", JSON.stringify(data.user));
        toast.success("Nama profil berhasil diperbarui!");
        setIsEditingName(false);
      }
    } catch (error: any) {
      console.error("Error updating user metadata:", error);
      toast.error(`Gagal memperbarui nama: ${error.message || "Terjadi kesalahan"}`);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSavePreferences = async (newMode?: string, newSubjects?: string[]) => {
    setIsSaving(true);
    const modeToSave = newMode || explainMode;
    const subjectsToSave = newSubjects || favoriteSubjects;
    
    try {
      const userId = user?.id || 'guest-student-123';
      
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          explain_mode: modeToSave,
          favorite_subjects: subjectsToSave,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;
      toast.success("Preferensi berhasil disimpan");
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      toast.error(`Gagal menyimpan: ${error.message || "Tabel user_preferences belum dibuat"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubjectToggle = (subjectId: string) => {
    setFavoriteSubjects(prev => {
      const newSubjects = prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId];
      handleSavePreferences(undefined, newSubjects);
      return newSubjects;
    });
  };

  const handleModeChange = (mode: string) => {
    setExplainMode(mode);
    handleSavePreferences(mode, undefined);
  };

  const handleDeleteData = async (type: 'roadmap' | 'chat') => {
    try {
      const userId = user?.id || 'guest-student-123';
      const table = type === 'roadmap' ? 'roadmaps' : 'chat_history';
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('user_id', userId);
        
      if (error) throw error;
      toast.success(`Data ${type} berhasil dihapus`);
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast.error("Gagal menghapus data");
    }
  };

  if (!mounted) return null;

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

        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          <div className="max-w-4xl mx-auto space-y-8 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-cyan-500" />
            Settings
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">Customize your learning experience.</p>
        </motion.div>

        {/* 1. Profile Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.05] rounded-2xl p-6 shadow-sm backdrop-blur-sm"
        >
          {isEditingName ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Ubah Nama Profil</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Masukkan nama baru Anda"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-cyan-500 transition-colors text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveName}
                    disabled={isSavingName}
                    className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-600/50 text-white transition-colors flex items-center justify-center min-w-[80px]"
                  >
                    {isSavingName ? "Menyimpan..." : "Simpan"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setNewName(user?.user_metadata?.full_name || user?.user_metadata?.name || "");
                    }}
                    disabled={isSavingName}
                    className="px-4 py-2.5 text-sm font-medium rounded-xl bg-zinc-100 dark:bg-white/[0.05] text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-white/[0.1] transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-zinc-100 dark:border-zinc-800 shadow-sm">
                  <AvatarImage src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "https://github.com/shadcn.png"} />
                  <AvatarFallback className="bg-cyan-500/10 text-cyan-500 font-bold text-xl">
                    {(user?.user_metadata?.full_name || user?.user_metadata?.name || "U").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                    {user?.user_metadata?.full_name || user?.user_metadata?.name || "Siswa Cerdas"}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <Mail size={14} />
                      {user?.email || "siswa@example.com"}
                    </span>
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium">
                      <ExternalLink size={12} />
                      Google
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditingName(true)}
                className="px-4 py-2 text-sm font-medium rounded-xl bg-zinc-100 dark:bg-white/[0.05] text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-white/[0.1] transition-colors"
              >
                Edit Name
              </button>
            </div>
          )}
        </motion.section>

        {/* 2. Learning Preferences */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.05] rounded-2xl p-6 shadow-sm backdrop-blur-sm space-y-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-cyan-500" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Learning Preferences</h2>
          </div>

          <div className="space-y-6">
            {/* Explain Mode */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Default Explain Mode</label>
              <p className="text-sm text-zinc-500 mb-4">Gaya bahasa yang akan digunakan oleh Afriza AI.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EXPLAIN_MODES.map((mode) => (
                  <div
                    key={mode.id}
                    onClick={() => handleModeChange(mode.id)}
                    className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col gap-1",
                      explainMode === mode.id
                        ? "bg-cyan-500/10 border-cyan-500/50 dark:border-cyan-500/30"
                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/[0.05] hover:border-zinc-300 dark:hover:border-white/[0.1]"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "font-medium text-sm",
                        explainMode === mode.id ? "text-cyan-600 dark:text-cyan-400" : "text-zinc-900 dark:text-white"
                      )}>
                        {mode.label}
                      </span>
                      {explainMode === mode.id && (
                        <div className="w-2 h-2 rounded-full bg-cyan-500" />
                      )}
                    </div>
                    <span className="text-xs text-zinc-500">{mode.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-zinc-200 dark:bg-white/[0.05]" />

            {/* Favorite Subjects */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Favorite Subjects</label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((subject) => {
                  const isSelected = favoriteSubjects.includes(subject.id);
                  return (
                    <button
                      key={subject.id}
                      onClick={() => handleSubjectToggle(subject.id)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                        isSelected
                          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent shadow-md"
                          : "bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/[0.05] hover:border-zinc-300 dark:hover:border-white/[0.1]"
                      )}
                    >
                      {subject.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.section>

        {/* 3. Theme Settings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.05] rounded-2xl p-6 shadow-sm backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <Palette className="w-5 h-5 text-cyan-500" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Theme Settings</h2>
          </div>

          <div className="flex flex-wrap gap-4">
            {[
              { id: "light", icon: Sun, label: "Light" },
              { id: "dark", icon: Moon, label: "Dark" },
              { id: "system", icon: Laptop, label: "System" }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 rounded-xl border font-medium text-sm transition-all duration-200",
                  theme === t.id
                    ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-600 dark:text-cyan-400"
                    : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-white/[0.05] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>
        </motion.section>

        {/* 4. Saved Data */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.05] rounded-2xl p-6 shadow-sm backdrop-blur-sm space-y-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <History className="w-5 h-5 text-cyan-500" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Saved Data</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Roadmaps Card */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-white/[0.05] bg-zinc-50 dark:bg-zinc-800/20 flex flex-col justify-between h-32 group hover:border-zinc-300 dark:hover:border-white/[0.1] transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                  <Map size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">Saved Roadmaps</h3>
                  <p className="text-xs text-zinc-500">Your generated learning paths</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-white/[0.05] hover:bg-zinc-300 dark:hover:bg-white/[0.1] text-zinc-700 dark:text-zinc-300 transition-colors">
                  View
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors">
                      Delete All
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/[0.1]">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertCircle className="text-red-500" />
                        Hapus Semua Roadmap?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Yakin ingin menghapus semua data roadmap belajarmu? Tindakan ini tidak dapat dibatalkan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-zinc-200 dark:border-white/[0.1] hover:bg-zinc-100 dark:hover:bg-white/[0.05]">Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteData('roadmap')} className="bg-red-500 hover:bg-red-600 text-white">
                        Hapus Semua
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Chat History Card */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-white/[0.05] bg-zinc-50 dark:bg-zinc-800/20 flex flex-col justify-between h-32 group hover:border-zinc-300 dark:hover:border-white/[0.1] transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">Chat History</h3>
                  <p className="text-xs text-zinc-500">Conversations with Afriza AI</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-white/[0.05] hover:bg-zinc-300 dark:hover:bg-white/[0.1] text-zinc-700 dark:text-zinc-300 transition-colors">
                  View
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors">
                      Delete All
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/[0.1]">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertCircle className="text-red-500" />
                        Hapus Riwayat Chat?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Yakin ingin menghapus semua data percakapanmu? Tindakan ini tidak dapat dibatalkan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-zinc-200 dark:border-white/[0.1] hover:bg-zinc-100 dark:hover:bg-white/[0.05]">Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteData('chat')} className="bg-red-500 hover:bg-red-600 text-white">
                        Hapus Semua
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 5. About Afriza AI */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-950 dark:to-zinc-900 border border-zinc-800 dark:border-white/[0.05] text-white overflow-hidden relative shadow-lg">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles size={120} />
            </div>
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Bot className="text-white w-6 h-6" />
              </div>
              <div className="space-y-2 max-w-md">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">Afriza AI</h3>
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-medium tracking-wider uppercase">v1.0</span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Your personal AI study buddy that helps students understand lessons in a smarter and easier way. Built for Ngerti.in platform.
                </p>
              </div>
            </div>
          </div>
        </motion.section>
        
          </div>
        </div>
      </div>
    </div>
  );
}
