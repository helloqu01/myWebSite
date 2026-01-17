// src/app/head.tsx
import { SeoHead } from "@/lib/seo";

export default function Head() {
  return (
    <>
      <SeoHead
        title="Oh Hyunji – FullStack Web Developer"
        description="Hyunji Oh 의 포트폴리오 사이트입니다."
        path="/"
      />
      <meta name="author" content="Oh Hyunji" />
      <meta
        name="keywords"
        content="Oh Hyunji, Full-stack Developer, Next.js, Nest.js, AWS, Portfolio, Web Developer"
      />
      <meta name="theme-color" content="#1e3a8a" />
    </>
  );
}
