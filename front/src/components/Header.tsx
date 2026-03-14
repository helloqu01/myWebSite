// File: components/Header.tsx
"use client";

import React, { useContext, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  IconButton,
  useTheme,
  Drawer,
  Box,
  List,
  ListItemButton,
  Divider,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  Menu as MenuIcon,
  Info,
  DesignServices,
  Code,
  Work,
  Mail,
  Close as CloseIcon,
  Article,
  QuestionAnswer,
  Assessment,
  Psychology,
  ContactPage,
  Summarize,
} from "@mui/icons-material";

import en from "@/locales/en/common.json";
import ko from "@/locales/ko/common.json";
import { useLocale } from "@/context/LocaleContext";
import { ColorModeContext } from "@/app/context/ColorModeContext";

export default function Header() {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const router = useRouter();
  const pathname = usePathname();
  const { lang, setLang } = useLocale();
  const t = lang === "en" ? en : ko;
  const isDark = theme.palette.mode === "dark";
  const [openDrawer, setOpenDrawer] = useState(false);

  const servicesLabel = lang === "en" ? "Services" : "서비스";

  const primaryItems = [
    { label: servicesLabel, href: "#services", icon: <DesignServices fontSize="small" /> },
    { label: t.nav.projects, href: "#projects", icon: <Code fontSize="small" /> },
    { label: t.nav.experience, href: "#experience", icon: <Work fontSize="small" /> },
    { label: t.nav.contact, href: "#contact", icon: <Mail fontSize="small" /> },
    { label: t.nav.about, href: "#about", icon: <Info fontSize="small" /> },
  ];

  const secondaryItems = [
    { label: t.nav.metrics, href: "#metrics", icon: <Assessment fontSize="small" /> },
    { label: t.nav.caseStudies, href: "#case-studies", icon: <Article fontSize="small" /> },
    { label: t.nav.skills, href: "#skills", icon: <Psychology fontSize="small" /> },
    { label: t.nav.summary, href: "#summary", icon: <Summarize fontSize="small" /> },
    { label: t.nav.insights, href: "/insights", icon: <Article fontSize="small" /> },
    { label: t.nav.faq, href: "/faq", icon: <QuestionAnswer fontSize="small" /> },
    { label: t.nav.resume, href: "/resume", icon: <ContactPage fontSize="small" /> },
  ];

  const handleNavClick = (href: string) => {
    setOpenDrawer(false);
    if (href.startsWith("#")) {
      if (pathname !== "/") {
        router.push(`/${href}`);
        return;
      }
      const id = href.replace("#", "");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 50);
      return;
    }
    router.push(href);
  };

  const NavItem = ({
    label,
    href,
    icon,
  }: {
    label: string;
    href: string;
    icon: React.ReactNode;
  }) => (
    <ListItemButton
      onClick={() => handleNavClick(href)}
      sx={{
        px: 3,
        py: 1.1,
        gap: 1.5,
        borderLeft: "2px solid transparent",
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: isDark ? "rgba(139,92,246,0.07)" : "rgba(109,40,217,0.05)",
          borderLeftColor: "#a78bfa",
          "& .nav-icon": { color: "#a78bfa" },
          "& .nav-label": { color: theme.palette.text.primary },
        },
      }}
    >
      <Box
        className="nav-icon"
        sx={{
          color: theme.palette.text.disabled,
          display: "flex",
          alignItems: "center",
          transition: "color 0.2s ease",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Typography
        className="nav-label"
        variant="body2"
        sx={{
          fontWeight: 500,
          fontSize: "0.88rem",
          color: theme.palette.text.secondary,
          transition: "color 0.2s ease",
          letterSpacing: "0.005em",
        }}
      >
        {label}
      </Typography>
    </ListItemButton>
  );

  return (
    <>
      {/* Fixed hamburger toggle */}
      <Box
        sx={{
          position: "fixed",
          top: { xs: 16, md: 20 },
          left: { xs: 16, md: 20 },
          zIndex: 1300,
          display: openDrawer ? "none" : "block",
        }}
      >
        <IconButton
          onClick={() => setOpenDrawer(true)}
          aria-label="open navigation"
          sx={{
            width: 40,
            height: 40,
            borderRadius: "12px",
            backgroundColor: isDark ? "rgba(12,17,34,0.9)" : "rgba(255,255,255,0.9)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${isDark ? "rgba(139,92,246,0.25)" : "rgba(109,40,217,0.15)"}`,
            color: "#a78bfa",
            boxShadow: isDark
              ? "0 4px 20px rgba(0,0,0,0.6), 0 0 0 0 rgba(139,92,246,0)"
              : "0 4px 16px rgba(0,0,0,0.1)",
            transition: "all 0.25s ease",
            "&:hover": {
              backgroundColor: isDark ? "rgba(139,92,246,0.12)" : "rgba(109,40,217,0.06)",
              borderColor: "rgba(139,92,246,0.45)",
              boxShadow: "0 0 0 3px rgba(139,92,246,0.12), 0 4px 20px rgba(0,0,0,0.4)",
            },
          }}
        >
          <MenuIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Sidebar */}
      <Drawer
        anchor="left"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        PaperProps={{
          sx: {
            width: { xs: "80vw", sm: 272 },
            maxWidth: 300,
            backgroundColor: isDark ? "#0c1122" : "#ffffff",
            borderRight: `1px solid ${isDark ? "rgba(139,92,246,0.12)" : "rgba(109,40,217,0.1)"}`,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            // gradient top accent
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "linear-gradient(90deg, #7c3aed, #22d3ee)",
              zIndex: 1,
            },
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.3)",
              backdropFilter: "blur(4px)",
            },
          },
        }}
      >
        {/* Logo + close */}
        <Box
          sx={{
            px: 3,
            pt: 3,
            pb: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <Box
            onClick={() => handleNavClick("#hero")}
            sx={{ cursor: "pointer" }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "1.5rem",
                fontFamily: "var(--font-display), 'Fraunces', serif",
                letterSpacing: "-0.03em",
                background: "linear-gradient(135deg, #a78bfa 0%, #22d3ee 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                lineHeight: 1,
                mb: 0.3,
              }}
            >
              OhJ
            </Typography>
            <Typography
              sx={{
                fontSize: "0.65rem",
                color: theme.palette.text.disabled,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {lang === "en" ? "Freelance Dev" : "프리랜서 개발자"}
            </Typography>
          </Box>
          <IconButton
            onClick={() => setOpenDrawer(false)}
            size="small"
            sx={{
              width: 32,
              height: 32,
              color: theme.palette.text.disabled,
              borderRadius: "8px",
              "&:hover": {
                color: theme.palette.text.primary,
                backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", mx: 3, mb: 1 }} />

        {/* Primary nav */}
        <Box sx={{ flex: 1, overflowY: "auto", pb: 1 }}>
          <List disablePadding>
            {primaryItems.map((item, i) => (
              <NavItem key={i} {...item} />
            ))}
          </List>

          <Box sx={{ px: 3, pt: 2.5, pb: 0.5 }}>
            <Typography
              sx={{
                fontSize: "0.62rem",
                color: theme.palette.text.disabled,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {lang === "en" ? "More" : "더보기"}
            </Typography>
          </Box>
          <List disablePadding>
            {secondaryItems.map((item, i) => (
              <NavItem key={i} {...item} />
            ))}
          </List>
        </Box>

        <Divider sx={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", mx: 3, mt: 1 }} />

        {/* Bottom controls */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <ToggleButtonGroup
            value={lang}
            exclusive
            onChange={(_, value) => value && setLang(value)}
            size="small"
            sx={{
              gap: 0.5,
              "& .MuiToggleButtonGroup-grouped": {
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"} !important`,
                borderRadius: "8px !important",
                color: theme.palette.text.disabled,
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                minWidth: 36,
                height: 30,
                "&.Mui-selected": {
                  backgroundColor: "rgba(139,92,246,0.16)",
                  color: "#a78bfa",
                  borderColor: "rgba(139,92,246,0.3) !important",
                },
                "&:hover": {
                  backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                },
              },
            }}
          >
            <ToggleButton value="en">EN</ToggleButton>
            <ToggleButton value="ko">KO</ToggleButton>
          </ToggleButtonGroup>

          <IconButton
            onClick={colorMode.toggleColorMode}
            size="small"
            sx={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              color: theme.palette.text.disabled,
              border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"}`,
              "&:hover": {
                color: "#a78bfa",
                borderColor: "rgba(139,92,246,0.35)",
                backgroundColor: "rgba(139,92,246,0.08)",
              },
            }}
          >
            {isDark ? (
              <Brightness7 sx={{ fontSize: 15 }} />
            ) : (
              <Brightness4 sx={{ fontSize: 15 }} />
            )}
          </IconButton>
        </Box>
      </Drawer>
    </>
  );
}
