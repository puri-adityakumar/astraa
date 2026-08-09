import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";

import { Button } from "@/components/ui/button";

import { HOME_CATALOG_COUNTS, HOME_FEATURED_TOOLS } from "./home-content";

export function HeroSection() {
  return (
    <section
      className="relative -mx-4 -mt-8 overflow-hidden border-b sm:-mx-6 sm:-mt-10 lg:-mx-8 lg:-mt-12"
      aria-labelledby="home-hero-title"
    >
      <div className="site-grid pointer-events-none absolute inset-0 opacity-55" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background via-background/80 to-transparent" />

      <div className="relative mx-auto max-w-5xl px-5 py-11 text-center sm:px-8 sm:py-20 lg:py-24">
        <p className="inline-flex min-h-8 items-center gap-2 rounded-full border bg-background/90 px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground shadow-geist">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
          Browser-first · {HOME_CATALOG_COUNTS.available} available tools
        </p>

        <h1
          id="home-hero-title"
          className="mx-auto mt-5 max-w-4xl text-[clamp(2.65rem,11.5vw,5.25rem)] leading-[0.96] tracking-[-0.06em]"
        >
          Format JSON. Resize images. Keep moving.
        </h1>

        <p className="mx-auto mt-5 min-h-[168px] max-w-2xl text-base leading-7 text-muted-foreground min-[360px]:min-h-[140px] sm:min-h-[112px] sm:text-lg">
          Test regexes, convert values, edit Markdown, and finish everyday developer and creator
          tasks. Most work stays in your browser; provider-backed steps are labelled before use.
        </p>

        <div className="mx-auto mt-7 grid max-w-sm grid-cols-2 gap-3 sm:flex sm:max-w-none sm:justify-center">
          <Button size="lg" asChild>
            <Link href="/tools" className="group gap-2 px-4" data-home-primary="hero">
              Browse tools
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
              className="gap-2 px-4"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              View source
              <span className="sr-only"> (opens in a new tab)</span>
            </Link>
          </Button>
        </div>

        <nav className="mt-7" aria-label="Start with a tool">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Start with a real tool
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-1">
            {HOME_FEATURED_TOOLS.map((tool) => (
              <Link
                key={tool.id}
                href={tool.path}
                prefetch={false}
                className="inline-flex min-h-touch items-center justify-center rounded-md px-3 text-center text-sm text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground focus-visible:text-foreground"
              >
                {tool.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </section>
  );
}
