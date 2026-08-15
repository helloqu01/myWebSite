"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
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
import type { CatProfile, CatSex, Medication } from "@/types/cat-care";
import { createId } from "@/lib/cat-care/storage";
import { getCatAge } from "@/lib/cat-care/insights";

interface CatProfileDialogProps {
  open: boolean;
  profile: CatProfile | null;
  onClose: () => void;
  onSave: (profile: CatProfile) => void;
}

interface ProfileDraft {
  name: string;
  birthDate: string;
  sex: CatSex;
  neutered: boolean;
  isSenior: boolean;
  focusCare: boolean;
  currentWeightKg: string;
  targetWeightKg: string;
  conditions: string;
  medications: string;
  vetTargets: string;
  notes: string;
}

const emptyDraft: ProfileDraft = {
  name: "",
  birthDate: "",
  sex: "unknown",
  neutered: true,
  isSenior: false,
  focusCare: false,
  currentWeightKg: "",
  targetWeightKg: "",
  conditions: "",
  medications: "",
  vetTargets: "",
  notes: "",
};

function profileToDraft(profile: CatProfile): ProfileDraft {
  return {
    name: profile.name,
    birthDate: profile.birthDate,
    sex: profile.sex,
    neutered: profile.neutered,
    isSenior: profile.isSenior,
    focusCare: profile.focusCare,
    currentWeightKg: profile.currentWeightKg?.toString() ?? "",
    targetWeightKg: profile.targetWeightKg?.toString() ?? "",
    conditions: profile.conditions.join(", "),
    medications: profile.medications
      .map(item => `${item.name}${item.scheduleNote ? ` | ${item.scheduleNote}` : ""}`)
      .join("\n"),
    vetTargets: profile.vetTargets,
    notes: profile.notes,
  };
}

function parseNullableNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseMedications(value: string, existing: Medication[]): Medication[] {
  return value
    .split(/\n|,/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [name, ...scheduleParts] = line.split("|").map(part => part.trim());
      const old = existing.find(item => item.name === name);
      return {
        id: old?.id ?? createId("med"),
        name,
        scheduleNote: scheduleParts.join(" | "),
        stockCount: old?.stockCount ?? null,
        refillThreshold: old?.refillThreshold ?? null,
        stockUnit: old?.stockUnit ?? "회분",
      };
    });
}

export default function CatProfileDialog({
  open,
  profile,
  onClose,
  onSave,
}: CatProfileDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [draft, setDraft] = useState<ProfileDraft>(emptyDraft);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setDraft(profile ? profileToDraft(profile) : emptyDraft);
    setError("");
  }, [open, profile]);

  const age = useMemo(() => getCatAge(draft.birthDate), [draft.birthDate]);

  const update = <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) => {
    setDraft(current => ({ ...current, [key]: value }));
  };

  const handleBirthDate = (value: string) => {
    const calculatedAge = getCatAge(value);
    setDraft(current => ({
      ...current,
      birthDate: value,
      isSenior: calculatedAge != null ? calculatedAge >= 10 : current.isSenior,
      focusCare: calculatedAge != null && calculatedAge >= 10 ? true : current.focusCare,
    }));
  };

  const handleSave = () => {
    if (!draft.name.trim()) {
      setError("이름을 입력해 주세요.");
      return;
    }

    const now = new Date().toISOString();
    onSave({
      id: profile?.id ?? createId("cat"),
      name: draft.name.trim(),
      birthDate: draft.birthDate,
      sex: draft.sex,
      neutered: draft.neutered,
      isSenior: draft.isSenior,
      focusCare: draft.focusCare,
      currentWeightKg: parseNullableNumber(draft.currentWeightKg),
      targetWeightKg: parseNullableNumber(draft.targetWeightKg),
      conditions: draft.conditions
        .split(",")
        .map(item => item.trim())
        .filter(Boolean),
      medications: parseMedications(draft.medications, profile?.medications ?? []),
      vetTargets: draft.vetTargets.trim(),
      notes: draft.notes.trim(),
      createdAt: profile?.createdAt ?? now,
      updatedAt: now,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" fullScreen={fullScreen}>
      <DialogTitle>{profile ? `${profile.name} 프로필 수정` : "고양이 등록"}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.25} sx={{ pt: 0.5 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="이름"
            value={draft.name}
            onChange={event => update("name", event.target.value)}
            required
            autoFocus
            fullWidth
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="생년월일"
              type="date"
              value={draft.birthDate}
              onChange={event => handleBirthDate(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              helperText={age == null ? "모르면 비워 두어도 됩니다." : `현재 만 ${age}살`}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="cat-sex-label">성별</InputLabel>
              <Select
                labelId="cat-sex-label"
                label="성별"
                value={draft.sex}
                onChange={event => update("sex", event.target.value as CatSex)}
              >
                <MenuItem value="female">암컷</MenuItem>
                <MenuItem value="male">수컷</MenuItem>
                <MenuItem value="unknown">모름</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={0.5}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={draft.neutered}
                  onChange={event => update("neutered", event.target.checked)}
                />
              }
              label="중성화 완료"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={draft.isSenior}
                  onChange={event => update("isSenior", event.target.checked)}
                />
              }
              label="노묘"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={draft.focusCare}
                  onChange={event => update("focusCare", event.target.checked)}
                />
              }
              label="집중관리"
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="현재 체중"
              type="number"
              value={draft.currentWeightKg}
              onChange={event => update("currentWeightKg", event.target.value)}
              slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
              InputProps={{ endAdornment: <Typography color="text.secondary">kg</Typography> }}
              fullWidth
            />
            <TextField
              label="목표 체중"
              type="number"
              value={draft.targetWeightKg}
              onChange={event => update("targetWeightKg", event.target.value)}
              slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
              InputProps={{ endAdornment: <Typography color="text.secondary">kg</Typography> }}
              fullWidth
            />
          </Stack>

          <TextField
            label="진단 질환"
            value={draft.conditions}
            onChange={event => update("conditions", event.target.value)}
            placeholder="예: 만성 신장질환, 관절염"
            helperText="여러 항목은 쉼표로 구분해 주세요."
            fullWidth
          />

          <TextField
            label="복용약·영양제 이름"
            value={draft.medications}
            onChange={event => update("medications", event.target.value)}
            placeholder={"예: 신장약\n오메가3"}
            helperText="한 줄에 하나씩 약 이름을 등록하세요. 매일·매주·매달 주기와 시간은 ‘투약 관리’에서 설정합니다."
            minRows={3}
            multiline
            fullWidth
          />

          <TextField
            label="주치의 목표·관리 기준"
            value={draft.vetTargets}
            onChange={event => update("vetTargets", event.target.value)}
            placeholder="예: 목표 체중 4.2kg, 물 마시는 횟수 변화 시 병원 연락"
            minRows={2}
            multiline
            fullWidth
          />

          <TextField
            label="기타 메모"
            value={draft.notes}
            onChange={event => update("notes", event.target.value)}
            minRows={2}
            multiline
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">취소</Button>
        <Button onClick={handleSave} variant="contained">저장</Button>
      </DialogActions>
    </Dialog>
  );
}
