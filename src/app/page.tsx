"use client"
import { useEffect } from "react"
import { Spotlight } from "@/components/home/spotlight"
import { cn } from "@/lib/utils"
import { MarqueeCards } from "@/components/ui/MarqueeCards"
import Footer from "@/components/home/Footer"
import { motion } from "framer-motion"
import { ArrowRight,Play } from "lucide-react"
import { WobbleCardDemo } from "@/components/WobbleCard"
import { FeaturesSectionDemo } from "@/components/Featuresection"
import { HeroScrollDemo } from "@/components/HeroScrollDemo"
import { Cover } from "@/components/ui/cover"
import Link from "next/link"


export default function Home() {
  // Add smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth"
    return () => {
      document.documentElement.style.scrollBehavior = "auto"
    }
  }, [])

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      
      {/* Hero Section - Enhanced with uniform background */}
      <section className="relative flex h-[70vh] w-full overflow-hidden antialiased md:items-center md:justify-center bg-[#0a0a0a]">
        {/* Subtle grid pattern */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 [background-size:60px_60px] select-none opacity-[0.15]",
            "[background-image:linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)]",
          )}
        />

        {/* Enhanced spotlight with better positioning */}
        <div className="absolute inset-0">
          <Spotlight />
        </div>

        {/* Subtle radial gradient for depth */}
        <div className="absolute inset-0 bg-gradient-radial from-purple-900/5 via-transparent to-transparent opacity-50" />

        <motion.div
          className="relative z-10 mx-auto w-full max-w-7xl p-4 pt-20 md:pt-0"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.h1
            className="bg-gradient-to-b from-white via-neutral-200 to-neutral-500 bg-clip-text text-center text-4xl font-bold text-transparent md:text-8xl leading-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
          >
            Welcome to <Cover>Kerenel</Cover>
          </motion.h1>
          <motion.p
            className="mx-auto mt-8 max-w-2xl text-center text-xl font-light text-neutral-400 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            Build, deploy, and collaborate on decentralized projects with ease. The future of blockchain development is
            here.
          </motion.p>

          <motion.div
            className="mt-12 flex flex-col sm:flex-row justify-center gap-4 items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            {/* Primary CTA Button */}
            <Link
              href="/drag-drop"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white transition-all duration-300 ease-out bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-xl border border-purple-500/20 hover:border-purple-400/40 shadow-lg hover:shadow-purple-500/10 hover:shadow-xl"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>

            {/* Secondary Button */}
            <a
              href="#features"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-medium text-neutral-300 transition-all duration-300 ease-out bg-gray-900/50 hover:bg-gray-800/60 rounded-xl border border-gray-700/50 hover:border-gray-600/60 backdrop-blur-sm"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Play className="w-4 h-4" />
                Watch Demo
              </span>
            </a>
          </motion.div>
        </motion.div>

        {/* Smooth transition to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      </section>
<FeaturesSectionDemo/>      

<HeroScrollDemo/>

      {/* Contracts Section - Enhanced with better spacing */}
      <section className="relative py-32 px-6 sm:px-12 overflow-hidden bg-[#0a0a0a]">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-transparent to-indigo-500" />
        </div>

        <motion.div
          className="relative z-10 w-full"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-16 bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
            Explore Our Contracts
          </h2>
          <MarqueeCards />
        </motion.div>
      </section>

      {/* CTA Section - Enhanced with modern styling */}
      <section className="relative py-32 px-6 sm:px-12 bg-[#0a0a0a]">
      <WobbleCardDemo/>
      
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

