"use client";

import Link from "next/link";
import { ArrowRight, Braces, Github, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";

const FEATURE_ITEMS = [
  {
    title: "14+ focused tools",
    description: "Purpose-built utilities for everyday work.",
    icon: Braces,
  },
  {
    title: "Local by default",
    description: "Your files and input stay in your browser.",
    icon: LockKeyhole,
  },
  {
    title: "Open and free",
    description: "No account, paywall, or installation required.",
    icon: Github,
  },
];

export function HeroSection() {
  return (
    <section className="relative -mx-4 -my-8 overflow-hidden sm:-mx-6 sm:-my-10 lg:-mx-8 lg:-my-12">
      <div className="site-grid pointer-events-none absolute inset-0 opacity-65" />
      <div className="pointer-events-none absolute left-1/2 top-[44%] h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/60" />
      <div className="pointer-events-none absolute left-1/2 top-[44%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/70" />
      <div className="pointer-events-none absolute left-1/2 top-[44%] h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-background/70 blur-3xl" />

      <div className="pointer-events-none absolute left-[12%] top-16 hidden items-center gap-2 font-mono text-[10px] text-muted-foreground lg:flex">
        <span className="h-px w-12 bg-border" />
        64 × 64
      </div>
      <div className="pointer-events-none absolute right-[12%] top-32 hidden items-center gap-2 font-mono text-[10px] text-muted-foreground lg:flex">
        1200 GRID
        <span className="h-px w-12 bg-border" />
      </div>

      <div className="relative flex min-h-[680px] items-center justify-center px-5 py-24 sm:min-h-[720px] sm:px-8 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div>
            <span className="inline-flex min-h-8 items-center gap-2 rounded-full border bg-background/80 px-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground shadow-geist backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Browser-native utility suite
            </span>
          </div>

          <h1 className="mt-7 text-[clamp(3rem,8vw,6.5rem)] font-semibold leading-[0.92] tracking-[-0.065em]">
            Tools for the work
            <span className="block text-muted-foreground">between the work.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Astraa brings precise developer and creator utilities into one fast,
            private workspace—ready whenever the small task becomes the blocker.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/explore" className="group w-full gap-2 sm:w-auto">
                Explore tools
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link
                href="https://github.com/puri-adityakumar/astraa"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full gap-2 sm:w-auto"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
                View source
              </Link>
            </Button>
          </div>

          <div className="mt-7 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>Quick access</span>
            <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] shadow-geist">
              ⌘ / Ctrl
            </kbd>
            <span>+</span>
            <kbd className="rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] shadow-geist">
              K
            </kbd>
          </div>
        </div>
      </div>

      <div className="relative grid border-t bg-background/90 sm:grid-cols-3">
        {FEATURE_ITEMS.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className={
                "flex gap-4 border-b p-6 last:border-b-0 sm:border-b-0 sm:p-8 " +
                (index > 0 ? "sm:border-l" : "")
              }
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted/40">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-semibold tracking-normal">{item.title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
