"use client";

import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import { Box, Button, Link, Stack, Typography } from "@mui/material";
import { useLocale } from "@/context/LocaleContext";

type ConsentValue = "accepted" | "declined" | null;

export default function CookieBanner() {
  const { lang } = useLocale();
  const [consent, setConsent] = useState<ConsentValue>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("cookieConsent") as ConsentValue;
    if (stored) setConsent(stored);
  }, []);

  const accept = () => {
    window.localStorage.setItem("cookieConsent", "accepted");
    setConsent("accepted");
    window.dispatchEvent(new CustomEvent("cookie-consent", { detail: "accepted" }));
  };

  const decline = () => {
    window.localStorage.setItem("cookieConsent", "declined");
    setConsent("declined");
    window.dispatchEvent(new CustomEvent("cookie-consent", { detail: "declined" }));
  };

  if (consent) return null;

  const content =
    lang === "en"
      ? {
          title: "Cookies & Ads Notice",
          body:
            "We use cookies and third-party services (Analytics, AdSense) to measure traffic and deliver ads. You can accept or decline non-essential cookies.",
          accept: "Accept",
          decline: "Decline",
          policy: "Privacy Policy",
        }
      : {
          title: "쿠키 및 광고 고지",
          body:
            "본 사이트는 트래픽 분석 및 광고 제공을 위해 쿠키와 외부 서비스(Analytics, AdSense)를 사용합니다. 비필수 쿠키는 동의/거부할 수 있습니다.",
          accept: "동의",
          decline: "거부",
          policy: "개인정보처리방침",
        };

  return (
    <Box
      sx={{
        position: "fixed",
        zIndex: 1400,
        left: 16,
        right: 16,
        bottom: 16,
        maxWidth: 720,
        mx: "auto",
        p: 2.5,
        borderRadius: 3,
        border: "1px solid var(--card-border)",
        background: "var(--surface-strong)",
        boxShadow: "var(--shadow-strong)",
        backdropFilter: "blur(10px)",
      }}
      role="dialog"
      aria-live="polite"
    >
      <Stack spacing={1.5}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {content.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {content.body}{" "}
          <Link component={NextLink} href="/privacy" underline="hover">
            {content.policy}
          </Link>
          .
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button variant="contained" onClick={accept}>
            {content.accept}
          </Button>
          <Button variant="outlined" onClick={decline} sx={{ borderColor: "var(--card-border)" }}>
            {content.decline}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
