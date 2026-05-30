import Link from "next/link";
import { toolCategories } from "@/lib/tools";

export function ToolGrid() {
  const categories = toolCategories
    .map((category) => ({
      ...category,
      items: category.items.filter((tool) => !tool.comingSoon),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <section
      aria-labelledby="home-tools-heading"
      className="mt-16 mb-12 max-w-5xl mx-auto px-4"
    >
      <h2
        id="home-tools-heading"
        className="text-2xl sm:text-3xl font-semibold tracking-tight text-center"
      >
        Browse the free tool catalog
      </h2>
      <p className="mt-3 text-sm sm:text-base text-muted-foreground text-center max-w-2xl mx-auto">
        Every tool runs entirely in your browser using native web APIs.
        No upload, no signup, no tracking, no server processing.
      </p>

      <div className="mt-10 space-y-10">
        {categories.map((category) => (
          <div key={category.name}>
            <h3 className="text-base sm:text-lg font-medium text-foreground">
              {category.name}
            </h3>
            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {category.items.map((tool) => {
                const Icon = tool.icon;
                return (
                  <li key={tool.path}>
                    <Link
                      href={tool.path}
                      className="group block rounded-lg border border-border bg-card/40 hover:bg-card hover:border-foreground/20 transition-colors p-4 min-h-touch focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <div className="flex items-start gap-3">
                        <Icon
                          className="h-5 w-5 mt-0.5 text-foreground/70 group-hover:text-foreground transition-colors shrink-0"
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {tool.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
