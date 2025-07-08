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
import Link from "next/link";
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
  const opacity = useTransform(scrollY, [0, 100], [1, 0.8]);


  const navItems = [
    { label: t.nav.about, href: "#about", icon: <Info fontSize="small" /> },
    { label: t.nav.projects, href: "#projects", icon: <Code fontSize="small" /> },
    { label: t.nav.experience, href: "#experience", icon: <Work fontSize="small" /> },
    { label: t.nav.contact, href: "#contact", icon: <Mail fontSize="small" /> },
  ];

  const [openDrawer, setOpenDrawer] = useState(false);

  return (
    <motion.div
      style={{
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        backgroundColor: theme.palette.background.paper,
        opacity,
        backdropFilter: "blur(10px)",
      }}
    >
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              component={Link}
              href="#hero"
              sx={{ fontWeight: 900, fontSize: "1.2rem", color: "inherit", textTransform: "none" }}
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
                  component={Link}
                  href={item.href}
                  startIcon={item.icon}
                  color="inherit"
                  sx={{ fontWeight: 600, textTransform: "none", fontSize: "0.95rem" }}
                >
                  {item.label}
                </Button>
              ))
            )}
          </Stack>

          {/* Desktop Controls */}
          {!isMobile && (
            <Stack direction="row" spacing={1} alignItems="center">
              <ToggleButtonGroup
                value={lang}
                exclusive
                onChange={(_, value) => value && setLang(value)}
                size="small"
                sx={{ mr: 1 }}
              >
                <ToggleButton value="en">EN</ToggleButton>
                <ToggleButton value="ko">KO</ToggleButton>
              </ToggleButtonGroup>
              <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Stack>
          )}
        </Toolbar>

        {/* Mobile Drawer */}
        {isMobile && (
          <Drawer
            anchor="left"
            open={openDrawer}
            onClose={() => setOpenDrawer(false)}
            PaperProps={{
              sx: { width: 260, backgroundColor: theme.palette.background.default, color: theme.palette.text.primary },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ px: 2, py: 2, borderBottom: `1px solid ${theme.palette.divider}` }}
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
                    component={Link}
                    href={item.href}
                    onClick={() => setOpenDrawer(false)}
                    fullWidth
                    startIcon={item.icon}
                    sx={{
                      justifyContent: "flex-start",
                      px: 3,
                      py: 1.75,
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "inherit",
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
              >
                <ToggleButton value="en">EN</ToggleButton>
                <ToggleButton value="ko">KO</ToggleButton>
              </ToggleButtonGroup>

              <Box sx={{ mt: 2, textAlign: "center" }}>
                <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                  {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
              </Box>
            </Box>
          </Drawer>
        )}
      </AppBar>
    </motion.div>
  );
}
