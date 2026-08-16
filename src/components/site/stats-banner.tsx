import { BookOpen, MessageSquare, Reply, Github, Eye, Star } from "lucide-react";
import type { SiteStats } from "@/lib/api-client";

interface StatsBannerProps {
  stats: SiteStats;
}

export function StatsBanner({ stats }: StatsBannerProps) {
  // stat_items — declarative config so the render stays clean
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
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
      {items.map(({ key, label, icon: Icon }) => (
        <div
          key={key}
          className="flex items-center gap-3 rounded-2xl border hairline bg-card p-4 shadow-premium-xs transition-shadow hover:shadow-premium-sm"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft">
            <Icon className="h-5 w-5 text-accent" />
          </div>
          <div className="min-w-0">
            {/* big number — tabular-nums so digits align nicely */}
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
