// File: components/ProjectsSection.tsx
"use client";

import React, { useState } from "react";
import {
  Container,
  Stack,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import { Wrench, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import ProjectDialog from "./ProjectDialog";
import en from "@/locales/en/common.json";
import ko from "@/locales/ko/common.json";
import { useLocale } from "@/context/LocaleContext";

export default function ProjectsSection() {
  const theme = useTheme();
  const { lang } = useLocale();
  const t = lang === "en" ? en : ko;
  const projects = t.projectData;

  const [imgIndex, setImgIndex] = useState<Record<number, number>>({});
  const handlePrev = (idx: number) => {
    setImgIndex(prev => {
      const raw = Array.isArray(projects[idx].images)
        ? projects[idx].images
        : projects[idx].images
        ? [projects[idx].images]
        : [];
      const curr = prev[idx] ?? 0;
      return { ...prev, [idx]: raw.length ? (curr - 1 + raw.length) % raw.length : 0 };
    });
  };
  const handleNext = (idx: number) => {
    setImgIndex(prev => {
      const raw = Array.isArray(projects[idx].images)
        ? projects[idx].images
        : projects[idx].images
        ? [projects[idx].images]
        : [];
      const curr = prev[idx] ?? 0;
      return { ...prev, [idx]: raw.length ? (curr + 1) % raw.length : 0 };
    });
  };

  const [projIndex, setProjIndex] = useState<number | null>(null);
  const openProj = (i: number) => setProjIndex(i);
  const closeProj = () => setProjIndex(null);

  return (
    <Container id="projects" sx={{ py: { xs: 8, md: 12 } }}>
      <Stack spacing={3} textAlign="center" mb={6}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
            letterSpacing: "-0.02em",
          }}
        >
          <Wrench size={28} /> {t.projectsHeader}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t.projectsSubtitle}
        </Typography>
      </Stack>

      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }}
        gap={4}
      >
        {projects.map((proj, idx) => {
          const imgs = Array.isArray(proj.images)
            ? proj.images
            : proj.images
            ? [proj.images]
            : [];
          const current = imgIndex[idx] ?? 0;

          return (
            <Card
              key={idx}
              component={motion.div}
              whileHover={{ y: -5 }}
              sx={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "var(--surface)",
                border: "1px solid var(--card-border)",
                boxShadow: "var(--shadow-soft)",
                borderRadius: 3,
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                "&:hover": {
                  boxShadow: "var(--shadow-strong)",
                },
              }}
            >
              <Box position="relative" sx={{ height: 160, overflow: "hidden" }}>
                {imgs[current] ? (
                  <Image
                    src={imgs[current]}
                    alt={`${proj.title} image ${current + 1}`}
                    fill
                    sizes="(max-width: 900px) 100vw, 33vw"
                    style={{ objectFit: "cover", transform: "scale(1.02)" }}
                  />
                ) : (
                  <Box sx={{ width: "100%", height: "100%", backgroundColor: "var(--surface-strong)" }} />
                )}
                {imgs.length > 1 && (
                  <>
                    <IconButton
                      onClick={() => handlePrev(idx)}
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: 8,
                        transform: "translateY(-50%)",
                        backgroundColor: "var(--surface-strong)",
                        "&:hover": { backgroundColor: "var(--surface-strong)" },
                      }}
                    >
                      <ChevronLeft />
                    </IconButton>
                    <IconButton
                      onClick={() => handleNext(idx)}
                      sx={{
                        position: "absolute",
                        top: "50%",
                        right: 8,
                        transform: "translateY(-50%)",
                        backgroundColor: "var(--surface-strong)",
                        "&:hover": { backgroundColor: "var(--surface-strong)" },
                      }}
                    >
                      <ChevronRight />
                    </IconButton>
                  </>
                )}
              </Box>

              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {proj.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {proj.description}
                </Typography>
              </CardContent>

              <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
                <Button
                  onClick={() => openProj(idx)}
                  variant="outlined"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    color: theme.palette.common.white,
                    textTransform: "none",
                    borderRadius: 2,
                    boxShadow: "var(--shadow-soft)",
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    transition: "all 0.25s ease",
                    "&:hover": {
                      boxShadow: "var(--shadow-strong)",
                      transform: "translateY(-1px) scale(1.02)",
                    },
                  }}
                >
                  {t.projectsView}
                </Button>
              </CardActions>
            </Card>
          );
        })}
      </Box>

      {projIndex !== null && (
        <ProjectDialog
          open={true}
          project={projects[projIndex]}
          onClose={closeProj}
          viewLabel={t.projectsView}
        />
      )}
    </Container>
  );
}
