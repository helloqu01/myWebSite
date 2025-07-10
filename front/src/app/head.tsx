// src/app/head.tsx
export default function Head() {
  return (
    <>
      <title>Oh Hyunji – FullStack Web Developer</title>
      <meta name="description" content="Hyunji Oh 의 포트폴리오 사이트입니다." />

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
        content="https://codingbyohj.com/images/businesscard.webp"
      />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Oh Hyunji – FullStack Web Developer" />
      <meta
        name="twitter:description"
        content="Hyunji Oh 의 포트폴리오 사이트입니다."
      />
      <meta
        name="twitter:image"
        content="https://codingbyohj.com/images/businesscard.webp"
      />
    </>
  );
}
