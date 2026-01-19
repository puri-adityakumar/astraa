"use client";

import { useState, useEffect } from "react";
import { Github, Bug } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Contributor {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

export default function ContributePage() {
  const [contributors, setContributors] = useState<Contributor[]>([]);

  // Exclude founder and bots from contributors
  const EXCLUDED_USERS = [
    "puri-adityakumar",
    "vercel[bot]",
    "dependabot[bot]",
    "github-actions[bot]",
  ];

  useEffect(() => {
    fetch("https://api.github.com/repos/puri-adityakumar/astraa/contributors")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const filtered = data.filter(
            (contributor: Contributor) =>
              !EXCLUDED_USERS.includes(contributor.login),
          );
          setContributors(filtered);
        }
      })
      .catch((err) => console.error("Failed to fetch contributors:", err));
  }, []);

  return (
    <div className="container max-w-5xl space-y-16 pb-12 pt-24">
      {/* Header Section */}
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Contribute to{" "}
          <span style={{ fontFamily: "'Funnel Display', sans-serif" }}>
            astraa
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-xl leading-relaxed text-muted-foreground">
          Built by developers, for developers. Help us shape the future of this
          open-source collection of tools.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link
              href="https://github.com/puri-adityakumar/astraa"
              target="_blank"
            >
              <Github className="mr-2 h-5 w-5" />
              Star on GitHub
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-8"
          >
            <Link
              href="https://github.com/puri-adityakumar/astraa/issues"
              target="_blank"
            >
              <Bug className="mr-2 h-5 w-5" />
              Report Issue
            </Link>
          </Button>
        </div>

        <div className="mx-auto max-w-xl space-y-6 pt-8">
          <blockquote className="font-mono text-sm italic leading-relaxed text-muted-foreground sm:text-base">
            "This was my first idea when I started coding. I wanted to build
            this, but back then I didn't have the skills. Now I do, so I made it
            happen."
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="text-right leading-tight">
              <span className="block text-sm font-semibold">~ Aditya</span>
              <span className="block text-xs text-muted-foreground">
                Founder
              </span>
            </div>
            <Link
              href="https://github.com/puri-adityakumar"
              target="_blank"
              className="flex-shrink-0 transition-opacity hover:opacity-80"
            >
              <Image
                src="https://github.com/puri-adityakumar.png"
                alt="Aditya"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full border border-border bg-muted"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Top Contributors Section */}
      <div className="space-y-8">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">
          Top Contributors
        </h2>

        {contributors.length > 0 ? (
          <div className="flex flex-col items-center gap-6">
            {/* Overlapping Avatars */}
            <div className="flex items-center justify-center">
              <div className="flex -space-x-4">
                {contributors.slice(0, 4).map((contributor) => (
                  <Link
                    key={contributor.id}
                    href={contributor.html_url}
                    target="_blank"
                    className="relative transition-transform hover:z-10 hover:scale-110"
                  >
                    <Avatar className="h-14 w-14 border-4 border-background shadow-lg sm:h-16 sm:w-16">
                      <AvatarImage
                        src={contributor.avatar_url}
                        alt={contributor.login}
                      />
                      <AvatarFallback>
                        {contributor.login.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                ))}
                {contributors.length > 4 && (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-background bg-foreground text-sm font-semibold text-background shadow-lg sm:h-16 sm:w-16 sm:text-base">
                    +{contributors.length - 4}
                  </div>
                )}
              </div>
            </div>

            {/* Contributor Names */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {contributors.slice(0, 5).map((contributor, index) => (
                <Link
                  key={contributor.id}
                  href={contributor.html_url}
                  target="_blank"
                  className="transition-colors hover:text-foreground"
                >
                  {contributor.login}
                  {index < Math.min(contributors.length, 5) - 1 && (
                    <span className="ml-6 text-border">•</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            No contributors yet. Be the first to contribute!
          </p>
        )}
      </div>

      {/* Getting Started Section */}
      <div className="space-y-8">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">
          Getting Started
        </h2>

        <div className="mx-auto max-w-2xl space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              1
            </div>
            <div>
              <p className="font-medium">Star the repository</p>
              <p className="text-sm text-muted-foreground">
                Show your support and help us reach more developers.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              2
            </div>
            <div>
              <p className="font-medium">
                Read CONTRIBUTING.md & Code of Conduct
              </p>
              <p className="text-sm text-muted-foreground">
                Understand our{" "}
                <Link
                  href="https://github.com/puri-adityakumar/astraa/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  className="text-foreground hover:underline"
                >
                  contribution guidelines
                </Link>{" "}
                and{" "}
                <Link
                  href="https://github.com/puri-adityakumar/astraa/blob/main/CODE_OF_CONDUCT.md"
                  target="_blank"
                  className="text-foreground hover:underline"
                >
                  code of conduct
                </Link>{" "}
                before contributing.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              3
            </div>
            <div>
              <p className="font-medium">
                Check the Issues tab or raise a new issue
              </p>
              <p className="text-sm text-muted-foreground">
                Find tasks to work on or report bugs and feature requests.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              4
            </div>
            <div>
              <p className="font-medium">Reach out to us</p>
              <p className="text-sm text-muted-foreground">
                Connect with us on{" "}
                <Link
                  href="https://x.com/astraadottech"
                  target="_blank"
                  className="text-foreground hover:underline"
                >
                  X (formerly Twitter)
                </Link>{" "}
                or{" "}
                <Link
                  href="https://t.me/astraadottech"
                  target="_blank"
                  className="text-foreground hover:underline"
                >
                  Telegram
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="space-y-6 text-center">
        <p className="font-medium text-muted-foreground">
          Help support development and server costs ❤️
        </p>

        <div className="mx-auto flex max-w-md items-center gap-4 rounded-xl border bg-card/50 p-4 text-left shadow-sm backdrop-blur-sm transition-colors hover:bg-card/80">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">
              Sponsor <span className="font-logo">astraa</span>
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Support open source work
            </p>
          </div>
          <div className="shrink-0">
            <iframe
              src="https://github.com/sponsors/puri-adityakumar/button"
              title="Sponsor astraa"
              height="32"
              width="114"
              style={{ border: 0, borderRadius: "6px" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
