"use client";

import { Button } from "@/components/ui/button";
import { BookOpen, CircleDot } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import type { Contributor } from "@/lib/github/contributors-service";

interface ContributeClientProps {
  contributors: Contributor[];
}

export function ContributeClient({ contributors }: ContributeClientProps) {
  return (
    <div className="mx-auto max-w-5xl space-y-16 pb-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Contribute to Astraa</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Browse an assigned or open issue, then read the contribution guide before starting a
          focused change.
        </p>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Start in the issue thread so ownership and the implementation approach are clear.
        </p>
        <div className="flex flex-col items-stretch justify-center gap-3 pt-4 sm:flex-row sm:items-center sm:gap-4">
          <Button asChild size="lg" className="w-full rounded-full px-6 sm:w-auto sm:px-8">
            <Link
              href="https://github.com/puri-adityakumar/astraa/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              <CircleDot className="mr-2 h-5 w-5" aria-hidden="true" />
              Browse open issues
              <span className="sr-only"> (opens in a new tab)</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full rounded-full px-6 sm:w-auto sm:px-8"
          >
            <Link
              href="https://github.com/puri-adityakumar/astraa/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              <BookOpen className="mr-2 h-5 w-5" aria-hidden="true" />
              Read contribution guide
              <span className="sr-only"> (opens in a new tab)</span>
            </Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Want to support the project without taking an issue?{" "}
          <Link
            href="https://github.com/puri-adityakumar/astraa"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:underline"
          >
            Star the repository
            <span className="sr-only"> (opens in a new tab)</span>
          </Link>
          .
        </p>

        <div className="pt-8 max-w-xl mx-auto space-y-6">
          <blockquote className="font-mono text-sm sm:text-base text-muted-foreground leading-relaxed italic">
            &quot;This was my first idea when I started coding. I wanted to build this, but back
            then I didn&apos;t have the skills. Now I do, so I made it happen.&quot;
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="text-right leading-tight">
              <span className="text-sm font-semibold block">~ Aditya</span>
              <span className="text-xs text-muted-foreground block">Founder</span>
            </div>
            <Link
              href="https://github.com/puri-adityakumar"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Aditya's GitHub profile (opens in a new tab)"
              className="inline-flex min-h-touch min-w-touch flex-shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80"
            >
              <Image
                src="/assets/astraa_pfp.png"
                alt="Aditya"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border border-border bg-muted"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Top Contributors Section */}
      <div className="space-y-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center">Top contributors</h2>

        {contributors.length > 0 ? (
          <div className="flex flex-col items-center gap-6">
            {/* Overlapping Avatars */}
            <div className="flex items-center justify-center">
              <div className="flex -space-x-4">
                {contributors.slice(0, 4).map((contributor) => (
                  <Link
                    key={contributor.id}
                    href={contributor.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${contributor.login}'s GitHub profile (opens in a new tab)`}
                    className="transition-transform hover:scale-110 hover:z-10 relative"
                  >
                    <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border-4 border-background shadow-lg">
                      <AvatarImage src={contributor.avatarUrl} alt={contributor.login} />
                      <AvatarFallback>{contributor.login.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Link>
                ))}
                {contributors.length > 4 && (
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-foreground text-background border-4 border-background shadow-lg flex items-center justify-center font-semibold text-sm sm:text-base">
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
                  href={contributor.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  {contributor.login}
                  <span className="sr-only"> (opens in a new tab)</span>
                  {index < Math.min(contributors.length, 5) - 1 && (
                    <span className="ml-6 text-border" aria-hidden="true">
                      &bull;
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            Contributor profiles are unavailable. Browse open issues to get started.
          </p>
        )}
      </div>

      {/* Getting Started Section */}
      <div className="space-y-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center">How to start</h2>

        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              1
            </div>
            <div>
              <p className="font-medium">Find an issue</p>
              <p className="text-sm text-muted-foreground">
                Choose an issue you opened or one assigned to you. Wait for assignment before
                starting implementation.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              2
            </div>
            <div>
              <p className="font-medium">Read the contribution guide and code of conduct</p>
              <p className="text-sm text-muted-foreground">
                Understand our{" "}
                <Link
                  href="https://github.com/puri-adityakumar/astraa/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:underline"
                >
                  contribution guidelines
                  <span className="sr-only"> (opens in a new tab)</span>
                </Link>{" "}
                and{" "}
                <Link
                  href="https://github.com/puri-adityakumar/astraa/blob/main/CODE_OF_CONDUCT.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:underline"
                >
                  code of conduct
                  <span className="sr-only"> (opens in a new tab)</span>
                </Link>{" "}
                before contributing.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              3
            </div>
            <div>
              <p className="font-medium">Discuss the approach</p>
              <p className="text-sm text-muted-foreground">
                Align on the intended behavior and scope in the issue before changing code.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              4
            </div>
            <div>
              <p className="font-medium">Verify and submit a focused change</p>
              <p className="text-sm text-muted-foreground">
                Run the required checks and open a surgical pull request against the development
                branch.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="text-center space-y-6">
        <p className="text-muted-foreground font-medium">
          Help support development and server costs
        </p>

        <div className="max-w-md mx-auto p-4 rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm flex items-center gap-4 text-left hover:bg-card/80 transition-colors">
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              Sponsor <span className="font-logo">astraa</span>
            </p>
            <p className="text-xs text-muted-foreground truncate">Support open source work</p>
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
