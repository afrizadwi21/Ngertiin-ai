import Link from "next/link";
import { Logo } from "@/components/logo";

const footerLinks = {
  Produk: ["Fitur", "Harga", "Changelog", "Roadmap"],
  Perusahaan: ["Tentang", "Blog", "Karir", "Press"],
  Dukungan: ["Dokumentasi", "Help Center", "Status", "Kontak"],
  Legal: ["Privasi", "Syarat & Ketentuan", "Cookie"],
};

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Logo size="md" />
            <p className="mt-4 text-sm text-zinc-500 leading-relaxed max-w-xs">
              AI Study Buddy untuk siswa Indonesia. Belajar lebih paham, lebih
              cepat, lebih seru.
            </p>
            <div className="flex gap-3 mt-6">
              {["X", "IG", "TT"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/8 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/8 transition-all text-xs font-bold"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="text-sm font-semibold text-zinc-800 dark:text-white mb-4">
                {category}
              </p>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-200 dark:border-white/5 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-600">
            © 2025 Ngerti.in. All rights reserved.
          </p>
          <p className="text-sm text-zinc-600">
            Made with Afriza
          </p>
        </div>
      </div>
    </footer>
  );
}
