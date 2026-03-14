// File: components/HeroSection.tsx
"use client";

import React from "react";
import { Box, Typography, IconButton, Button, Chip, Stack } from "@mui/material";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@mui/material";
import en from "@/locales/en/common.json";
import ko from "@/locales/ko/common.json";
import { useLocale } from "@/context/LocaleContext";
import { trackEvent } from "@/lib/analytics";
import ThreeScene from "./ThreeScene";

export default function HeroSection() {
  const theme = useTheme();
  const { lang } = useLocale();
  const t = lang === "en" ? en : ko;
  const isDark = theme.palette.mode === "dark";

  const content =
    lang === "en"
      ? {
          eyebrow: "Freelance Product Engineering",
          lead:
            "I design and build polished business websites, admin tools, and AI-ready workflows that are practical to launch and maintain.",
          primaryCta: "Start a project",
          scrollLabel: "See services",
          highlights: [
            "Next.js + Nest.js delivery",
            "SEO, analytics, and contact funnels",
            "Admin dashboards and internal tools",
            "Selective AI integration",
          ],
          proofCards: [
            {
              label: "Focus",
              value: "Business websites, dashboards, and operational tools",
              gradient: "linear-gradient(90deg, #a78bfa, #22d3ee)",
            },
            {
              label: "Strength",
              value: "Reliable delivery with deployment, performance, and handoff in scope",
              gradient: "linear-gradient(90deg, #22d3ee, #a78bfa)",
            },
            {
              label: "Stack",
              value: "Next.js, Nest.js, AWS, and practical AI workflows",
              gradient: "linear-gradient(90deg, #a78bfa, #f472b6)",
            },
          ],
        }
      : {
          eyebrow: "프리랜서 제품 개발",
          lead:
            "기업 사이트, 관리자 도구, 운영형 웹 서비스와 AI 보조 기능을 기획 의도에 맞게 설계하고 실제 운영 가능한 수준으로 구현합니다.",
          primaryCta: "프로젝트 문의하기",
          scrollLabel: "서비스 보기",
          highlights: [
            "Next.js + Nest.js 기반 구축",
            "SEO, 분석, 문의 전환까지 고려",
            "관리자 대시보드와 업무 도구",
            "필요한 범위의 AI 기능 연동",
          ],
          proofCards: [
            {
              label: "집중 분야",
              value: "기업 사이트, 대시보드, 운영 도구 구축",
              gradient: "linear-gradient(90deg, #a78bfa, #22d3ee)",
            },
            {
              label: "강점",
              value: "배포, 성능, 인수인계까지 포함한 안정적인 납품",
              gradient: "linear-gradient(90deg, #22d3ee, #a78bfa)",
            },
            {
              label: "기술 기반",
              value: "Next.js, Nest.js, AWS, 실무형 AI 워크플로",
              gradient: "linear-gradient(90deg, #a78bfa, #f472b6)",
            },
          ],
        };

  const scrollToNext = () => {
    const next = document.getElementById("services");
    if (next) next.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToContact = () => {
    const next = document.getElementById("contact");
    if (next) next.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Box
      id="hero"
      component={motion.section}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      sx={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      {/* ── Background layer ── */}
      <Box sx={{ position: "absolute", inset: 0, zIndex: 0 }}>
        {/* Aurora blobs */}
        <Box
          sx={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: "60%",
            height: "80%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(109,40,217,0.18) 0%, transparent 65%)",
            animation: "aurora1 13s ease-in-out infinite",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "-10%",
            right: "-8%",
            width: "50%",
            height: "65%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(14,116,144,0.13) 0%, transparent 65%)",
            animation: "aurora2 16s ease-in-out infinite",
          }}
        />
        {/* ThreeScene - subtle, right-side aligned, very low opacity */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            right: "-5%",
            width: { xs: "100%", md: "55%" },
            height: "100%",
            transform: "translateY(-50%)",
            opacity: { xs: 0.25, md: 0.5 },
            pointerEvents: "none",
          }}
        >
          <ThreeScene />
        </Box>
      </Box>

      {/* ── Content ── */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 1200,
          px: { xs: 3, sm: 5, md: 8 },
          py: { xs: 14, md: 0 },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 400px" },
            gap: { xs: 6, md: 8 },
            alignItems: "center",
          }}
        >
          {/* Left: Text */}
          <Stack
            spacing={4}
            alignItems={{ xs: "center", md: "flex-start" }}
            textAlign={{ xs: "center", md: "left" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Chip
                label={content.eyebrow}
                sx={{
                  borderRadius: 999,
                  background: "rgba(139,92,246,0.22)",
                  border: "1px solid rgba(139,92,246,0.5)",
                  color: "#e9d5ff",
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  fontSize: "0.75rem",
                  boxShadow: "0 0 16px rgba(139,92,246,0.2)",
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.2 }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "2.9rem", sm: "3.9rem", md: "5.2rem" },
                  lineHeight: 1.06,
                  letterSpacing: "-0.03em",
                  background: "linear-gradient(135deg, #a78bfa 0%, #22d3ee 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  whiteSpace: "pre-line",
                }}
              >
                {t.greeting}
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.35 }}
              style={{ maxWidth: 560 }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: "1rem", sm: "1.18rem" },
                  lineHeight: 1.85,
                  color: theme.palette.text.secondary,
                  fontWeight: 400,
                }}
              >
                {content.lead}
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.5 }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                <Button
                  variant="contained"
                  onClick={() => {
                    trackEvent("contact_open", { source: "hero" });
                    scrollToContact();
                  }}
                  sx={{
                    minWidth: 190,
                    py: 1.5,
                    fontSize: "0.95rem",
                  }}
                >
                  {content.primaryCta}
                </Button>
                <Button
                  component={Link}
                  href="/resume"
                  variant="outlined"
                  onClick={() => trackEvent("resume_open", { source: "hero" })}
                  sx={{
                    borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(109,40,217,0.25)",
                    color: theme.palette.text.primary,
                    minWidth: 190,
                    py: 1.5,
                    fontSize: "0.95rem",
                    "&:hover": {
                      borderColor: "rgba(167,139,250,0.45)",
                      backgroundColor: "rgba(167,139,250,0.07)",
                    },
                  }}
                >
                  {t.resumeCTA}
                </Button>
              </Stack>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.65 }}
            >
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                justifyContent={{ xs: "center", md: "flex-start" }}
              >
                {content.highlights.map(item => (
                  <Chip
                    key={item}
                    label={item}
                    sx={{
                      borderRadius: 999,
                      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(109,40,217,0.05)",
                      border: "1px solid var(--card-border)",
                      color: "text.secondary",
                      fontWeight: 500,
                      fontSize: "0.78rem",
                    }}
                  />
                ))}
              </Stack>
            </motion.div>
          </Stack>

          {/* Right: Proof Cards */}
          <Stack spacing={2.5}>
            {content.proofCards.map((card, i) => (
              <Box
                key={card.label}
                component={motion.div}
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.65, delay: 0.3 + i * 0.12 }}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  background: isDark ? "rgba(255,255,255,0.04)" : "rgba(109,40,217,0.03)",
                  border: "1px solid var(--card-border)",
                  backdropFilter: "blur(12px)",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: card.gradient,
                  },
                  "&:hover": {
                    background: isDark ? "rgba(255,255,255,0.07)" : "rgba(109,40,217,0.06)",
                    boxShadow: "var(--glow-violet)",
                    transform: "translateX(5px)",
                  },
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: "#a78bfa",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    fontSize: "0.68rem",
                  }}
                >
                  {card.label}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mt: 0.5,
                    lineHeight: 1.65,
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  {card.value}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* ── Scroll indicator ── */}
      <IconButton
        onClick={scrollToNext}
        aria-label={content.scrollLabel}
        sx={{
          position: "absolute",
          bottom: { xs: 20, md: 28 },
          zIndex: 1,
          color: theme.palette.text.primary,
          border: "1px solid var(--card-border)",
          backgroundColor: "var(--surface)",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "rgba(139,92,246,0.1)",
            borderColor: "rgba(139,92,246,0.35)",
            boxShadow: "var(--glow-violet)",
          },
        }}
      >
        <ChevronDown size={32} />
      </IconButton>
    </Box>
  );
}
