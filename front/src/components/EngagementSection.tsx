"use client";

import React from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { trackEvent } from "@/lib/analytics";

export default function EngagementSection() {
  const { lang } = useLocale();
  const content =
    lang === "en"
      ? {
          eyebrow: "Engagement Flow",
          title: "A clear working process for short and mid-sized projects",
          subtitle:
            "The goal is to reduce ambiguity early, move quickly during implementation, and finish with a handoff the client can actually use.",
          cta: "Discuss scope",
          deliverablesTitle: "Typical deliverables",
          fitTitle: "Project shapes that work well",
          stepLabel: "Step",
          steps: [
            {
              number: "01",
              title: "Scope and priorities",
              body:
                "Clarify business goals, must-have pages or features, timeline, and what success should look like after launch.",
            },
            {
              number: "02",
              title: "Build and review",
              body:
                "Design the structure, implement front-end and back-end work, and review milestones before the full release.",
            },
            {
              number: "03",
              title: "Launch and polish",
              body:
                "Finalize QA, deploy, connect analytics and forms, and tighten performance and UX details that affect trust.",
            },
            {
              number: "04",
              title: "Handoff and support",
              body:
                "Provide documentation, cleanup notes, and a practical transition path for the next internal or external maintainer.",
            },
          ],
          deliverables: [
            "Responsive pages optimized for desktop and mobile",
            "Admin or API wiring where the project requires it",
            "Deployment, analytics, and operational basics",
            "Follow-up fixes after launch if included in scope",
          ],
          fit: [
            "Corporate site renewals with stronger positioning",
            "Marketing pages that need inquiry conversion",
            "Internal dashboards and workflow tools",
            "Selective AI-enabled features with clear ROI",
          ],
        }
      : {
          eyebrow: "진행 방식",
          title: "짧은 프로젝트도 명확하게 진행하는 방식",
          subtitle:
            "초반에는 범위를 분명히 하고, 구현 단계에서는 빠르게 움직이며, 마무리 단계에서는 실제로 넘겨받아 운영 가능한 상태를 목표로 합니다.",
          cta: "범위 상담하기",
          deliverablesTitle: "보통 이런 결과물을 제공합니다",
          fitTitle: "잘 맞는 프로젝트 형태",
          stepLabel: "단계",
          steps: [
            {
              number: "01",
              title: "범위와 우선순위 정리",
              body:
                "비즈니스 목표, 꼭 필요한 화면과 기능, 일정, 런칭 후 기대 결과를 먼저 정리합니다.",
            },
            {
              number: "02",
              title: "구현과 중간 리뷰",
              body:
                "구조를 설계한 뒤 프론트엔드와 백엔드 작업을 진행하고, 중간 단위로 결과를 확인합니다.",
            },
            {
              number: "03",
              title: "런칭과 마감 다듬기",
              body:
                "QA, 배포, 분석 도구 연결, 문의 흐름 점검, 성능과 UX 마감까지 마무리합니다.",
            },
            {
              number: "04",
              title: "인수인계와 후속 지원",
              body:
                "문서화, 정리 노트, 후속 유지보수 관점을 남겨 다음 담당자가 이어받기 쉽게 합니다.",
            },
          ],
          deliverables: [
            "모바일과 데스크톱을 함께 고려한 반응형 화면",
            "프로젝트 범위에 맞는 관리자/API 연결",
            "배포, 분석, 운영 기초 세팅",
            "범위에 포함된 경우 런칭 후 후속 수정",
          ],
          fit: [
            "포지셔닝을 다시 잡아야 하는 기업 사이트 리뉴얼",
            "문의 전환이 중요한 랜딩 페이지",
            "사내 대시보드와 운영 도구",
            "ROI가 명확한 선택적 AI 기능 도입",
          ],
        };

  const stepLabel = lang === "en" ? "Step" : content.stepLabel;

  return (
    <Container id="process" sx={{ py: { xs: 8, md: 12 } }}>
      <Stack spacing={2} alignItems="flex-start" mb={6}>
        <Chip
          label={content.eyebrow}
          sx={{
            borderRadius: 999,
            background: "rgba(139,92,246,0.1)",
            border: "1px solid rgba(139,92,246,0.22)",
            color: "#a78bfa",
            fontWeight: 700,
            letterSpacing: "0.07em",
            fontSize: "0.7rem",
          }}
        />
        <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.025em" }}>
          {content.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 780 }}>
          {content.subtitle}
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
          gap: 3,
        }}
      >
        {content.steps.map((step, index) => (
          <Card
            key={step.number}
            component={motion.div}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
            sx={{
              p: 3,
              borderRadius: 4,
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s ease",
              "&:hover": {
                border: "1px solid rgba(139,92,246,0.2)",
                boxShadow: "var(--glow-violet)",
              },
            }}
          >
            {/* Decorative large step number */}
            <Typography
              sx={{
                position: "absolute",
                top: -16,
                right: 12,
                fontSize: "7rem",
                fontWeight: 900,
                fontFamily: "var(--font-display), 'Fraunces', serif",
                background: "linear-gradient(135deg, rgba(167,139,250,0.1), rgba(34,211,238,0.07))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                userSelect: "none",
                lineHeight: 1,
                pointerEvents: "none",
              }}
            >
              {step.number}
            </Typography>
            <Stack spacing={2}>
              <Typography
                variant="overline"
                sx={{ color: "#a78bfa", letterSpacing: "0.16em", fontWeight: 700 }}
              >
                {stepLabel} {step.number}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {step.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                {step.body}
              </Typography>
            </Stack>
          </Card>
        ))}
      </Box>

      <Box
        sx={{
          mt: 4,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.15fr 0.85fr" },
          gap: 3,
        }}
      >
        <Card
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            transition: "all 0.3s ease",
            "&:hover": { border: "1px solid rgba(139,92,246,0.18)" },
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            {content.deliverablesTitle}
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            {content.deliverables.map(item => (
              <Typography
                key={item}
                component="li"
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1.2 }}
              >
                {item}
              </Typography>
            ))}
          </Box>
        </Card>

        <Card
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            border: "1px solid rgba(139,92,246,0.18)",
            background: "linear-gradient(180deg, rgba(139,92,246,0.08), var(--surface))",
            transition: "all 0.3s ease",
            "&:hover": {
              border: "1px solid rgba(139,92,246,0.28)",
              boxShadow: "var(--glow-violet)",
            },
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            {content.fitTitle}
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            {content.fit.map(item => (
              <Typography
                key={item}
                component="li"
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1.2 }}
              >
                {item}
              </Typography>
            ))}
          </Box>
          <Button
            component={Link}
            href="/#contact"
            variant="contained"
            endIcon={<ArrowRight size={16} />}
            onClick={() => trackEvent("contact_open", { source: "engagement_section" })}
            sx={{ mt: 2.5 }}
          >
            {content.cta}
          </Button>
        </Card>
      </Box>
    </Container>
  );
}
