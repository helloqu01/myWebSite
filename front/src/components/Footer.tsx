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
        py: 4,
        borderTop: "1px solid var(--card-border)",
        background: "var(--surface-strong)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Container>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Oh Hyunji. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="text"
              size="small"
              onClick={() => {
                window.localStorage.removeItem("cookieConsent");
                window.dispatchEvent(new CustomEvent("cookie-consent", { detail: null }));
              }}
              sx={{ color: "text.secondary", textTransform: "none", p: 0, minWidth: "auto" }}
            >
              {cookieLabel}
            </Button>
            <Link component={NextLink} href="/about" underline="hover" color="text.secondary">
              About
            </Link>
            <Link component={NextLink} href="/insights" underline="hover" color="text.secondary">
              Insights
            </Link>
            <Link component={NextLink} href="/privacy" underline="hover" color="text.secondary">
              개인정보처리방침
            </Link>
            <Link component={NextLink} href="/terms" underline="hover" color="text.secondary">
              이용약관
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
