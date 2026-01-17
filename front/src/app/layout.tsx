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
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WSMNHKPD"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {/* Google Tag Manager */}
        <Script
          id="gtm-init"
          strategy="afterInteractive"
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
