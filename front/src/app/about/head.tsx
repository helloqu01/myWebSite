import { SeoHead } from "@/lib/seo";

export default function Head() {
  return (
    <>
      <SeoHead
        title="About"
        description="기존 소개 페이지는 홈의 소개 섹션으로 통합되었습니다."
        path="/about"
      />
      <meta name="robots" content="noindex, follow" />
      <meta httpEquiv="refresh" content="0;url=/#about" />
    </>
  );
}
