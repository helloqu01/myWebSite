import type { MetadataRoute } from "next";
import { insights } from "@/lib/insights";
import { siteConfig } from "@/lib/siteConfig";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.siteUrl,
      lastModified: "2026-03-14",
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.siteUrl}/about`,
      lastModified: "2026-03-14",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteConfig.siteUrl}/insights`,
      lastModified: "2026-03-14",
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteConfig.siteUrl}/faq`,
      lastModified: "2026-03-14",
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteConfig.siteUrl}/privacy`,
      lastModified: "2026-03-14",
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${siteConfig.siteUrl}/terms`,
      lastModified: "2026-03-14",
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${siteConfig.siteUrl}/resume`,
      lastModified: "2026-03-14",
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteConfig.siteUrl}/summary`,
      lastModified: "2026-03-14",
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const insightRoutes: MetadataRoute.Sitemap = insights.map(article => ({
    url: `${siteConfig.siteUrl}/insights/${article.slug}`,
    lastModified: article.published,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...routes, ...insightRoutes];
}
