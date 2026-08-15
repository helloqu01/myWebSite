"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import AddTaskRounded from "@mui/icons-material/AddTaskRounded";
import AccessibilityNewRounded from "@mui/icons-material/AccessibilityNewRounded";
import FavoriteRounded from "@mui/icons-material/FavoriteRounded";
import type { CatProfile, ObservationLevel, QualityOfLifeCheck, WeeklyWellnessCheck } from "@/types/cat-care";
import { createId, toLocalDateKey } from "@/lib/cat-care/storage";

interface WeeklyWellnessPanelProps {
  cat: CatProfile;
  checks: WeeklyWellnessCheck[];
  qualityChecks: QualityOfLifeCheck[];
  openRequestKey?: number;
  onSave: (check: WeeklyWellnessCheck, qualityCheck: QualityOfLifeCheck) => void;
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

const qualityCategories: Array<{ key: keyof Pick<QualityOfLifeCheck, "appetite" | "painComfort" | "hygiene" | "mobility" | "interaction" | "sleep">; label: string; hint: string }> = [
  { key: "appetite", label: "식욕", hint: "스스로 충분히 먹는지" },
  { key: "painComfort", label: "편안함", hint: "통증 없이 편안해 보이는지" },
  { key: "hygiene", label: "청결", hint: "그루밍과 배변 후 청결 유지" },
  { key: "mobility", label: "활동·이동", hint: "걷기, 점프, 화장실 접근" },
  { key: "interaction", label: "교감", hint: "사람·다른 고양이와의 반응" },
  { key: "sleep", label: "수면", hint: "평소 수면 리듬과 안정감" },
];

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
    weightKg: null,
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
    jumpingDifficulty: false,
    stairDifficulty: false,
    limping: false,
    disorientation: false,
    nightVocalizationCount: null,
    hidingHours: null,
    notes: "",
    updatedAt: new Date().toISOString(),
  };
}

function emptyQualityCheck(catId: string): QualityOfLifeCheck {
  return { id: createId("quality-life"), catId, date: toLocalDateKey(new Date()), appetite: 3, painComfort: 3, hygiene: 3, mobility: 3, interaction: 3, sleep: 3, notes: "", updatedAt: new Date().toISOString() };
}

function qualityScore(check: QualityOfLifeCheck): number {
  const total = qualityCategories.reduce((sum, category) => sum + check[category.key], 0);
  return Math.round(total / (qualityCategories.length * 4) * 100);
}

function scoreColor(score: number): "success" | "warning" | "error" {
  if (score >= 75) return "success";
  if (score >= 50) return "warning";
  return "error";
}

function concernCount(check: WeeklyWellnessCheck): number {
  return observations.filter(item => check[item.key] !== "usual").length
    + [check.jumpingDifficulty, check.stairDifficulty, check.limping, check.disorientation].filter(Boolean).length;
}

