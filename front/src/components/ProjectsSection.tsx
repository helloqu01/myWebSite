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

  // 각 카드별 현재 이미지 인덱스 상태
  const [imgIndex, setImgIndex] = useState<Record<number, number>>({});

  // 이전 이미지로 이동
  const handlePrev = (idx: number) => {
    setImgIndex((prev) => {
      const rawImages = projects[idx].images
        ? projects[idx].images
        : projects[idx].images
        ? [projects[idx].images]
        : [];
      const current = prev[idx] ?? 0;
      const prevIdx = rawImages.length
        ? (current - 1 + rawImages.length) % rawImages.length
        : 0;
      return { ...prev, [idx]: prevIdx };
    });
  };

  // 다음 이미지로 이동
  const handleNext = (idx: number) => {
    setImgIndex((prev) => {
      const rawImages = projects[idx].images
        ? projects[idx].images
        : projects[idx].images
        ? [projects[idx].images]
        : [];
      const current = prev[idx] ?? 0;
      const nextIdx = rawImages.length
        ? (current + 1) % rawImages.length
        : 0;
      return { ...prev, [idx]: nextIdx };
    });
  };

  // 프로젝트 다이얼로그 상태
  const [projIndex, setProjIndex] = useState<number | null>(null);
  const openProj = (idx: number) => setProjIndex(idx);
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
          const rawImages = proj.images
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
              sx={{ display: "flex", flexDirection: "column" }}
            >
              {/* 이미지 슬라이더 영역 */}
              <Box position="relative" sx={{ height: 160, overflow: 'hidden' }}>
                <Box
                  component="img"
                  src={rawImages[current] ?? ''}
                  alt={`${proj.title} image ${current + 1}`}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {rawImages.length > 1 && (
                  <>  {/* 좌/우 화살표 */}
                    <IconButton
                      onClick={() => handlePrev(idx)}
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: 8,
                        transform: 'translateY(-50%)',
                        backgroundColor: theme.palette.background.paper,
                        '&:hover': { backgroundColor: theme.palette.background.paper },
                      }}
                    >
                      <ChevronLeft />
                    </IconButton>
                    <IconButton
                      onClick={() => handleNext(idx)}
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        right: 8,
                        transform: 'translateY(-50%)',
                        backgroundColor: theme.palette.background.paper,
                        '&:hover': { backgroundColor: theme.palette.background.paper },
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
                <Button onClick={() => openProj(idx)} variant="contained" color="primary">
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
