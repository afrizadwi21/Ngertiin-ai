import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function Logo({ className, size = "md", href = "/" }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg font-bold tracking-tight",
    md: "text-2xl font-bold tracking-tight",
    lg: "text-4xl font-bold tracking-tight",
  };

  const content = (
    <span
      className={cn(
        sizeClasses[size],
        "bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent",
        className
      )}
    >
      Ngerti.in
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg glow-cyan-sm">
          <span className="text-white font-bold text-xs">N</span>
        </div>
        {content}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg glow-cyan-sm">
        <span className="text-white font-bold text-xs">N</span>
      </div>
      {content}
    </div>
  );
}
