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
      <head>
        <Script
          id="gtag-consent-default"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html:
              "window.dataLayer = window.dataLayer || [];" +
              "function gtag(){dataLayer.push(arguments);}" +
              "gtag('consent','default',{" +
              "ad_storage:'denied'," +
              "analytics_storage:'denied'," +
              "ad_user_data:'denied'," +
              "ad_personalization:'denied'," +
              "functionality_storage:'granted'," +
              "security_storage:'granted'," +
              "wait_for_update:500" +
              "});",
          }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C2589TCWZ6"
          strategy="beforeInteractive"
        />
        <Script
          id="gtag-config"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: "gtag('js', new Date());" + "gtag('config', 'G-C2589TCWZ6');",
          }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1115617071874827"
          strategy="beforeInteractive"
          crossOrigin="anonymous"
          onLoad={() => {
            window.dispatchEvent(new Event("adsense-ready"));
          }}
        />
      </head>
      <body className={`${spaceGrotesk.variable} ${fraunces.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
