import { DocsArticle } from "@/components/docs/docs-article";
import { DocsBreadcrumbs } from "@/components/docs/docs-breadcrumbs";
import { DocsNavigation } from "@/components/docs/docs-navigation";
import { DocsPagination } from "@/components/docs/docs-pagination";

import type { FoundDocsContent } from "@/lib/docs/content";

interface DocsPageProps {
  content: FoundDocsContent;
}

export function DocsPage({ content }: DocsPageProps) {
  return (
    <div className="min-w-0">
      <DocsBreadcrumbs current={content.entry} />
      <div className="grid min-w-0 gap-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <DocsNavigation current={content.entry} />
        <div className="min-w-0 rounded-xl border bg-card p-5 shadow-geist sm:p-8 lg:p-10">
          <DocsArticle markdown={content.markdown} sourceKey={content.entry.sourceKey} />
          <DocsPagination current={content.entry} />
        </div>
      </div>
    </div>
  );
}
