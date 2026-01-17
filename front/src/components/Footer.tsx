"use client";

import React from "react";
import NextLink from "next/link";
import { Box, Button, Container, Stack, Typography, Link } from "@mui/material";
import { useLocale } from "@/context/LocaleContext";

export default function Footer() {
  const { lang } = useLocale();
  const cookieLabel = lang === "en" ? "Cookie Settings" : "쿠키 설정";

  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        py: { xs: 5, md: 6 },
        borderTop: "1px solid var(--card-border)",
        background:
          "linear-gradient(180deg, rgba(255,250,242,0.7) 0%, rgba(245,247,251,0.9) 100%)",
        backdropFilter: "blur(14px)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 15% 20%, rgba(30,58,138,0.16), transparent 45%), radial-gradient(circle at 90% 10%, rgba(14,116,144,0.14), transparent 40%)",
          opacity: 0.7,
          pointerEvents: "none",
        },
      }}
    >
      <Container sx={{ position: "relative", zIndex: 1 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 3, md: 6 }}
          justifyContent="space-between"
        >
          <Stack spacing={2} sx={{ maxWidth: 420 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}
            >
              Oh Hyunji
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Full-stack developer delivering production-ready web products, AI-enabled automation,
              and scalable platform experiences.
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <Typography variant="body2" color="text.secondary">
                helloqu@naver.com
              </Typography>
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()}
              </Typography>
            </Stack>
          </Stack>

          <Stack spacing={2}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ letterSpacing: "0.1em" }}>
              QUICK LINKS
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              {[
                { label: "About", href: "/about" },
                { label: "Insights", href: "/insights" },
                { label: "FAQ", href: "/faq" },
                { label: "개인정보처리방침", href: "/privacy" },
                { label: "이용약관", href: "/terms" },
              ].map(item => (
                <Link
                  key={item.href}
                  component={NextLink}
                  href={item.href}
                  underline="none"
                  sx={{
                    px: 2,
                    py: 0.75,
                    borderRadius: 999,
                    border: "1px solid var(--card-border)",
                    color: "text.secondary",
                    background: "rgba(255,255,255,0.6)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    transition: "all 0.25s ease",
                    "&:hover": {
                      color: "primary.main",
                      borderColor: "primary.main",
                      background: "rgba(255,255,255,0.9)",
                      boxShadow: "var(--shadow-soft)",
                    },
                  }}
                >
                  {item.label}
                </Link>
              ))}
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  window.localStorage.removeItem("cookieConsent");
                  window.dispatchEvent(new CustomEvent("cookie-consent", { detail: null }));
                }}
                sx={{
                  color: "text.secondary",
                  textTransform: "none",
                  px: 2,
                  py: 0.6,
                  borderRadius: 999,
                  border: "1px dashed var(--card-border)",
                  fontWeight: 600,
                }}
              >
                {cookieLabel}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
