"use client";

import React from "react";
import NextLink from "next/link";
import { Box, Chip, Container, Link, Stack, Typography } from "@mui/material";
import { useLocale } from "@/context/LocaleContext";
import type { InsightArticle, InsightSection } from "@/lib/insights";
import RelatedInsights from "@/components/RelatedInsights";

function renderSection(section: InsightSection, index: number) {
  const content = (
    <Stack spacing={1.5}>
      {section.title ? (
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {section.title}
        </Typography>
      ) : null}
      {section.paragraphs?.map((paragraph, paragraphIndex) => (
        <Typography key={`paragraph-${index}-${paragraphIndex}`} variant="body1" color="text.secondary">
          {paragraph}
        </Typography>
      ))}
      {section.items ? (
        <Stack component="ul" spacing={1.25} sx={{ pl: 3, mb: 0 }}>
          {section.items.map((item, itemIndex) => (
            <Typography component="li" key={`item-${index}-${itemIndex}`} variant="body1">
              {item}
            </Typography>
          ))}
        </Stack>
      ) : null}
    </Stack>
  );

  if (section.variant === "callout") {
    return (
      <Box
        key={`section-${index}`}
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid var(--card-border)",
          background: "var(--surface-strong)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        {content}
      </Box>
    );
  }

  return <Box key={`section-${index}`}>{content}</Box>;
}

export default function InsightArticlePage({ article }: { article: InsightArticle }) {
  const { lang } = useLocale();
  const isEnglish = lang === "en";
  const title = isEnglish ? article.titleEn : article.titleKo;
  const summary = isEnglish ? article.summaryEn : article.summaryKo;
  const category = isEnglish ? article.categoryEn : article.categoryKo;
  const sections = isEnglish ? article.sectionsEn : article.sectionsKo;

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Chip
            label={category}
            sx={{
              width: "fit-content",
              fontWeight: 700,
              backgroundColor: "rgba(34,211,238,0.12)",
              color: "text.primary",
            }}
          />
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {summary}
          </Typography>
          {sections.map((section, index) => renderSection(section, index))}
          <RelatedInsights currentSlug={article.slug} />
          <Link component={NextLink} href="/insights" underline="hover" color="primary">
            {isEnglish ? "Back to Insights" : "인사이트로 돌아가기"}
          </Link>
        </Stack>
      </Container>
    </Box>
  );
}
