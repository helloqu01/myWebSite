import { ArticleJsonLd, SeoHead } from "@/lib/seo";

export default function Head() {
  return (
    <>
      <SeoHead
        title="Design Systems That Scale With Teams"
        description="토큰과 컴포넌트 표준화를 통해 팀 생산성을 높이는 방법."
        path="/insights/design-systems"
      />
      <ArticleJsonLd
        title="Design Systems That Scale With Teams"
        description="토큰과 컴포넌트 표준화를 통해 팀 생산성을 높이는 방법."
        path="/insights/design-systems"
        published="2026-01-17"
      />
    </>
  );
}
