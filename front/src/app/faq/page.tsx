"use client";

import React from "react";
import NextLink from "next/link";
import { Box, Container, Stack, Typography, Link } from "@mui/material";
import { useLocale } from "@/context/LocaleContext";

const faqData = {
  en: [
    {
      q: "What is this site for?",
      a: "It is a personal portfolio showcasing projects, experience, and case studies.",
    },
    {
      q: "How can I contact you?",
      a: "Use the contact form on the homepage or email helloqu@naver.com.",
    },
    {
      q: "Do you accept collaboration or freelance work?",
      a: "Yes, when the scope aligns with product impact and technical growth.",
    },
    {
      q: "Do you use cookies or ads?",
      a: "Yes. We use cookies for analytics and may serve ads via Google AdSense.",
    },
  ],
  ko: [
    {
      q: "이 사이트는 어떤 목적인가요?",
      a: "프로젝트, 경력, 케이스 스터디를 소개하는 개인 포트폴리오입니다.",
    },
    {
      q: "연락은 어떻게 하나요?",
      a: "홈페이지의 연락처 폼 또는 helloqu@naver.com으로 문의해 주세요.",
    },
    {
      q: "협업이나 프리랜스도 가능한가요?",
      a: "프로젝트 방향이 맞는다면 협업 가능합니다.",
    },
    {
      q: "쿠키나 광고를 사용하나요?",
      a: "네. 분석 목적 쿠키를 사용하며 Google AdSense 광고가 포함될 수 있습니다.",
    },
  ],
};

export default function FaqPage() {
  const { lang } = useLocale();
  const title = lang === "en" ? "FAQ" : "자주 묻는 질문";
  const items = lang === "en" ? faqData.en : faqData.ko;

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {items.map((item, idx) => (
            <Stack key={idx} spacing={1.5}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {item.q}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {item.a}
              </Typography>
            </Stack>
          ))}
          <Link component={NextLink} href="/" underline="hover" color="primary">
            {lang === "en" ? "Back to Home" : "홈으로 돌아가기"}
          </Link>
        </Stack>
      </Container>
    </Box>
  );
}
