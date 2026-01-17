// src/app/head.tsx
export default function Head() {
  return (
    <>
      <title>Oh Hyunji – FullStack Web Developer</title>
      <meta name="description" content="Hyunji Oh 의 포트폴리오 사이트입니다." />

      {/* Google Tag Manager */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':" +
            "new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0]," +
            "j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=" +
            "'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);" +
            "})(window,document,'script','dataLayer','GTM-WSMNHKPD');",
        }}
      />
      {/* End Google Tag Manager */}

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
