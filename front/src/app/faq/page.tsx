"use client";

import React from "react";
import NextLink from "next/link";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  Stack,
  Typography,
  Link,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
  const subtitle =
    lang === "en"
      ? "Answers to the most common questions about this portfolio."
      : "포트폴리오 사이트에 대해 자주 묻는 질문을 정리했습니다.";
  const items = lang === "en" ? faqData.en : faqData.ko;

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 85% 10%, rgba(249,115,22,0.18), transparent 45%), radial-gradient(circle at 12% 0%, rgba(59,130,246,0.16), transparent 50%)",
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        <Stack spacing={4}>
          <Stack spacing={1.5}>
            <Chip
              label={lang === "en" ? "Support" : "지원"}
              sx={{
                backgroundColor: "rgba(249,115,22,0.15)",
                color: "text.primary",
                fontWeight: 600,
                width: "fit-content",
              }}
            />
            <Typography variant="h2" sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
              {title}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {subtitle}
            </Typography>
          </Stack>

          <Stack spacing={2}>
            {items.map((item, idx) => (
              <Accordion
                key={idx}
                elevation={0}
                sx={{
                  border: "1px solid var(--card-border)",
                  borderRadius: 3,
                  background: "var(--surface-strong)",
                  boxShadow: "var(--shadow-soft)",
                  "&::before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    px: 3,
                    "& .MuiAccordionSummary-content": {
                      alignItems: "center",
                      gap: 2,
                    },
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {item.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                  <Typography variant="body1" color="text.secondary">
                    {item.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>

          <Link component={NextLink} href="/" underline="hover" color="primary">
            {lang === "en" ? "Back to Home" : "홈으로 돌아가기"}
          </Link>
        </Stack>
      </Container>
    </Box>
  );
}
