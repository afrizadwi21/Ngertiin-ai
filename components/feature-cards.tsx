"use client";

import { motion } from "framer-motion";
import {
  MessageSquare,
  Upload,
  Zap,
  Map,
  History,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Explain Like Student",
    description:
      "AI menjelaskan materi dengan gaya yang kamu pilih sendiri. Sesuaikan dengan mood belajarmu!",
    modes: ["Formal", "Santai", "Anak SMK", "Super Singkat"],
    color: "from-cyan-500/20 to-blue-500/10",
    borderColor: "border-cyan-500/20",
    iconColor: "text-cyan-400",
    badgeColor: "bg-cyan-500/10 text-cyan-400",
  },
  {
    icon: Upload,
    title: "Upload Soal",
    description:
      "Foto soal PR atau ujianmu, upload ke Ngerti.in, dan AI akan langsung menjelaskan langkah-langkahnya.",
    modes: ["OCR Smart", "Langkah Detail", "Ringkas"],
    color: "from-blue-500/20 to-indigo-500/10",
    borderColor: "border-blue-500/20",
    iconColor: "text-blue-400",
    badgeColor: "bg-blue-500/10 text-blue-400",
  },
  {
    icon: Zap,
    title: "Quiz Generator",
    description:
      "Generate soal latihan otomatis dari topik yang kamu masukkan. Pilih tingkat kesulitan dan jumlah soal.",
    modes: ["Pilihan Ganda", "Essay", "True/False"],
    color: "from-violet-500/20 to-purple-500/10",
    borderColor: "border-violet-500/20",
    iconColor: "text-violet-400",
    badgeColor: "bg-violet-500/10 text-violet-400",
  },
  {
    icon: Map,
    title: "Roadmap Belajar",
    description:
      "AI buatkan jalur belajar yang terstruktur sesuai targetmu — dari pemula sampai mahir.",
    modes: ["Harian", "Mingguan", "Custom"],
    color: "from-emerald-500/20 to-green-500/10",
    borderColor: "border-emerald-500/20",
    iconColor: "text-emerald-400",
    badgeColor: "bg-emerald-500/10 text-emerald-400",
  },
  {
    icon: History,
    title: "Riwayat Belajar",
    description:
      "Semua sesi chat tersimpan rapi. Review kapan saja, lanjut belajar dari mana kamu terakhir berhenti.",
    modes: ["Auto-save", "Search", "Bookmark"],
    color: "from-orange-500/20 to-amber-500/10",
    borderColor: "border-orange-500/20",
    iconColor: "text-orange-400",
    badgeColor: "bg-orange-500/10 text-orange-400",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export function FeatureCards() {
  return (
    <section id="features" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] transition-colors duration-300" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-6 transition-colors duration-300">
            Semua yang kamu butuhkan
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white mb-4 transition-colors duration-300">
            Fitur{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Lengkap
            </span>{" "}
            untuk Belajar
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto transition-colors duration-300">
            Dari penjelasan materi sampai latihan soal, semua ada di satu tempat.
            Belajar lebih efektif dengan bantuan AI.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`relative group p-6 rounded-2xl border backdrop-blur-sm cursor-pointer overflow-hidden bg-white/80 dark:bg-gradient-to-br dark:${feature.color} border-zinc-200 dark:${feature.borderColor} shadow-sm hover:shadow-md dark:shadow-none bg-gradient-to-br ${feature.color.replace(/500\/20/g, '500/5').replace(/500\/10/g, '500/5')} transition-all duration-300`}
              style={{
                gridColumn: i === 3 ? "span 1" : undefined,
              }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-zinc-500/5 dark:bg-white/2 rounded-2xl" />

              {/* Icon */}
              <div
                className={`w-11 h-11 rounded-xl bg-zinc-100 dark:bg-gradient-to-br dark:${feature.color} border border-zinc-200 dark:${feature.borderColor} flex items-center justify-center mb-4 transition-colors duration-300`}
              >
                <feature.icon size={20} className={feature.iconColor} />
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 transition-colors duration-300">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4 transition-colors duration-300">
                {feature.description}
              </p>

              {/* Mode badges */}
              <div className="flex flex-wrap gap-2">
                {feature.modes.map((mode) => (
                  <span
                    key={mode}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 dark:${feature.badgeColor} text-zinc-600 dark:text-cyan-400 transition-colors duration-300`}
                  >
                    {mode}
                  </span>
                ))}
              </div>

              {/* Arrow */}
              <div
                className={`absolute top-5 right-5 ${feature.iconColor} opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0`}
              >
                <ChevronRight size={16} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
