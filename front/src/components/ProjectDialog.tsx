// File: components/ProjectDialog.tsx
"use client";

import React, { useState } from "react";
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
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{project.title}</DialogTitle>
        <DialogContent>
          {/* Image slider */}
          <Box
            position="relative"
            sx={{
              width: '100%',
              height: 300,
              mb: 2,
              bgcolor: theme.palette.background.default,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={handlePreviewOpen}
          >
            <Box
              component="img"
              src={rawImages[idx]}
              alt={`${project.title} slide ${idx + 1}`}
              sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
            {rawImages.length > 1 && (
              <>
                <IconButton
                  onClick={e => { e.stopPropagation(); handlePrev(); }}
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
                  onClick={e => { e.stopPropagation(); handleNext(); }}
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

          {/* Video preview */}
          {project.video && (
            <Box sx={{ mb: 2 }}>
              <Box
                component="video"
                controls
                src={project.video}
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 1,
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
            component="a"
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<LinkIcon />}
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
          component="img"
          src={rawImages[idx]}
          alt={`${project.title} full preview`}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            bgcolor: 'rgba(0,0,0,0.9)',
          }}
        />
      </Dialog>
    </>
  );
}
