"use client";

import React from "react";
import NextLink from "next/link";
import { Box, Container, Stack, Typography, Link } from "@mui/material";
import { useLocale } from "@/context/LocaleContext";
import AdUnit from "@/components/AdUnit";

export default function SecurityBasicsPage() {
  const { lang } = useLocale();
  const content =
    lang === "en"
      ? {
          title: "Security Basics for Product Teams",
          body: [
            "Start with secrets management and avoid committing keys to repositories.",
            "Add security headers, enforce HTTPS, and limit third-party scripts.",
            "Keep dependencies updated and monitor for known vulnerabilities.",
            "Use least-privilege access and review permissions regularly.",
          ],
        }
      : {
          title: "제품팀을 위한 보안 기초",
          body: [
            "시크릿 관리부터 시작해 키가 저장소에 남지 않도록 합니다.",
            "보안 헤더 적용, HTTPS 강제, 외부 스크립트 최소화를 권장합니다.",
            "의존성을 최신으로 유지하고 취약점 알림을 모니터링하세요.",
            "최소 권한 원칙을 적용하고 권한을 주기적으로 점검합니다.",
          ],
        };

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            {content.title}
          </Typography>
          <Typography variant="body1">{content.body[0]}</Typography>
          <Typography variant="body1">{content.body[1]}</Typography>
          <AdUnit />
          <Typography variant="body1">{content.body[2]}</Typography>
          <Typography variant="body1">{content.body[3]}</Typography>
          <Link component={NextLink} href="/insights" underline="hover" color="primary">
            {lang === "en" ? "Back to Insights" : "인사이트로 돌아가기"}
          </Link>
        </Stack>
      </Container>
    </Box>
  );
}
