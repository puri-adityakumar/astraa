"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Github, Send, Twitter } from "lucide-react";

import { Logo } from "@/components/logo";
import { AvatarCircles } from "@/components/ui/avatar-circles";

interface Contributor {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
}

const PRODUCT_LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/tools", label: "Tools" },
  { href: "/games", label: "Games" },
  { href: "/contribute", label: "Contribute" },
];

const PROJECT_LINKS = [
  { href: "https://astraa.notion.site/roadmap", label: "Roadmap" },
  { href: "https://astraa.notion.site/roadmap", label: "Docs" },
  { href: "https://astraa.notion.site/changelog", label: "Changelog" },
  { href: "/privacy", label: "Privacy" },
];

export function Footer() {
  const [contributors, setContributors] = useState<Contributor[]>([]);

  useEffect(() => {
    fetch("https://api.github.com/repos/puri-adityakumar/astraa/contributors")
      .then((response) => response.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) setContributors(data as Contributor[]);
      })
      .catch(() => {
        // Contributor data is supplementary; the footer remains complete without it.
      });
  }, []);

  const avatarUrls = useMemo(() => {
    if (contributors.length > 0) {
      return contributors.slice(0, 5).map((contributor) => ({
        imageUrl: contributor.avatar_url,
        profileUrl: contributor.html_url,
      }));
    }

    return [
      {
        imageUrl: "https://github.com/puri-adityakumar.png",
        profileUrl: "https://github.com/puri-adityakumar",
      },
    ];
  }, [contributors]);

  const remainingCount = Math.max(0, contributors.length - 5);

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto w-full max-w-[1200px] border-x border-border/70">
        <div className="grid lg:grid-cols-[1.6fr_0.7fr_0.7fr]">
          <div className="border-b p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <Logo />
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              A focused collection of browser-native utilities for developers and
              creators. Fast to open, private by default, and free to use.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              All systems operational
            </div>
          </div>

          <FooterColumn title="Product" links={PRODUCT_LINKS} />
          <FooterColumn title="Project" links={PROJECT_LINKS} borderLeft />
        </div>

        <div className="flex flex-col gap-5 border-t px-6 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Astraa
            </p>
            <span className="hidden h-3 w-px bg-border sm:block" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Built with contributors</span>
              <AvatarCircles avatarUrls={avatarUrls} numPeople={remainingCount} />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <SocialLink
              href="https://github.com/puri-adityakumar/astraa"
              label="GitHub"
            >
              <Github className="h-4 w-4" />
            </SocialLink>
            <SocialLink href="https://x.com/astraadottech" label="X (Twitter)">
              <Twitter className="h-4 w-4" />
            </SocialLink>
            <SocialLink href="https://t.me/astraadottech" label="Telegram">
              <Send className="h-4 w-4" />
            </SocialLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

interface FooterColumnProps {
  borderLeft?: boolean;
  links: Array<{ href: string; label: string }>;
  title: string;
}

function FooterColumn({ borderLeft = false, links, title }: FooterColumnProps) {
  return (
    <div
      className={
        "border-b p-6 sm:p-8 lg:border-b-0 " +
        (borderLeft ? "lg:border-l" : "")
      }
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </p>
      <div className="mt-4 grid gap-1">
        {links.map((link) => {
          const isExternal = link.href.startsWith("http");
          return (
            <Link
              key={`${title}-${link.label}`}
              href={link.href}
              className="inline-flex min-h-touch items-center rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground"
              {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

interface SocialLinkProps {
  children: React.ReactNode;
  href: string;
  label: string;
}

function SocialLink({ children, href, label }: SocialLinkProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-10 min-h-touch w-10 min-w-touch items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={label}
    >
      {children}
    </Link>
  );
}
