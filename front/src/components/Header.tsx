// File: components/Header.tsx
"use client";

import React, { useContext, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AppBar,
  Toolbar,
  IconButton,
  Stack,
  Button,
  useTheme,
  useMediaQuery,
  Drawer,
  Box,
  List,
  ListItem,
  Divider,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  Menu as MenuIcon,
  Info,
  Code,
  Work,
  Mail,
  Close as CloseIcon,
} from "@mui/icons-material";
import { motion, useScroll, useTransform } from "framer-motion";

import en from "@/locales/en/common.json";
import ko from "@/locales/ko/common.json";
import { useLocale } from "@/context/LocaleContext";
import { ColorModeContext } from "@/app/context/ColorModeContext";

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const colorMode = useContext(ColorModeContext);
  const router = useRouter();
  const pathname = usePathname();

  const { lang, setLang } = useLocale();
  const t = lang === "en" ? en : ko;

  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 100], [1, 0.85]);

  const primaryNavItems = [
    { label: t.nav.about, href: "#hero", icon: <Info fontSize="small" /> },
    { label: t.nav.projects, href: "#projects", icon: <Code fontSize="small" /> },
    { label: t.nav.experience, href: "#experience", icon: <Work fontSize="small" /> },
    { label: t.nav.contact, href: "#contact", icon: <Mail fontSize="small" /> },
  ];
  const moreNavItems = [
    { label: t.nav.aboutPage, href: "/about", icon: <Info fontSize="small" /> },
    { label: t.nav.insights, href: "/insights", icon: <Code fontSize="small" /> },
    { label: t.nav.faq, href: "/faq", icon: <Info fontSize="small" /> },
    { label: t.nav.metrics, href: "#metrics", icon: <Info fontSize="small" /> },
    { label: t.nav.caseStudies, href: "#case-studies", icon: <Code fontSize="small" /> },
    { label: t.nav.skills, href: "#skills", icon: <Code fontSize="small" /> },
    { label: t.nav.summary, href: "#summary", icon: <Info fontSize="small" /> },
    { label: t.nav.resume, href: "/resume", icon: <Info fontSize="small" /> },
  ];

  const handleNavClick = (href: string) => {
    if (href.startsWith("#")) {
      if (pathname !== "/") {
        router.push(`/${href}`);
        return;
      }
      const id = href.replace("#", "");
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }
    router.push(href);
  };

  const [openDrawer, setOpenDrawer] = useState(false);
  const [moreAnchor, setMoreAnchor] = useState<null | HTMLElement>(null);
  const moreOpen = Boolean(moreAnchor);

  const linkSx = {
    fontWeight: 600,
    textTransform: "none",
    fontSize: "0.95rem",
    color: theme.palette.text.primary,
    borderRadius: 999,
    position: "relative" as const,
    "&:hover": {
      backgroundColor: theme.palette.mode === "dark"
        ? "rgba(255,255,255,0.08)"
        : "rgba(30,58,138,0.08)",
    },
    "&::after": {
      content: '""',
      position: "absolute" as const,
      bottom: 4,
      left: "18%",
      width: 0,
      height: 2,
      borderRadius: 999,
      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
      transition: "width 0.3s ease",
    },
    "&:hover::after": {
      width: "64%",
    },
  };

  return (
    <motion.div
      style={{
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        backgroundColor: "var(--surface-strong)",
        backdropFilter: "blur(18px)",
        borderBottom: "1px solid var(--card-border)",
        boxShadow: "var(--shadow-soft)",
        opacity,
      }}
    >
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: "wrap", rowGap: 1 }}>
            <Button
              onClick={() => handleNavClick("#hero")}
              sx={{
                fontWeight: 700,
                fontSize: "1.2rem",
                fontFamily: "var(--font-display), 'Fraunces', serif",
                letterSpacing: "-0.02em",
                color: theme.palette.text.primary,
                textTransform: "none",
              }}
            >
              OhJ
            </Button>

            {isMobile ? (
              <IconButton onClick={() => setOpenDrawer(true)} color="inherit">
                <MenuIcon />
              </IconButton>
            ) : (
              <>
                {primaryNavItems.map((item, i) => (
                  <Button
                    key={i}
                    onClick={() => handleNavClick(item.href)}
                    startIcon={item.icon}
                    sx={linkSx}
                  >
                    {item.label}
                  </Button>
                ))}
                <Button
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => setMoreAnchor(e.currentTarget)}
                  sx={linkSx}
                >
                  More
                </Button>
                <Menu
                  anchorEl={moreAnchor}
                  open={moreOpen}
                  onClose={() => setMoreAnchor(null)}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      backgroundColor: "var(--surface-strong)",
                      border: "1px solid var(--card-border)",
                      boxShadow: "var(--shadow-strong)",
                    },
                  }}
                >
                  {moreNavItems.map((item, i) => (
                    <MenuItem
                      key={i}
                      onClick={() => {
                        handleNavClick(item.href);
                        setMoreAnchor(null);
                      }}
                    >
                      {item.label}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
          </Stack>

          {!isMobile && (
            <Stack direction="row" spacing={1} alignItems="center">
              <ToggleButtonGroup
                value={lang}
                exclusive
                onChange={(_, value) => value && setLang(value)}
                size="small"
                sx={{
                  "& .MuiToggleButton-root": {
                    color: theme.palette.text.primary,
                    "&.Mui-selected": {
                      backgroundColor: "rgba(30,58,138,0.15)",
                    },
                  },
                }}
              >
                <ToggleButton value="en">EN</ToggleButton>
                <ToggleButton value="ko">KO</ToggleButton>
              </ToggleButtonGroup>

              <IconButton
                onClick={colorMode.toggleColorMode}
                sx={{
                  color:
                    theme.palette.mode === "dark"
                      ? "#e0e0e0"
                      : theme.palette.text.primary,
                }}
              >
                {theme.palette.mode === "dark" ? (
                  <Brightness7 />
                ) : (
                  <Brightness4 />
                )}
              </IconButton>
            </Stack>
          )}
        </Toolbar>

        {isMobile && (
          <Drawer
            anchor="left"
            open={openDrawer}
            onClose={() => setOpenDrawer(false)}
            PaperProps={{
              sx: {
                width: 260,
                backgroundColor: "var(--surface-strong)",
                color: theme.palette.text.primary,
                borderRight: "1px solid var(--card-border)",
              },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                px: 2,
                py: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                {t.nav.about}
              </Typography>
              <IconButton onClick={() => setOpenDrawer(false)} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>

            <List sx={{ flexGrow: 1 }}>
              {[...primaryNavItems, ...moreNavItems].map((item, i) => (
                <ListItem key={i} disablePadding>
                  <Button
                    onClick={() => {
                      handleNavClick(item.href);
                      setOpenDrawer(false);
                    }}
                    fullWidth
                    startIcon={item.icon}
                    sx={{
                      justifyContent: "flex-start",
                      px: 3,
                      py: 1.75,
                      fontSize: "1rem",
                      fontWeight: 600,
                      color:
                        theme.palette.mode === "dark"
                          ? "#e0e0e0"
                          : theme.palette.text.primary,
                      textTransform: "none",
                    }}
                  >
                    {item.label}
                  </Button>
                </ListItem>
              ))}
            </List>

            <Divider />
            <Box sx={{ p: 2 }}>
              <ToggleButtonGroup
                value={lang}
                exclusive
                onChange={(_, value) => value && setLang(value)}
                size="small"
                fullWidth
                sx={{
                  "& .MuiToggleButton-root": {
                    color: theme.palette.text.primary,
                    "&.Mui-selected": {
                      backgroundColor: "rgba(30,58,138,0.15)",
                    },
                  },
                }}
              >
                <ToggleButton value="en">EN</ToggleButton>
                <ToggleButton value="ko">KO</ToggleButton>
              </ToggleButtonGroup>
              <Box sx={{ mt: 2, textAlign: "center" }}>
                <IconButton
                  onClick={colorMode.toggleColorMode}
                  sx={{
                    color:
                      theme.palette.mode === "dark"
                        ? "#e0e0e0"
                        : theme.palette.text.primary,
                  }}
                >
                  {theme.palette.mode === "dark" ? (
                    <Brightness7 />
                  ) : (
                    <Brightness4 />
                  )}
                </IconButton>
              </Box>
            </Box>
          </Drawer>
        )}
      </AppBar>
    </motion.div>
  );
}
