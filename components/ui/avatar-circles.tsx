"use client";

import { cn } from "@/lib/utils";

interface Avatar {
  imageUrl: string;
  profileUrl: string;
}
interface AvatarCirclesProps {
  className?: string;
  numPeople?: number;
  avatarUrls: Avatar[];
}

export const AvatarCircles = ({
  numPeople,
  className,
  avatarUrls,
}: AvatarCirclesProps) => {
  return (
    <div className={cn("z-10 flex -space-x-4 rtl:space-x-reverse", className)}>
      {avatarUrls.map((url) => (
        <a
          key={url.profileUrl}
          href={url.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            className="h-10 w-10 rounded-full border-2 border-background"
            src={url.imageUrl}
            width={40}
            height={40}
            alt="Avatar"
          />
        </a>
      ))}
      {(numPeople ?? 0) > 0 && (
        <a
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-background text-center text-xs font-medium text-foreground hover:bg-muted dark:bg-background dark:text-foreground"
          href="https://github.com/puri-adityakumar/astraa/graphs/contributors"
          target="_blank"
          rel="noopener noreferrer"
        >
          +{numPeople}
        </a>
      )}
    </div>
  );
};
