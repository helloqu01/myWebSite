// src/app/head.tsx
import { SeoHead } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

export default function Head() {
  const homeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: siteConfig.name,
        url: siteConfig.siteUrl,
        email: siteConfig.email,
        jobTitle: siteConfig.role,
        sameAs: [siteConfig.linkedInUrl, siteConfig.githubUrl],
        knowsAbout: [
          "Next.js",
          "NestJS",
          "AWS",
          "Admin dashboards",
          "Web performance",
          "AI workflow automation",
        ],
      },
      {
        "@type": "ProfessionalService",
        name: `${siteConfig.name} Freelance Development`,
        url: siteConfig.siteUrl,
        description:
          "Freelance full-stack development for business websites, admin tools, operational workflows, and practical AI-enabled features.",
        provider: {
          "@type": "Person",
          name: siteConfig.name,
        },
        email: siteConfig.email,
        areaServed: ["KR", "US"],
        availableLanguage: ["ko", "en"],
        serviceType: [
          "Business website development",
          "Admin dashboard development",
          "Workflow automation",
          "AI feature integration",
        ],
      },
    ],
  };

  return (
    <>
      <SeoHead
        title="Oh Hyunji | Freelance Full-stack Developer"
        description="프리랜서 풀스택 개발자 오현지의 포트폴리오 및 서비스 소개 사이트입니다."
        path="/"
      />
      <meta name="author" content="Oh Hyunji" />
      <meta name="google-adsense-account" content={siteConfig.adsenseClient} />
      <meta
        name="keywords"
        content="Oh Hyunji, Freelance Developer, Full-stack Developer, Next.js, Nest.js, AWS, Portfolio, Web Developer"
      />
      <meta name="theme-color" content="#1e3a8a" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
    </>
  );
}
