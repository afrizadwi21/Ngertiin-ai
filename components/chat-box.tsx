"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  User,
  RotateCcw,
  Copy,
  Check,
  Paperclip,
  StopCircle,
  X,
  FileText,
  Image as ImageIcon,
  Upload,
  MessageSquare,
  Heart,
  GraduationCap,
  BrainCircuit,
  PenTool,
  Coffee,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export type ExplainMode = "Formal" | "Santai" | "Anak SMK" | "Super Singkat";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  mode?: ExplainMode;
  attachments?: {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }[];
  timestamp: Date;
}

interface ChatBoxProps {
  mode: ExplainMode;
  onModeChange?: (mode: ExplainMode) => void;
  showModeSelector?: boolean;
  className?: string;
}

const MODES: { label: ExplainMode; emoji: string; desc: string }[] = [
  { label: "Formal", emoji: "📚", desc: "Terstruktur & profesional" },
  { label: "Santai", emoji: "😎", desc: "Ramah & mudah dipahami" },
  { label: "Anak SMK", emoji: "🔥", desc: "Gaul & relatable" },
  { label: "Super Singkat", emoji: "⚡", desc: "2-3 kalimat saja" },
];

const SUGGESTIONS = [
  "Jelaskan fotosintesis",
  "Apa itu integral?",
  "Hukum Newton ke-2",
  "Rumus luas lingkaran",
  "Apa itu DNA?",
  "Cara hitung pH larutan",
];

const SOLVE_SUGGESTIONS = [
  "Selesaikan soal matematika ini",
  "Bantu jawab soal Hukum Newton",
  "Analisis struktur molekul air",
  "Penjelasan reaksi kimia redoks",
  "Latihan soal biologi genetika",
];

const TEMAN_BELAJAR_SUGGESTIONS = [
  "Aku capek belajar 😭",
  "Stres sama tugas sekolah 🤯",
  "Takut gagal ujian 🥺",
  "Bingung mau pilih jurusan",
  "Butuh motivasi belajar 🔥",
  "Bantu buat jadwal belajar 📅",
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.18, ease: "easeInOut" }}
          className="w-2 h-2 rounded-full bg-cyan-400/60"
        />
      ))}
    </div>
  );
}

