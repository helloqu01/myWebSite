import type { MetadataRoute } from "next";
import { isPortfolioPublic, isResumePublic } from "@/lib/featureFlags";
import { siteConfig } from "@/lib/siteConfig";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  if (!isPortfolioPublic) {
    return {
      rules: {
        userAgent: "*",
        allow: "/senior-cat/",
        disallow: "/",
      },
      sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: isResumePublic ? undefined : "/resume/",
    },
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
  };
}