export default function WeeklyWellnessPanel({ cat, checks, qualityChecks, openRequestKey = 0, onSave }: WeeklyWellnessPanelProps) {
  const catChecks = checks.filter(check => check.catId === cat.id).sort((a, b) => b.date.localeCompare(a.date));
  const catQualityChecks = qualityChecks.filter(check => check.catId === cat.id).sort((a, b) => b.date.localeCompare(a.date));
  const latest = catChecks[0];
  const latestQuality = catQualityChecks[0];
  const previousQuality = catQualityChecks[1];
  const latestQualityScore = latestQuality ? qualityScore(latestQuality) : null;
  const qualityChange = latestQuality && previousQuality ? qualityScore(latestQuality) - qualityScore(previousQuality) : null;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<WeeklyWellnessCheck>(() => emptyCheck(cat.id));
  const [qualityDraft, setQualityDraft] = useState<QualityOfLifeCheck>(() => emptyQualityCheck(cat.id));

  useEffect(() => {
    if (!open) return;
    const today = toLocalDateKey(new Date());
    const todayCheck = catChecks.find(check => check.date === today);
    const todayQuality = catQualityChecks.find(check => check.date === today);
    const nextQuality = todayQuality ? { ...todayQuality } : emptyQualityCheck(cat.id);
    const nextCheck = todayCheck ? { ...todayCheck } : emptyCheck(cat.id);
    if (!nextCheck.notes && nextQuality.notes) nextCheck.notes = nextQuality.notes;
    setDraft(nextCheck);
    setQualityDraft(nextQuality);
  }, [cat.id, open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (openRequestKey > 0) setOpen(true);
  }, [openRequestKey]);

  const update = <K extends keyof WeeklyWellnessCheck>(key: K, value: WeeklyWellnessCheck[K]) => {
    setDraft(current => ({ ...current, [key]: value }));
  };

  const updateQuality = <K extends keyof QualityOfLifeCheck>(key: K, value: QualityOfLifeCheck[K]) => {
    setQualityDraft(current => ({ ...current, [key]: value }));
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: "1px solid var(--card-border)", borderRadius: 4 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center"><AccessibilityNewRounded color="primary" /><Typography variant="h6" fontWeight={800}>주간 건강·삶의 질 체크</Typography></Stack>
          <Typography variant="body2" color="text.secondary">체중·이동·행동과 삶의 질 점수를 일주일에 한 번 함께 확인합니다.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddTaskRounded />} onClick={() => setOpen(true)}>통합 주간 체크</Button>
      </Stack>

      {latest ? (
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography fontWeight={800}>최근 {latest.date}</Typography>
            {latest.weightKg != null && <Chip label={`체중 ${latest.weightKg}kg`} color="primary" variant="outlined" size="small" />}
            <Chip label={concernCount(latest) ? `변화 ${concernCount(latest)}개` : "모두 평소"} color={concernCount(latest) ? "warning" : "success"} size="small" />
            {latest.bodyConditionScore != null && <Chip label={`BCS ${latest.bodyConditionScore}/9`} variant="outlined" size="small" />}
            {latest.muscleConditionScore != null && <Chip label={`MCS ${latest.muscleConditionScore}/3`} variant="outlined" size="small" />}
            {latest.systolicBloodPressure != null && <Chip label={`혈압 ${latest.systolicBloodPressure}${latest.diastolicBloodPressure != null ? `/${latest.diastolicBloodPressure}` : ""}`} variant="outlined" size="small" />}
            {latestQualityScore != null && <Chip icon={<FavoriteRounded />} label={`삶의 질 ${latestQualityScore}점`} color={scoreColor(latestQualityScore)} size="small" />}
            {qualityChange != null && <Chip label={`이전 대비 ${qualityChange > 0 ? "+" : ""}${qualityChange}점`} color={qualityChange <= -20 ? "error" : qualityChange < 0 ? "warning" : "success"} variant="outlined" size="small" />}
          </Stack>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 1 }}>
            {observations.map(item => <Box key={item.key} sx={{ p: 1.25, bgcolor: "var(--surface)", borderRadius: 2 }}><Typography variant="caption" color="text.secondary">{item.label}</Typography><Typography fontWeight={800} color={latest[item.key] === "concerning" ? "error.main" : latest[item.key] === "changed" ? "warning.main" : "success.main"}>{observationLabel[latest[item.key]]}</Typography></Box>)}
          </Box>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {latest.jumpingDifficulty && <Chip size="small" color="warning" label="점프 어려움" />}
            {latest.stairDifficulty && <Chip size="small" color="warning" label="계단 어려움" />}
            {latest.limping && <Chip size="small" color="error" label="절뚝거림" />}
            {latest.disorientation && <Chip size="small" color="warning" label="방향 혼란" />}
            {latest.nightVocalizationCount != null && <Chip size="small" variant="outlined" label={`야간 울음 ${latest.nightVocalizationCount}회`} />}
            {latest.hidingHours != null && <Chip size="small" variant="outlined" label={`숨은 시간 ${latest.hidingHours}시간`} />}
          </Stack>
          {concernCount(latest) >= 2 && <Alert severity="warning">여러 생활 영역에서 변화가 함께 기록되었습니다. 지속되거나 심해지면 기록을 보여주며 동물병원에 상담하세요.</Alert>}
          {latestQualityScore != null && <Box><Stack direction="row" justifyContent="space-between"><Typography variant="caption" color="text.secondary">최근 삶의 질 점수 · {latestQuality?.date}</Typography><Typography variant="caption" fontWeight={800}>{latestQualityScore}점</Typography></Stack><LinearProgress variant="determinate" value={latestQualityScore} color={scoreColor(latestQualityScore)} sx={{ mt: 0.5, height: 7, borderRadius: 5 }} /></Box>}
          {qualityChange != null && qualityChange <= -20 && <Alert severity="warning">이전 주보다 삶의 질 점수가 크게 낮아졌습니다. 변화한 항목과 메모를 병원 상담 자료로 활용하세요.</Alert>}
        </Stack>
      ) : latestQualityScore != null ? (
        <Stack spacing={1}><Typography fontWeight={800}>최근 삶의 질 {latestQualityScore}점 · {latestQuality?.date}</Typography><LinearProgress variant="determinate" value={latestQualityScore} color={scoreColor(latestQualityScore)} sx={{ height: 7, borderRadius: 5 }} /><Typography color="text.secondary" variant="body2">다음 통합 체크에서 체중과 주간 상태도 함께 기록할 수 있습니다.</Typography></Stack>
      ) : <Typography color="text.secondary" sx={{ py: 2 }}>아직 통합 주간 체크 기록이 없습니다.</Typography>}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{cat.name} 주간 건강·삶의 질 체크 · {qualityScore(qualityDraft)}점</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Alert severity="info">일주일에 한 번 같은 조건에서 체중과 생활 변화를 확인하고, 삶의 질은 0~4점의 같은 기준으로 기록해 주세요.</Alert>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="체크 날짜" type="date" value={draft.date} onChange={event => { update("date", event.target.value); updateQuality("date", event.target.value); }} slotProps={{ inputLabel: { shrink: true } }} sx={{ maxWidth: 240 }} />
              <TextField label="이번 주 체중(kg)" type="number" value={draft.weightKg ?? ""} onChange={event => update("weightKg", optionalNumber(event.target.value))} slotProps={{ htmlInput: { min: 0.3, max: 30, step: 0.01 } }} helperText="체중 추세에도 자동 반영됩니다." sx={{ minWidth: 220 }} />
            </Stack>
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
            <Box sx={{ p: 1.5, bgcolor: "var(--surface)", borderRadius: 2.5 }}>
              <Typography fontWeight={800} sx={{ mb: 0.5 }}>구체적인 이동·행동 변화</Typography>
              <Stack direction={{ xs: "column", sm: "row" }} flexWrap="wrap" useFlexGap>
                <FormControlLabel control={<Checkbox checked={draft.jumpingDifficulty} onChange={event => update("jumpingDifficulty", event.target.checked)} />} label="점프가 어려움" />
                <FormControlLabel control={<Checkbox checked={draft.stairDifficulty} onChange={event => update("stairDifficulty", event.target.checked)} />} label="계단 이용 어려움" />
                <FormControlLabel control={<Checkbox checked={draft.limping} onChange={event => update("limping", event.target.checked)} />} label="절뚝거림" />
                <FormControlLabel control={<Checkbox checked={draft.disorientation} onChange={event => update("disorientation", event.target.checked)} />} label="방향 혼란" />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 1 }}>
                <TextField label="야간 울음 횟수" type="number" value={draft.nightVocalizationCount ?? ""} onChange={event => update("nightVocalizationCount", optionalNumber(event.target.value))} slotProps={{ htmlInput: { min: 0 } }} fullWidth />
                <TextField label="하루 중 숨은 시간" type="number" value={draft.hidingHours ?? ""} onChange={event => update("hidingHours", optionalNumber(event.target.value))} slotProps={{ htmlInput: { min: 0, max: 24, step: 0.5 } }} InputProps={{ endAdornment: <Typography color="text.secondary">시간</Typography> }} fullWidth />
              </Stack>
            </Box>
            <Box sx={{ pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}><FavoriteRounded color="primary" /><Typography variant="h6" fontWeight={800}>삶의 질 점수</Typography><Chip label={`${qualityScore(qualityDraft)}점`} color={scoreColor(qualityScore(qualityDraft))} size="small" /></Stack>
              <Typography variant="body2" color="text.secondary">0은 매우 어려움, 4는 평소처럼 좋음입니다.</Typography>
            </Box>
            {qualityCategories.map(category => (
              <Stack key={category.key} direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1}>
                <Box><Typography fontWeight={800}>{category.label}</Typography><Typography variant="caption" color="text.secondary">{category.hint}</Typography></Box>
                <ToggleButtonGroup exclusive size="small" value={qualityDraft[category.key]} onChange={(_, value: number | null) => value != null && updateQuality(category.key, value)}>
                  {[0, 1, 2, 3, 4].map(value => <ToggleButton key={value} value={value} color={value <= 1 ? "error" : value === 2 ? "warning" : "success"}>{value}</ToggleButton>)}
                </ToggleButtonGroup>
              </Stack>
            ))}
            <TextField label="이번 주 메모" value={draft.notes} onChange={event => update("notes", event.target.value)} multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}><Button color="inherit" onClick={() => setOpen(false)}>취소</Button><Button variant="contained" onClick={() => { const updatedAt = new Date().toISOString(); onSave({ ...draft, updatedAt }, { ...qualityDraft, date: draft.date, notes: draft.notes, updatedAt }); setOpen(false); }}>통합 체크 저장</Button></DialogActions>
      </Dialog>
    </Paper>
  );
}
