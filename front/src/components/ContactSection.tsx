"use client";
import React from "react";
import { Container, Stack, Typography, IconButton } from "@mui/material";
import { Mail, Linkedin, Github } from "lucide-react";

import en from "@/locales/en/common.json";
import ko from "@/locales/ko/common.json";
import { useLocale } from "@/context/LocaleContext";

export default function ContactSection() {
  const { lang } = useLocale();
  const t = lang === "en" ? en : ko;

  return (
    <Container id="contact" sx={{ py: 10 }}>
      <Stack spacing={4} alignItems="center" textAlign="center">
        <Typography
          variant="h4"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontWeight: 600,
          }}
        >
          <Mail size={24} /> {t.contactHeader}
        </Typography>

        <Typography variant="body1" sx={{ maxWidth: 500, color: "text.secondary" }}>
          {t.contactSubtitle}
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center">
          <IconButton
            component="a"
            href="mailto:helloqu@naver.com"
            target="_blank"
            sx={{ border: "1px solid", borderRadius: 2, p: 1.5 }}
          >
            <Mail size={20} />
          </IconButton>

          <IconButton
            component="a"
            href="https://www.linkedin.com/in/hyunji-oh-13949233a/"
            target="_blank"
            sx={{ border: "1px solid", borderRadius: 2, p: 1.5 }}
          >
            <Linkedin size={20} />
          </IconButton>

          <IconButton
            component="a"
            href="https://github.com/helloqu01"
            target="_blank"
            sx={{ border: "1px solid", borderRadius: 2, p: 1.5 }}
          >
            <Github size={20} />
          </IconButton>
        </Stack>
      </Stack>
    </Container>
  );
}
