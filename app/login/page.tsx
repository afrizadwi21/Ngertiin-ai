import { LoginCard } from "@/components/login-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk — Ngerti.in",
  description: "Masuk ke Ngerti.in, AI Study Buddy untuk siswa Indonesia.",
};

export default function LoginPage() {
  return <LoginCard />;
}