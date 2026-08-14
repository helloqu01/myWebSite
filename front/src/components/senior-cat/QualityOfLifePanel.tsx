"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import AddTaskRounded from "@mui/icons-material/AddTaskRounded";
import FavoriteRounded from "@mui/icons-material/FavoriteRounded";
import type { CatProfile, QualityOfLifeCheck } from "@/types/cat-care";
import { createId, toLocalDateKey } from "@/lib/cat-care/storage";

interface QualityOfLifePanelProps {
  cat: CatProfile;
  checks: QualityOfLifeCheck[];
  openRequestKey: number;
  onSave: (check: QualityOfLifeCheck) => void;
}

const categories: Array<{ key: keyof Pick<QualityOfLifeCheck, "appetite" | "painComfort" | "hygiene" | "mobility" | "interaction" | "sleep">; label: string; hint: string }> = [
  { key: "appetite", label: "식욕", hint: "스스로 충분히 먹는지" },
  { key: "painComfort", label: "편안함", hint: "통증 없이 편안해 보이는지" },
  { key: "hygiene", label: "청결", hint: "그루밍과 배변 후 청결 유지" },
  { key: "mobility", label: "활동·이동", hint: "걷기, 점프, 화장실 접근" },
  { key: "interaction", label: "교감", hint: "사람·다른 고양이와의 반응" },
  { key: "sleep", label: "수면", hint: "평소 수면 리듬과 안정감" },
];

function blankCheck(catId: string): QualityOfLifeCheck {
  return {
    id: createId("quality-life"),
    catId,
    date: toLocalDateKey(new Date()),
    appetite: 3,
    painComfort: 3,
    hygiene: 3,
    mobility: 3,
    interaction: 3,
    sleep: 3,
    notes: "",
    updatedAt: new Date().toISOString(),
  };
}

export function qualityOfLifeScore(check: QualityOfLifeCheck): number {
  const total = categories.reduce((sum, category) => sum + check[category.key], 0);
  return Math.round((total / (categories.length * 4)) * 100);
}

function scoreColor(score: number): "success" | "warning" | "error" {
  if (score >= 75) return "success";
  if (score >= 50) return "warning";
  return "error";
}

export default function QualityOfLifePanel({ cat, checks, openRequestKey, onSave }: QualityOfLifePanelProps) {
  const catChecks = useMemo(
    () => checks.filter(check => check.catId === cat.id).sort((a, b) => b.date.localeCompare(a.date)),
    [cat.id, checks],
  );
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<QualityOfLifeCheck>(() => blankCheck(cat.id));
  const latest = catChecks[0];
  const previous = catChecks[1];
  const latestScore = latest ? qualityOfLifeScore(latest) : null;
  const change = latest && previous ? qualityOfLifeScore(latest) - qualityOfLifeScore(previous) : null;

  const openCheck = () => {
    const today = toLocalDateKey(new Date());
    setDraft(catChecks.find(check => check.date === today) ?? blankCheck(cat.id));
    setOpen(true);
  };

  useEffect(() => {
    if (openRequestKey > 0) openCheck();
  }, [openRequestKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = <K extends keyof QualityOfLifeCheck>(key: K, value: QualityOfLifeCheck[K]) => {
    setDraft(current => ({ ...current, [key]: value }));
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: "1px solid var(--card-border)", borderRadius: 4 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center"><FavoriteRounded color="primary" /><Typography variant="h6" fontWeight={800}>삶의 질 점수</Typography></Stack>
          <Typography variant="body2" color="text.secondary">식욕·편안함·청결·이동·교감·수면을 같은 기준으로 반복 관찰합니다.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddTaskRounded />} onClick={openCheck}>오늘 평가</Button>
      </Stack>

      {latest && latestScore != null ? (
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="h4" fontWeight={900}>{latestScore}점</Typography>
            <Chip size="small" color={scoreColor(latestScore)} label={latest.date} />
            {change != null && <Chip size="small" variant="outlined" color={change <= -20 ? "error" : change < 0 ? "warning" : "success"} label={`이전 대비 ${change > 0 ? "+" : ""}${change}점`} />}
          </Stack>
          {change != null && change <= -20 && <Alert severity="warning">이전 평가보다 점수가 크게 낮아졌습니다. 변화한 항목과 메모를 병원 상담 자료로 활용하세요.</Alert>}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1 }}>
            {catChecks.slice(0, 8).map(check => {
              const score = qualityOfLifeScore(check);
              return <Box key={check.id} sx={{ p: 1.25, bgcolor: "var(--surface)", borderRadius: 2 }}><Stack direction="row" justifyContent="space-between"><Typography variant="body2" fontWeight={800}>{check.date}</Typography><Typography variant="body2">{score}점</Typography></Stack><LinearProgress variant="determinate" value={score} color={scoreColor(score)} sx={{ mt: 0.75, height: 7, borderRadius: 5 }} /></Box>;
            })}
          </Box>
          {latest.notes && <Typography variant="body2">{latest.notes}</Typography>}
        </Stack>
      ) : <Typography color="text.secondary" sx={{ py: 2 }}>아직 삶의 질 평가 기록이 없습니다.</Typography>}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{cat.name} 삶의 질 평가 · {qualityOfLifeScore(draft)}점</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Alert severity="info">0은 매우 어려움, 4는 평소처럼 좋음입니다. 점수 자체보다 같은 기준으로 기록한 변화 추세를 확인하세요.</Alert>
            <TextField label="평가 날짜" type="date" value={draft.date} onChange={event => update("date", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ maxWidth: 240 }} />
            {categories.map(category => (
              <Stack key={category.key} direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "center" }} gap={1}>
                <Box><Typography fontWeight={800}>{category.label}</Typography><Typography variant="caption" color="text.secondary">{category.hint}</Typography></Box>
                <ToggleButtonGroup exclusive size="small" value={draft[category.key]} onChange={(_, value: number | null) => value != null && update(category.key, value)}>
                  {[0, 1, 2, 3, 4].map(value => <ToggleButton key={value} value={value} color={value <= 1 ? "error" : value === 2 ? "warning" : "success"}>{value}</ToggleButton>)}
                </ToggleButtonGroup>
              </Stack>
            ))}
            <TextField label="평가 메모" value={draft.notes} onChange={event => update("notes", event.target.value)} placeholder="어떤 점이 평소와 달랐는지 기록해 주세요." multiline minRows={3} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}><Button color="inherit" onClick={() => setOpen(false)}>취소</Button><Button variant="contained" onClick={() => { onSave({ ...draft, catId: cat.id, updatedAt: new Date().toISOString() }); setOpen(false); }}>저장</Button></DialogActions>
      </Dialog>
    </Paper>
  );
}
