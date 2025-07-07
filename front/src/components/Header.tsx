// src/components/Header.tsx
"use client";

import React, { useContext } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Stack,
  Button,
  useTheme,
} from "@mui/material";
import { Brightness4, Brightness7, Home } from "@mui/icons-material";
import Link from "next/link";
import { ColorModeContext } from "@/app/layout";
import { useScroll, useTransform, motion } from "framer-motion";

export default function Header() {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  // scrollY 값에 따라 opacity를 1에서 0.8까지 변환
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 100], [1, 0.8]);

  return (
    <motion.div
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        backgroundColor: theme.palette.background.paper,
        opacity,
        backdropFilter: 'blur(10px)',
      }}
    >
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton component={Link} href="#hero" color="inherit">
              <Home />
            </IconButton>
            <Button component={Link} href="#about" color="inherit" sx={{ fontWeight: 600 }}>
              About
            </Button>
            <Button component={Link} href="#projects" color="inherit" sx={{ fontWeight: 600 }}>
              Projects
            </Button>
            <Button component={Link} href="#experience" color="inherit" sx={{ fontWeight: 600 }}>
              Experience
            </Button>
            <Button component={Link} href="#contact" color="inherit" sx={{ fontWeight: 600 }}>
              Contact
            </Button>
          </Stack>

          <IconButton onClick={colorMode.toggleColorMode} color="inherit">
            {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>
    </motion.div>
  );
}
