// app/layout.tsx
import React from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Header from "@/components/Header";
import { ColorModeContext } from "./context/ColorModeContext";
import { LocaleProvider } from "@/context/LocaleContext";
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
  // ...컬러 모드 설정은 그대로 유지...
  const [mode, setMode] = React.useState<"light"|"dark">("light");
  const colorMode = React.useMemo(()=>({ toggleColorMode: ()=>setMode(m=>m==='light'?'dark':'light') }), []);
  const theme = React.useMemo(()=>createTheme({ palette:{mode, primary:{main:"#1976d2"}, secondary:{main:"#9c27b0"} } }), [mode]);

  return (
    <html lang="ko">
      <body>
        <LocaleProvider>
          <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Header />
              {children}
            </ThemeProvider>
          </ColorModeContext.Provider>
        </LocaleProvider>
      </body>
    </html>
  );
}
