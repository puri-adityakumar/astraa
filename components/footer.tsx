"use client";

import { useState, useEffect, useMemo } from "react";
import { BsTwitterX, BsTelegram } from "react-icons/bs";
import { Github } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { AvatarCircles } from "@/components/ui/avatar-circles";

interface Contributor {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
}

export function Footer() {
  const [contributors, setContributors] = useState<Contributor[]>([]);

  useEffect(() => {
    fetch("https://api.github.com/repos/puri-adityakumar/astraa/contributors")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setContributors(data);
        }
      })
      .catch(() => {
        // Silent fail - avatar will show default
      });
  }, []);

  // Transform contributors for AvatarCircles
  const avatarUrls = useMemo(() => {
    if (contributors.length > 0) {
      return contributors.slice(0, 5).map((c) => ({
        imageUrl: c.avatar_url,
        profileUrl: c.html_url,
      }));
    }
    return [
      {
        imageUrl: "https://github.com/puri-adityakumar.png",
        profileUrl: "https://github.com/puri-adityakumar",
      },
    ];
  }, [contributors]);

  // Calculate remaining contributors count
  const remainingCount = contributors.length > 5 ? contributors.length - 5 : 0;

  return (
    <footer className="relative z-10 w-full bg-gradient-to-b from-transparent via-background/40 to-background">
      <div className="container mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:gap-12">
          {/* Left Section */}
          <div className="max-w-md space-y-3">
            <div className="-ml-1">
              <Logo className="text-3xl md:text-4xl [&>span:last-child]:text-base md:[&>span:last-child]:text-xl" />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A collection of helpful utility tools for developers and creators,
              built with modern web technologies. Designed for speed,
              accessibility, and ease of use.
            </p>

            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground">
                Contributed by:
              </span>
              <AvatarCircles
                avatarUrls={avatarUrls}
                numPeople={remainingCount}
              />
            </div>
          </div>

          {/* Right Section - Left aligned on mobile, right aligned on desktop */}
          <div className="flex flex-col items-center gap-2 md:items-end md:justify-end md:gap-3">
            {/* Social Icons */}
            <div className="flex items-center gap-1 md:gap-5">
              <Link
                href="https://github.com/puri-adityakumar/astraa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://x.com/astraadottech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="X (Twitter)"
              >
                <BsTwitterX className="h-4 w-4" />
              </Link>
              <Link
                href="https://t.me/astraadottech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Telegram"
              >
                <BsTelegram className="h-5 w-5" />
              </Link>
            </div>

            {/* Text Links */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground md:gap-6">
              <Link
                href="https://astraa.notion.site/roadmap"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                Roadmap
              </Link>
              <Link
                href="https://astraa.notion.site/roadmap"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                Docs
              </Link>
              <Link
                href="https://astraa.notion.site/changelog"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                Changelog
              </Link>
              <Link
                href="/privacy"
                className="transition-colors hover:text-foreground"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-6 flex justify-center border-t border-white/5 pt-4 md:justify-start">
          <p className="text-xs text-muted-foreground md:text-sm">
            &copy; {new Date().getFullYear()} Astraa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
