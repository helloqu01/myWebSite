"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { KeyRound, LockKeyhole, PawPrint } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import {
  isPortfolioPublic,
  isResumePublic,
  resumeAccessHash,
} from "@/lib/featureFlags";
import { trackEvent } from "@/lib/analytics";

const SITE_UNLOCK_SESSION_KEY = "ohj-protected-site-unlocked";

function isSeniorCatPath(pathname: string): boolean {
  return pathname === "/senior-cat" || pathname.startsWith("/senior-cat/");
}

function requiresPassword(pathname: string): boolean {
  if (isSeniorCatPath(pathname)) return false;
  if (!isPortfolioPublic) return true;
  return pathname === "/resume" && !isResumePublic;
}

export default function ProtectedSiteGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang } = useLocale();
  const protectedPage = useMemo(() => requiresPassword(pathname), [pathname]);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setUnlocked(window.sessionStorage.getItem(SITE_UNLOCK_SESSION_KEY) === "true");
  }, [pathname]);

  const unlock = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password) {
      setError(lang === "en" ? "Enter the password." : "비밀번호를 입력해 주세요.");
      return;
    }

    setChecking(true);
    setError("");
    try {
      const bytes = new TextEncoder().encode(password);
      const digest = await window.crypto.subtle.digest("SHA-256", bytes);
      const hash = Array.from(new Uint8Array(digest))
        .map(value => value.toString(16).padStart(2, "0"))
        .join("");

      if (hash !== resumeAccessHash.toLowerCase()) {
        setError(lang === "en" ? "Incorrect password." : "비밀번호가 올바르지 않습니다.");
        trackEvent("protected_site_unlock", { status: "failure" });
        return;
      }

      window.sessionStorage.setItem(SITE_UNLOCK_SESSION_KEY, "true");
      setUnlocked(true);
      setPassword("");
      trackEvent("protected_site_unlock", { status: "success" });
    } catch {
      setError(lang === "en" ? "Unable to verify the password." : "비밀번호를 확인할 수 없습니다.");
    } finally {
      setChecking(false);
    }
  };

  const lockAgain = () => {
    window.sessionStorage.removeItem(SITE_UNLOCK_SESSION_KEY);
    setUnlocked(false);
    setPassword("");
    setError("");
  };

  if (!protectedPage) return children;

  if (!unlocked) {
    return (
      <Box sx={{ minHeight: "calc(100vh - 80px)", py: { xs: 8, md: 14 }, display: "grid", placeItems: "center" }}>
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
                width: 68,
                height: 68,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                color: "primary.main",
                backgroundColor: "rgba(139,92,246,0.12)",
              }}
            >
              <LockKeyhole size={30} />
            </Box>
            <Typography variant="h4" fontWeight={700}>
              {lang === "en" ? "Password-protected page" : "비밀번호로 보호된 페이지"}
            </Typography>
            <Typography color="text.secondary">
              {lang === "en"
                ? "Enter the administrator password to view the private portfolio pages for this browser session."
                : "관리자 비밀번호를 입력하면 현재 브라우저 세션에서 비공개 페이지 전체를 볼 수 있습니다."}
            </Typography>
            <Stack component="form" onSubmit={unlock} spacing={1.5} sx={{ width: "100%", pt: 1 }}>
              <TextField
                label={lang === "en" ? "Password" : "비밀번호"}
                type="password"
                value={password}
                onChange={event => {
                  setPassword(event.target.value);
                  setError("");
                }}
                autoComplete="current-password"
                autoFocus
                fullWidth
              />
              {error && <Alert severity="error">{error}</Alert>}
              <Button
                type="submit"
                startIcon={<KeyRound size={16} />}
                variant="contained"
                disabled={checking}
                size="large"
              >
                {checking
                  ? lang === "en" ? "Checking…" : "확인 중…"
                  : lang === "en" ? "Unlock private pages" : "비공개 페이지 잠금 해제"}
              </Button>
              <Button component={Link} href="/senior-cat" startIcon={<PawPrint size={16} />} color="inherit">
                {lang === "en" ? "Go to senior cat care" : "노묘 건강관리로 이동"}
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    );
  }

  return (
    <>
      {children}
      <Button
        className="print-hidden"
        onClick={lockAgain}
        startIcon={<LockKeyhole size={15} />}
        variant="outlined"
        size="small"
        sx={{
          position: "fixed",
          right: { xs: 16, sm: 24 },
          top: { xs: 16, sm: 20 },
          zIndex: 1250,
          backgroundColor: "background.paper",
          backdropFilter: "blur(16px)",
        }}
      >
        {lang === "en" ? "Lock" : "다시 잠그기"}
      </Button>
    </>
  );
}

