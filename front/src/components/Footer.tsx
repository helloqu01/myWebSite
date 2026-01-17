"use client";

import React from "react";
import NextLink from "next/link";
import { Box, Container, Stack, Typography, Link } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        py: 4,
        borderTop: "1px solid var(--card-border)",
        background: "var(--surface-strong)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Container>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Oh Hyunji. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Link component={NextLink} href="/privacy" underline="hover" color="text.secondary">
              개인정보처리방침
            </Link>
            <Link component={NextLink} href="/terms" underline="hover" color="text.secondary">
              이용약관
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
