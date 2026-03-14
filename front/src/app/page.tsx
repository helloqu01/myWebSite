// File: app/page.tsx
"use client";

import React from "react";
import { Box } from "@mui/material";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import MetricsSection from "@/components/MetricsSection";
import ProjectsSection from "@/components/ProjectsSection";
import CaseStudiesSection from "@/components/CaseStudiesSection";
import ExperienceSection from "@/components/ExperienceSection";
import SkillsRadarSection from "@/components/SkillsRadarSection";
import SummarySection from "@/components/SummarySection";
import ContactSection from "@/components/ContactSection";
import EngagementSection from "@/components/EngagementSection";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <Box sx={{ scrollBehavior: "smooth" }}>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <MetricsSection />
      <ProjectsSection />
      <CaseStudiesSection />
      <ExperienceSection />
      <SkillsRadarSection />
      <EngagementSection />
      <SummarySection />
      <ContactSection />
      <Footer />
    </Box>
  );
}
