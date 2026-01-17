"use client";

import React from "react";
import NextLink from "next/link";
import { Box, Container, Stack, Typography, Link } from "@mui/material";
import { useLocale } from "@/context/LocaleContext";

export default function AboutPage() {
  const { lang } = useLocale();
  const content =
    lang === "en"
      ? {
          title: "About",
          subtitle: "Operator: Oh Hyunji",
          body: [
            "This site is a personal portfolio showcasing projects, experience, and product delivery outcomes.",
            "The content focuses on real-world engineering work across Next.js, Nest.js, AWS, and AI-enabled automation.",
            "For collaboration, hiring inquiries, or partnerships, please reach out via the contact form or email.",
          ],
          email: "Contact: helloqu@naver.com",
          back: "Back to Home",
        }
      : {
          title: "소개",
          subtitle: "운영자: 오현지",
          body: [
            "이 사이트는 프로젝트, 경력, 성과를 정리한 개인 포트폴리오입니다.",
            "Next.js, Nest.js, AWS, AI 자동화를 포함한 실무 중심의 작업을 소개합니다.",
            "협업/채용/프로젝트 문의는 연락처 섹션 또는 이메일로 부탁드립니다.",
          ],
          email: "문의: helloqu@naver.com",
          back: "홈으로 돌아가기",
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
          {content.body.map((text, idx) => (
            <Typography key={idx} variant="body1">
              {text}
            </Typography>
          ))}
          <Typography variant="body1">{content.email}</Typography>
          <Link component={NextLink} href="/" underline="hover" color="primary">
            {content.back}
          </Link>
        </Stack>
      </Container>
    </Box>
  );
}
