// File: components/Header.tsx
"use client";

import React, { useContext, useState } from "react";
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

  const { lang, setLang } = useLocale();
  const t = lang === "en" ? en : ko;

  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 100], [1, 0.85]);

  const navItems = [
    { label: t.nav.about, href: "#hero",      icon: <Info fontSize="small" /> },
    { label: t.nav.projects, href: "#projects", icon: <Code fontSize="small" /> },
    { label: t.nav.experience, href: "#experience", icon: <Work fontSize="small" /> },
    { label: t.nav.contact, href: "#contact",   icon: <Mail fontSize="small" /> },
  ];

  const handleNavClick = (href: string) => {
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const [openDrawer, setOpenDrawer] = useState(false);

  const linkSx = {
    fontWeight: 600,
    textTransform: "none",
    fontSize: "0.95rem",
    color: theme.palette.mode === "dark" ? "#e0e0e0" : "inherit",
    borderRadius: 1,
    position: "relative" as const,
    "&:hover": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? "rgba(255,255,255,0.1)"
          : "rgba(0,0,0,0.04)",
    },
    "&::after": {
      content: '""',
      position: "absolute" as const,
      bottom: 0,
      left: 0,
      width: 0,
      height: 2,
      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
      transition: "width 0.3s ease",
    },
    "&:hover::after": {
      width: "100%",
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
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(16,16,20,0.85)"
            : theme.palette.background.paper,
        backdropFilter: "blur(12px)",
        borderBottom:
          theme.palette.mode === "dark"
            ? "1px solid rgba(255,255,255,0.1)"
            : "1px solid rgba(0,0,0,0.1)",
        opacity,
      }}
    >
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              onClick={() => handleNavClick("#hero")}
              sx={{
                fontWeight: 900,
                fontSize: "1.2rem",
                color: theme.palette.mode === "dark" ? "#fff" : "inherit",
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
              navItems.map((item, i) => (
                <Button
                  key={i}
                  onClick={() => handleNavClick(item.href)}
                  startIcon={item.icon}
                  sx={linkSx}
                >
                  {item.label}
                </Button>
              ))
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
                    color:
                      theme.palette.mode === "dark"
                        ? "#e0e0e0"
                        : theme.palette.text.primary,
                    "&.Mui-selected": {
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.15)"
                          : "rgba(0,0,0,0.08)",
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
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "#121217"
                    : theme.palette.background.default,
                color: theme.palette.text.primary,
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
              {navItems.map((item, i) => (
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
                    color:
                      theme.palette.mode === "dark"
                        ? "#e0e0e0"
                        : theme.palette.text.primary,
                    "&.Mui-selected": {
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.15)"
                          : "rgba(0,0,0,0.08)",
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
