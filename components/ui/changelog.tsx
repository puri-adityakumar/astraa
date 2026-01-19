import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  description: string;
  items?: string[];
  image?: string;
  button?: {
    url: string;
    text: string;
  };
};

export interface ChangelogProps {
  title?: string;
  description?: string;
  entries?: ChangelogEntry[];
  className?: string;
}

export const defaultEntries: ChangelogEntry[] = [
  {
    version: "Version 1.0.1",
    date: "6 January 2026",
    title: "Initial Launch",
    description:
      "Development branch merged to main - introducing astraa as a versatile platform with tools, games, and utilities.",
    items: [
      "Removed debug console.log statements from storage/migration utilities",
      "Refactored footer contributor avatars to AvatarCircles component",
      "Added release process documentation to CONTRIBUTING.md",
      "Minor responsive design improvements",
      "Initial launch with core feature set",
    ],
  },
];

export const Changelog = ({
  title = "Changelog",
  description = "Get the latest updates and improvements to our platform.",
  entries = defaultEntries,
}: ChangelogProps) => {
  return (
    <section className="py-32">
      <div className="container">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
            {title}
          </h1>
          <p className="mb-6 text-base text-muted-foreground md:text-lg">
            {description}
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-3xl space-y-16 md:mt-24 md:space-y-24">
          {entries.map((entry, index) => (
            <div
              key={index}
              className="relative flex flex-col gap-4 md:flex-row md:gap-16"
            >
              <div className="top-8 flex h-min w-64 shrink-0 items-center gap-4 md:sticky">
                <Badge variant="secondary" className="text-xs">
                  {entry.version}
                </Badge>
                <span className="text-xs font-medium text-muted-foreground">
                  {entry.date}
                </span>
              </div>
              <div className="flex flex-col">
                <h2 className="mb-3 text-lg font-bold leading-tight text-foreground/90 md:text-2xl">
                  {entry.title}
                </h2>
                <p className="text-sm text-muted-foreground md:text-base">
                  {entry.description}
                </p>
                {entry.items && entry.items.length > 0 && (
                  <ul className="ml-4 mt-4 space-y-1.5 text-sm text-muted-foreground md:text-base">
                    {entry.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="list-disc">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {entry.image && (
                  <img
                    src={entry.image}
                    alt={`${entry.version} visual`}
                    className="mt-8 w-full rounded-lg object-cover"
                  />
                )}
                {entry.button && (
                  <Button variant="link" className="mt-4 self-end" asChild>
                    <a href={entry.button.url} target="_blank">
                      {entry.button.text} <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
