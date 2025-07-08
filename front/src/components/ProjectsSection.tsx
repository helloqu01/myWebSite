// File: components/ProjectsSection.tsx
"use client";

import React, { useState } from "react";
import {
  Container,
  Stack,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
} from "@mui/material";
import { Wrench } from "lucide-react";
import { motion } from "framer-motion";
import ProjectDialog from "./ProjectDialog";
import en from "@/locales/en/common.json";
import ko from "@/locales/ko/common.json";
import { useLocale } from "@/context/LocaleContext";

export default function ProjectsSection() {
  const { lang } = useLocale();
  const t = lang === "en" ? en : ko;
  const projects = t.projectData;

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
        {projects.map((proj, idx) => (
          <Card
            key={idx}
            component={motion.div}
            whileHover={{ y: -5 }}
            sx={{ display: "flex", flexDirection: "column" }}
          >
            <CardMedia
              component="img"
              height="160"
              image={proj.image}
              alt={proj.title}
            />
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
                variant="contained"
                color="primary"
              >
                {t.projectsView}
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      {projIndex !== null && (
        <ProjectDialog
          open={true}
          project={projects[projIndex]}
          onClose={closeProj}
          viewLabel={t.projectsView}      // now declared in props
        />
      )}
    </Container>
  );
}
