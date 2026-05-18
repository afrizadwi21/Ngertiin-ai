"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Sparkles,
  Award,
  BookOpen,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  LayoutDashboard,
  Brain,
  Timer,
  FileText,
  ListTodo,
  AlertTriangle,
  Lightbulb,
  X,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar";
import { DashboardNavbar } from "@/components/dashboard-navbar";
import { supabase } from "@/lib/supabase";

interface Question {
  id: number;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  concept: string;
}

interface QuizData {
  topic: string;
  quizType: "Pilihan Ganda" | "Essay";
  difficulty: "Mudah" | "Sedang" | "Sulit";
  questions: Question[];
}

interface EssayGradeResult {
  finalScore: number;
  results: {
    questionId: number;
    score: number;
    isCorrect: boolean;
    feedback: string;
  }[];
  recommendation: string;
}

const DIFFICULTY_OPTIONS = [
  { value: "Mudah", label: "Mudah", desc: "Soal pemahaman dasar", emoji: "", color: "border-emerald-500/30 text-emerald-500 bg-emerald-500/5 hover:border-emerald-500/50" },
  { value: "Sedang", label: "Sedang", desc: "Soal aplikasi konsep", emoji: "", color: "border-cyan-500/30 text-cyan-500 bg-cyan-500/5 hover:border-cyan-500/50" },
  { value: "Sulit", label: "Sulit", desc: "Soal HOTS & penalaran", emoji: "", color: "border-rose-500/30 text-rose-500 bg-rose-500/5 hover:border-rose-500/50" },
];

const COUNT_OPTIONS = [
  { value: 5, label: "5 Soal", desc: "Quiz kilat 5 menit" },
  { value: 10, label: "10 Soal", desc: "Latihan standar" },
  { value: 20, label: "20 Soal", desc: "Uji coba komprehensif" },
];

const TYPE_OPTIONS = [
  { value: "Pilihan Ganda", label: "Pilihan Ganda", icon: ListTodo, desc: "Pilih jawaban terbaik dari 4 opsi. Dinilai otomatis secara instan." },
  { value: "Essay", label: "Essay", icon: FileText, desc: "Tulis penjelasanmu sendiri. Dinilai secara mendalam oleh Gemini AI." },
];

const SUGGESTED_TOPICS = ["Next.js App Router", "Fotosintesis & Klorofil", "Integral Substitusi", "Hukum Newton III", "Reaksi Redoks"];

const LOADING_STATUSES = [
  "Menganalisis topik & kurikulum...",
  "Menyusun butir soal berkualitas tinggi...",
  "Merumuskan pilihan jawaban & pengecoh...",
  "Menyusun kunci jawaban dan penjelasan rinci...",
  "Menyelaraskan tingkat kesulitan...",
  "Mengoptimalkan performa kuis untuk Anda...",
];

