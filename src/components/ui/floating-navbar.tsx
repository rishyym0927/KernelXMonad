"use client";
import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// Add proper TypeScript interface for the props
interface NavItem {
  name: string;
  link: string;
  icon: React.ReactNode;
}

interface FloatingNavProps {
  navItems: NavItem[];
  className?: string;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({ navItems, className }) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const pathname = usePathname();

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    // Check if 'current' is a valid number
    if (typeof current === "number") {
      // Determine scroll direction
      const direction = current - (scrollYProgress.getPrevious() ?? current);

      // Once the user passes 0.05 in scroll progress, we consider them to have scrolled
      if (!hasScrolled && scrollYProgress.get() > 0.05) {
        setHasScrolled(true);
      }

      // If user has scrolled at least once, show/hide nav based on scroll direction
      if (hasScrolled) {
        if (direction < 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key="floating-nav"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ 
            duration: 0.3,
            ease: "easeOut"
          }}
          className={cn(
            "fixed top-6 inset-x-0 mx-auto flex w-[80vw] items-center justify-between",
            "border border-white/[0.2] rounded-full bg-black/80 backdrop-blur-sm",
            "shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]",
            "z-[5000] px-8 py-2",
            className
          )}
        >
          {/* Left side navigation items */}
          <div className="flex items-center space-x-4">
            {navItems.map((navItem, idx) => {
              const isActive = pathname === navItem.link;
              return (
                <Link
                  key={`link-${idx}`}
                  href={navItem.link}
                  className="relative"
                >
                  <motion.div
                    className={cn(
                      "relative px-3 py-2 rounded-full transition-colors",
                      "text-neutral-50 flex items-center space-x-1 ",
                      "hover:bg-white/10",
                      isActive ? "text-white  font-medium" : "text-neutral-400 "
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="block sm:hidden">{navItem.icon}</span>
                    <span className="hidden sm:block text-sm">{navItem.name}</span>
                    
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 -z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Right side with Sonic logo and name */}
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Image
                src="/logo.png"
                alt="Sonic Logo"
                width={32}
                height={32}
                priority
                className="rounded-full"
              />
            </motion.div>
            <motion.span 
              className="text-lg font-semibold text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              Monad
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};