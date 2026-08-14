// File: app/resume/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import "./resume.css";
import Link from "next/link";
import { Alert, Box, Button, Container, Stack, TextField, Typography, Divider } from "@mui/material";
import { Download, ArrowLeft, KeyRound, LockKeyhole } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import en from "@/locales/en/common.json";
import ko from "@/locales/ko/common.json";
import { trackEvent } from "@/lib/analytics";
import { isResumePublic, resumeAccessHash } from "@/lib/featureFlags";

type ExperienceItem = {
  period: string;
  company: string;
  role: string;
  details: string[];
};

type SkillItem = {
  label: string;
  value: number;
};

export default function ResumePage() {
  const { lang } = useLocale();
  const t = lang === "en" ? en : ko;
  const [unlocked, setUnlocked] = useState(isResumePublic);
  const [password, setPassword] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    if (isResumePublic) return;
    setUnlocked(window.sessionStorage.getItem("ohj-resume-unlocked") === "true");
  }, []);

  const handleUnlock = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password) {
      setUnlockError(lang === "en" ? "Enter the password." : "비밀번호를 입력해 주세요.");
      return;
    }

    setUnlocking(true);
    setUnlockError("");
    try {
      const bytes = new TextEncoder().encode(password);
      const digest = await window.crypto.subtle.digest("SHA-256", bytes);
      const hash = Array.from(new Uint8Array(digest))
        .map(value => value.toString(16).padStart(2, "0"))
        .join("");

      if (hash !== resumeAccessHash.toLowerCase()) {
        setUnlockError(lang === "en" ? "Incorrect password." : "비밀번호가 올바르지 않습니다.");
        return;
      }

      window.sessionStorage.setItem("ohj-resume-unlocked", "true");
      setUnlocked(true);
      setPassword("");
      trackEvent("resume_unlock", { status: "success" });
    } catch {
      setUnlockError(lang === "en" ? "Unable to verify the password." : "비밀번호를 확인할 수 없습니다.");
    } finally {
      setUnlocking(false);
    }
  };

  if (!isResumePublic && !unlocked) {
    return (
      <Box sx={{ py: { xs: 8, md: 14 } }}>
        <Container maxWidth="sm">
          <Stack
            spacing={2.5}
            alignItems="center"
            textAlign="center"
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: 4,
              border: "1px solid var(--card-border)",
              backgroundColor: "var(--surface-strong)",
              boxShadow: "var(--shadow-soft)",
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                color: "primary.main",
                backgroundColor: "rgba(139,92,246,0.12)",
              }}
            >
              <LockKeyhole size={28} />
            </Box>
            <Typography variant="h4" fontWeight={700}>
              {lang === "en" ? "Password-protected resume" : "비밀번호로 보호된 이력서"}
            </Typography>
            <Typography color="text.secondary">
              {lang === "en"
                ? "Enter the administrator password to view it for this browser session."
                : "관리자 비밀번호를 입력하면 현재 브라우저 세션에서 이력서를 볼 수 있습니다."}
            </Typography>
            <Stack
              component="form"
              onSubmit={handleUnlock}
              spacing={1.5}
              sx={{ width: "100%", pt: 1 }}
            >
              <TextField
                label={lang === "en" ? "Password" : "비밀번호"}
                type="password"
                value={password}
                onChange={event => {
                  setPassword(event.target.value);
                  setUnlockError("");
                }}
                autoComplete="current-password"
                autoFocus
                fullWidth
              />
              {unlockError && <Alert severity="error">{unlockError}</Alert>}
              <Button
                type="submit"
                startIcon={<KeyRound size={16} />}
                variant="contained"
                disabled={unlocking}
                size="large"
              >
                {unlocking
                  ? lang === "en" ? "Checking…" : "확인 중…"
                  : lang === "en" ? "Unlock resume" : "이력서 잠금 해제"}
              </Button>
              <Button component={Link} href="/" startIcon={<ArrowLeft size={16} />} color="inherit">
                {t.resumeBackLabel}
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    );
  }

  const experiences = (t.experienceData as ExperienceItem[]) || [];
  const skills = (t.skillsRadarData as SkillItem[]) || [];

  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="md">
        <Stack direction="row" spacing={2} className="print-hidden" mb={3}>
          <Button
            component={Link}
            href="/"
            startIcon={<ArrowLeft size={16} />}
            variant="outlined"
          >
            {t.resumeBackLabel}
          </Button>
          <Button
            onClick={() => {
              trackEvent("resume_download", { method: "print" });
              window.print();
            }}
            startIcon={<Download size={16} />}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
              "&:hover": {
                background: "linear-gradient(135deg, #3b82f6, #1e3a8a)",
              },
            }}
          >
            {t.resumeDownloadLabel}
          </Button>
          {!isResumePublic && (
            <Button
              onClick={() => {
                window.sessionStorage.removeItem("ohj-resume-unlocked");
                setUnlocked(false);
              }}
              startIcon={<LockKeyhole size={16} />}
              color="inherit"
            >
              {lang === "en" ? "Lock again" : "다시 잠그기"}
            </Button>
          )}
        </Stack>

        <Box
          className="print-sheet"
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            backgroundColor: "var(--surface-strong)",
            border: "1px solid var(--card-border)",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {t.resumeTitle}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t.subtitle}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="body1">{t.resumeHeadline}</Typography>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {t.resumeSummaryLabel}
              </Typography>
              <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                {(t.summaryHighlights as string[]).map((item, idx) => (
                  <li key={idx}>
                    <Typography variant="body2">{item}</Typography>
                  </li>
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {t.resumeGoalTitle}
              </Typography>
              <Stack spacing={1}>
                {(t.resumeGoalLines as string[]).map((line, idx) => (
                  <Typography key={idx} variant="body2">
                    {line}
                  </Typography>
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {t.resumeGrowthTitle}
              </Typography>
              <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                {(t.resumeGrowthBullets as string[]).map((item, idx) => (
                  <li key={idx}>
                    <Typography variant="body2">{item}</Typography>
                  </li>
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {t.resumeRoadmapTitle}
              </Typography>
              <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                {(t.resumeRoadmapBullets as string[]).map((item, idx) => (
                  <li key={idx}>
                    <Typography variant="body2">{item}</Typography>
                  </li>
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {t.resumeOnePageLabel}
              </Typography>
              <Typography variant="body2">{t.resumeInterviewLine}</Typography>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {t.resumeSkillsLabel}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {skills.map((skill, idx) => (
                  <Box
                    key={`${skill.label}-${idx}`}
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 999,
                      border: "1px solid var(--card-border)",
                      backgroundColor: "rgba(30,58,138,0.08)",
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {skill.label} · {skill.value}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {t.resumeTechStackTitle}
              </Typography>
              <Stack spacing={2}>
                {(t.resumeTechStackSections as { title: string; items: string[] }[]).map(
                  (section, idx) => (
                    <Box key={`${section.title}-${idx}`}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                        {section.title}
                      </Typography>
                      <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                        {section.items.map((item, i) => (
                          <li key={i}>
                            <Typography variant="body2">{item}</Typography>
                          </li>
                        ))}
                      </Box>
                    </Box>
                  )
                )}
              </Stack>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {t.resumeExperienceLabel}
              </Typography>
              <Stack spacing={2}>
                {experiences.map((exp, idx) => (
                  <Box key={`${exp.company}-${idx}`}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {exp.company} — {exp.role}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {exp.period}
                    </Typography>
                    <Box component="ul" sx={{ pl: 3, mt: 1, mb: 0 }}>
                      {exp.details.slice(0, 3).map((item, i) => (
                        <li key={i}>
                          <Typography variant="body2">{item}</Typography>
                        </li>
                      ))}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {t.resumeContactLabel}
              </Typography>
              <Typography variant="body2">Email: ddaaadd01@gmail.com</Typography>
              <Typography variant="body2">Website: https://codingbyohj.com</Typography>
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