export default function QuizGeneratorPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userId, setUserId] = useState("guest-student-123");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  // Form State
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"Mudah" | "Sedang" | "Sulit">("Sedang");
  const [count, setCount] = useState<number>(5);
  const [quizType, setQuizType] = useState<"Pilihan Ganda" | "Essay">("Pilihan Ganda");

  // App Phase: 'setup' | 'generating' | 'active' | 'grading' | 'result'
  const [phase, setPhase] = useState<"setup" | "generating" | "active" | "grading" | "result">("setup");

  // Loading Screen State
  const [loadingStatusIndex, setLoadingStatusIndex] = useState(0);

  // Active Quiz State
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]); // Saves letter (A,B,C,D) or Essay text
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Result State
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [aiRecommendation, setAiRecommendation] = useState("");
  const [essayGradingResult, setEssayGradingResult] = useState<EssayGradeResult | null>(null);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Cycle through loading status messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (phase === "generating" || phase === "grading") {
      interval = setInterval(() => {
        setLoadingStatusIndex((prev) => (prev + 1) % LOADING_STATUSES.length);
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [phase]);

  // Quiz timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (phase === "active") {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phase]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const handleGenerateQuiz = async () => {
    if (!topic.trim()) {
      setError("Topik quiz tidak boleh kosong!");
      return;
    }
    setError(null);
    setPhase("generating");
    setLoadingStatusIndex(0);

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty, count, quizType }),
      });

      if (!response.ok) {
        throw new Error("Gagal membuahkan kuis");
      }

      const data = await response.json();
      setQuiz(data);
      setUserAnswers(new Array(data.questions.length).fill(""));
      setCurrentQuestionIndex(0);
      setTimerSeconds(0);
      setPhase("active");
    } catch (err: any) {
      console.error(err);
      setError("Terjadi kesalahan saat menghubungi AI. Silakan coba lagi.");
      setPhase("setup");
    }
  };

  const handleSelectAnswer = (optionIndex: number) => {
    const optionLetter = ["A", "B", "C", "D"][optionIndex];
    const updated = [...userAnswers];
    updated[currentQuestionIndex] = optionLetter;
    setUserAnswers(updated);
  };

  const handleEssayChange = (text: string) => {
    const updated = [...userAnswers];
    updated[currentQuestionIndex] = text;
    setUserAnswers(updated);
  };

  const saveQuizResultToDb = async (topicName: string, quizScore: number, quizDataJson: any) => {
    try {
      const { error } = await supabase
        .from("quiz_history")
        .insert([{
          user_id: userId,
          topic: topicName,
          score: quizScore,
          quiz_data: quizDataJson
        }]);
      if (error) {
        console.error("Error saving quiz result to DB:", error);
      }
    } catch (err) {
      console.error("Error in saveQuizResultToDb:", err);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    if (quizType === "Pilihan Ganda") {
      // Direct instant grading
      let correct = 0;
      let wrong = 0;
      const missedConcepts: string[] = [];

      quiz.questions.forEach((q, index) => {
        const userAnswer = userAnswers[index];
        if (userAnswer === q.correctAnswer) {
          correct++;
        } else {
          wrong++;
          if (q.concept && !missedConcepts.includes(q.concept)) {
            missedConcepts.push(q.concept);
          }
        }
      });

      const calculatedScore = Math.round((correct / quiz.questions.length) * 100);
      setScore(calculatedScore);
      setCorrectCount(correct);
      setWrongCount(wrong);

      // Generate localized recommendation
      const recommendation = missedConcepts.length > 0
        ? `Pelajari kembali konsep: ${missedConcepts.slice(0, 3).join(" & ")}`
        : "Luar biasa! Kamu memahami seluruh konsep materi dengan sempurna.";
      setAiRecommendation(recommendation);

      // Save to Supabase quiz_history
      saveQuizResultToDb(quiz.topic, calculatedScore, {
        questions: quiz.questions,
        userAnswers,
        correctCount: correct,
        wrongCount: wrong,
        recommendation
      });

      setPhase("result");
    } else {
      // AI-Graded Essay Quiz
      setPhase("grading");
      setLoadingStatusIndex(0);

      try {
        const response = await fetch("/api/quiz/grade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questions: quiz.questions,
            answers: userAnswers,
            topic: quiz.topic,
            difficulty: quiz.difficulty,
          }),
        });

        if (!response.ok) {
          throw new Error("Gagal menilai essay");
        }

        const data: EssayGradeResult = await response.json();
        setEssayGradingResult(data);
        setScore(data.finalScore);

        let correct = 0;
        let wrong = 0;
        data.results.forEach((res) => {
          if (res.isCorrect) correct++;
          else wrong++;
        });

        setCorrectCount(correct);
        setWrongCount(wrong);
        setAiRecommendation(data.recommendation);

        // Save to Supabase quiz_history
        saveQuizResultToDb(quiz.topic, data.finalScore, {
          questions: quiz.questions,
          userAnswers,
          correctCount: correct,
          wrongCount: wrong,
          recommendation: data.recommendation,
          essayResults: data.results
        });

        setPhase("result");
      } catch (err) {
        console.error(err);
        setError("Gagal menilai jawaban esai melalui AI. Coba kembali.");
        setPhase("active");
      }
    }
  };

  const handleRestartQuiz = () => {
    setPhase("setup");
    setQuiz(null);
    setUserAnswers([]);
    setEssayGradingResult(null);
    setTimerSeconds(0);
  };

  const handleGenerateSimilar = () => {
    handleGenerateQuiz();
  };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-[#0a0a0a] overflow-hidden text-zinc-900 dark:text-zinc-100">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
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
                <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Ngerti.in
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
                >
                  <X size={18} />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
                {[
                  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
                  { href: "/dashboard/chat?mode=chat", icon: BookOpen, label: "AI Chat" },
                  { href: "/dashboard/quiz-generator", icon: Zap, label: "Quiz Generator" },
                ].map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-all">
                      <item.icon size={18} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardNavbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto w-full h-full flex flex-col justify-start">
            <AnimatePresence mode="wait">
              {/* PHASE 1: SETUP FORM */}
              {phase === "setup" && (
                <motion.div
                  key="setup"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Header */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center shadow-lg shadow-cyan-500/5">
                        <Zap size={20} className="text-cyan-500 dark:text-cyan-400" />
                      </div>
                      <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                        Quiz Generator
                      </h1>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm ml-12">
                      Buat latihan soal otomatis dengan AI untuk menguji pemahaman belajarmu
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-center gap-2"
                    >
                      <AlertTriangle size={16} />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  {/* Form Container */}
                  <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm dark:shadow-none space-y-6 backdrop-blur-xl relative overflow-hidden">
                    {/* Floating cyan ambient glow */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full filter blur-[80px] pointer-events-none" />

                    {/* FIELD 1: TOPIC */}
                    <div className="space-y-2 relative">
                      <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                        <BookOpen size={14} className="text-cyan-500" /> Topik Pembelajaran
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          placeholder="Contoh: Next.js, Fotosintesis, Integral, Fisika"
                          className="w-full pl-4 pr-10 py-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.07] rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white dark:focus:bg-zinc-900 transition-all font-medium"
                        />
                        <Sparkles size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cyan-500 pointer-events-none opacity-70" />
                      </div>

                      {/* Clickable Quick Suggestions */}
                      <div className="flex flex-wrap gap-2 pt-1.5">
                        {SUGGESTED_TOPICS.map((suggested) => (
                          <button
                            key={suggested}
                            type="button"
                            onClick={() => setTopic(suggested)}
                            className="text-xs px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 hover:bg-cyan-500/10 dark:hover:bg-cyan-500/10 border border-zinc-200 dark:border-white/[0.04] hover:border-cyan-500/20 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all cursor-pointer font-medium"
                          >
                            {suggested}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* FIELD 2: DIFFICULTY */}
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                          <Zap size={14} className="text-cyan-500" /> Tingkat Kesulitan
                        </label>
                        <div className="flex flex-col gap-2">
                          {DIFFICULTY_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setDifficulty(opt.value as any)}
                              className={cn(
                                "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer relative group",
                                difficulty === opt.value
                                  ? "border-cyan-500 bg-cyan-500/5 dark:bg-cyan-500/10"
                                  : "border-zinc-200 dark:border-white/[0.05] bg-zinc-50 dark:bg-zinc-900/20 hover:bg-zinc-100 dark:hover:bg-white/[0.02]"
                              )}
                            >
                              {difficulty === opt.value && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-500 shadow-md shadow-cyan-400/50" />
                              )}
                              <span className="text-xl">{opt.emoji}</span>
                              <div>
                                <p className={cn("text-sm font-bold transition-colors", difficulty === opt.value ? "text-cyan-600 dark:text-cyan-400" : "text-zinc-800 dark:text-zinc-200")}>
                                  {opt.label}
                                </p>
                                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-medium">{opt.desc}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* FIELD 3: AMOUNT */}
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                          <Award size={14} className="text-cyan-500" /> Jumlah Soal
                        </label>
                        <div className="flex flex-col gap-2">
                          {COUNT_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setCount(opt.value)}
                              className={cn(
                                "flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer relative group",
                                count === opt.value
                                  ? "border-cyan-500 bg-cyan-500/5 dark:bg-cyan-500/10"
                                  : "border-zinc-200 dark:border-white/[0.05] bg-zinc-50 dark:bg-zinc-900/20 hover:bg-zinc-100 dark:hover:bg-white/[0.02]"
                              )}
                            >
                              <div>
                                <p className={cn("text-sm font-bold transition-colors", count === opt.value ? "text-cyan-600 dark:text-cyan-400" : "text-zinc-800 dark:text-zinc-200")}>
                                  {opt.label}
                                </p>
                                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-medium">{opt.desc}</p>
                              </div>
                              {count === opt.value ? (
                                <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-white">
                                  <Check size={12} className="stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full border border-zinc-300 dark:border-white/10 group-hover:border-zinc-400 transition-colors" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* FIELD 4: TYPE */}
                    <div className="space-y-3 pt-2">
                      <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                        <Brain size={14} className="text-cyan-500" /> Tipe Soal
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {TYPE_OPTIONS.map((opt) => {
                          const IconComponent = opt.icon;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setQuizType(opt.value as any)}
                              className={cn(
                                "flex items-start gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer relative group",
                                quizType === opt.value
                                  ? "border-cyan-500 bg-cyan-500/5 dark:bg-cyan-500/10 shadow-sm"
                                  : "border-zinc-200 dark:border-white/[0.05] bg-zinc-50 dark:bg-zinc-900/20 hover:bg-zinc-100 dark:hover:bg-white/[0.02]"
                              )}
                            >
                              <div className={cn(
                                "p-2 rounded-lg border flex-shrink-0 transition-colors shadow-sm",
                                quizType === opt.value
                                  ? "bg-cyan-500/15 border-cyan-500/20 text-cyan-600 dark:text-cyan-400"
                                  : "bg-white dark:bg-zinc-950/60 border-zinc-200 dark:border-white/[0.04] text-zinc-500"
                              )}>
                                <IconComponent size={20} />
                              </div>
                              <div className="min-w-0">
                                <p className={cn("text-sm font-bold transition-colors", quizType === opt.value ? "text-cyan-600 dark:text-cyan-400" : "text-zinc-800 dark:text-zinc-200")}>
                                  {opt.label}
                                </p>
                                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 leading-relaxed">{opt.desc}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* GENERATE BUTTON */}
                    <div className="pt-4">
                      <motion.button
                        whileHover={{ scale: 1.01, boxShadow: "0 0 25px rgba(6,182,212,0.25)" }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleGenerateQuiz}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/10 transition-all border border-cyan-500/10"
                      >
                        <Sparkles size={18} className="animate-pulse" />
                        <span>Buat Latihan Soal</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* PHASE 2: GENERATING OR GRADING LOADER */}
              {(phase === "generating" || phase === "grading") && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6"
                >
                  <div className="relative">
                    {/* Ring pulsing animation */}
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-full bg-cyan-500/20 filter blur-md"
                    />
                    <div className="relative w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-cyan-500/20 flex items-center justify-center shadow-lg shadow-cyan-500/10">
                      <Brain size={40} className="text-cyan-500 animate-bounce" />
                    </div>
                  </div>

                  <div className="space-y-2 max-w-sm">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center justify-center gap-1.5">
                      {phase === "generating" ? "Menyusun Latihan Soal..." : "Menilai Essay Anda..."}
                      <Sparkles size={16} className="text-cyan-500 animate-spin" />
                    </h2>
                    <p className="text-sm text-zinc-400 dark:text-zinc-500 h-6 overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={loadingStatusIndex}
                          initial={{ y: 15, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -15, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="block text-xs font-semibold text-cyan-600 dark:text-cyan-400"
                        >
                          {LOADING_STATUSES[loadingStatusIndex]}
                        </motion.span>
                      </AnimatePresence>
                    </p>
                  </div>

                  {/* Sleek Custom Loading Progress Bar */}
                  <div className="w-64 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-300/30 dark:border-white/[0.03]">
                    <motion.div
                      animate={{ width: ["0%", "100%"] }}
                      transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    />
                  </div>
                </motion.div>
              )}

              {/* PHASE 3: ACTIVE QUIZ */}
              {phase === "active" && quiz && (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Progress Header */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold">
                          {quiz.topic}
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.04] text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
                          {quiz.difficulty}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500">
                        <span className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.04] px-3 py-1.5 rounded-xl">
                          <Timer size={13} className="text-cyan-500" />
                          <span>{formatTime(timerSeconds)}</span>
                        </span>
                        <span className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-3 py-1.5 rounded-xl border border-cyan-500/15">
                          {currentQuestionIndex + 1} / {quiz.questions.length} Soal
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300/30 dark:border-white/[0.03] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Question Card */}
                  <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/[0.06] rounded-2xl p-6 md:p-8 shadow-md dark:shadow-none backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-60 h-60 bg-cyan-500/5 rounded-full filter blur-[60px] pointer-events-none" />

                    <h2 className="text-lg md:text-xl font-bold text-zinc-800 dark:text-white leading-relaxed mb-6">
                      {quiz.questions[currentQuestionIndex].id}. {quiz.questions[currentQuestionIndex].question}
                    </h2>

                    {/* QUESTION CONTENT */}
                    {quiz.quizType === "Pilihan Ganda" ? (
                      /* MULTIPLE CHOICE OPTIONS */
                      <div className="flex flex-col gap-3.5">
                        {quiz.questions[currentQuestionIndex].options?.map((opt, optIndex) => {
                          const optionLetter = ["A", "B", "C", "D"][optIndex];
                          const isSelected = userAnswers[currentQuestionIndex] === optionLetter;

                          return (
                            <button
                              key={optIndex}
                              onClick={() => handleSelectAnswer(optIndex)}
                              className={cn(
                                "flex items-center gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer relative group",
                                isSelected
                                  ? "border-cyan-500 bg-cyan-500/5 dark:bg-cyan-500/10"
                                  : "border-zinc-200 dark:border-white/[0.05] bg-zinc-50 dark:bg-zinc-900/20 hover:bg-zinc-100 dark:hover:bg-white/[0.02]"
                              )}
                            >
                              <div className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border transition-colors flex-shrink-0 shadow-sm",
                                isSelected
                                  ? "bg-cyan-500 border-cyan-500 text-white"
                                  : "bg-white dark:bg-zinc-950/60 border-zinc-200 dark:border-white/[0.04] text-zinc-500 group-hover:border-zinc-300 dark:group-hover:border-white/10"
                              )}>
                                {optionLetter}
                              </div>
                              <span className={cn(
                                "text-sm font-medium transition-colors leading-relaxed",
                                isSelected ? "text-cyan-600 dark:text-cyan-300" : "text-zinc-700 dark:text-zinc-300"
                              )}>
                                {opt.replace(/^[A-D]\.\s*/, "")}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      /* ESSAY TEXTAREA */
                      <div className="space-y-2">
                        <textarea
                          rows={6}
                          value={userAnswers[currentQuestionIndex] || ""}
                          onChange={(e) => handleEssayChange(e.target.value)}
                          placeholder="Ketik jawaban lengkapmu di sini..."
                          className="w-full p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/[0.07] rounded-xl text-sm leading-relaxed text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white dark:focus:bg-zinc-900 transition-all font-medium"
                        />
                        <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                          <span>Usahakan menjawab dengan detail dan menggunakan kata kunci yang relevan</span>
                          <span>{(userAnswers[currentQuestionIndex] || "").length} Karakter</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation Footer */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentQuestionIndex === 0}
                      className={cn(
                        "flex items-center gap-2 px-5 py-3 rounded-xl border border-zinc-200 dark:border-white/[0.06] hover:bg-zinc-100 dark:hover:bg-white/5 font-semibold text-sm transition-all cursor-pointer",
                        currentQuestionIndex === 0 && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      <ArrowLeft size={16} />
                      <span>Sebelumnya</span>
                    </button>

                    {currentQuestionIndex < quiz.questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQuestionIndex((prev) => Math.min(quiz.questions.length - 1, prev + 1))}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/15 hover:bg-cyan-500/20 font-semibold text-sm transition-all cursor-pointer"
                      >
                        <span>Selanjutnya</span>
                        <ArrowRight size={16} />
                      </button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(6,182,212,0.2)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmitQuiz}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-md transition-all cursor-pointer border border-cyan-500/10"
                      >
                        <span>Selesaikan Kuis</span>
                        <CheckCircle2 size={16} />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* PHASE 4: RESULT PAGE */}
              {phase === "result" && quiz && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Results Dashboard Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    {/* Circle Score Ring (Left - 5 columns) */}
                    <div className="md:col-span-5 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/[0.06] rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm dark:shadow-none relative overflow-hidden">
                      <div className="absolute inset-0 bg-cyan-500/5 filter blur-3xl rounded-full" />

                      <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4 z-10">
                        SKOR AKHIR
                      </span>

                      {/* Radial Score Indicator */}
                      <div className="relative w-36 h-36 flex items-center justify-center z-10">
                        {/* Static grey ring */}
                        <svg className="absolute w-full h-full transform -rotate-90">
                          <circle
                            cx="72"
                            cy="72"
                            r="62"
                            className="stroke-zinc-100 dark:stroke-zinc-800/80"
                            strokeWidth="10"
                            fill="transparent"
                          />
                          {/* Animated progress ring */}
                          <motion.circle
                            cx="72"
                            cy="72"
                            r="62"
                            className="stroke-cyan-500"
                            strokeWidth="10"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 62}
                            initial={{ strokeDashoffset: 2 * Math.PI * 62 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 62 * (1 - score / 100) }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="flex flex-col items-center">
                          <span className="text-4xl font-extrabold text-zinc-900 dark:text-white leading-none">
                            {score}
                          </span>
                          <span className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 font-bold">
                            / 100
                          </span>
                        </div>
                      </div>

                      {/* Summary text */}
                      <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mt-4 leading-normal px-2 z-10">
                        {score >= 80 ? (
                          <span className="text-emerald-500">🏆 Luar Biasa! Kamu sangat menguasai topik ini.</span>
                        ) : score >= 60 ? (
                          <span className="text-cyan-500 font-bold">⚡ Bagus sekali! Sedikit latihan lagi untuk sempurna.</span>
                        ) : (
                          <span className="text-rose-500">💪 Kerja keras adalah kunci. Teruskan latihanmu!</span>
                        )}
                      </p>
                    </div>

                    {/* Metadata & Quick Stats (Right - 7 columns) */}
                    <div className="md:col-span-7 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/[0.06] rounded-2xl p-6 flex flex-col justify-between shadow-sm dark:shadow-none">
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">TOPIK KUIS</p>
                          <h3 className="text-lg font-bold text-zinc-800 dark:text-white mt-1 flex items-center gap-1.5">
                            <BookOpen size={16} className="text-cyan-500" />
                            {quiz.topic}
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Correct count */}
                          <div className="p-3.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                              <CheckCircle2 size={18} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase leading-none">BENAR</p>
                              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">{correctCount} Soal</p>
                            </div>
                          </div>

                          {/* Wrong count */}
                          <div className="p-3.5 rounded-xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                              <XCircle size={18} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase leading-none">SALAH</p>
                              <p className="text-base font-bold text-rose-600 dark:text-rose-400 mt-1.5">{wrongCount} Soal</p>
                            </div>
                          </div>
                        </div>

                        {/* Timing */}
                        <div className="flex items-center justify-between text-xs text-zinc-500 px-1 border-t border-zinc-200 dark:border-white/[0.04] pt-3">
                          <span className="font-semibold">Tipe: {quiz.quizType}</span>
                          <span className="flex items-center gap-1.5 font-semibold">
                            <Timer size={13} className="text-cyan-500" /> Durasi: {formatTime(timerSeconds)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendation Panel */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/15 shadow-sm dark:shadow-none flex items-start gap-4 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 filter blur-xl rounded-full" />

                    <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shadow-sm border border-cyan-500/10 flex-shrink-0 mt-0.5">
                      <Lightbulb size={20} className="animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5">
                        REKOMENDASI BELAJAR AI
                      </h4>
                      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 leading-relaxed mt-2">
                        {aiRecommendation}
                      </p>
                    </div>
                  </motion.div>

                  {/* QUESTION REVIEW SECTION */}
                  <div className="space-y-4 pt-2">
                    <h3 className="text-base font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                      <Brain size={15} className="text-cyan-500" /> Tinjauan Jawaban Kuis
                    </h3>

                    <div className="flex flex-col gap-4">
                      {quiz.questions.map((q, index) => {
                        const userAnswer = userAnswers[index];
                        const isCorrect = quiz.quizType === "Pilihan Ganda"
                          ? userAnswer === q.correctAnswer
                          : essayGradingResult?.results[index]?.isCorrect;

                        const essayScore = quiz.quizType === "Essay" && essayGradingResult
                          ? essayGradingResult.results[index]?.score
                          : null;

                        const essayFeedback = quiz.quizType === "Essay" && essayGradingResult
                          ? essayGradingResult.results[index]?.feedback
                          : null;

                        return (
                          <div
                            key={q.id}
                            className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/[0.06] rounded-2xl p-5 md:p-6 shadow-sm dark:shadow-none space-y-4"
                          >
                            {/* Review Item Header */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wide">
                                  SOAL {q.id} · Concept: {q.concept}
                                </p>
                                <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-1 leading-relaxed">
                                  {q.question}
                                </h4>
                              </div>

                              {/* Question Result Badge */}
                              <div className="flex-shrink-0">
                                {isCorrect ? (
                                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/15 text-emerald-500 text-xs font-bold">
                                    <CheckCircle2 size={13} />
                                    <span>Tepat {essayScore && `(${essayScore}/100)`}</span>
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/15 text-rose-500 text-xs font-bold">
                                    <XCircle size={13} />
                                    <span>Kurang Tepat {essayScore && `(${essayScore}/100)`}</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Multiple choice selections rendering */}
                            {quiz.quizType === "Pilihan Ganda" ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-white/[0.03]">
                                  <p className="text-zinc-400 dark:text-zinc-500 font-semibold uppercase text-[10px]">JAWABANMU</p>
                                  <p className={cn("font-bold mt-1", isCorrect ? "text-emerald-500" : "text-rose-500")}>
                                    Option {userAnswer || "[Tidak Menjawab]"}
                                  </p>
                                </div>
                                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-white/[0.03]">
                                  <p className="text-zinc-400 dark:text-zinc-500 font-semibold uppercase text-[10px]">KUNCI JAWABAN</p>
                                  <p className="text-emerald-500 font-bold mt-1">
                                    Option {q.correctAnswer}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              /* Essay Answer Displays */
                              <div className="space-y-3 pt-1">
                                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-white/[0.03] text-xs">
                                  <p className="text-zinc-400 dark:text-zinc-500 font-semibold uppercase text-[10px]">JAWABANMU</p>
                                  <p className="font-semibold text-zinc-700 dark:text-zinc-300 mt-1.5 leading-relaxed whitespace-pre-wrap">
                                    {userAnswer || "[Tidak Menjawab]"}
                                  </p>
                                </div>

                                {essayFeedback && (
                                  <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-xs">
                                    <p className="text-cyan-500/80 font-bold uppercase text-[10px]">PENILAIAN AI (GEMINI)</p>
                                    <p className="font-semibold text-zinc-700 dark:text-zinc-300 mt-1.5 leading-relaxed">
                                      {essayFeedback}
                                    </p>
                                  </div>
                                )}

                                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-white/[0.03] text-xs">
                                  <p className="text-zinc-400 dark:text-zinc-500 font-semibold uppercase text-[10px]">ACUAN JAWABAN BENAR</p>
                                  <p className="font-semibold text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
                                    {q.correctAnswer}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Conceptual Explanation Box */}
                            <div className="p-4 rounded-xl bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/10 text-xs flex gap-2.5">
                              <Lightbulb size={16} className="text-cyan-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-cyan-600 dark:text-cyan-400 font-extrabold uppercase text-[10px] tracking-wide">PENJELASAN KONSEP</p>
                                <p className="font-medium text-zinc-700 dark:text-zinc-300 mt-1 leading-relaxed">
                                  {q.explanation}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 pb-8">
                    <button
                      onClick={handleGenerateSimilar}
                      className="w-full sm:flex-1 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all border border-cyan-500/10"
                    >
                      <RefreshCw size={15} />
                      <span>Buat Quiz Serupa</span>
                    </button>

                    <button
                      onClick={handleRestartQuiz}
                      className="w-full sm:flex-1 py-3.5 rounded-xl border border-zinc-200 dark:border-white/[0.06] hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <span>Ubah Pengaturan Quiz</span>
                    </button>
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
