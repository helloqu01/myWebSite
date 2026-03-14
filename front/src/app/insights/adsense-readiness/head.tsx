import { ArticleJsonLd, SeoHead } from "@/lib/seo";

export default function Head() {
  return (
    <>
      <SeoHead
        title="AdSense Readiness: Content and Compliance"
        description="개발자·AI·SaaS 실무형 콘텐츠가 왜 현실적인 애드센스 전략인지와 정책 체크 포인트를 정리했습니다."
        path="/insights/adsense-readiness"
      />
      <ArticleJsonLd
        title="AdSense Readiness: Content and Compliance"
        description="개발자·AI·SaaS 실무형 콘텐츠가 왜 현실적인 애드센스 전략인지와 정책 체크 포인트를 정리했습니다."
        path="/insights/adsense-readiness"
        published="2026-01-17"
      />
    </>
  );
}
