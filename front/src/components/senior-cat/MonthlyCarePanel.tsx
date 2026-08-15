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
import FactCheckRounded from "@mui/icons-material/FactCheckRounded";
import type { CatProfile, MonthlyCareCheck, ObservationLevel } from "@/types/cat-care";
import { createId, toLocalDateKey } from "@/lib/cat-care/storage";

interface MonthlyCarePanelProps {
  cat: CatProfile;
  checks: MonthlyCareCheck[];
  openRequestKey?: number;
  onSave: (check: MonthlyCareCheck) => void;
}

const categories: Array<{
  key: keyof Pick<MonthlyCareCheck, "oralHealth" | "skinAndLumps" | "nailsAndPaws" | "homeAccessibility" | "litterBoxAccessibility" | "foodWaterAccessibility">;
  label: string;
  hint: string;
}> = [
  { key: "oralHealth", label: "치아·잇몸·입", hint: "입 냄새, 침 흘림, 붉은 잇몸, 씹기 불편함" },
  { key: "skinAndLumps", label: "피부·몸의 혹", hint: "새로운 혹, 상처, 붉음, 탈모, 만질 때 불편함" },
  { key: "nailsAndPaws", label: "발톱·발바닥", hint: "과도하게 긴 발톱, 갈라짐, 발바닥 상처" },
  { key: "homeAccessibility", label: "이동 환경", hint: "미끄럼 방지, 계단·발판, 따뜻한 잠자리" },
  { key: "litterBoxAccessibility", label: "화장실 접근", hint: "낮은 입구, 이동 거리, 편한 배변 자세" },
  { key: "foodWaterAccessibility", label: "사료·물 접근", hint: "쉽게 닿는 위치와 충분한 급수 공간" },
];

const observationLabel: Record<ObservationLevel, string> = {
  usual: "문제 없음",
  changed: "변화 있음",
  concerning: "주의 필요",
};

function emptyCheck(catId: string): MonthlyCareCheck {
  return {
    id: createId("monthly-care"),
    catId,
    date: toLocalDateKey(new Date()),
    oralHealth: "usual",
    skinAndLumps: "usual",
    nailsAndPaws: "usual",
    homeAccessibility: "usual",
    litterBoxAccessibility: "usual",
    foodWaterAccessibility: "usual",
    notes: "",
    updatedAt: new Date().toISOString(),
  };
}

function concernCount(check: MonthlyCareCheck): number {
  return categories.filter(category => check[category.key] !== "usual").length;
}

export default function MonthlyCarePanel({ cat, checks, openRequestKey = 0, onSave }: MonthlyCarePanelProps) {
  const catChecks = checks.filter(check => check.catId === cat.id).sort((a, b) => b.date.localeCompare(a.date));
  const latest = catChecks[0];
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<MonthlyCareCheck>(() => emptyCheck(cat.id));

  useEffect(() => {
    if (!open) return;
    const today = toLocalDateKey(new Date());
    const todayCheck = catChecks.find(check => check.date === today);
    setDraft(todayCheck ? { ...todayCheck } : emptyCheck(cat.id));
  }, [cat.id, open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (openRequestKey > 0) setOpen(true);
  }, [openRequestKey]);

  const update = <K extends keyof MonthlyCareCheck>(key: K, value: MonthlyCareCheck[K]) => {
    setDraft(current => ({ ...current, [key]: value }));
  };

  return (
    <Paper id="monthly-care-section" elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: "1px solid var(--card-border)", borderRadius: 4, scrollMarginTop: 96 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center"><FactCheckRounded color="primary" /><Typography variant="h6" fontWeight={800}>월간 생활환경·몸 점검</Typography></Stack>
          <Typography variant="body2" color="text.secondary">치아·잇몸, 피부와 혹, 발톱, 화장실과 생활환경을 한 달에 한 번 확인합니다.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<AddTaskRounded />} onClick={() => setOpen(true)}>월간 점검</Button>
      </Stack>

      {latest ? (
        <Stack spacing={1.25}>
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography fontWeight={800}>최근 {latest.date}</Typography>
            <Chip size="small" color={concernCount(latest) ? "warning" : "success"} label={concernCount(latest) ? `변화 ${concernCount(latest)}개` : "모두 문제 없음"} />
          </Stack>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 1 }}>
            {categories.map(category => (
              <Box key={category.key} sx={{ p: 1.1, bgcolor: "var(--surface)", borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">{category.label}</Typography>
                <Typography variant="body2" fontWeight={800} color={latest[category.key] === "concerning" ? "error.main" : latest[category.key] === "changed" ? "warning.main" : "success.main"}>{observationLabel[latest[category.key]]}</Typography>
              </Box>
            ))}
          </Box>
          {latest.notes && <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{latest.notes}</Typography>}
        </Stack>
      ) : <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>아직 월간 점검 기록이 없습니다.</Typography>}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{cat.name} 월간 생활환경·몸 점검</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.25}>
            <Alert severity="info">한 달에 한 번 밝은 곳에서 몸을 천천히 만져보고, 고양이가 불편해하면 억지로 확인하지 마세요.</Alert>
            <TextField label="점검 날짜" type="date" value={draft.date} onChange={event => update("date", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ maxWidth: 240 }} />
            {categories.map(category => (
              <Stack key={category.key} direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1}>
                <Box><Typography fontWeight={800}>{category.label}</Typography><Typography variant="caption" color="text.secondary">{category.hint}</Typography></Box>
                <ToggleButtonGroup exclusive size="small" value={draft[category.key]} onChange={(_, value: ObservationLevel | null) => value && update(category.key, value)}>
                  <ToggleButton value="usual" color="success">문제 없음</ToggleButton>
                  <ToggleButton value="changed" color="warning">변화 있음</ToggleButton>
                  <ToggleButton value="concerning" color="error">주의 필요</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            ))}
            <TextField label="월간 점검 메모" value={draft.notes} onChange={event => update("notes", event.target.value)} placeholder="혹의 위치, 구강 상태, 환경을 바꾼 내용 등" multiline minRows={3} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}><Button color="inherit" onClick={() => setOpen(false)}>취소</Button><Button variant="contained" onClick={() => { onSave({ ...draft, catId: cat.id, updatedAt: new Date().toISOString() }); setOpen(false); }}>월간 점검 저장</Button></DialogActions>
      </Dialog>
    </Paper>
  );
}
