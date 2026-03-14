"use client";

import React from "react";
import NextLink from "next/link";
import { Box, Link, Stack, Typography } from "@mui/material";
import { useLocale } from "@/context/LocaleContext";
import { getRelatedInsights } from "@/lib/insights";

export default function RelatedInsights({ currentSlug }: { currentSlug: string }) {
  const { lang } = useLocale();
  const filtered = getRelatedInsights(currentSlug, 4);

  return (
    <Box sx={{ mt: 5, pt: 3, borderTop: "1px solid var(--card-border)" }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
        {lang === "en" ? "Related Insights" : "관련 글"}
      </Typography>
      <Stack spacing={1}>
        {filtered.map(item => (
          <Link
            key={item.slug}
            component={NextLink}
            href={`/insights/${item.slug}`}
            underline="hover"
          >
            {lang === "en" ? item.titleEn : item.titleKo}
          </Link>
        ))}
      </Stack>
    </Box>
  );
}
