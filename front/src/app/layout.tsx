// src/app/layout.tsx
import React from "react";
import Providers from "./Providers";

export const metadata = {
  title: 'Oh Hyunji – FullStack Web Developer',
  description: 'Hyunji Oh 의 포트폴리오 사이트입니다.',
  openGraph: {
    title: 'Oh Hyunji – FullStack Web Developer',
    description: 'React · Next.js · Node.js · AWS …',
    url: 'https://codingbyohj.com',
    siteName: 'codingbyohj.com',
    images: [
      {
        url: '/images/businesscard.png',  // public/images/businesscard.png
        width: 1200,
        height: 630,
        alt: 'Hyunji Oh Business Card',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oh Hyunji – FullStack Web Developer',
    description: 'Hyunji Oh 의 포트폴리오 사이트입니다.',
    images: ['/images/businesscard.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head />  {/* Next.js가 metadata를 자동으로 삽입합니다 */}
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
