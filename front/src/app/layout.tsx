// src/app/layout.tsx
import React from "react";
import Providers from "./Providers";

export const metadata = {
  title: 'Oh Hyunji – FullStack Web Developer',
  description: 'Hyunji Oh 의 포트폴리오 사이트입니다.',
  openGraph: {
    url: 'https://codingbyohj.com',
    images: [
      {
        url: '/images/businesscard.png',
        width: 1200,
        height: 630,
        alt: 'Hyunji Oh Business Card',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/businesscard.webp'],
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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
