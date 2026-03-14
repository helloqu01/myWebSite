"use client";

import React from "react";
import NextLink from "next/link";
import { Box, Button, Container, Link, Stack, Typography } from "@mui/material";
import { useLocale } from "@/context/LocaleContext";
import { siteConfig } from "@/lib/siteConfig";

export default function Footer() {
  const { lang } = useLocale();

  const cookieLabel = lang === "en" ? "Cookie Settings" : "쿠키 설정";
  const footerBody =
    lang === "en"
      ? "Freelance full-stack developer building business websites, admin tools, and AI-ready product workflows."
      : "기업 사이트, 관리자 도구, 운영형 웹 서비스와 AI 연동 기능을 구축하는 프리랜서 풀스택 개발자입니다.";
  const quickLinksLabel = lang === "en" ? "Quick Links" : "바로가기";
  const quickLinks =
    lang === "en"
      ? [
          { label: "Services", href: "/#services" },
          { label: "About", href: "/#about" },
          { label: "Insights", href: "/insights" },
          { label: "FAQ", href: "/faq" },
          { label: "Privacy", href: "/privacy" },
          { label: "Terms", href: "/terms" },
        ]
      : [
          { label: "서비스", href: "/#services" },
          { label: "소개", href: "/#about" },
          { label: "인사이트", href: "/insights" },
          { label: "FAQ", href: "/faq" },
          { label: "개인정보처리방침", href: "/privacy" },
          { label: "이용약관", href: "/terms" },
        ];

  return (
    <Box
      component="footer"
      sx={{
        borderTop: "1px solid var(--card-border)",
        py: { xs: 8, md: 10 },
        mt: 8,
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "flex-end" }}
          gap={{ xs: 6, md: 4 }}
        >
          {/* Brand */}
          <Box sx={{ maxWidth: 380 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "1.35rem",
                fontFamily: "var(--font-display), 'Fraunces', serif",
                letterSpacing: "-0.02em",
                mb: 1,
                background: "linear-gradient(135deg, #a78bfa, #22d3ee)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              OhJ
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.8, mb: 1.5 }}
            >
              {footerBody}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.85 }}>
              {siteConfig.email} · © {new Date().getFullYear()}
            </Typography>
          </Box>

          {/* Links */}
          <Box>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ letterSpacing: "0.1em", fontWeight: 700, fontSize: "0.65rem", mb: 2, display: "block" }}
            >
              {quickLinksLabel}
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1.5}>
              {quickLinks.map(item => (
                <Link
                  key={item.href}
                  component={NextLink}
                  href={item.href}
                  underline="none"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    transition: "color 0.2s ease",
                    "&:hover": { color: "#a78bfa" },
                  }}
                >
                  {item.label}
                </Link>
              ))}
              <Button
                variant="text"
                onClick={() => {
                  window.localStorage.removeItem("cookieConsent");
                  window.dispatchEvent(new CustomEvent("cookie-consent", { detail: null }));
                }}
                sx={{
                  color: "text.secondary",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  p: 0,
                  minWidth: 0,
                  lineHeight: "inherit",
                  textTransform: "none",
                  transition: "color 0.2s ease",
                  "&:hover": { color: "#a78bfa", background: "none" },
                }}
              >
                {cookieLabel}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
