// src/app/layout.tsx
import React from "react";
import Script from "next/script";
import Providers from "./Providers";
import { Space_Grotesk, Fraunces } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata = {
  title: 'Oh Hyunji – FullStack Web Developer',
  description: 'Hyunji Oh 의 포트폴리오 사이트입니다.',
  openGraph: {
    url: 'https://codingbyohj.com',
    images: [
      {
        url: 'https://codingbyohj.com/images/businesscard.png',
        width: 1200,
        height: 630,
        alt: 'Hyunji Oh Business Card',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://codingbyohj.com/images/businesscard.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 맨 앞줄에 공백, 주석, "use client" 없어야 합니다.
    <html lang="ko">
      <body className={`${spaceGrotesk.variable} ${fraunces.variable}`}>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C2589TCWZ6"
          strategy="afterInteractive"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html:
              "window.dataLayer = window.dataLayer || [];" +
              "function gtag(){dataLayer.push(arguments);}" +
              "gtag('js', new Date());" +
              "gtag('config', 'G-C2589TCWZ6');",
          }}
        />
        {/* End Google tag (gtag.js) */}
        <Script
          id="clarity-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html:
              "(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};" +
              "t=l.createElement(r);t.async=1;t.src=\"https://www.clarity.ms/tag/\"+i;" +
              "y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);" +
              "})(window, document, \"clarity\", \"script\", \"v2sj4o2bvk\");",
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
