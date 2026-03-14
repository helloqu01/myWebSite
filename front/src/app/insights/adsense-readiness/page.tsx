"use client";

import React from "react";
import NextLink from "next/link";
import { Box, Chip, Container, Link, Stack, Typography } from "@mui/material";
import { useLocale } from "@/context/LocaleContext";
import RelatedInsights from "@/components/RelatedInsights";

export default function AdsenseReadinessPage() {
  const { lang } = useLocale();
  const content =
    lang === "en"
      ? {
          title: "AdSense Readiness: Content and Compliance",
          recommendationLabel: "Best-fit niche",
          recommendation: "Developer / AI / SaaS practical content is the most realistic path.",
          recommendationLead:
            "This direction works when you combine topics with healthy advertiser demand and original experience from real project delivery.",
          reasonsTitle: "Why this direction fits",
          reasons: [
            "Technology, software, SaaS, and AI tooling are often treated as higher-value advertising categories.",
            "You already have delivery experience, which makes it easier to publish trustworthy, non-generic content.",
          ],
          peopleFirstTitle: "What to publish instead of generic SEO posts",
          peopleFirstBody:
            "Google rewards helpful, reliable, people-first content. In practice, original notes from production work are usually stronger than thin summaries written only for search traffic.",
          examplesTitle: "Content ideas that fit this site",
          examples: [
            "Deployment retrospectives: what broke, what changed, and what shipped.",
            "Architecture comparisons for small SaaS products and internal tools.",
            "Cloud cost reduction notes based on actual traffic and usage patterns.",
            "SEO, analytics, and contact funnel improvements on real client sites.",
            "Admin workflow automation and selective AI integrations that saved time.",
          ],
          closeTitle: "Operational rule",
          closeBody:
            "Approval still depends on clean navigation, policy pages, crawlability, and a restrained ad experience. High-value topics help, but original execution is what makes the site durable.",
        }
      : {
          title: "애드센스 승인 준비: 콘텐츠와 정책",
          recommendationLabel: "추천 방향",
          recommendation: "개발자 / AI / SaaS 실무 사이트가 가장 현실적입니다.",
          recommendationLead:
            "광고 단가가 비교적 높은 주제를 다루면서도, 이미 가진 실무 경험과 결과물을 원본 콘텐츠로 풀어낼 수 있기 때문입니다.",
          reasonsTitle: "이 방향이 맞는 이유",
          reasons: [
            "기술, 소프트웨어, SaaS, AI 도구 분야는 비교적 광고 단가가 높은 축으로 자주 언급됩니다.",
            "이미 실제 배포 경험과 결과물이 있어서, 얇은 요약글이 아니라 신뢰 가능한 실무형 글을 쓸 수 있습니다.",
          ],
          peopleFirstTitle: "어떤 글을 써야 유리한가",
          peopleFirstBody:
            "Google이 강조하는 것은 사람에게 도움이 되는, 신뢰 가능한, 사람 우선 콘텐츠입니다. 그래서 일반론보다 실제 운영 경험과 선택 이유가 담긴 글이 훨씬 유리합니다.",
          examplesTitle: "이 사이트에 맞는 콘텐츠 예시",
          examples: [
            "배포 회고: 무엇이 깨졌고 어떻게 복구했고 무엇을 개선했는지.",
            "소규모 SaaS나 내부 도구에 맞는 아키텍처 비교와 선택 기준.",
            "실제 트래픽과 사용 패턴을 바탕으로 한 클라우드 비용 최적화 기록.",
            "클라이언트 사이트에서 SEO, 분석, 문의 전환을 어떻게 개선했는지.",
            "관리자 업무 자동화와 필요한 범위의 AI 연동으로 시간을 줄인 사례.",
          ],
          closeTitle: "운영 원칙",
          closeBody:
            "승인과 수익은 결국 정책 페이지, 크롤링 가능 상태, 명확한 내비게이션, 과하지 않은 광고 경험이 함께 갖춰져야 안정적입니다. 주제 선정은 시작이고, 원본 실무 콘텐츠가 핵심입니다.",
        };

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Chip
            label={content.recommendationLabel}
            sx={{
              width: "fit-content",
              fontWeight: 700,
              backgroundColor: "rgba(34,211,238,0.12)",
              color: "text.primary",
            }}
          />
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            {content.title}
          </Typography>
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid var(--card-border)",
              background: "var(--surface-strong)",
              boxShadow: "var(--shadow-soft)",
            }}
          >
            <Stack spacing={1.25}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {content.recommendation}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {content.recommendationLead}
              </Typography>
            </Stack>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.25 }}>
              {content.reasonsTitle}
            </Typography>
            <Stack component="ul" spacing={1.25} sx={{ pl: 3, mb: 0 }}>
              {content.reasons.map((item, idx) => (
                <Typography component="li" key={idx} variant="body1">
                  {item}
                </Typography>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.25 }}>
              {content.peopleFirstTitle}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {content.peopleFirstBody}
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.25 }}>
              {content.examplesTitle}
            </Typography>
            <Stack component="ul" spacing={1.25} sx={{ pl: 3, mb: 0 }}>
              {content.examples.map((item, idx) => (
                <Typography component="li" key={idx} variant="body1">
                  {item}
                </Typography>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.25 }}>
              {content.closeTitle}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {content.closeBody}
            </Typography>
          </Box>

          <RelatedInsights currentSlug="adsense-readiness" />
          <Link component={NextLink} href="/insights" underline="hover" color="primary">
            {lang === "en" ? "Back to Insights" : "인사이트로 돌아가기"}
          </Link>
        </Stack>
      </Container>
    </Box>
  );
}
