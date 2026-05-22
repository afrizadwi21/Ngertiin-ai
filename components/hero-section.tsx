"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, ChevronRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background radial glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-white dark:bg-zinc-950 transition-colors duration-300" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-cyan-500/10 dark:bg-cyan-500/10 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-blue-600/5 dark:bg-blue-600/8 rounded-full blur-[100px]" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03] transition-opacity duration-300"
          style={{
            backgroundImage:
              "linear-gradient(rgba(120,120,120,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(120,120,120,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text side */}
          <div className="flex flex-col gap-6">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-sm font-medium">
                <Sparkles size={14} />
                Powered by AI
                <ChevronRight size={14} />
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-zinc-900 dark:text-white transition-colors duration-300"
            >
              Belajar Jadi{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent text-glow-cyan">
                Lebih Paham
              </span>{" "}
              dengan AI
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl transition-colors duration-300"
            >
              AI Study Buddy yang menjelaskan pelajaran dengan cara yang lebih
              mudah dipahami siswa. Formal, santai, atau super singkat — pilih
              gayamu.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/login"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-base hover:opacity-90 transition-all glow-cyan shadow-lg shadow-cyan-500/20"
              >
                Coba Gratis
                <ArrowRight size={18} />
              </Link>
              <Link
                href="#features"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 font-semibold text-base hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white transition-all"
              >
                Lihat Demo
              </Link>
            </motion.div>
          </div>

          {/* Chat mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <HeroChatMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeroChatMockup() {
  const messages = [
    {
      role: "user",
      content: "Jelasin fotosintesis dong, pake bahasa anak SMK!",
    },
    {
      role: "ai",
      content:
        "Oke bro! Jadi fotosintesis itu basically kayak tanaman nge-charge diri sendiri. Dia nyedot sinar matahari, terus diproses jadi makanan (gula) + oksigen. Input: CO₂ + air + cahaya ➜ Output: gula + O₂. Gampang kan? ",
    },
    { role: "user", content: "Nah gitu dong! Sekarang formal versinya" },
  ];

  return (
    <div className="relative">
      {/* Glow behind card */}
      <div className="absolute inset-0 bg-cyan-500/10 blur-3xl rounded-3xl" />

      <div className="relative bg-white/95 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">N</span>
            </div>
            <span className="text-sm font-semibold text-zinc-800 dark:text-white">Ngerti.in</span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-medium">
              Anak SMK
            </span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
        </div>

        {/* Messages */}
        <div className="p-5 flex flex-col gap-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.3, duration: 0.5 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "ai" && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                  <Sparkles size={10} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                  ? "bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/20 dark:border-cyan-500/30 text-cyan-900 dark:text-cyan-50"
                  : "bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-white/5 text-zinc-700 dark:text-zinc-200"
                  }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="flex items-center gap-2"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0">
              <Sparkles size={10} className="text-white" />
            </div>
            <div className="bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-white/5 px-4 py-3 rounded-2xl flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                  className="w-1.5 h-1.5 bg-zinc-400 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Input */}
        <div className="px-5 pb-5">
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-white/8 rounded-2xl px-4 py-3">
            <input
              readOnly
              value="Coba jelasin rumus integral..."
              className="flex-1 bg-transparent text-sm text-zinc-500 dark:text-zinc-400 outline-none"
            />
            <div className="w-7 h-7 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
              <ArrowRight size={14} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
