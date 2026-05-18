import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { FeatureCards } from "@/components/feature-cards";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300">
      <Navbar />
      <main>
        <HeroSection />
        <FeatureCards />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
