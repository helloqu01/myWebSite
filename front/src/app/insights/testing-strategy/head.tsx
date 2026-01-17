import { ArticleJsonLd, SeoHead } from "@/lib/seo";

export default function Head() {
  return (
    <>
      <SeoHead
        title="Testing Strategy: Coverage That Matters"
        description="핵심 플로우와 통합 테스트 중심으로 신뢰도를 높이는 전략."
        path="/insights/testing-strategy"
      />
      <ArticleJsonLd
        title="Testing Strategy: Coverage That Matters"
        description="핵심 플로우와 통합 테스트 중심으로 신뢰도를 높이는 전략."
        path="/insights/testing-strategy"
        published="2026-01-17"
      />
    </>
  );
}
