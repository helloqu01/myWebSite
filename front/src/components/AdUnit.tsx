"use client";

import React, { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useLocale } from "@/context/LocaleContext";

type AdUnitProps = {
  slot?: string;
  format?: string;
  minHeight?: number;
};

const AD_CLIENT = "ca-pub-1115617071874827";

export default function AdUnit({ slot, format = "auto", minHeight = 280 }: AdUnitProps) {
  const { lang } = useLocale();
  const resolvedSlot =
    slot || process.env.NEXT_PUBLIC_ADSENSE_SLOT_INSIGHTS || "";

  useEffect(() => {
    if (!resolvedSlot) return;
    const pushAd = () => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        // Ignore if adsbygoogle is not ready yet.
      }
    };

    pushAd();
    window.addEventListener("adsense-ready", pushAd);
    return () => {
      window.removeEventListener("adsense-ready", pushAd);
    };
  }, [resolvedSlot]);

  if (!resolvedSlot) return null;

  return (
    <Box
      sx={{
        my: 4,
        p: 2,
        borderRadius: 3,
        border: "1px solid var(--card-border)",
        background: "var(--surface-strong)",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
        {lang === "en" ? "Sponsored" : "광고"}
      </Typography>
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={resolvedSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </Box>
  );
}
