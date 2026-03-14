"use client";

import React from "react";
import Link from "next/link";
import { Box, Button, Chip, Container, Typography, useTheme } from "@mui/material";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import { siteConfig } from "@/lib/siteConfig";
import { trackEvent } from "@/lib/analytics";

export default function AboutSection() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { lang } = useLocale();

  const content =
    lang === "en"
      ? {
          eyebrow: "About",
          title: "Portfolio and freelance introduction in one place",
          body: [
            "This site brings together selected projects, delivery outcomes, and the kind of freelance work I take on.",
            "My work is centered on Next.js, Nest.js, AWS, admin systems, and practical AI-enabled automation for real operations.",
            "If you need a business website, dashboard, internal tool, or a scoped AI-assisted workflow — this is the single overview.",
          ],
          contact: siteConfig.email,
          contactLabel: "Contact",
          cta: "Get in touch",
        }
      : {
          eyebrow: "소개",
          title: "포트폴리오와 프리랜서 소개를 한 곳에",
          body: [
            "이 사이트는 선별 프로젝트, 성과, 그리고 제가 맡는 프리랜서 작업 범위를 함께 보여주는 단일 소개 페이지입니다.",
            "주요 작업 범위는 Next.js, Nest.js, AWS, 관리자 시스템, 그리고 실무에 맞춘 AI 자동화 연동입니다.",
            "기업 사이트, 대시보드, 사내 도구, 제한된 범위의 AI 보조 기능이 필요할 때 이 페이지에서 전체 흐름을 확인할 수 있습니다.",
          ],
          contact: siteConfig.email,
          contactLabel: "문의",
          cta: "문의하러 가기",
        };

  return (
    <Box
      id="about"
      sx={{ py: { xs: 10, md: 16 }, borderTop: "1px solid var(--card-border)" }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: { xs: 6, md: 12 },
            alignItems: "center",
          }}
        >
          {/* Left: headline */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
          >
            <Chip
              label={content.eyebrow}
              sx={{
                mb: 2.5,
                borderRadius: 999,
                background: "rgba(139,92,246,0.1)",
                border: "1px solid rgba(139,92,246,0.22)",
                color: "#a78bfa",
                fontWeight: 700,
                letterSpacing: "0.07em",
                fontSize: "0.7rem",
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                background: isDark
                  ? "linear-gradient(160deg, #f1f5f9 40%, rgba(167,139,250,0.75))"
                  : "linear-gradient(160deg, #0f172a 40%, rgba(109,40,217,0.85))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {content.title}
            </Typography>
          </Box>

          {/* Right: body + CTA */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {content.body.map((text, i) => (
                <Typography
                  key={i}
                  variant="body1"
                  color="text.secondary"
                  sx={{ lineHeight: 1.9 }}
                >
                  {text}
                </Typography>
              ))}
            </Box>

            <Box
              sx={{
                mt: 4,
                pt: 4,
                borderTop: "1px solid var(--card-border)",
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: "#a78bfa",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    fontSize: "0.68rem",
                  }}
                >
                  {content.contactLabel}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.25, opacity: 0.9 }}>
                  {content.contact}
                </Typography>
              </Box>
              <Button
                component={Link}
                href="/#contact"
                variant="contained"
                endIcon={<ArrowRight size={16} />}
                onClick={() => trackEvent("contact_open", { source: "about_section" })}
                sx={{ flexShrink: 0, py: 1.4 }}
              >
                {content.cta}
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
