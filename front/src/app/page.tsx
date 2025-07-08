// File: app/page.tsx
"use client";

import React from "react";
import { Box } from "@mui/material";
import HeroSection from "@/components/HeroSection";
import ProjectsSection from "@/components/ProjectsSection";
import ExperienceSection from "@/components/ExperienceSection";
import ContactSection from "@/components/ContactSection";

export default function Page() {
  return (
    <Box sx={{ scrollBehavior: "smooth" }}>
      <HeroSection />
      <ProjectsSection />
      <ExperienceSection />
      <ContactSection />
    </Box>
  );
}