function AIBubble({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group flex items-start gap-3 max-w-[88%]">
      {/* Avatar */}
      <div className="relative flex-shrink-0 mt-0.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
          <Sparkles size={14} className="text-white" />
        </div>
        {isStreaming && (
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-zinc-950 animate-pulse" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Bubble */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.07] rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm">
          <div className="prose dark:prose-invert prose-sm max-w-none
            prose-p:text-zinc-700 dark:prose-p:text-zinc-200 prose-p:leading-relaxed prose-p:my-1.5 last:prose-p:mb-0
            prose-headings:text-zinc-900 dark:prose-headings:text-white prose-headings:font-semibold
            prose-strong:text-zinc-900 dark:prose-strong:text-white prose-strong:font-semibold
            prose-em:text-zinc-600 dark:prose-em:text-zinc-300
            prose-code:text-cyan-600 dark:prose-code:text-cyan-300 prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800/70 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-zinc-50 dark:prose-pre:bg-zinc-800/80 prose-pre:border prose-pre:border-zinc-200 dark:prose-pre:border-white/5 prose-pre:rounded-xl prose-pre:my-2
            prose-ul:text-zinc-600 dark:prose-ul:text-zinc-300 prose-ol:text-zinc-600 dark:prose-ol:text-zinc-300 prose-ul:my-2 prose-ol:my-2
            prose-li:my-0.5
            prose-blockquote:border-l-2 prose-blockquote:border-cyan-500/40 prose-blockquote:pl-3 prose-blockquote:text-zinc-500 dark:prose-blockquote:text-zinc-400 prose-blockquote:not-italic
            prose-hr:border-zinc-200 dark:prose-hr:border-white/10
            prose-a:text-cyan-600 dark:prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
          {isStreaming && (
            <span className="inline-block w-0.5 h-4 bg-cyan-400 ml-0.5 animate-pulse align-middle rounded-full" />
          )}
        </div>

        {/* Actions */}
        {!isStreaming && (
          <div className="flex gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={copy}
              className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-300 px-2.5 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
            >
              {copied ? (
                <><Check size={11} className="text-emerald-400" /> Disalin!</>
              ) : (
                <><Copy size={11} /> Salin</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function UserBubble({
  content,
  attachments,
}: {
  content: string;
  attachments?: { id: string; name: string; size: number; type: string; url: string }[];
}) {
  const images = attachments?.filter((f) => f.type.startsWith("image/")) || [];
  const files = attachments?.filter((f) => !f.type.startsWith("image/")) || [];

  return (
    <div className="flex items-start gap-3 max-w-[80%] flex-row-reverse ml-auto">
      <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/8 flex items-center justify-center flex-shrink-0 mt-0.5">
        <User size={14} className="text-zinc-600 dark:text-zinc-400" />
      </div>
      <div className="flex flex-col gap-2 items-end">
        {/* Attachments: Images Grid */}
        {images.length > 0 && (
          <div className={cn(
            "grid gap-1.5",
            images.length === 1 ? "grid-cols-1" : "grid-cols-2 max-w-sm"
          )}>
            {images.map((img) => (
              <a
                key={img.id}
                href={img.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10 shadow-sm cursor-zoom-in block"
              >
                <img
                  src={img.url}
                  alt={img.name}
                  className="max-h-48 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs text-white bg-black/60 px-2.5 py-1 rounded-full font-medium">Buka Gambar</span>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Attachments: Documents/Files */}
        {files.length > 0 && (
          <div className="flex flex-col gap-1.5 max-w-sm">
            {files.map((file) => (
              <a
                key={file.id}
                href={file.url}
                download={file.name}
                className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <FileText size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 truncate">{file.name}</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{formatBytes(file.size)}</p>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Text bubble */}
        {content && (
          <div className="bg-cyan-500/10 dark:bg-gradient-to-br dark:from-cyan-500/15 dark:to-blue-600/10 border border-cyan-500/20 rounded-2xl rounded-tr-sm px-4 py-3.5 text-sm text-zinc-800 dark:text-zinc-100 leading-relaxed">
            {content}
          </div>
        )}
      </div>
    </div>
  );
}

// Utility to format file size
function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function ChatBox({
  mode,
  showModeSelector = false,
  className,
}: ChatBoxProps) {
  return (
    <Suspense fallback={
      <div className={cn("flex flex-col h-full items-center justify-center bg-white dark:bg-[#0a0a0a] text-zinc-500", className)}>
        Memuat Chat...
      </div>
    }>
      <ChatBoxContent mode={mode} showModeSelector={showModeSelector} className={className} />
    </Suspense>
  );
}

function ChatBoxContent({
  mode,
  showModeSelector = false,
  className,
}: ChatBoxProps) {
  const [chatMode, setChatMode] = useState<"chat" | "solve" | "teman-belajar">("chat");
  const [isDragging, setIsDragging] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("guest-student-123");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (err) {
        console.error("Error fetching user in ChatBox:", err);
      }
    };
    fetchUser();
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content:
        "Halo! Aku **Ngerti.in AI** — asisten belajarmu yang siap menjelaskan pelajaran dengan cara yang paling mudah dipahami.\n\nMau belajar topik apa hari ini? Kamu bisa tanya tentang **Matematika, Fisika, Kimia, Biologi, Sejarah**, atau pelajaran apa pun! 🚀\n\n*Tips: Kamu juga bisa mengirim **foto soal**, **gambar pelajaran**, atau **dokumen** (seperti PDF & teks) dengan menekan tombol lampiran (paperclip 📎) di bawah agar aku bisa menganalisis dan membantumu belajar!* 📝✨",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>("welcome");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  interface AttachedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    base64?: string;
  }

  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleModeChange = (newMode: "chat" | "solve" | "teman-belajar") => {
    setChatMode(newMode);
    if (newMode === "solve") {
      router.push("/dashboard/chat?mode=solve");
    } else if (newMode === "teman-belajar") {
      router.push("/dashboard/chat?mode=teman-belajar");
    } else {
      router.push("/dashboard/chat?mode=chat");
    }
  };

  // Dynamic Welcome Message Swapper based on chatMode when empty
  useEffect(() => {
    if (messages.length <= 1) {
      if (chatMode === "teman-belajar") {
        setMessages([
          {
            id: "welcome-tb",
            role: "ai",
            content:
              "Halo! Aku **Afriza AI** — Teman Belajarmu hari ini. 🌟\n\nLagi capek belajar, pusing sama tugas, takut ujian, atau butuh motivasi? Tenang, aku di sini buat nemenin kamu. Kita bisa buat jadwal belajar bareng, menyusun rencana belajar taktis, atau sekadar cerita keluh kesahmu.\n\n*Ingat, istirahat dan menjaga semangat itu bagian dari belajar. Bagian mana yang paling bikin berat hari ini? Cerita aja, kita hadapi bareng-bareng!* 💙✨",
            timestamp: new Date(),
          }
        ]);
        setStreamingId("welcome-tb");
      } else if (chatMode === "solve") {
        setMessages([
          {
            id: "welcome-solve",
            role: "ai",
            content:
              "Selamat datang di **Mode Smart Solve Premium Ngerti.in**! 🧠\n\nSilakan **unggah foto soal**, kirim tangkapan layar tugas, atau ketik soal pelajaranmu di bawah. Aku akan memecahkannya secara terstruktur langkah-demi-langkah, menjelaskan konsep dasarnya, memberikan tips pengerjaan cepat, dan memberimu latihan soal sejenis untuk berlatih! 🚀📎",
            timestamp: new Date(),
          }
        ]);
        setStreamingId("welcome-solve");
      } else {
        setMessages([
          {
            id: "welcome",
            role: "ai",
            content:
              "Halo! Aku **Ngerti.in AI** — asisten belajarmu yang siap menjelaskan pelajaran dengan cara yang paling mudah dipahami.\n\nMau belajar topik apa hari ini? Kamu bisa tanya tentang **Matematika, Fisika, Kimia, Biologi, Sejarah**, atau pelajaran apa pun! 🚀\n\n*Tips: Kamu juga bisa mengirim **foto soal**, **gambar pelajaran**, atau **dokumen** (seperti PDF & teks) dengan menekan tombol lampiran (paperclip 📎) di bawah agar aku bisa menganalisis dan membantumu belajar!* 📝✨",
            timestamp: new Date(),
          }
        ]);
        setStreamingId("welcome");
      }
      setTimeout(() => setStreamingId(null), 300);
    }
  }, [chatMode]);

  // Sync solve mode from URL parameters dynamically
  useEffect(() => {
    const queryMode = searchParams.get("mode");
    if (queryMode === "solve") {
      setChatMode("solve");
    } else if (queryMode === "teman-belajar") {
      setChatMode("teman-belajar");
    } else {
      // Default to "chat" mode if no mode is specified (e.g. from sidebar link) or if "chat" is specified
      setChatMode("chat");
    }
  }, [searchParams]);

  // Load existing chat if searchParams has "id"
  useEffect(() => {
    const chatIdParam = searchParams.get("id");
    if (!chatIdParam || userId === "guest-student-123") return;

    const loadChatSession = async () => {
      try {
        const { data, error } = await supabase
          .from("chat_history")
          .select("id, messages")
          .eq("id", chatIdParam)
          .eq("user_id", userId)
          .single();

        if (error) {
          console.error("Error loading chat session from DB:", error);
          return;
        }

        if (data) {
          setChatId(data.id);
          if (data.messages && Array.isArray(data.messages)) {
            // Map JSON messages back to Message type
            const mappedMsgs: Message[] = data.messages.map((m: any) => ({
              id: m.id || `msg-${Date.now()}-${Math.random()}`,
              role: m.role,
              content: m.content,
              timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
              attachments: m.attachments || undefined,
              mode: m.mode || undefined,
            }));
            setMessages(mappedMsgs);
          }
        }
      } catch (err) {
        console.error("Error loading chat session:", err);
      }
    };

    loadChatSession();
  }, [searchParams, userId]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newFile: AttachedFile = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          base64: reader.result as string,
        };
        setAttachedFiles((prev) => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const newFile: AttachedFile = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          base64: reader.result as string,
        };
        setAttachedFiles((prev) => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachedFile = (id: string) => {
    setAttachedFiles((prev) => {
      const fileToRem = prev.find((f) => f.id === id);
      if (fileToRem) {
        URL.revokeObjectURL(fileToRem.url);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  // Mark welcome message as done streaming after a brief period
  useEffect(() => {
    const timer = setTimeout(() => setStreamingId(null), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const adjustTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, []);

  const saveChatHistoryToDb = async (updatedMsgs: Message[], lastUserText: string, lastAiResponse: string) => {
    try {
      const chatTitle = lastUserText.trim().substring(0, 40) || "Lampiran Media";
      const chatPreview = lastAiResponse.substring(0, 80) + "...";

      const cleanMsgs = updatedMsgs.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        attachments: m.attachments || null,
        mode: m.mode || null
      }));

      if (!chatId) {
        // Create new chat session in Supabase
        const { data, error } = await supabase
          .from("chat_history")
          .insert([{
            user_id: userId,
            title: chatTitle,
            preview: chatPreview,
            messages: cleanMsgs
          }])
          .select("id")
          .single();

        if (error) {
          console.error("Error creating chat history row:", error.message || error);
        } else if (data) {
          setChatId(data.id);
        }
      } else {
        // Update existing chat session in Supabase
        const { error } = await supabase
          .from("chat_history")
          .update({
            preview: chatPreview,
            messages: cleanMsgs
          })
          .eq("id", chatId);

        if (error) {
          console.error("Error updating chat history row:", error.message || error);
        }
      }
    } catch (err) {
      console.error("Error in saveChatHistoryToDb:", err);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if ((!text && attachedFiles.length === 0) || isLoading) return;

    const currentAttachments = [...attachedFiles];
    setAttachedFiles([]);

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      attachments: currentAttachments.map((f) => ({
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type,
        url: f.url,
      })),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsLoading(true);

    const aiId = `a-${Date.now()}`;
    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      // Build history for context (last 10 messages)
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          mode,
          chatMode,
          history,
          attachments: currentAttachments.map((f) => ({
            name: f.name,
            type: f.type,
            base64: f.base64,
          })),
        }),
        signal: abortController.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Request failed");
      }

      const data = await res.json();

      const aiMsg: Message = {
        id: aiId,
        role: "ai",
        content: data.response,
        mode,
        timestamp: new Date(),
      };

      setStreamingId(aiId);
      setMessages((prev) => [...prev, aiMsg]);

      // Save chat session to Supabase
      saveChatHistoryToDb([...messages, userMsg, aiMsg], text, data.response);

      // Allow typewriter effect to complete
      setTimeout(() => setStreamingId(null), 100);
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") return;
      const errorMsg: Message = {
        id: aiId,
        role: "ai",
        content:
          "Maaf, terjadi kesalahan saat menghubungi AI. Pastikan koneksi internet kamu stabil dan coba lagi. 🔄",
        timestamp: new Date(),
      };
      setStreamingId(null);
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setIsLoading(false);
  };

  const handleReset = () => {
    setChatId(null);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "ai",
        content:
          "Chat direset! Mau belajar topik baru apa? Aku siap membantu kamu memahami pelajaran apapun. 🚀",
        timestamp: new Date(),
      },
    ]);
    setStreamingId(null);
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn("flex flex-col h-full overflow-hidden relative", className)}
    >
      {/* Drag and Drop Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-cyan-900/10 dark:bg-cyan-950/20 backdrop-blur-md border-2 border-dashed border-cyan-500/50 rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all duration-300"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-600 dark:text-cyan-400 shadow-lg shadow-cyan-500/10"
            >
              <Upload size={32} />
            </motion.div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Lepaskan File Soal / Gambar</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mt-1">
              Unggah gambar soal, foto, PDF, atau file teks langsung untuk dianalisis oleh AI
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Segmented Toggle */}
      <div className="flex-shrink-0 px-4 md:px-6 pt-4 pb-3 border-b border-zinc-200 dark:border-white/[0.04] bg-white/40 dark:bg-zinc-950/20 backdrop-blur-md flex items-center justify-between gap-4">
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.07] rounded-2xl p-1 gap-1 w-full max-w-[420px]">
          <button
            onClick={() => handleModeChange("chat")}
            className={cn(
              "flex-1 relative flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold tracking-wide transition-all duration-200",
              chatMode === "chat"
                ? "text-cyan-600 dark:text-white"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            )}
          >
            {chatMode === "chat" && (
              <motion.div
                layoutId="chat-mode-pill"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/15 border border-cyan-500/25 shadow-sm"
                transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
              />
            )}
            <MessageSquare size={13} className="relative z-10" />
            <span className="relative z-10 whitespace-nowrap">Chat Mode</span>
          </button>
          
          <button
            onClick={() => handleModeChange("solve")}
            className={cn(
              "flex-1 relative flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold tracking-wide transition-all duration-200",
              chatMode === "solve"
                ? "text-cyan-600 dark:text-white"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            )}
          >
            {chatMode === "solve" && (
              <motion.div
                layoutId="chat-mode-pill"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/15 border border-cyan-500/25 shadow-sm"
                transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
              />
            )}
            <Sparkles size={13} className="relative z-10 text-cyan-500 dark:text-cyan-400" />
            <span className="relative z-10 whitespace-nowrap">Smart Solve</span>
          </button>

          <button
            onClick={() => handleModeChange("teman-belajar")}
            className={cn(
              "flex-1 relative flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold tracking-wide transition-all duration-200",
              chatMode === "teman-belajar"
                ? "text-rose-600 dark:text-rose-400"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            )}
          >
            {chatMode === "teman-belajar" && (
              <motion.div
                layoutId="chat-mode-pill"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-500/20 to-orange-600/15 border border-rose-500/25 shadow-sm"
                transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
              />
            )}
            <Heart size={13} className="relative z-10 text-rose-500 dark:text-rose-400" />
            <span className="relative z-10 whitespace-nowrap">Teman Belajar</span>
          </button>
        </div>
        
        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span className={cn("w-2 h-2 rounded-full animate-pulse", chatMode === "teman-belajar" ? "bg-rose-500" : "bg-emerald-500")} />
          {chatMode === "chat" ? "AI Asisten Belajar" : chatMode === "solve" ? "Mode Smart Solve Premium" : "Mode Teman Belajar Afriza"}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 flex flex-col gap-6 min-h-0 scroll-smooth">
        {/* Smart Solve Mode Premium Welcome Card */}
        {chatMode === "solve" && messages.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl border border-cyan-500/15 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 flex items-start gap-4 shadow-sm shadow-cyan-500/5"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex-shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Mode Smart Solve Aktif</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mt-1">
                Kirimkan **foto soal** atau **ketik soal pelajaranmu**. AI akan secara otomatis mendeteksi mata pelajaran, menganalisis soal, memecahkannya langkah demi langkah secara terstruktur, memberikan tips memahami konsep, serta memberikan satu soal latihan yang sejenis!
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 text-white font-semibold text-xs hover:bg-cyan-600 transition-all shadow-md shadow-cyan-500/20"
              >
                <Upload size={12} /> Unggah Foto Soal
              </button>
            </div>
          </motion.div>
        )}

        {/* Empty state suggestions */}
        {messages.length <= 1 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-4 mt-2"
          >
            {/* Quick Action Chips inside Chat */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-600">Pilih Aksi Cepat:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleModeChange("chat")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border",
                    chatMode === "chat"
                      ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30"
                      : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-white/5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  )}
                >
                  <GraduationCap size={13} className="text-cyan-500" />
                  Jelaskan Materi
                </button>

                <button
                  onClick={() => handleModeChange("solve")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border",
                    chatMode === "solve"
                      ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30"
                      : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-white/5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  )}
                >
                  <BrainCircuit size={13} className="text-cyan-500" />
                  Smart Solve
                </button>

                <button
                  onClick={() => {
                    window.location.href = "/dashboard/quiz-generator";
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-white/5 text-zinc-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/20"
                >
                  <PenTool size={13} />
                  Buat Quiz
                </button>

                <button
                  onClick={() => handleModeChange("teman-belajar")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border",
                    chatMode === "teman-belajar"
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                      : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-white/5 text-zinc-500 hover:text-rose-500 dark:hover:text-rose-200"
                  )}
                >
                  <Coffee size={13} className="text-rose-500" />
                  Teman Belajar
                </button>
              </div>
            </div>

            {/* Suggestions specific to Mode */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-600">
                {chatMode === "chat" ? "Coba tanyakan:" : chatMode === "solve" ? "Contoh Soal:" : "Keluh Kesah Belajar:"}
              </span>
              <div className="flex flex-wrap gap-2">
                {(chatMode === "solve" ? SOLVE_SUGGESTIONS : chatMode === "teman-belajar" ? TEMAN_BELAJAR_SUGGESTIONS : SUGGESTIONS).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setInput(s);
                      textareaRef.current?.focus();
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/8 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {msg.role === "ai" ? (
                <AIBubble
                  content={msg.content}
                  isStreaming={streamingId === msg.id}
                />
              ) : (
                <UserBubble content={msg.content} attachments={msg.attachments} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 flex-shrink-0">
                <Sparkles size={14} className="text-white" />
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.07] rounded-2xl rounded-tl-sm px-4 py-3">
                <TypingDots />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Permanent Quick Action Chips (Floating above Input) */}
      <div className="flex-shrink-0 px-4 md:px-6 pt-1 pb-2 flex flex-wrap gap-2 items-center">
        <span className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-600 mr-1 select-none">Aksi:</span>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => handleModeChange("chat")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold tracking-wide uppercase transition-all duration-200 border",
              chatMode === "chat"
                ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            )}
          >
            <GraduationCap size={11} className={chatMode === "chat" ? "text-cyan-500" : ""} />
            <span>Jelaskan Materi</span>
          </button>

          <button
            onClick={() => handleModeChange("solve")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold tracking-wide uppercase transition-all duration-200 border",
              chatMode === "solve"
                ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            )}
          >
            <BrainCircuit size={11} className={chatMode === "solve" ? "text-cyan-500" : ""} />
            <span>Smart Solve</span>
          </button>

          <button
            onClick={() => {
              window.location.href = "/dashboard/quiz-generator";
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold tracking-wide uppercase transition-all duration-200 border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/5 text-zinc-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/20"
          >
            <PenTool size={11} />
            <span>Buat Quiz</span>
          </button>

          <button
            onClick={() => handleModeChange("teman-belajar")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold tracking-wide uppercase transition-all duration-200 border",
              chatMode === "teman-belajar"
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/5 text-zinc-500 hover:text-rose-500 dark:hover:text-rose-400 hover:border-rose-500/20"
            )}
          >
            <Coffee size={11} className={chatMode === "teman-belajar" ? "text-rose-500" : ""} />
            <span>Teman Belajar</span>
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 px-4 md:px-6 pb-4 md:pb-5">
        <div className="relative rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/8 focus-within:border-cyan-500/40 focus-within:shadow-[0_0_0_3px_oklch(0.72_0.18_210_/_8%)] transition-all duration-200">
          
          {/* Attached Files Previews */}
          <AnimatePresence>
            {attachedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 px-4 pt-3.5 border-b border-zinc-100 dark:border-white/[0.04] pb-3"
              >
                {attachedFiles.map((file) => {
                  const isImg = file.type.startsWith("image/");
                  return (
                    <motion.div
                      key={file.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className={cn(
                        "relative flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border transition-all text-xs",
                        isImg
                          ? "border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/60"
                          : "border-cyan-500/20 bg-cyan-500/5 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                      )}
                    >
                      {isImg ? (
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-zinc-200 dark:border-white/10 bg-zinc-200 dark:bg-zinc-800">
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                          <FileText size={14} />
                        </div>
                      )}
                      
                      <div className="min-w-0 max-w-[120px]">
                        <p className="font-semibold text-zinc-700 dark:text-zinc-300 truncate leading-tight">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-zinc-400 truncate leading-none mt-0.5">
                          {formatBytes(file.size)}
                        </p>
                      </div>

                      <button
                        onClick={() => removeAttachedFile(file.id)}
                        className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/5 transition-all ml-1"
                        type="button"
                      >
                        <X size={12} />
                      </button>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              adjustTextarea();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              chatMode === "solve"
                ? "Ketik soal pelajaran atau seret & lepas gambar soal di sini..."
                : "Tanya pelajaran apa saja... (Enter kirim, Shift+Enter baris baru)"
            }
            rows={1}
            disabled={isLoading}
            className="w-full bg-transparent text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none resize-none leading-relaxed px-4 pt-3.5 pb-12 max-h-[140px] min-h-[56px] disabled:opacity-50"
          />

          {/* Input actions bar */}
          <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-3 pb-2.5">
            <div className="flex items-center gap-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
                title="Lampirkan file"
                type="button"
              >
                <Paperclip size={15} />
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
                title="Reset chat"
                type="button"
              >
                <RotateCcw size={15} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 dark:text-zinc-700 hidden sm:block">
                {input.length > 0 ? `${input.length} karakter` : ""}
              </span>

              {isLoading ? (
                <motion.button
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  onClick={handleStop}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-medium hover:bg-red-500/15 transition-all"
                >
                  <StopCircle size={13} />
                  Berhenti
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSend}
                  disabled={!input.trim() && attachedFiles.length === 0}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all",
                    input.trim() || attachedFiles.length > 0
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
                  )}
                >
                  <Send size={14} />
                  Kirim
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
