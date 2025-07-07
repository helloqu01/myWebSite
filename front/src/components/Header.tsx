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
  List,
  ListItem,
  Typography,
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  Menu,
  Info,
  Code,
  Work,
  Mail,
} from "@mui/icons-material";
import Link from "next/link";
import { useScroll, useTransform, motion } from "framer-motion";
import { ColorModeContext } from "@/app/context/ColorModeContext";

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const colorMode = useContext(ColorModeContext);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 100], [1, 0.8]);
  const [openDrawer, setOpenDrawer] = useState(false);

  const navItems = [
    { label: "About", href: "#about", icon: <Info /> },
    { label: "Projects", href: "#projects", icon: <Code /> },
    { label: "Experience", href: "#experience", icon: <Work /> },
    { label: "Contact", href: "#contact", icon: <Mail /> },
  ];

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
          {/* 로고 & 햄버거 */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              component={Link}
              href="#hero"
              sx={{
                fontWeight: 900,
                fontSize: "1.2rem",
                color: "inherit",
                textTransform: "none",
              }}
            >
              OhJ
            </Button>

            {isMobile ? (
              <>
                <IconButton onClick={() => setOpenDrawer(true)} color="inherit">
                  <Menu />
                </IconButton>

                <Drawer
                  anchor="left"
                  open={openDrawer}
                  onClose={() => setOpenDrawer(false)}
                  PaperProps={{
                    sx: {
                      width: 260,
                      backgroundColor: theme.palette.background.default,
                      color: theme.palette.text.primary,
                    },
                  }}
                >
                  {/* Drawer 상단 */}
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
                      Menu
                    </Typography>
                    <IconButton onClick={() => setOpenDrawer(false)} size="small">
                      ✕
                    </IconButton>
                  </Stack>

                  {/* 메뉴 리스트 */}
                  <List>
                    {navItems.map((item, idx) => (
                      <ListItem key={idx} disablePadding>
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
                </Drawer>
              </>
            ) : (
              navItems.map((item, idx) => (
                <Button
                  key={idx}
                  component={Link}
                  href={item.href}
                  startIcon={item.icon}
                  color="inherit"
                  sx={{
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: "0.95rem",
                  }}
                >
                  {item.label}
                </Button>
              ))
            )}
          </Stack>

          {/* 다크모드 토글 */}
          <IconButton onClick={colorMode.toggleColorMode} color="inherit">
            {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>
    </motion.div>
  );
}
