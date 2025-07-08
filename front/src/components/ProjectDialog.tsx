// File: components/ProjectDialog.tsx
"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";

interface Project {
  title: string;
  description: string;
  image: string;
  link: string;
  detailImage: string;
  detailText: string;
}

interface ProjectDialogProps {
  open: boolean;
  project: Project;
  onClose: () => void;
  viewLabel: string;      // declare this prop
}

export default function ProjectDialog({
  open,
  project,
  onClose,
  viewLabel,
}: ProjectDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{project.title}</DialogTitle>
      <DialogContent>
        <Box component="img" src={project.detailImage} alt={project.title} width="100%" mb={2} />
        <Typography>{project.detailText}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{viewLabel}</Button> {/* use viewLabel here */}
      </DialogActions>
    </Dialog>
  );
}
