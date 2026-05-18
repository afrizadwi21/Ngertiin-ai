"use client";

import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Logo } from "@/components/logo";
import { Sparkles, Shield, Zap } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { toast } from "sonner";

function LoginCardContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");

  useEffect(() => {
    if (error === "auth_failed") {
      toast.error("Gagal Masuk", {
        description: "Terjadi kesalahan saat masuk dengan Google. Silakan coba lagi.",
        duration: 5000,
      });
    }
  }, [error]);

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center relative overflow-hidden px-4">
      {/* Ambient blobs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-3/4 left-1/2 w-[300px] h-[300px] bg-violet-500/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "2s" }} />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-zinc-900/70 backdrop-blur-2xl border border-white/8 rounded-3xl p-8 shadow-2xl">
          {/* Glow top */}
          <div className="absolute -top-px left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-4"
            >
              <Logo size="lg" href="/" />
            </motion.div>
            <p className="text-zinc-400 text-sm">Your Personal AI Study Buddy</p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-zinc-600 font-medium">Masuk dengan</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Google button */}
          <motion.button
            onClick={loginWithGoogle}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-100 transition-all shadow-lg"
          >
            <GoogleIcon />
            Continue with Google
          </motion.button>

          {/* Trust signals */}
          <div className="mt-8 flex flex-col gap-3">
            {[
              { icon: Shield, text: "Data kamu aman & terenkripsi" },
              { icon: Zap, text: "Setup dalam hitungan detik" },
              { icon: Sparkles, text: "Akses gratis tanpa kartu kredit" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-xs text-zinc-500">
                <Icon size={13} className="text-cyan-500 flex-shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-zinc-600 mt-6">
          Dengan masuk, kamu menyetujui{" "}
          <a href="#" className="text-zinc-400 hover:text-white transition-colors underline underline-offset-2">
            Syarat & Ketentuan
          </a>{" "}
          dan{" "}
          <a href="#" className="text-zinc-400 hover:text-white transition-colors underline underline-offset-2">
            Kebijakan Privasi
          </a>
        </p>
      </motion.div>
    </div>
  );
}

export function LoginCard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
      </div>
    }>
      <LoginCardContent />
    </Suspense>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706 0-.59.102-1.166.282-1.706V4.962H.957C.347 6.175 0 7.55 0 9c0 1.45.348 2.826.957 4.038l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
