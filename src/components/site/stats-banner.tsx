// ============================================================================
// stats-banner.tsx — small strip of site-wide counts on the home page.
// ----------------------------------------------------------------------------
// Renders a row of stat cards (articles / threads / replies / repos / views / stars).
// Each card has an icon, a big number, and a label. Gives the hero section
// substance even when content is sparse.
//
// Docs: https://nextjs.org/docs/app/building-your-application/rendering/server-components
// ==========================================================================
import { BookOpen, MessageSquare, Reply, Github, Eye, Star } from "lucide-react";
import type { SiteStats } from "@/lib/api-client";

interface StatsBannerProps {
  stats: SiteStats;
}

export function StatsBanner({ stats }: StatsBannerProps) {
  // STAT_ITEMS — declarative config so the render stays clean.
  // Each entry maps a stat key to its display metadata.
  const items: Array<{
    key: keyof SiteStats;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { key: "articles", label: "Articles", icon: BookOpen },
    { key: "threads", label: "Threads", icon: MessageSquare },
    { key: "replies", label: "Replies", icon: Reply },
    { key: "repos", label: "Repos", icon: Github },
    { key: "totalViews", label: "Reads", icon: Eye },
    { key: "totalStars", label: "Stars", icon: Star },
  ];

  return (
    // Grid: 2 cols on mobile, 3 on tablet, 6 on desktop.
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
      {items.map(({ key, label, icon: Icon }) => (
        <div
          key={key}
          className="flex items-center gap-3 rounded-2xl border hairline bg-card p-4 shadow-premium-xs transition-shadow hover:shadow-premium-sm"
        >
          {/* Icon in an accent-tinted circle */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft">
            <Icon className="h-5 w-5 text-accent" />
          </div>
          <div className="min-w-0">
            {/* Big number — tabular-nums so digits align nicely. */}
            <dd className="text-xl font-semibold tabular-nums tracking-tight text-foreground">
              {stats[key]}
            </dd>
            <dt className="text-xs text-muted-foreground">{label}</dt>
          </div>
        </div>
      ))}
    </dl>
  );
}
