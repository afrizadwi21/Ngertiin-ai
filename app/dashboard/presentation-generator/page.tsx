"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Presentation,
  Sparkles,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  LayoutDashboard,
  Trash2,
  Save,
  CheckCircle,
  HelpCircle,
  Clock,
  Tv,
  List,
  AlertCircle,
  Download,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Monitor,
  X,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";
import { DashboardNavbar } from "@/components/dashboard-navbar";
import { MobileMenu } from "@/components/mobile-menu";
import { supabase } from "@/lib/supabase";

interface Slide {
  slide_number: number;
  title: string;
  points: string[];
  explanation: string;
  takeaway: string;
}

interface SavedPresentation {
  id: string;
  topic: string;
  style: string;
  level: string;
  slide_count: number;
  presentation_data: Slide[];
  created_at: string;
}

const STYLE_OPTIONS = [
  { value: "Formal", label: "Formal", desc: "Presentasi resmi & akademik", emoji: "" },
  { value: "Modern", label: "Modern", desc: "Desain trendy & startup vibe", emoji: "" },
  { value: "Student Friendly", label: "Student Friendly", desc: "Mudah dipahami & santai", emoji: "" },
];

const LEVEL_OPTIONS = [
  { value: "SMP", label: "SMP", desc: "Materi sederhana & analogi", emoji: "" },
  { value: "SMA/SMK", label: "SMA/SMK", desc: "Praktis & standar sekolah", emoji: "" },
  { value: "Kuliah", label: "Kuliah", desc: "Analitis, mendalam & akademis", emoji: "" },
];

const COUNT_OPTIONS = [
  { value: 5, label: "5 Slides", desc: "Presentasi kilat & ringkas" },
  { value: 10, label: "10 Slides", desc: "Presentasi standar lengkap" },
  { value: 15, label: "15 Slides", desc: "Pembahasan super mendalam" },
];

const SUGGESTED_TOPICS = [
  "Fotosintesis & Klorofil",
  "Cara Kerja Transformator",
  "Arsitektur Next.js App Router",
  "Kejayaan Kerajaan Majapahit",
];

const LOADING_STATUSES = [
  "Menganalisis topik presentasi...",
  "Menyusun struktur slide logis...",
  "Merumuskan poin-poin materi kunci...",
  "Menambahkan penjelasan interaktif Afriza AI...",
  "Menyisipkan ringkasan takeaway di setiap slide...",
  "Menyelaraskan dengan tingkat pendidikan Anda...",
  "Menyempurnakan desain visual deck presentasi...",
];

