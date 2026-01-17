"use client";

import React from "react";
import NextLink from "next/link";
import { Box, Container, Stack, Typography, Link } from "@mui/material";
import { useLocale } from "@/context/LocaleContext";

export default function SitePerformancePage() {
  const { lang } = useLocale();
  const content =
    lang === "en"
      ? {
          title: "Shipping Fast: Practical Web Performance Checks",
          body: [
            "Performance is easiest to keep stable when you set a few simple guardrails early.",
            "Start with image budgets, code-splitting on heavy widgets, and avoiding layout shifts on hero sections.",
            "Measure with real devices and network throttling, then tighten the largest contentful paint (LCP) and total blocking time (TBT).",
            "A quick win is to preload critical fonts, defer non-critical scripts, and keep above-the-fold markup lean.",
          ],
        }
      : {
          title: "빠르게 여는 사이트: 실전 성능 점검 포인트",
          body: [
            "성능은 초기에 몇 가지 기준을 잡아두면 안정적으로 유지됩니다.",
            "이미지 용량 제한, 무거운 위젯의 코드 분할, 히어로 섹션의 레이아웃 시프트 방지가 핵심입니다.",
            "실제 기기와 느린 네트워크 기준으로 측정한 뒤 LCP와 TBT를 줄이는 개선을 진행합니다.",
            "폰트 프리로드, 비핵심 스크립트 지연, 상단 영역 마크업 최소화가 효과적입니다.",
          ],
        };

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            {content.title}
          </Typography>
          {content.body.map((text, idx) => (
            <Typography key={idx} variant="body1">
              {text}
            </Typography>
          ))}
          <Link component={NextLink} href="/insights" underline="hover" color="primary">
            {lang === "en" ? "Back to Insights" : "인사이트로 돌아가기"}
          </Link>
        </Stack>
      </Container>
    </Box>
  );
}
