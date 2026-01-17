// File: components/ProjectDialog.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  useTheme,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Link as LinkIcon, X as CloseIcon } from "lucide-react";

interface Project {
  title: string;
  description: string;
  images?: string | string[];
  video?: string;
  videoDescription?: string;
  link: string;
  detailImage: string;
  detailText: string;
}

interface ProjectDialogProps {
  open: boolean;
  project: Project;
  onClose: () => void;
  viewLabel: string;
}

export default function ProjectDialog({ open, project, onClose, viewLabel }: ProjectDialogProps) {
  const theme = useTheme();
  const [idx, setIdx] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Normalize images
  const rawImages = Array.isArray(project.images)
    ? project.images
    : project.images
    ? [project.images]
    : [project.detailImage];

  const handlePrev = () => setIdx(prev => (prev - 1 + rawImages.length) % rawImages.length);
  const handleNext = () => setIdx(prev => (prev + 1) % rawImages.length);
  const handlePreviewOpen = () => setPreviewOpen(true);
  const handlePreviewClose = () => setPreviewOpen(false);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "var(--surface-strong)",
            border: "1px solid var(--card-border)",
            boxShadow: "var(--shadow-strong)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "var(--font-display), 'Fraunces', serif",
            fontWeight: 600,
          }}
        >
          {project.title}
        </DialogTitle>
        <DialogContent>
          {/* Image slider */}
          <Box
            position="relative"
            sx={{
              width: '100%',
              height: 300,
              mb: 2,
              bgcolor: 'var(--surface-strong)',
              borderRadius: 2,
              border: '1px solid var(--card-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={handlePreviewOpen}
          >
            <Image
              src={rawImages[idx]}
              alt={`${project.title} slide ${idx + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              style={{ objectFit: "contain" }}
            />
            {rawImages.length > 1 && (
              <>
                <IconButton
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: 8,
                    transform: 'translateY(-50%)',
                    backgroundColor: 'var(--surface-strong)',
                    '&:hover': { backgroundColor: 'var(--surface-strong)' },
                  }}
                >
                  <ChevronLeft />
                </IconButton>
                <IconButton
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    right: 8,
                    transform: 'translateY(-50%)',
                    backgroundColor: 'var(--surface-strong)',
                    '&:hover': { backgroundColor: 'var(--surface-strong)' },
                  }}
                >
                  <ChevronRight />
                </IconButton>
              </>
            )}
          </Box>

          {/* Video preview */}
          {project.video && (
            <Box sx={{ mb: 2 }}>
              <video
                controls
                src={project.video}
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: 4,
                  boxShadow: theme.shadows[1],
                }}
              />
              {project.videoDescription && (
                <Typography variant="caption" color="text.secondary">
                  {project.videoDescription}
                </Typography>
              )}
            </Box>
          )}

          <Typography variant="body1" gutterBottom>
            {project.detailText}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end' }}>
          <Button
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<LinkIcon />}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: theme.palette.common.white,
              px: 3,
              "&:hover": {
                background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
              },
            }}
          >
            {viewLabel}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fullscreen Preview */}
      <Dialog open={previewOpen} onClose={handlePreviewClose} fullScreen>
        <IconButton
          onClick={handlePreviewClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: theme.palette.common.white,
            zIndex: 1300,
          }}
        >
          <CloseIcon size={24} />
        </IconButton>
        <Box
          sx={{
            width: "100%",
            height: "100%",
            bgcolor: "rgba(0,0,0,0.9)",
            position: "relative",
          }}
        >
          <Image
            src={rawImages[idx]}
            alt={`${project.title} full preview`}
            fill
            sizes="100vw"
            style={{ objectFit: "contain" }}
          />
        </Box>
      </Dialog>
    </>
  );
}