export default function PresentationGeneratorPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userId, setUserId] = useState("guest-student-123");

  // Form State
  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState<number>(5);
  const [style, setStyle] = useState<string>("Modern");
  const [level, setLevel] = useState<string>("SMA/SMK");

  // App Phase: 'setup' | 'generating' | 'preview'
  const [phase, setPhase] = useState<"setup" | "generating" | "preview">("setup");
  const [loadingStatusIndex, setLoadingStatusIndex] = useState(0);

  // Output Slides
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"slideshow" | "outline">("slideshow");

  // Database / Saved Lists
  const [savedPresentations, setSavedPresentations] = useState<SavedPresentation[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPresId, setCurrentPresId] = useState<string | null>(null);

  // Notifications & Copy State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Slide Animation Direction
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  // Load User & Saved Presentations
  useEffect(() => {
    const initPage = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const activeUid = user?.id || "guest-student-123";
        setUserId(activeUid);
        loadSavedPresentations(activeUid);
      } catch (err) {
        console.error("Error initializing presentation page:", err);
      }
    };
    initPage();
  }, []);

  // Loading Screen loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (phase === "generating") {
      interval = setInterval(() => {
        setLoadingStatusIndex((prev) => (prev + 1) % LOADING_STATUSES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [phase]);

  // Keyboard Navigation for Slideshow
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== "preview" || viewMode !== "slideshow") return;
      if (e.key === "ArrowRight") {
        handleNextSlide();
      } else if (e.key === "ArrowLeft") {
        handlePrevSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, viewMode, currentSlideIndex, slides]);

  // Show auto-dismiss toast
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const loadSavedPresentations = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("presentations")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSavedPresentations(data || []);
    } catch (err: any) {
      console.error("Failed to load saved presentations:", err?.message || err);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Topik presentasi tidak boleh kosong!");
      return;
    }
    setError(null);
    setPhase("generating");
    setLoadingStatusIndex(0);

    try {
      const response = await fetch("/api/presentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          slide_count: slideCount,
          style,
          education_level: level,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal membuat presentasi");
      }

      const data = await response.json();
      setSlides(data.slides);
      setCurrentSlideIndex(0);
      setCurrentPresId(null); // Reset saved ID as this is fresh
      setPhase("preview");
      showToast("Presentasi berhasil dibuat oleh Afriza AI!", "success");
    } catch (err: any) {
      console.error(err);
      setError("Terjadi kesalahan saat memanggil AI. Silakan coba kembali.");
      setPhase("setup");
    }
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setDirection(1);
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setDirection(-1);
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const handleSave = async () => {
    if (slides.length === 0) return;
    setIsSaving(true);

    try {
      // Import library secara dinamis untuk mencegah error Next.js SSR
      const pptxgen = (await import("pptxgenjs")).default;
      const pptx = new pptxgen();

      // Set Slide Layout ke widescreen standard (10.0 x 5.625 inches)
      pptx.layout = "LAYOUT_16x9";

      // Menentukan warna tema berdasarkan gaya pilihan user
      let bgColor = "F4F4F5"; // default Zinc-100
      let textColor = "18181B"; // default Zinc-900
      let accentColor = "06B6D4"; // default Cyan-500
      let boxBgColor = "E4E4E7"; // default Zinc-200
      const titleFont = "Trebuchet MS";

      if (style === "Modern") {
        bgColor = "09090B"; // Zinc-950 (Sleek Dark Theme)
        textColor = "FAFAFA"; // Zinc-50
        accentColor = "06B6D4"; // Cyan-400
        boxBgColor = "18181B"; // Zinc-900
      } else if (style === "Formal") {
        bgColor = "FFFFFF"; // Pure White
        textColor = "0F172A"; // Slate-900
        accentColor = "2563EB"; // Blue-600
        boxBgColor = "F8FAFC"; // Slate-50
      } else if (style === "Student Friendly") {
        bgColor = "F0FDFA"; // Teal-50
        textColor = "115E59"; // Teal-800
        accentColor = "D946EF"; // Fuchsia-500
        boxBgColor = "CCFBF1"; // Teal-100
      }

      // 1. HALAMAN COVER (Sesuai Batas 10.0 x 5.625)
      const coverSlide = pptx.addSlide();
      coverSlide.background = { fill: bgColor };

      // Garis dekorasi vertikal di kiri
      coverSlide.addShape("rect" as any, {
        x: 0,
        y: 0,
        w: 0.25,
        h: 5.625,
        fill: { color: accentColor }
      });

      // Judul Presentasi
      coverSlide.addText(topic.toUpperCase(), {
        x: 0.8,
        y: 1.2,
        w: 8.4,
        h: 1.8,
        fontSize: 32,
        bold: true,
        fontFace: titleFont,
        color: textColor,
        align: "left"
      });

      // Sub-judul & branding
      coverSlide.addText(`Gaya Presentasi: ${style}  |  Jenjang: ${level}\nDibuat Secara Otomatis oleh Afriza AI (Ngerti.in)`, {
        x: 0.8,
        y: 3.2,
        w: 8.4,
        h: 1.2,
        fontSize: 13,
        fontFace: "Arial",
        color: style === "Modern" ? "A1A1AA" : "4B5563",
        align: "left"
      });

      // 2. HALAMAN MATERI (SLIDES - Grid Presisi 10.0 x 5.625)
      slides.forEach((s) => {
        const slide = pptx.addSlide();
        slide.background = { fill: bgColor };

        // Garis aksen atas yang terpusat simetris
        slide.addShape("rect" as any, {
          x: 0.5,
          y: 0.3,
          w: 9.0,
          h: 0.05,
          fill: { color: accentColor }
        });

        // Penomoran Slide (Batas Kanan x=9.5)
        slide.addText(`Slide ${s.slide_number} / ${slides.length}`, {
          x: 7.5,
          y: 0.4,
          w: 2.0,
          h: 0.4,
          fontSize: 11,
          fontFace: "Arial",
          color: style === "Modern" ? "71717A" : "9CA3AF",
          align: "right"
        });

        // Judul Slide
        slide.addText(s.title, {
          x: 0.5,
          y: 0.4,
          w: 7.0,
          h: 0.6,
          fontSize: 22,
          bold: true,
          fontFace: titleFont,
          color: accentColor,
          align: "left"
        });

        // Kolom Kiri: Poin Materi (Format Terpisah & Renggang)
        const bulletText = s.points.map((p) => {
          return {
            text: p.replace(/^-\s*/, ""),
            options: {
              bullet: true,
              color: textColor,
              fontSize: 12,
              breakLine: true,
              paraSpaceAfter: 8 // Menambahkan spasi renggang vertikal antar poin!
            }
          };
        });

        slide.addText(bulletText as any, {
          x: 0.5,
          y: 1.2,
          w: 4.8,
          h: 3.6,
          fontFace: "Arial",
          color: textColor,
          align: "left",
          valign: "top"
        });

        // Kolom Kanan Atas: Kartu Penjelasan Afriza AI (Lebar Pas 4.0, Sisa Margin Kanan 0.5)
        slide.addShape("roundRect" as any, {
          x: 5.5,
          y: 1.2,
          w: 4.0,
          h: 2.6,
          fill: { color: boxBgColor },
          line: { color: accentColor, width: 1 }
        });

        slide.addText(`⚡ PENJELASAN AFRIZA AI:\n${s.explanation}`, {
          x: 5.6,
          y: 1.3,
          w: 3.8,
          h: 2.4,
          fontSize: 9,
          fontFace: "Arial",
          color: textColor,
          align: "left",
          valign: "top",
          wrap: true,
          fit: "shrink" // Otomatis mengecilkan ukuran teks jika melebihi tinggi kartu!
        });

        // Kolom Kanan Bawah: Takeaway Kunci (Highlight Solid)
        slide.addShape("roundRect" as any, {
          x: 5.5,
          y: 4.0,
          w: 4.0,
          h: 0.8,
          fill: { color: accentColor }
        });

        slide.addText(`🔑 TAKEAWAY: "${s.takeaway}"`, {
          x: 5.6,
          y: 4.05,
          w: 3.8,
          h: 0.7,
          fontSize: 8.5,
          bold: true,
          fontFace: "Arial",
          color: style === "Modern" ? "000000" : "FFFFFF",
          align: "left",
          valign: "middle",
          wrap: true
        });

        // Keterangan Kaki (Footer)
        slide.addText(`Ngerti.in — AI Study Buddy`, {
          x: 0.5,
          y: 5.1,
          w: 4.5,
          h: 0.3,
          fontSize: 8.5,
          fontFace: "Arial",
          color: style === "Modern" ? "71717A" : "9CA3AF"
        });
      });

      // 3. BANGUN BERKAS DAN UNDUH SECARA NATIVE
      await pptx.writeFile({ fileName: `Presentasi_${topic.replace(/\s+/g, "_")}.pptx` });

      showToast("Presentasi PPTX berhasil diunduh!", "success");
    } catch (err: any) {
      console.error("Error generating PPTX:", err);
      showToast("Gagal membuat berkas PPTX", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSaved = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Stop loading it
    if (!confirm("Apakah Anda yakin ingin menghapus presentasi ini dari riwayat?")) return;

    try {
      const { error } = await supabase.from("presentations").delete().eq("id", id);
      if (error) throw error;

      showToast("Presentasi dihapus!", "success");
      if (currentPresId === id) {
        setCurrentPresId(null);
      }
      loadSavedPresentations(userId);
    } catch (err: any) {
      console.error(err);
      showToast("Gagal menghapus presentasi", "error");
    }
  };

  const handleLoadSaved = (pres: SavedPresentation) => {
    setTopic(pres.topic);
    setSlideCount(pres.slide_count);
    setStyle(pres.style);
    setLevel(pres.level);
    setSlides(pres.presentation_data);
    setCurrentSlideIndex(0);
    setCurrentPresId(pres.id);
    setPhase("preview");
    showToast(`Memuat presentasi: "${pres.topic}"`, "info");
  };

  const handleClearPreview = () => {
    if (confirm("Hapus pratinjau presentasi saat ini?")) {
      setSlides([]);
      setCurrentSlideIndex(0);
      setCurrentPresId(null);
      setPhase("setup");
      showToast("Pratinjau dibersihkan", "info");
    }
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    showToast("Salin konten slide berhasil!", "success");
  };

  const handleExportText = () => {
    let output = `PRESNTASI: ${topic.toUpperCase()}\nStyle: ${style} | Jenjang: ${level}\n\n`;
    slides.forEach((s) => {
      output += `========================================\n`;
      output += `SLIDE ${s.slide_number}: ${s.title}\n`;
      output += `========================================\n`;
      s.points.forEach((p) => {
        output += `- ${p}\n`;
      });
      output += `\nPenjelasan:\n${s.explanation}\n\n`;
      output += `Takeaway: "${s.takeaway}"\n\n`;
    });

    const element = document.createElement("a");
    const file = new Blob([output], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `Presentasi_${topic.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast("Mengekspor berkas teks berhasil!", "success");
  };

  // Motion variants for slide transition
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-[#0a0a0a] overflow-hidden text-zinc-900 dark:text-zinc-100">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer Drawer */}
      <AnimatePresence>
        <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <DashboardNavbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* Dynamic Toast System */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className={cn(
                "fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md max-w-sm",
                toast.type === "success" && "bg-cyan-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400",
                toast.type === "info" && "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
                toast.type === "error" && "bg-rose-500/10 border-rose-500/20 text-rose-500"
              )}
            >
              {toast.type === "success" && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
              {toast.type === "info" && <Clock className="w-4 h-4 flex-shrink-0" />}
              {toast.type === "error" && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              <span className="text-xs font-bold leading-relaxed">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto w-full h-full flex flex-col justify-start">
            <AnimatePresence mode="wait">
              {/* PHASE 1: SETUP FORM */}
              {phase === "setup" && (
                <motion.div
                  key="setup"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Header Title */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center shadow-lg shadow-cyan-500/5">
                        <Presentation size={20} className="text-cyan-500 dark:text-cyan-400" />
                      </div>
                      <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                        AI Presentation Generator
                      </h1>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm ml-12 font-medium">
                      Buat materi presentasi lebih cepat dengan bantuan AI.
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="font-semibold">{error}</span>
                    </motion.div>
                  )}

                  {/* Two-Column split layout for Form + History */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Form: 8 Cols */}
                    <div className="lg:col-span-8 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm dark:shadow-none space-y-6 backdrop-blur-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full filter blur-[80px] pointer-events-none" />

                      {/* FIELD 1: TOPIC */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                          <BookOpen size={12} className="text-cyan-500" /> Topik Presentasi
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Contoh: Transformator, Fotosintesis, Next.js, Kerajaan Majapahit"
                            className="w-full pl-4 pr-10 py-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.07] rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white dark:focus:bg-zinc-900 transition-all font-semibold"
                          />
                          <Sparkles size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cyan-500 pointer-events-none opacity-70 animate-pulse" />
                        </div>

                        {/* Suggestions list */}
                        <div className="flex flex-wrap gap-2 pt-1.5">
                          {SUGGESTED_TOPICS.map((suggested) => (
                            <button
                              key={suggested}
                              type="button"
                              onClick={() => setTopic(suggested)}
                              className="text-xs px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 hover:bg-cyan-500/10 dark:hover:bg-cyan-500/10 border border-zinc-200 dark:border-white/[0.04] hover:border-cyan-500/20 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all cursor-pointer font-semibold"
                            >
                              {suggested}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Split parameters Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* FIELD 2: PRESENTATION STYLE */}
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                            <Tv size={12} className="text-cyan-500" /> Gaya Presentasi
                          </label>
                          <div className="flex flex-col gap-2">
                            {STYLE_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setStyle(opt.value)}
                                className={cn(
                                  "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer relative group",
                                  style === opt.value
                                    ? "border-cyan-500 bg-cyan-500/5 dark:bg-cyan-500/10"
                                    : "border-zinc-200 dark:border-white/[0.05] bg-zinc-50 dark:bg-zinc-900/20 hover:bg-zinc-100 dark:hover:bg-white/[0.02]"
                                )}
                              >
                                {style === opt.value && (
                                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-500 shadow-md shadow-cyan-400/50" />
                                )}
                                <span className="text-lg">{opt.emoji}</span>
                                <div>
                                  <p className={cn("text-xs font-bold transition-colors", style === opt.value ? "text-cyan-600 dark:text-cyan-400" : "text-zinc-800 dark:text-zinc-200")}>
                                    {opt.label}
                                  </p>
                                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-medium">{opt.desc}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* FIELD 3: EDUCATION LEVEL */}
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                            <Monitor size={12} className="text-cyan-500" /> Jenjang Pendidikan
                          </label>
                          <div className="flex flex-col gap-2">
                            {LEVEL_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setLevel(opt.value)}
                                className={cn(
                                  "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer relative group",
                                  level === opt.value
                                    ? "border-cyan-500 bg-cyan-500/5 dark:bg-cyan-500/10"
                                    : "border-zinc-200 dark:border-white/[0.05] bg-zinc-50 dark:bg-zinc-900/20 hover:bg-zinc-100 dark:hover:bg-white/[0.02]"
                                )}
                              >
                                {level === opt.value && (
                                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-500 shadow-md shadow-cyan-400/50" />
                                )}
                                <span className="text-lg">{opt.emoji}</span>
                                <div>
                                  <p className={cn("text-xs font-bold transition-colors", level === opt.value ? "text-cyan-600 dark:text-cyan-400" : "text-zinc-800 dark:text-zinc-200")}>
                                    {opt.label}
                                  </p>
                                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-medium">{opt.desc}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* FIELD 4: SLIDE COUNT */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                          <List size={12} className="text-cyan-500" /> Jumlah Slide Presentasi
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {COUNT_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setSlideCount(opt.value)}
                              className={cn(
                                "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer relative",
                                slideCount === opt.value
                                  ? "border-cyan-500 bg-cyan-500/5 dark:bg-cyan-500/10 shadow-sm"
                                  : "border-zinc-200 dark:border-white/[0.04] bg-zinc-50 dark:bg-zinc-900/20 hover:bg-zinc-100 dark:hover:bg-white/[0.02]"
                              )}
                            >
                              <p className={cn("text-xs font-bold transition-colors", slideCount === opt.value ? "text-cyan-600 dark:text-cyan-400" : "text-zinc-800 dark:text-zinc-200")}>
                                {opt.label}
                              </p>
                              <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-1 leading-tight font-medium hidden md:block">{opt.desc}</p>
                              {slideCount === opt.value && (
                                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* GENERATE ACTION BUTTON */}
                      <div className="pt-2">
                        <motion.button
                          whileHover={{ scale: 1.01, boxShadow: "0 0 20px rgba(6,182,212,0.25)" }}
                          whileTap={{ scale: 0.99 }}
                          onClick={handleGenerate}
                          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/10 border border-cyan-500/10 transition-all"
                        >
                          <Sparkles size={16} className="animate-spin-slow" />
                          <span>Generate Presentation</span>
                        </motion.button>
                      </div>
                    </div>

                    {/* Right History panel: 4 Cols */}
                    <div className="lg:col-span-4 space-y-4">
                      <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm dark:shadow-none backdrop-blur-xl">
                        <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Clock size={13} className="text-cyan-500" /> RIWAYAT PRESENTASI
                        </h3>

                        {savedPresentations.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 text-center bg-zinc-50/50 dark:bg-zinc-950/20 rounded-xl border border-zinc-100 dark:border-white/[0.02]">
                            <Presentation className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mb-2" />
                            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Belum ada riwayat</p>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 max-w-[150px]">
                              Presentasi yang Anda simpan akan muncul di sini.
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
                            {savedPresentations.map((pres) => (
                              <div
                                key={pres.id}
                                onClick={() => handleLoadSaved(pres)}
                                className="group flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-cyan-500/5 dark:bg-zinc-950/25 dark:hover:bg-cyan-500/5 border border-zinc-200/50 dark:border-white/[0.03] hover:border-cyan-500/20 cursor-pointer transition-all duration-200"
                              >
                                <div className="min-w-0 pr-2">
                                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                    {pres.topic}
                                  </p>
                                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 flex items-center gap-1.5 font-medium">
                                    <span>{pres.slide_count} Slide</span>
                                    <span>•</span>
                                    <span className="capitalize">{pres.style}</span>
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteSaved(pres.id, e)}
                                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 dark:text-zinc-600 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all flex-shrink-0"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Ambient Judge WOW Box */}
                      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 rounded-2xl p-4 flex gap-3 relative overflow-hidden">
                        <Sparkles className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5 animate-pulse" />
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-200">
                            Fitur Premium Afriza AI:
                          </h4>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                            Setiap presentasi disusun sesuai jenjang akademik, menyertakan poin materi penting, penjelasan mendalam, serta takeaway praktis yang bisa langsung diekspor ke format teks!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* PHASE 2: GENERATING SCREEN */}
              {phase === "generating" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6"
                >
                  <div className="relative">
                    {/* Ring pulsing animation */}
                    <motion.div
                      animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-full bg-cyan-500/20 filter blur-md"
                    />
                    <div className="relative w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-cyan-500/20 flex items-center justify-center shadow-lg shadow-cyan-500/10">
                      <Presentation size={36} className="text-cyan-500 animate-bounce" />
                    </div>
                  </div>

                  <div className="space-y-2 max-w-sm">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center justify-center gap-1.5">
                      Menyusun Deck Presentasi...
                      <Sparkles size={16} className="text-cyan-500 animate-spin" />
                    </h2>
                    <div className="h-6 overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={loadingStatusIndex}
                          initial={{ y: 15, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -15, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="block text-xs font-bold text-cyan-600 dark:text-cyan-400"
                        >
                          {LOADING_STATUSES[loadingStatusIndex]}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Sleek Custom Loading Progress Bar */}
                  <div className="w-64 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-300/30 dark:border-white/[0.03]">
                    <motion.div
                      animate={{ width: ["0%", "100%"] }}
                      transition={{ duration: 12, ease: "easeInOut", repeat: Infinity }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    />
                  </div>
                </motion.div>
              )}

              {/* PHASE 3: PREVIEW UI */}
              {phase === "preview" && slides.length > 0 && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  {/* Presentation Control Navbar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm backdrop-blur-xl">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
                          {style} Style
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.04] text-zinc-500 dark:text-zinc-400 text-[10px] font-bold">
                          Jenjang {level}
                        </span>
                      </div>
                      <h2 className="text-lg font-extrabold text-zinc-800 dark:text-white leading-snug mt-1 truncate max-w-sm">
                        {topic}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* View Mode Toggle */}
                      <div className="flex items-center bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200/50 dark:border-white/[0.04] mr-2">
                        <button
                          onClick={() => setViewMode("slideshow")}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                            viewMode === "slideshow"
                              ? "bg-white dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 shadow-sm"
                              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                          )}
                        >
                          <Tv size={13} />
                          <span>Slideshow</span>
                        </button>
                        <button
                          onClick={() => setViewMode("outline")}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                            viewMode === "outline"
                              ? "bg-white dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 shadow-sm"
                              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                          )}
                        >
                          <List size={13} />
                          <span>Outline</span>
                        </button>
                      </div>

                      {/* Premium Unduh Button */}
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={cn(
                          "flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs shadow-md border border-cyan-500/10 transition-all cursor-pointer",
                          isSaving
                            ? "bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white"
                        )}
                      >
                        {isSaving ? (
                          <RefreshCw size={13} className="animate-spin" />
                        ) : (
                          <Download size={13} />
                        )}
                        <span>Unduh Presentasi</span>
                      </button>
                    </div>
                  </div>

                  {/* VIEW MODE A: SLIDESHOW DECK VIEW */}
                  {viewMode === "slideshow" && (
                    <div className="space-y-6">
                      {/* Premium Deck Aspect-Ratio Container */}
                      <div className="w-full relative aspect-[16/9] min-h-[300px] md:min-h-[460px] bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-white/[0.08] shadow-2xl overflow-hidden flex flex-col justify-between">
                        {/* Slide Top Banner */}
                        <div className="px-6 py-4 flex items-center justify-between border-b border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent z-10">
                          <div className="flex items-center gap-2">
                            <Presentation className="w-4 h-4 text-cyan-400" />
                            <span className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest truncate max-w-[200px]">
                              {topic}
                            </span>
                          </div>
                          <div className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] md:text-[10px] font-extrabold text-cyan-400 tracking-wider">
                            SLIDE {currentSlideIndex + 1} OF {slides.length}
                          </div>
                        </div>

                        {/* Ambient decorative glowing shapes */}
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full filter blur-[100px] pointer-events-none" />
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full filter blur-[100px] pointer-events-none" />

                        {/* Slide Contents with transition */}
                        <div className="flex-1 px-6 md:px-12 py-6 flex flex-col justify-center relative overflow-hidden">
                          <AnimatePresence initial={false} mode="wait" custom={direction}>
                            <motion.div
                              key={currentSlideIndex}
                              custom={direction}
                              variants={slideVariants}
                              initial="enter"
                              animate="center"
                              exit="exit"
                              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                              className="w-full h-full flex flex-col justify-between space-y-4"
                            >
                              {/* 1. Slide Title */}
                              <h3 className="text-xl md:text-3xl font-extrabold text-white leading-tight tracking-tight border-l-4 border-cyan-400 pl-3 md:pl-4">
                                {slides[currentSlideIndex].title}
                              </h3>

                              {/* 2. Slide Content Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch flex-1 py-2">
                                {/* Points list (Left) */}
                                <div className="flex flex-col justify-center gap-2 md:gap-3.5">
                                  {slides[currentSlideIndex].points.map((point, pIndex) => (
                                    <div key={pIndex} className="flex items-start gap-2.5 group">
                                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0 group-hover:scale-150 transition-transform" />
                                      <p className="text-xs md:text-sm text-zinc-300 leading-relaxed font-semibold">
                                        {point.replace(/^-\s*/, "")}
                                      </p>
                                    </div>
                                  ))}
                                </div>

                                {/* Explanation & Takeaway box (Right) */}
                                <div className="flex flex-col justify-center gap-3 p-4 md:p-5 rounded-xl bg-white/[0.02] border border-white/[0.04] shadow-inner relative">
                                  <div className="space-y-1 bg-zinc-900/60 rounded-lg p-2.5 border border-white/[0.02]">
                                    <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                                      <Sparkles className="w-3 h-3 text-cyan-400" /> Penjelasan Afriza AI
                                    </p>
                                    <p className="text-[10px] md:text-xs text-zinc-400 leading-relaxed font-medium">
                                      {slides[currentSlideIndex].explanation}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </AnimatePresence>
                        </div>

                        {/* Slide Takeaway bottom bar */}
                        <div className="px-6 md:px-12 py-3.5 bg-cyan-500/[0.03] border-t border-white/[0.05] flex items-center justify-between z-10 gap-4">
                          <p className="text-[9px] md:text-[11px] font-bold text-cyan-400 italic truncate flex-1 leading-snug">
                            🔑 Takeaway: "{slides[currentSlideIndex].takeaway}"
                          </p>
                          <button
                            type="button"
                            onClick={() => handleCopyText(`SLIDE: ${slides[currentSlideIndex].title}\nMateri:\n${slides[currentSlideIndex].points.map(p => `- ${p}`).join("\n")}\n\nPenjelasan:\n${slides[currentSlideIndex].explanation}\n\nTakeaway: "${slides[currentSlideIndex].takeaway}"`, currentSlideIndex)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all flex-shrink-0"
                            title="Salin isi slide"
                          >
                            {copiedIndex === currentSlideIndex ? (
                              <Check size={12} className="text-cyan-400" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Slideshow interactive navigation bar */}
                      <div className="flex items-center justify-between select-none">
                        <button
                          onClick={handlePrevSlide}
                          disabled={currentSlideIndex === 0}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/[0.06] hover:bg-zinc-100 dark:hover:bg-white/5 font-semibold text-xs transition-all cursor-pointer",
                            currentSlideIndex === 0 && "opacity-40 cursor-not-allowed"
                          )}
                        >
                          <ChevronLeft size={16} />
                          <span>Sebelumnya</span>
                        </button>

                        {/* Slide dots tracking */}
                        <div className="flex items-center gap-1.5">
                          {slides.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setDirection(idx > currentSlideIndex ? 1 : -1);
                                setCurrentSlideIndex(idx);
                              }}
                              className={cn(
                                "h-1.5 rounded-full transition-all cursor-pointer",
                                idx === currentSlideIndex
                                  ? "w-6 bg-cyan-500 shadow-sm shadow-cyan-400/50"
                                  : "w-1.5 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600"
                              )}
                            />
                          ))}
                        </div>

                        {currentSlideIndex < slides.length - 1 ? (
                          <button
                            onClick={handleNextSlide}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/15 hover:bg-cyan-500/20 font-semibold text-xs transition-all cursor-pointer"
                          >
                            <span>Selanjutnya</span>
                            <ChevronRight size={16} />
                          </button>
                        ) : (
                          <div className="px-4 py-2 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            Deck Selesai ✨
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* VIEW MODE B: OUTLINE VERTICAL LIST */}
                  {viewMode === "outline" && (
                    <div className="flex flex-col gap-4">
                      {slides.map((slide, sIndex) => (
                        <motion.div
                          key={sIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: sIndex * 0.05 }}
                          className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm space-y-4 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500/15 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-extrabold flex items-center justify-center">
                                {slide.slide_number}
                              </div>
                              <h3 className="text-sm md:text-base font-extrabold text-zinc-900 dark:text-white leading-tight">
                                {slide.title}
                              </h3>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyText(`SLIDE: ${slide.title}\nMateri:\n${slide.points.map(p => `- ${p}`).join("\n")}\n\nPenjelasan:\n${slide.explanation}\n\nTakeaway: "${slide.takeaway}"`, sIndex)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-cyan-500 dark:text-zinc-600 dark:hover:text-cyan-400 hover:bg-zinc-50 dark:hover:bg-zinc-950 opacity-0 group-hover:opacity-100 transition-all"
                              title="Salin isi slide"
                            >
                              {copiedIndex === sIndex ? (
                                <Check size={12} className="text-cyan-400" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pl-0 md:pl-10">
                            {/* Material list (Left 5 columns) */}
                            <div className="md:col-span-5 flex flex-col gap-2">
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Materi Slide</p>
                              {slide.points.map((pt, ptIdx) => (
                                <div key={ptIdx} className="flex items-start gap-2">
                                  <div className="w-1 h-1 rounded-full bg-cyan-500 mt-2 flex-shrink-0" />
                                  <p className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold leading-relaxed">
                                    {pt}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {/* Explanation (Right 7 columns) */}
                            <div className="md:col-span-7 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-white/[0.02] rounded-xl p-3.5 space-y-2">
                              <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-cyan-500" /> Penjelasan AI
                              </p>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                                {slide.explanation}
                              </p>
                              <div className="pt-2 border-t border-zinc-200/50 dark:border-white/[0.04] text-[10px] font-bold text-cyan-400 italic">
                                🔑 Takeaway: "{slide.takeaway}"
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Actions Section Panel */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-white/[0.05]">
                    <button
                      onClick={handleClearPreview}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-500/20 hover:bg-rose-500/5 text-rose-500 font-bold text-xs transition-all cursor-pointer"
                    >
                      <Trash2 size={13} />
                      <span>Hapus Pratinjau</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setPhase("setup");
                          setError(null);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/[0.06] hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300 font-bold text-xs transition-all cursor-pointer"
                      >
                        <span>Ubah Pengaturan</span>
                      </button>

                      <button
                        onClick={handleGenerate}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/15 hover:bg-cyan-500/20 font-bold text-xs transition-all cursor-pointer"
                      >
                        <RefreshCw size={13} />
                        <span>Generate Ulang</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
