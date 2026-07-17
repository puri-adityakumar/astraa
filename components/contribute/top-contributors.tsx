import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Contributor } from "./use-contributors";

interface TopContributorsProps {
  contributors: Contributor[];
}

export function TopContributors({ contributors }: TopContributorsProps) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-center">Top Contributors</h2>

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
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-110 hover:z-10 relative"
                >
                  <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border-4 border-background shadow-lg">
                    <AvatarImage src={contributor.avatar_url} alt={contributor.login} />
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
                href={contributor.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                {contributor.login}
                {index < Math.min(contributors.length, 5) - 1 && (
                  <span className="ml-6 text-border">&bull;</span>
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
  );
}
