// src/app/head.tsx
export default function Head() {
  return (
    <>
      <title>Oh Hyunji – FullStack Web Developer</title>
      <meta name="description" content="Hyunji Oh 의 포트폴리오 사이트입니다." />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Oh Hyunji" />
      <meta
        name="keywords"
        content="Oh Hyunji, Full-stack Developer, Next.js, Nest.js, AWS, Portfolio, Web Developer"
      />
      <link rel="canonical" href="https://codingbyohj.com/" />
      <meta name="theme-color" content="#1e3a8a" />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://codingbyohj.com" />
      <meta property="og:title" content="Oh Hyunji – FullStack Web Developer" />
      <meta
        property="og:description"
        content="React · Next.js · Node.js · AWS …"
      />
      <meta
        property="og:image"
        content="https://codingbyohj.com/images/businesscard.png"
      />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="ko_KR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Oh Hyunji – FullStack Web Developer" />
      <meta
        name="twitter:description"
        content="Hyunji Oh 의 포트폴리오 사이트입니다."
      />
      <meta
        name="twitter:image"
        content="https://codingbyohj.com/images/businesscard.png"
      />
    </>
  );
}
