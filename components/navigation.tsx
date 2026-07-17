"use client";

import { usePathname } from "next/navigation";
import { LandingNavigation } from "@/components/home";
import { FloatingNav } from "@/components/ui/floating-navbar";

export function Navigation() {
  const pathname = usePathname();

  // Landing page gets the full navigation
  if (pathname === "/") {
    return <LandingNavigation />;
  }

  // All other routes get the floating navbar
  return <FloatingNav />;
}
