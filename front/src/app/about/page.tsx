"use client";

import React, { useEffect } from "react";
import NextLink from "next/link";
import { Box, Container, Stack, Typography, Link } from "@mui/material";
import { useLocale } from "@/context/LocaleContext";

export default function AboutPage() {
  const { lang } = useLocale();
  useEffect(() => {
    window.location.replace("/#about");
  }, []);

  const content =
    lang === "en"
      ? {
          title: "Redirecting to About",
          subtitle: "The standalone About page has been merged into the homepage.",
          body: "If the redirect does not happen automatically, use the link below.",
          back: "Go to About section",
        }
      : {
          title: "소개 섹션으로 이동 중",
          subtitle: "기존 소개 페이지는 홈의 소개 섹션으로 합쳐졌습니다.",
          body: "자동으로 이동하지 않으면 아래 링크를 눌러주세요.",
          back: "소개 섹션으로 가기",
        };

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            {content.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {content.subtitle}
          </Typography>
          <Typography variant="body1">{content.body}</Typography>
          <Link component={NextLink} href="/#about" underline="hover" color="primary">
            {content.back}
          </Link>
        </Stack>
      </Container>
    </Box>
  );
}
