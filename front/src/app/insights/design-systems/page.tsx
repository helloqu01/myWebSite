"use client";

import React from "react";
import NextLink from "next/link";
import { Box, Container, Stack, Typography, Link } from "@mui/material";
import { useLocale } from "@/context/LocaleContext";
import AdUnit from "@/components/AdUnit";
import RelatedInsights from "@/components/RelatedInsights";

export default function DesignSystemsPage() {
  const { lang } = useLocale();
  const content =
    lang === "en"
      ? {
          title: "Design Systems That Scale With Teams",
          body: [
            "A design system should remove friction, not add it.",
            "Define tokens first: colors, spacing, typography, and elevation.",
            "Ship the smallest set of reusable components that cover 80% of UI patterns.",
            "Document usage with real examples so new team members ramp quickly.",
          ],
        }
      : {
          title: "팀과 함께 커지는 디자인 시스템",
          body: [
            "디자인 시스템은 속도를 늦추지 않고 마찰을 줄여야 합니다.",
            "컬러, 간격, 타이포, 그림자 등 토큰부터 정의하세요.",
            "UI 패턴의 80%를 커버하는 최소 컴포넌트를 먼저 제공합니다.",
            "실제 예시를 포함한 문서화로 온보딩 시간을 줄입니다.",
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
          <AdUnit slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_INSIGHTS_SECONDARY} minHeight={220} />
          <RelatedInsights currentSlug="design-systems" />
          <Link component={NextLink} href="/insights" underline="hover" color="primary">
            {lang === "en" ? "Back to Insights" : "인사이트로 돌아가기"}
          </Link>
        </Stack>
      </Container>
    </Box>
  );
}
