// File: app/page.tsx
"use client";

import React from "react";
import { Box } from "@mui/material";
import HeroSection from "@/components/HeroSection";
import MetricsSection from "@/components/MetricsSection";
import ProjectsSection from "@/components/ProjectsSection";
import CaseStudiesSection from "@/components/CaseStudiesSection";
import ExperienceSection from "@/components/ExperienceSection";
import SkillsRadarSection from "@/components/SkillsRadarSection";
import SummarySection from "@/components/SummarySection";
import ContactSection from "@/components/ContactSection";

export default function Page() {
  return (
    <Box sx={{ scrollBehavior: "smooth" }}>
      <HeroSection />
      <MetricsSection />
      <ProjectsSection />
      <CaseStudiesSection />
      <ExperienceSection />
      <SkillsRadarSection />
      <SummarySection />
      <ContactSection />
    </Box>
  );
}
