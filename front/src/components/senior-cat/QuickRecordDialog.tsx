"use client";

import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import PetsRounded from "@mui/icons-material/PetsRounded";
import type {
  AppetiteLevel,
  CatProfile,
  DailyRecord,
  MeasurementConfidence,
} from "@/types/cat-care";
import { createId } from "@/lib/cat-care/storage";

interface QuickRecordDialogProps {
  open: boolean;
  cats: CatProfile[];
  records: DailyRecord[];
  date: string;
  onDateChange: (date: string) => void;
  onClose: () => void;
  onSave: (records: DailyRecord[]) => void;
}

interface QuickDraft {
  waterCount: string;
  urineCount: string;
  stoolCount: string;
  weightKg: string;
  appetite: AppetiteLevel;
  medicationDone: boolean;
  confidence: MeasurementConfidence;
}

function draftFor(cat: CatProfile, record?: DailyRecord): QuickDraft {
  return {
    waterCount: record?.waterCount?.toString() ?? "",
    urineCount: record?.urineCount?.toString() ?? "",
    stoolCount: record?.stoolCount?.toString() ?? "",
    weightKg: record?.weightKg?.toString() ?? cat.currentWeightKg?.toString() ?? "",
    appetite: record?.appetite ?? "normal",
    medicationDone:
      cat.medications.length > 0 &&
      cat.medications.every(medication => Boolean(record?.medicationChecks[medication.id])),
    confidence: record?.measurementConfidence ?? "high",
  };
}

function nullableNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function recordFor(cat: CatProfile, date: string, draft: QuickDraft, existing?: DailyRecord): DailyRecord {
  return {
    id: existing?.id ?? createId("record"),
    catId: cat.id,
    date,
    waterCount: nullableNumber(draft.waterCount),
    urineCount: nullableNumber(draft.urineCount),
    urineSize: existing?.urineSize ?? null,
    stoolCount: nullableNumber(draft.stoolCount),
    stoolAmount: existing?.stoolAmount ?? null,
    stoolScore: existing?.stoolScore ?? null,
    appetite: draft.appetite,
    weightKg: nullableNumber(draft.weightKg),
    vomitCount: existing?.vomitCount ?? 0,
    activity: existing?.activity ?? "normal",
    restingRespiratoryRate: existing?.restingRespiratoryRate ?? null,
    measurementConfidence: draft.confidence,
    medicationChecks: {
      ...(existing?.medicationChecks ?? {}),
      ...Object.fromEntries(cat.medications.map(medication => [medication.id, draft.medicationDone])),
    },
    urinationStraining: existing?.urinationStraining ?? false,
    urineNotProduced: existing?.urineNotProduced ?? false,
    bloodInUrine: existing?.bloodInUrine ?? false,
    breathingDifficulty: existing?.breathingDifficulty ?? false,
    collapseOrSeizure: existing?.collapseOrSeizure ?? false,
    timedEvents: existing?.timedEvents ?? [],
    notes: existing?.notes ?? "",
    updatedAt: new Date().toISOString(),
  };
}

export default function QuickRecordDialog({
  open,
  cats,
  records,
  date,
  onDateChange,
  onClose,
  onSave,
}: QuickRecordDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [drafts, setDrafts] = useState<Record<string, QuickDraft>>({});
  const [changedCatIds, setChangedCatIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setDrafts(Object.fromEntries(cats.map(cat => [
      cat.id,
      draftFor(cat, records.find(record => record.catId === cat.id && record.date === date)),
    ])));
    setChangedCatIds([]);
  }, [cats, date, open, records]);

  const update = <K extends keyof QuickDraft>(catId: string, key: K, value: QuickDraft[K]) => {
    setDrafts(current => ({
      ...current,
      [catId]: { ...current[catId], [key]: value },
    }));
    setChangedCatIds(current => current.includes(catId) ? current : [...current, catId]);
  };

  const save = () => {
    const changedRecords = cats
      .filter(cat => changedCatIds.includes(cat.id) && drafts[cat.id])
      .map(cat => recordFor(
        cat,
        date,
        drafts[cat.id],
        records.find(record => record.catId === cat.id && record.date === date),
      ));
    if (changedRecords.length) onSave(changedRecords);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" fullScreen={fullScreen}>
      <DialogTitle>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1.5}>
          <Box>
            <Typography variant="h5" fontWeight={800}>전체 고양이 빠른 기록</Typography>
            <Typography variant="body2" color="text.secondary">변경한 고양이의 핵심 항목만 한 번에 저장합니다.</Typography>
          </Box>
          <TextField
            label="기록 날짜"
            type="date"
            value={date}
            onChange={event => onDateChange(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            size="small"
          />
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {cats.map(cat => {
            const draft = drafts[cat.id];
            if (!draft) return null;
            const changed = changedCatIds.includes(cat.id);
            return (
              <Box
                key={cat.id}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: changed ? "primary.main" : "divider",
                  backgroundColor: changed ? "rgba(139,92,246,0.06)" : "var(--surface)",
                }}
              >
                <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: cat.focusCare ? "primary.main" : "secondary.main" }}>
                    <PetsRounded fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography fontWeight={800}>{cat.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {cat.focusCare ? "집중관리" : cat.isSenior ? "노묘" : "일반관리"}
                    </Typography>
                  </Box>
                </Stack>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(7, minmax(110px, 1fr))" },
                    gap: 1.25,
                    alignItems: "center",
                  }}
                >
                  <TextField label="물 마심(회)" type="number" size="small" value={draft.waterCount} onChange={event => update(cat.id, "waterCount", event.target.value)} slotProps={{ htmlInput: { min: 0, step: 1 } }} />
                  <TextField label="소변(회)" type="number" size="small" value={draft.urineCount} onChange={event => update(cat.id, "urineCount", event.target.value)} />
                  <TextField label="대변(회)" type="number" size="small" value={draft.stoolCount} onChange={event => update(cat.id, "stoolCount", event.target.value)} />
                  <TextField label="체중(kg)" type="number" size="small" value={draft.weightKg} onChange={event => update(cat.id, "weightKg", event.target.value)} />
                  <FormControl size="small">
                    <InputLabel>식욕</InputLabel>
                    <Select label="식욕" value={draft.appetite} onChange={event => update(cat.id, "appetite", event.target.value as AppetiteLevel)}>
                      <MenuItem value="good">좋음</MenuItem>
                      <MenuItem value="normal">평소</MenuItem>
                      <MenuItem value="low">감소</MenuItem>
                      <MenuItem value="none">먹지 않음</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small">
                    <InputLabel>신뢰도</InputLabel>
                    <Select label="신뢰도" value={draft.confidence} onChange={event => update(cat.id, "confidence", event.target.value as MeasurementConfidence)}>
                      <MenuItem value="high">직접 확인</MenuItem>
                      <MenuItem value="medium">대부분 확인</MenuItem>
                      <MenuItem value="low">추정</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControlLabel
                    control={<Checkbox checked={draft.medicationDone} onChange={event => update(cat.id, "medicationDone", event.target.checked)} disabled={!cat.medications.length} />}
                    label={cat.medications.length ? "투약 완료" : "등록 약 없음"}
                  />
                </Box>
              </Box>
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: "auto" }}>
          {changedCatIds.length}마리 변경됨
        </Typography>
        <Button onClick={onClose} color="inherit">취소</Button>
        <Button onClick={save} variant="contained" disabled={!changedCatIds.length}>빠른 기록 저장</Button>
      </DialogActions>
    </Dialog>
  );
}
