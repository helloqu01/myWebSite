"use client";

import React from "react";
import NextLink from "next/link";
import { Box, Container, Stack, Typography, Link } from "@mui/material";
import { useLocale } from "@/context/LocaleContext";

export default function UxAccessibilityPage() {
  const { lang } = useLocale();
  const content =
    lang === "en"
      ? {
          title: "UX & Accessibility: Small Fixes, Big Gains",
          body: [
            "Accessibility improvements usually align with better UX for everyone.",
            "Use clear heading hierarchy, sufficient color contrast, and visible focus states on buttons and links.",
            "Add descriptive labels to form fields and ensure error messages are easy to notice and understand.",
            "Keyboard navigation and logical tab order prevent users from getting stuck during key actions.",
          ],
        }
      : {
          title: "UX와 접근성: 작은 개선으로 큰 효과",
          body: [
            "접근성 개선은 대부분 사용자 경험 개선과 함께 움직입니다.",
            "명확한 제목 구조, 충분한 색 대비, 버튼/링크의 포커스 표시가 기본입니다.",
            "폼에는 라벨과 오류 메시지를 명확히 제공해 이탈을 줄일 수 있습니다.",
            "키보드 탐색과 탭 순서를 정리하면 중요한 동작에서 막히는 상황을 줄일 수 있습니다.",
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
