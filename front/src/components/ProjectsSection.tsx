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
    <Container id="projects" sx={{ py: 8 }}>
      <Stack spacing={3} textAlign="center" mb={6}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
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
                backgroundColor:
                  theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "#fff",
                backdropFilter:
                  theme.palette.mode === "dark" ? "blur(8px)" : "none",
                border:
                  theme.palette.mode === "dark"
                    ? "1px solid rgba(255,255,255,0.1)"
                    : "none",
                boxShadow:
                  theme.palette.mode === "dark"
                    ? "0 8px 32px rgba(0,0,0,0.7)"
                    : theme.shadows[4],
                borderRadius: 2,
              }}
            >
              <Box position="relative" sx={{ height: 160, overflow: "hidden" }}>
                <Box
                  component="img"
                  src={imgs[current] || ""}
                  alt={`${proj.title} image ${current + 1}`}
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                {imgs.length > 1 && (
                  <>
                    <IconButton
                      onClick={() => handlePrev(idx)}
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: 8,
                        transform: "translateY(-50%)",
                        backgroundColor: theme.palette.background.paper,
                        "&:hover": { backgroundColor: theme.palette.background.paper },
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
                        backgroundColor: theme.palette.background.paper,
                        "&:hover": { backgroundColor: theme.palette.background.paper },
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
                    color: "#fff",
                    textTransform: "none",
                    borderRadius: 2,
                    boxShadow: theme.shadows[2],
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    transition: "all 0.25s ease",
                    "&:hover": {
                      boxShadow: theme.shadows[6],
                      transform: "scale(1.05)",
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
