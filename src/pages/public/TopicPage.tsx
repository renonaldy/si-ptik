import { Link, Navigate, useParams } from "react-router-dom";

import { PublicLayout } from "@/components/layout/PublicLayout";
import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { useSiteContent } from "@/features/content/useSiteContent";
import { cn } from "@/lib/utils";
import type { Topic } from "./topicSections";

// Renders a single topic as its own page, with a pill nav to sibling topics.
export default function TopicPage({ topics, basePath }: { topics: Record<string, Topic>; basePath: string }) {
  const { topic = "" } = useParams();
  const { get, getList } = useSiteContent();
  const t = topics[topic];
  if (!t) return <Navigate to="/" replace />;

  return (
    <PublicLayout>
      <PublicPageHeader eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />
      <div className="mx-auto max-w-5xl px-4 py-14 md:px-6 md:py-16">
        {t.render({ get, getList })}

        <div className="mt-12 border-t border-border pt-8">
          <p className="mb-4 text-sm font-medium text-muted-foreground">Halaman lainnya</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(topics).map(([key, s]) => (
              <Link
                key={key}
                to={`${basePath}/${key}`}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  key === topic
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {s.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
