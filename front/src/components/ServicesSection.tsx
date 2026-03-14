"use client";

import React from "react";
import Link from "next/link";
import { Box, Button, Chip, Container, Stack, Typography, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { ArrowRight, Bot, LayoutDashboard, Rocket } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { trackEvent } from "@/lib/analytics";

const iconMap = {
  product: <Rocket size={20} />,
  admin: <LayoutDashboard size={20} />,
  automation: <Bot size={20} />,
};

export default function ServicesSection() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { lang } = useLocale();

  const content =
    lang === "en"
      ? {
          eyebrow: "Services",
          title: "What I deliver",
          subtitle:
            "Focused on scoped work that needs both product thinking and reliable execution.",
          cta: "Start a conversation",
          fitTitle: "Best fit for",
          fitBody:
            "Company sites with lead capture, admin dashboards, internal tools, operational workflows, and selective AI-enabled features.",
          cards: [
            {
              key: "product" as const,
              title: "Business websites & product surfaces",
              description:
                "Launch or refresh branded websites, landing pages, and user-facing flows with SEO, analytics, and responsive UI built in.",
              tags: ["Next.js", "Responsive UI", "SEO"],
            },
            {
              key: "admin" as const,
              title: "Admin dashboards & workflow tools",
              description:
                "Build operations-facing systems that reduce manual work and make day-to-day processes easier to manage.",
              tags: ["Nest.js", "Dashboard", "Automation"],
            },
            {
              key: "automation" as const,
              title: "AI-assisted features & automation",
              description:
                "Add practical AI where it helps — support workflows, document handling, internal assistants, or retrieval-based experiences.",
              tags: ["AI integration", "Workflow", "AWS"],
            },
          ],
        }
      : {
          eyebrow: "서비스",
          title: "제공 범위",
          subtitle:
            "기획 의도를 제품 구조로 정리하고, 실제 운영 가능한 결과물까지 만드는 범위에 집중합니다.",
          cta: "프로젝트 문의하기",
          fitTitle: "특히 잘 맞는 의뢰",
          fitBody:
            "브랜딩이 필요한 기업 사이트, 문의/전환형 랜딩, 관리자 대시보드, 사내 운영 도구, 그리고 선택적으로 AI 연동이 필요한 프로젝트입니다.",
          cards: [
            {
              key: "product" as const,
              title: "기업 사이트와 서비스 화면",
              description:
                "회사 소개 사이트, 랜딩 페이지, 사용자 화면을 SEO와 반응형 UI까지 고려해 설계하고 구현합니다.",
              tags: ["Next.js", "Responsive UI", "SEO"],
            },
            {
              key: "admin" as const,
              title: "관리자 대시보드와 업무 시스템",
              description:
                "운영팀이 실제로 쓰기 편한 관리자 화면과 반복 업무를 줄이는 내부 도구를 구축합니다.",
              tags: ["Nest.js", "Dashboard", "Automation"],
            },
            {
              key: "automation" as const,
              title: "AI 보조 기능과 자동화",
              description:
                "고객 응대, 문서 처리, 검색형 도우미, 내부 업무 자동화처럼 실무에 바로 쓰이는 AI 기능을 붙입니다.",
              tags: ["AI integration", "Workflow", "AWS"],
            },
          ],
        };

  return (
    <Box id="services" sx={{ py: { xs: 10, md: 16 } }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ mb: { xs: 6, md: 10 } }}>
          <Chip
            label={content.eyebrow}
            sx={{
              mb: 2,
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
            sx={{ fontWeight: 700, letterSpacing: "-0.03em", mb: 1.5, lineHeight: 1.05 }}
          >
            {content.title}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 520, lineHeight: 1.8 }}
          >
            {content.subtitle}
          </Typography>
        </Box>

        {/* Numbered service list */}
        <Box sx={{ borderTop: "1px solid var(--card-border)" }}>
          {content.cards.map((card, index) => (
            <Box
              key={card.title}
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "96px 1fr 36px" },
                gap: { xs: 2, md: 6 },
                alignItems: "start",
                py: { xs: 5, md: 7 },
                borderBottom: "1px solid var(--card-border)",
                cursor: "default",
                transition: "background 0.3s ease",
                px: { xs: 0, md: 0 },
                "&:hover": {
                  background: isDark
                    ? "rgba(139,92,246,0.03)"
                    : "rgba(139,92,246,0.02)",
                },
                "&:hover .svc-num": { opacity: 1 },
                "&:hover .svc-title": { color: "#a78bfa" },
                "&:hover .svc-icon": { opacity: 0.7, color: "#a78bfa" },
              }}
            >
              {/* Number */}
              <Typography
                className="svc-num"
                sx={{
                  fontSize: "3.5rem",
                  fontWeight: 900,
                  fontFamily: "var(--font-display), 'Fraunces', serif",
                  background: "linear-gradient(135deg, rgba(167,139,250,0.55), rgba(34,211,238,0.4))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  lineHeight: 1,
                  transition: "opacity 0.3s ease",
                  display: { xs: "none", md: "block" },
                  userSelect: "none",
                  pt: 0.5,
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </Typography>

              {/* Content */}
              <Box>
                <Typography
                  className="svc-title"
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 1.5,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                    transition: "color 0.3s ease",
                  }}
                >
                  {card.title}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3, maxWidth: 680, lineHeight: 1.85 }}
                >
                  {card.description}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {card.tags.map(tag => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{
                        borderRadius: 999,
                        background: "rgba(139,92,246,0.08)",
                        border: "1px solid rgba(139,92,246,0.18)",
                        color: "#c4b5fd",
                        fontWeight: 600,
                        fontSize: "0.74rem",
                      }}
                    />
                  ))}
                </Stack>
              </Box>

              {/* Icon */}
              <Box
                className="svc-icon"
                sx={{
                  color: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)",
                  opacity: 0.4,
                  transition: "all 0.3s ease",
                  mt: 0.5,
                  display: { xs: "none", md: "block" },
                }}
              >
                {iconMap[card.key]}
              </Box>
            </Box>
          ))}
        </Box>

        {/* CTA Banner */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          sx={{
            mt: 8,
            p: { xs: 4, md: 6 },
            borderRadius: 5,
            border: "1px solid rgba(139,92,246,0.28)",
            background: "linear-gradient(135deg, rgba(109,40,217,0.9), rgba(8,145,178,0.85))",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 4,
            boxShadow: "0 12px 60px rgba(109,40,217,0.35)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.08), transparent 60%)",
              pointerEvents: "none",
            },
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography
              variant="overline"
              sx={{ color: "rgba(255,255,255,0.65)", letterSpacing: "0.14em", fontWeight: 700 }}
            >
              {content.fitTitle.toUpperCase()}
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "rgba(255,255,255,0.92)", lineHeight: 1.75, maxWidth: 680, mt: 0.5 }}
            >
              {content.fitBody}
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/#contact"
            variant="contained"
            endIcon={<ArrowRight size={16} />}
            onClick={() => trackEvent("contact_open", { source: "services_section" })}
            sx={{
              position: "relative",
              zIndex: 1,
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.25)",
              minWidth: 200,
              py: 1.5,
              boxShadow: "none",
              flexShrink: 0,
              "&:hover": {
                background: "rgba(255,255,255,0.25)",
                boxShadow: "none",
                transform: "translateY(-1px)",
              },
            }}
          >
            {content.cta}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
