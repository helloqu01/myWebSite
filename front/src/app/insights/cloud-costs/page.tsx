"use client";

import React from "react";
import NextLink from "next/link";
import { Box, Container, Stack, Typography, Link } from "@mui/material";
import { useLocale } from "@/context/LocaleContext";
import AdUnit from "@/components/AdUnit";

export default function CloudCostsPage() {
  const { lang } = useLocale();
  const content =
    lang === "en"
      ? {
          title: "Cloud Costs: Reduce Waste Without Breaking Systems",
          body: [
            "Start by tagging resources so cost reports have clear ownership.",
            "Right-size compute, turn off idle environments, and add CDN caching rules.",
            "Move cold data to cheaper storage tiers and delete unused snapshots.",
            "Track unit costs per request to prevent hidden regressions.",
          ],
        }
      : {
          title: "클라우드 비용 최적화: 낭비 줄이기",
          body: [
            "태그를 정리해 비용 리포트의 소유권을 명확히 합니다.",
            "컴퓨트 리사이징, 유휴 환경 종료, CDN 캐시 규칙 추가가 빠른 효과를 냅니다.",
            "콜드 데이터는 저렴한 스토리지로 이전하고 불필요한 스냅샷을 삭제합니다.",
            "요청당 비용 지표를 관리해 숨은 비용 증가를 막습니다.",
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
