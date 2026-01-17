"use client";

import React from "react";
import NextLink from "next/link";
import { Box, Container, Stack, Typography, Link } from "@mui/material";
import { useLocale } from "@/context/LocaleContext";
import AdUnit from "@/components/AdUnit";

export default function AdsenseReadinessPage() {
  const { lang } = useLocale();
  const content =
    lang === "en"
      ? {
          title: "AdSense Readiness: Content and Compliance",
          body: [
            "AdSense approval is easier when the site has consistent, original text content.",
            "Publish multiple pages with clear navigation and include privacy/terms pages.",
            "Ensure crawlers can access the site (no login walls, no blocked robots).",
            "Keep ads minimal after approval and prioritize user experience over density.",
          ],
        }
      : {
          title: "애드센스 승인 준비: 콘텐츠와 정책",
          body: [
            "승인은 독창적인 텍스트 콘텐츠가 꾸준히 있는 사이트에서 수월합니다.",
            "정책 페이지와 명확한 내비게이션을 갖춘 여러 페이지를 운영하는 것이 좋습니다.",
            "크롤러가 접근 가능하도록 로그인/차단을 피해야 합니다.",
            "승인 후에도 광고 밀도는 낮게 유지하고 사용자 경험을 우선합니다.",
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
