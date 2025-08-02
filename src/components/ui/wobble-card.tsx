"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const WobbleCard = ({
  children,
  containerClassName,
  className,
}: {
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY } = event;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (clientX - (rect.left + rect.width / 2)) / 25;
    const y = (clientY - (rect.top + rect.height / 2)) / 25;
    setMousePosition({ x, y });
  };

  return (
    <motion.section
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      style={{
        transform: isHovering
          ? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale3d(1.02, 1.02, 1)`
          : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
        transition: "transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      className={cn(
        "mx-auto w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative rounded-xl overflow-hidden border border-slate-800/50",
        containerClassName
      )}
    >
      <div
        className="relative h-full [background-image:radial-gradient(circle_at_top_right,rgba(139,92,246,0.15),rgba(59,130,246,0.1),transparent_50%)] sm:mx-0 sm:rounded-xl overflow-hidden"
        style={{
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(148, 163, 184, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        }}
      >
        <motion.div
          style={{
            transform: isHovering
              ? `translate3d(${-mousePosition.x * 0.5}px, ${-mousePosition.y * 0.5}px, 0) scale3d(1.01, 1.01, 1)`
              : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
            transition: "transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          className={cn("h-full px-6 py-8 sm:px-12 sm:py-12", className)}
        >
          <Noise />
          <ProfessionalOverlay />
          <div className="relative z-10">{children}</div>
        </motion.div>
      </div>
    </motion.section>
  );
};

const Noise = () => {
  return (
    <div
      className="absolute inset-0 w-full h-full scale-[1.1] transform opacity-[0.03] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundSize: "128px 128px",
      }}
    />
  );
};

const ProfessionalOverlay = () => {
  return (
    <>
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      />
      
      {/* Professional gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5" />
      
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-500/10 to-transparent rounded-bl-full" />
      
      {/* Bottom left accent */}
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-600/8 to-transparent rounded-tr-full" />
    </>
  );
};