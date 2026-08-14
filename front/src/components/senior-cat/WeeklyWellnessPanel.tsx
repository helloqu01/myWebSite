"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import AddTaskRounded from "@mui/icons-material/AddTaskRounded";
import AccessibilityNewRounded from "@mui/icons-material/AccessibilityNewRounded";
import type { CatProfile, ObservationLevel, WeeklyWellnessCheck } from "@/types/cat-care";
import { createId, toLocalDateKey } from "@/lib/cat-care/storage";

interface WeeklyWellnessPanelProps {
  cat: CatProfile;
  checks: WeeklyWellnessCheck[];
  onSave: (check: WeeklyWellnessCheck) => void;
}

const observations: Array<{ key: keyof Pick<WeeklyWellnessCheck, "mobility" | "grooming" | "sleep" | "interaction" | "litterBoxUse" | "painResponse">; label: string; hint: string }> = [
  { key: "mobility", label: "이동·점프", hint: "점프, 계단, 걷기" },
  { key: "grooming", label: "그루밍", hint: "털 상태, 발톱 관리" },
  { key: "sleep", label: "수면·숨기", hint: "수면 증가, 숨는 장소" },
  { key: "interaction", label: "상호작용", hint: "놀이, 가족·다른 고양이" },
  { key: "litterBoxUse", label: "화장실 이용", hint: "진입, 실수, 자세" },
  { key: "painResponse", label: "통증 의심", hint: "만짐·안기·빗질 반응" },
];

const observationLabel: Record<ObservationLevel, string> = { usual: "평소", changed: "변화", concerning: "주의" };

function optionalNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function emptyCheck(catId: string): WeeklyWellnessCheck {
  return {
    id: createId("weekly"),
    catId,
    date: toLocalDateKey(new Date()),
    mobility: "usual",
    grooming: "usual",
    sleep: "usual",
    interaction: "usual",
    litterBoxUse: "usual",
    painResponse: "usual",
    bodyConditionScore: null,
    muscleConditionScore: null,
    systolicBloodPressure: null,
    diastolicBloodPressure: null,
    notes: "",
    updatedAt: new Date().toISOString(),
  };
}

function concernCount(check: WeeklyWellnessCheck): number {
  return observations.filter(item => check[item.key] !== "usual").length;
}

export default function WeeklyWellnessPanel({ cat, checks, onSave }: WeeklyWellnessPanelProps) {
  const catChecks = checks.filter(check => check.catId === cat.id).sort((a, b) => b.date.localeCompare(a.date));
  const latest = catChecks[0];
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<WeeklyWellnessCheck>(() => emptyCheck(cat.id));

  useEffect(() => {
    if (!open) return;
    const today = toLocalDateKey(new Date());
    const todayCheck = catChecks.find(check => check.date === today);
    setDraft(todayCheck ? { ...todayCheck } : emptyCheck(cat.id));
  }, [cat.id, open]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = <K extends keyof WeeklyWellnessCheck>(key: K, value: WeeklyWellnessCheck[K]) => {
    setDraft(current => ({ ...current, [key]: value }));
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: "1px solid var(--card-border)", borderRadius: 4 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center"><AccessibilityNewRounded color="primary" /><Typography variant="h6" fontWeight={800}>주간 노묘 체크</Typography></Stack>
          <Typography variant="body2" color="text.secondary">이동성·행동·체형의 작은 변화를 일주일에 한 번 확인합니다.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddTaskRounded />} onClick={() => setOpen(true)}>이번 주 체크</Button>
      </Stack>

      {latest ? (
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography fontWeight={800}>최근 {latest.date}</Typography>
            <Chip label={concernCount(latest) ? `변화 ${concernCount(latest)}개` : "모두 평소"} color={concernCount(latest) ? "warning" : "success"} size="small" />
            {latest.bodyConditionScore != null && <Chip label={`BCS ${latest.bodyConditionScore}/9`} variant="outlined" size="small" />}
            {latest.muscleConditionScore != null && <Chip label={`MCS ${latest.muscleConditionScore}/3`} variant="outlined" size="small" />}
            {latest.systolicBloodPressure != null && <Chip label={`혈압 ${latest.systolicBloodPressure}${latest.diastolicBloodPressure != null ? `/${latest.diastolicBloodPressure}` : ""}`} variant="outlined" size="small" />}
          </Stack>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 1 }}>
            {observations.map(item => <Box key={item.key} sx={{ p: 1.25, bgcolor: "var(--surface)", borderRadius: 2 }}><Typography variant="caption" color="text.secondary">{item.label}</Typography><Typography fontWeight={800} color={latest[item.key] === "concerning" ? "error.main" : latest[item.key] === "changed" ? "warning.main" : "success.main"}>{observationLabel[latest[item.key]]}</Typography></Box>)}
          </Box>
          {concernCount(latest) >= 2 && <Alert severity="warning">여러 생활 영역에서 변화가 함께 기록되었습니다. 지속되거나 심해지면 기록을 보여주며 동물병원에 상담하세요.</Alert>}
        </Stack>
      ) : <Typography color="text.secondary" sx={{ py: 2 }}>아직 주간 체크 기록이 없습니다.</Typography>}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{cat.name} 주간 상태 체크</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Alert severity="info">평소와 비교해 기록해 주세요. 이 점수는 진단이 아니라 보호자 관찰을 일정하게 남기기 위한 도구입니다.</Alert>
            <TextField label="체크 날짜" type="date" value={draft.date} onChange={event => update("date", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ maxWidth: 240 }} />
            {observations.map(item => (
              <Stack key={item.key} direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1}>
                <Box><Typography fontWeight={800}>{item.label}</Typography><Typography variant="caption" color="text.secondary">{item.hint}</Typography></Box>
                <ToggleButtonGroup exclusive size="small" value={draft[item.key]} onChange={(_, value: ObservationLevel | null) => value && update(item.key, value)}>
                  <ToggleButton value="usual" color="success">평소</ToggleButton><ToggleButton value="changed" color="warning">변화 있음</ToggleButton><ToggleButton value="concerning" color="error">주의 필요</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            ))}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 1.5 }}>
              <TextField label="BCS (1~9)" type="number" value={draft.bodyConditionScore ?? ""} onChange={event => update("bodyConditionScore", optionalNumber(event.target.value))} slotProps={{ htmlInput: { min: 1, max: 9 } }} />
              <TextField label="MCS (0~3)" type="number" value={draft.muscleConditionScore ?? ""} onChange={event => update("muscleConditionScore", optionalNumber(event.target.value))} slotProps={{ htmlInput: { min: 0, max: 3 } }} />
              <TextField label="수축기 혈압" type="number" value={draft.systolicBloodPressure ?? ""} onChange={event => update("systolicBloodPressure", optionalNumber(event.target.value))} helperText="병원 측정값" />
              <TextField label="이완기 혈압" type="number" value={draft.diastolicBloodPressure ?? ""} onChange={event => update("diastolicBloodPressure", optionalNumber(event.target.value))} helperText="선택 입력" />
            </Box>
            <TextField label="이번 주 메모" value={draft.notes} onChange={event => update("notes", event.target.value)} multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}><Button color="inherit" onClick={() => setOpen(false)}>취소</Button><Button variant="contained" onClick={() => { onSave({ ...draft, updatedAt: new Date().toISOString() }); setOpen(false); }}>저장</Button></DialogActions>
      </Dialog>
    </Paper>
  );
}
