"use client";
import React from "react";
import { FloatingNav } from "./ui/floating-navbar";
import { IconHome, IconUser, IconCode, IconTemplate } from "@tabler/icons-react";

export function FloatingNavDemo() {
  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: <IconHome className="h-4 w-4 text-white" />,
    },
    {
      name: "Dashboard",
      link: "/dashboard",
      icon: <IconTemplate className="h-4 w-4 text-white" />,
    },
    {
      name: "Explore",
      link: "/explore",
      icon: <IconUser className="h-4 w-4 text-white" />,
    },
    {
      name: "IDE",
      link: "/ide",
      icon: <IconCode className="h-4 w-4 text-white" />,
    },
    {
      name: "Builder",
      link: "/drag-drop",
      icon: <IconCode className="h-4 w-4 text-white" />,
    },
     {
      name: "Pipeline",
      link: "/pipeline",
      icon: <IconCode className="h-4 w-4 text-white" />,
    },
      {
      name: "AI-Query",
      link: "/nlp",
      icon: <IconCode className="h-4 w-4 text-white" />,
    },
  ];

  return (
    <div className="relative w-full">
      <FloatingNav navItems={navItems} />
    </div>
  );
}