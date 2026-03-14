import type { Metadata } from "next";
import { notFound } from "next/navigation";
import InsightArticlePage from "@/components/InsightArticlePage";
import { ArticleJsonLd } from "@/lib/seo";
import { getInsightBySlug, insights } from "@/lib/insights";
import { siteConfig } from "@/lib/siteConfig";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return insights.map(article => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getInsightBySlug(slug);

  if (!article) {
    return {};
  }

  const title = `${article.titleEn} | Oh Hyunji`;
  const description = article.summaryKo;
  const path = `/insights/${article.slug}`;
  const image = `${siteConfig.siteUrl}/images/businesscard.png`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: "article",
      url: `${siteConfig.siteUrl}${path}`,
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: "Hyunji Oh Business Card",
        },
      ],
      locale: "ko_KR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function InsightDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = getInsightBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <>
      <ArticleJsonLd
        title={article.titleEn}
        description={article.summaryKo}
        path={`/insights/${article.slug}`}
        published={article.published}
      />
      <InsightArticlePage article={article} />
    </>
  );
}
