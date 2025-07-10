// app/layout.tsx
"use client";
import React from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Header from "@/components/Header";
import { ColorModeContext } from "./context/ColorModeContext";
import { LocaleProvider } from "@/context/LocaleContext";

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
