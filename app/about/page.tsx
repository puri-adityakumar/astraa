import type { Metadata } from "next";
import Link from "next/link";
import { Github, Twitter, Send, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Astraa is built and maintained by Aditya Kumar — a full-stack developer focused on privacy-first, browser-based utility tools. Read about the project, the author, and why every tool runs client-side.",
  keywords: [
    "about astraa",
    "aditya kumar",
    "astraa author",
    "open source utility tools",
    "browser-based tools",
  ],
  openGraph: {
    title: "About Astraa",
    description:
      "About Astraa — a free, open-source utility toolkit built and maintained by Aditya Kumar. Every tool runs entirely in the browser.",
    url: "/about",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Astraa",
    description:
      "About Astraa — a free, open-source utility toolkit built and maintained by Aditya Kumar.",
    images: ["/assets/astraa_banner.jpg"],
  },
  alternates: {
    canonical: "https://www.astraa.tech/about",
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://www.astraa.tech/about#person",
  "name": "Aditya Kumar",
  "url": "https://www.astraa.tech/about",
  "jobTitle": "Full-stack developer",
  "worksFor": { "@id": "https://www.astraa.tech/#organization" },
  "sameAs": [
    "https://github.com/puri-adityakumar",
    "https://x.com/astraadottech",
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.astraa.tech" },
    { "@type": "ListItem", "position": 2, "name": "About", "item": "https://www.astraa.tech/about" },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="container max-w-2xl mx-auto pt-12 pb-16 px-4 prose-styles">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            About Astraa
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            A free, open-source utility toolkit running entirely in your browser.
          </p>
        </header>

        <section aria-labelledby="who" className="space-y-3">
          <h2 id="who" className="text-xl font-semibold">
            Who builds this
          </h2>
          <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
            Astraa is built and maintained by{" "}
            <Link
              href="https://github.com/puri-adityakumar"
              className="underline underline-offset-4 hover:text-foreground"
              rel="author"
            >
              Aditya Kumar
            </Link>
            , a full-stack developer. The project started in early 2025 as a
            personal utility hub: a single home for the small developer tools
            I reach for daily, with no signups, no upload prompts, no ads,
            and no analytics on individual tool pages.
          </p>
        </section>

        <section aria-labelledby="why" className="mt-8 space-y-3">
          <h2 id="why" className="text-xl font-semibold">
            Why it runs in the browser
          </h2>
          <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
            Every Astraa tool runs entirely on your device using native web
            APIs — the Web Crypto API for the password generator and hash
            generator, the Canvas API for the image resizer, browser-native
            arithmetic and TextEncoder for the calculator and base64 encoder.
            Nothing is transmitted to a server. That choice is deliberate:
            tools that touch passwords, secrets, files, or local content
            should never depend on someone else&apos;s uptime or someone
            else&apos;s storage policy. The exceptions are explicitly
            documented: the currency converter fetches public exchange rates,
            and the AI text generator calls a hosted LLM. Both are clearly
            labelled on their respective tool pages.
          </p>
        </section>

        <section aria-labelledby="stack" className="mt-8 space-y-3">
          <h2 id="stack" className="text-xl font-semibold">
            What it&apos;s built with
          </h2>
          <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
            Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS,
            shadcn/ui, Zustand for state, Vitest for unit tests, and
            framer-motion for animations. Hosted on Vercel. The full source
            is on GitHub under the MIT License — issues, pull requests, and
            feature suggestions are all welcome.
          </p>
        </section>

        <section aria-labelledby="contact" className="mt-8 space-y-3">
          <h2 id="contact" className="text-xl font-semibold">
            Get in touch
          </h2>
          <ul className="space-y-2 text-sm sm:text-base">
            <li className="flex items-center gap-2">
              <Github className="h-4 w-4 text-foreground/70" aria-hidden="true" />
              <Link
                href="https://github.com/puri-adityakumar/astraa/issues"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Report an issue or request a feature on GitHub
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <Github className="h-4 w-4 text-foreground/70" aria-hidden="true" />
              <Link
                href="https://github.com/puri-adityakumar"
                className="underline underline-offset-4 hover:text-foreground"
              >
                github.com/puri-adityakumar
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <Twitter className="h-4 w-4 text-foreground/70" aria-hidden="true" />
              <Link
                href="https://x.com/astraadottech"
                className="underline underline-offset-4 hover:text-foreground"
              >
                x.com/astraadottech
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <Send className="h-4 w-4 text-foreground/70" aria-hidden="true" />
              <Link
                href="https://t.me/astraadottech"
                className="underline underline-offset-4 hover:text-foreground"
              >
                t.me/astraadottech
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-foreground/70" aria-hidden="true" />
              <span className="text-muted-foreground">
                For private inquiries, open a GitHub Issue and request a contact channel.
              </span>
            </li>
          </ul>
        </section>
      </article>
    </>
  );
}
