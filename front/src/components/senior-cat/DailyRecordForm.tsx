"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SaveRounded from "@mui/icons-material/SaveRounded";
import AccessTimeRounded from "@mui/icons-material/AccessTimeRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import MedicationRounded from "@mui/icons-material/MedicationRounded";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import type {
  ActivityLevel,
  AppetiteLevel,
  CatProfile,
  DailyRecord,
  FoodItem,
  MeasurementConfidence,
  SeizureSeverity,
  SizeLevel,
  TimedCareEvent,
  TimedCareEventType,
} from "@/types/cat-care";
import { createId } from "@/lib/cat-care/storage";

interface DailyRecordFormProps {
  cat: CatProfile;
  foodItems: FoodItem[];
  date: string;
  record: DailyRecord | null;
  onDateChange: (date: string) => void;
  onSave: (record: DailyRecord) => void;
}

function emptyRecord(cat: CatProfile, date: string): DailyRecord {
  return {
    id: createId("record"),
    catId: cat.id,
    date,
    waterCount: null,
    urineCount: null,
    urineSize: null,
    stoolCount: null,
    stoolAmount: null,
    stoolScore: null,
    appetite: "normal",
    weightKg: cat.currentWeightKg,
    vomitCount: 0,
    activity: "normal",
    measurementConfidence: "high",
    medicationChecks: Object.fromEntries(cat.medications.map(item => [item.id, false])),
    urinationStraining: false,
    urineNotProduced: false,
    bloodInUrine: false,
    breathingDifficulty: false,
    collapseOrSeizure: false,
    timedEvents: [],
    notes: "",
    updatedAt: new Date().toISOString(),
  };
}

const timedEventLabels: Record<TimedCareEventType, string> = {
  water: "물 마심",
  meal: "밥 먹음",
  urine: "소변",
  stool: "대변",
  seizure: "발작",
};

const seizureSeverityLabels: Record<SeizureSeverity, string> = {
  mild: "경미",
  moderate: "중간",
  severe: "심함",
};

function currentTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function syncTimedEventCounts(record: DailyRecord, timedEvents: TimedCareEvent[]): DailyRecord {
  const previousWaterCount = record.timedEvents.filter(event => event.type === "water").length;
  const waterEventCount = timedEvents.filter(event => event.type === "water").length;
  const previousUrineCount = record.timedEvents.filter(event => event.type === "urine").length;
  const previousStoolCount = record.timedEvents.filter(event => event.type === "stool").length;
  const urineEventCount = timedEvents.filter(event => event.type === "urine").length;
  const stoolEventCount = timedEvents.filter(event => event.type === "stool").length;
  const syncCount = (aggregate: number | null, previousCount: number, nextCount: number) => {
    if (previousCount === 0 && nextCount === 0) return aggregate;
    return aggregate == null || aggregate === previousCount || aggregate < nextCount ? nextCount : aggregate;
  };

  return {
    ...record,
    timedEvents,
    waterCount: syncCount(record.waterCount, previousWaterCount, waterEventCount),
    urineCount: syncCount(record.urineCount, previousUrineCount, urineEventCount),
    stoolCount: syncCount(record.stoolCount, previousStoolCount, stoolEventCount),
    collapseOrSeizure: record.collapseOrSeizure || timedEvents.some(event => event.type === "seizure"),
  };
}

function numberOrNull(value: string): number | null {
  if (value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export default function DailyRecordForm({
  cat,
  foodItems,
  date,
  record,
  onDateChange,
  onSave,
}: DailyRecordFormProps) {
  const [draft, setDraft] = useState<DailyRecord>(() => record ?? emptyRecord(cat, date));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(record ?? emptyRecord(cat, date));
    setSaved(false);
  }, [cat, date, record]);

  const update = <K extends keyof DailyRecord>(key: K, value: DailyRecord[K]) => {
    setDraft(current => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const addTimedEvent = (type: TimedCareEventType) => {
    const event: TimedCareEvent = {
      id: createId("care-event"),
      type,
      time: currentTime(),
      amountMl: null,
      amountGrams: null,
      durationSeconds: null,
      severity: null,
      foodItemId: type === "meal"
        ? foodItems.find(item => item.category !== "treat" && item.startDate <= date && (!item.endDate || item.endDate >= date))?.id ?? null
        : null,
      notes: "",
    };
    setDraft(current => syncTimedEventCounts(current, [...current.timedEvents, event]));
    setSaved(false);
  };

  const updateTimedEvent = (id: string, patch: Partial<TimedCareEvent>) => {
    setDraft(current => syncTimedEventCounts(
      current,
      current.timedEvents.map(event => event.id === id ? { ...event, ...patch } : event),
    ));
    setSaved(false);
  };

  const removeTimedEvent = (id: string) => {
    setDraft(current => syncTimedEventCounts(current, current.timedEvents.filter(event => event.id !== id)));
    setSaved(false);
  };

  const handleSave = () => {
    onSave({
      ...draft,
      date,
      catId: cat.id,
      timedEvents: [...draft.timedEvents].sort((a, b) => a.time.localeCompare(b.time)),
      updatedAt: new Date().toISOString(),
    });
    setSaved(true);
  };

  const emergencySelected =
    draft.urineNotProduced
    || draft.breathingDifficulty
    || draft.collapseOrSeizure
    || draft.timedEvents.some(event => event.type === "seizure");
  const mealEvents = draft.timedEvents.filter(event => event.type === "meal");
  const waterEvents = draft.timedEvents.filter(event => event.type === "water");
  const waterEventCount = waterEvents.length;
  const mealTotalGrams = mealEvents.reduce((sum, event) => sum + (event.amountGrams ?? 0), 0);
  const mealCalories = mealEvents.reduce((sum, event) => {
    const food = event.foodItemId ? foodItems.find(item => item.id === event.foodItemId) : null;
    return sum + (event.amountGrams ?? 0) * (food?.caloriesPer100g ?? 0) / 100;
  }, 0);
  const dailyTargetGrams = foodItems
    .filter(item => item.category !== "treat" && item.startDate <= date && (!item.endDate || item.endDate >= date))
    .reduce((sum, item) => sum + (item.dailyTargetGrams ?? 0), 0);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3 },
        border: "1px solid var(--card-border)",
        background: "var(--surface-strong)",
        borderRadius: 4,
      }}
    >
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>하루 기록</Typography>
            <Typography variant="body2" color="text.secondary">
              숫자를 모르면 비워 두고, 확인한 항목만 기록해도 괜찮습니다.
            </Typography>
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

        {emergencySelected && (
          <Alert severity="error" icon={<WarningAmberRounded />}>
            소변이 나오지 않음, 호흡 곤란, 쓰러짐·경련은 즉시 진료가 필요한 증상일 수 있습니다.
            저장이나 추세 분석을 기다리지 말고 동물병원에 연락하세요.
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
            gap: 2,
          }}
        >
          <TextField
            label="물 마신 횟수"
            type="number"
            value={draft.waterCount ?? ""}
            onChange={event => update("waterCount", numberOrNull(event.target.value))}
            slotProps={{ htmlInput: { min: 0, step: 1 } }}
            InputProps={{ endAdornment: <InputAdornment position="end">회</InputAdornment> }}
          />
          <TextField
            label="소변 횟수"
            type="number"
            value={draft.urineCount ?? ""}
            onChange={event => update("urineCount", numberOrNull(event.target.value))}
            slotProps={{ htmlInput: { min: 0, step: 1 } }}
            InputProps={{ endAdornment: <InputAdornment position="end">회</InputAdornment> }}
          />
          <FormControl>
            <InputLabel id="urine-size-label">소변 덩어리</InputLabel>
            <Select
              labelId="urine-size-label"
              label="소변 덩어리"
              value={draft.urineSize ?? ""}
              onChange={event => update("urineSize", (event.target.value || null) as SizeLevel | null)}
            >
              <MenuItem value=""><em>미기록</em></MenuItem>
              <MenuItem value="small">작음</MenuItem>
              <MenuItem value="normal">평소</MenuItem>
              <MenuItem value="large">큼</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="체중"
            type="number"
            value={draft.weightKg ?? ""}
            onChange={event => update("weightKg", numberOrNull(event.target.value))}
            slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
            InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
          />
          <TextField
            label="대변 횟수"
            type="number"
            value={draft.stoolCount ?? ""}
            onChange={event => update("stoolCount", numberOrNull(event.target.value))}
            slotProps={{ htmlInput: { min: 0, step: 1 } }}
            InputProps={{ endAdornment: <InputAdornment position="end">회</InputAdornment> }}
          />
          <FormControl>
            <InputLabel id="stool-amount-label">대변 양</InputLabel>
            <Select
              labelId="stool-amount-label"
              label="대변 양"
              value={draft.stoolAmount ?? ""}
              onChange={event => update("stoolAmount", (event.target.value || null) as SizeLevel | null)}
            >
              <MenuItem value=""><em>미기록</em></MenuItem>
              <MenuItem value="small">적음</MenuItem>
              <MenuItem value="normal">평소</MenuItem>
              <MenuItem value="large">많음</MenuItem>
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel id="stool-score-label">변 상태 점수</InputLabel>
            <Select
              labelId="stool-score-label"
              label="변 상태 점수"
              value={draft.stoolScore ?? ""}
              onChange={event => update("stoolScore", numberOrNull(String(event.target.value)))}
            >
              <MenuItem value=""><em>미기록</em></MenuItem>
              {[1, 2, 3, 4, 5, 6, 7].map(score => (
                <MenuItem value={score} key={score}>{score}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="구토 횟수"
            type="number"
            value={draft.vomitCount}
            onChange={event => update("vomitCount", Math.max(0, Number(event.target.value) || 0))}
            slotProps={{ htmlInput: { min: 0, step: 1 } }}
            InputProps={{ endAdornment: <InputAdornment position="end">회</InputAdornment> }}
          />
          <FormControl>
            <InputLabel id="appetite-label">식욕</InputLabel>
            <Select
              labelId="appetite-label"
              label="식욕"
              value={draft.appetite}
              onChange={event => update("appetite", event.target.value as AppetiteLevel)}
            >
              <MenuItem value="good">좋음</MenuItem>
              <MenuItem value="normal">평소</MenuItem>
              <MenuItem value="low">감소</MenuItem>
              <MenuItem value="none">먹지 않음</MenuItem>
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel id="activity-label">활동성</InputLabel>
            <Select
              labelId="activity-label"
              label="활동성"
              value={draft.activity}
              onChange={event => update("activity", event.target.value as ActivityLevel)}
            >
              <MenuItem value="normal">평소</MenuItem>
              <MenuItem value="low">감소</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ gridColumn: { md: "span 2" } }}>
            <InputLabel id="confidence-label">측정 신뢰도</InputLabel>
            <Select
              labelId="confidence-label"
              label="측정 신뢰도"
              value={draft.measurementConfidence}
              onChange={event =>
                update("measurementConfidence", event.target.value as MeasurementConfidence)
              }
            >
              <MenuItem value="high">높음 · 직접 확인</MenuItem>
              <MenuItem value="medium">보통 · 대부분 확인</MenuItem>
              <MenuItem value="low">낮음 · 공용 그릇/화장실로 추정</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Divider />

        <Box>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={1.5} sx={{ mb: 1.5 }}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <AccessTimeRounded color="primary" fontSize="small" />
                <Typography variant="subtitle1" fontWeight={800}>시간별 물 마심·식사·배변·발작 기록</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                버튼을 누르면 현재 시각이 입력됩니다. 과거 기록은 시각을 직접 수정할 수 있습니다.
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              <Button size="small" variant="outlined" onClick={() => addTimedEvent("water")}>+ 물 마심</Button>
              <Button size="small" variant="outlined" onClick={() => addTimedEvent("meal")}>+ 밥 먹음</Button>
              <Button size="small" variant="outlined" onClick={() => addTimedEvent("urine")}>+ 소변</Button>
              <Button size="small" variant="outlined" onClick={() => addTimedEvent("stool")}>+ 대변</Button>
              <Button size="small" variant="outlined" color="error" onClick={() => addTimedEvent("seizure")}>+ 발작</Button>
            </Stack>
          </Stack>

          {draft.timedEvents.some(event => event.type === "seizure") && (
            <Alert severity="error" sx={{ mb: 1.5 }}>
              발작이 5분 이상 지속되거나 짧은 시간에 반복되면 즉시 동물병원에 연락하세요. 발생 시각과 지속시간을 실제로 재서 기록하는 것이 중요합니다.
            </Alert>
          )}

          {draft.timedEvents.length ? (
            <Stack spacing={1}>
              {[...draft.timedEvents].sort((a, b) => a.time.localeCompare(b.time)).map(event => (
                <Box key={event.id} sx={{ p: 1.5, border: "1px solid", borderColor: event.type === "seizure" ? "error.light" : "divider", borderRadius: 2.5 }}>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: event.type === "seizure" ? "110px 130px 150px 150px 1fr auto" : event.type === "meal" ? "110px 130px minmax(180px, 1fr) 150px minmax(180px, 1fr) auto" : event.type === "water" ? "110px 130px 150px minmax(180px, 1fr) auto" : "110px 130px 1fr auto" }, gap: 1, alignItems: "center" }}>
                    <Chip label={timedEventLabels[event.type]} size="small" color={event.type === "seizure" ? "error" : "primary"} variant={event.type === "seizure" ? "filled" : "outlined"} />
                    <TextField label="발생 시각" type="time" size="small" value={event.time} onChange={change => updateTimedEvent(event.id, { time: change.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
                    {event.type === "meal" && <TextField select label="먹인 사료·간식" size="small" value={event.foodItemId ?? ""} onChange={change => updateTimedEvent(event.id, { foodItemId: change.target.value || null })}><MenuItem value=""><em>미선택</em></MenuItem>{foodItems.map(item => <MenuItem key={item.id} value={item.id}>{item.brand}{item.productName ? ` · ${item.productName}` : ""}</MenuItem>)}</TextField>}
                    {event.type === "meal" && <TextField label="먹은 양" type="number" size="small" value={event.amountGrams ?? ""} onChange={change => updateTimedEvent(event.id, { amountGrams: numberOrNull(change.target.value) })} slotProps={{ htmlInput: { min: 0, step: 1 } }} InputProps={{ endAdornment: <InputAdornment position="end">g</InputAdornment> }} />}
                    {event.type === "seizure" && <TextField label="지속시간" type="number" size="small" value={event.durationSeconds ?? ""} onChange={change => updateTimedEvent(event.id, { durationSeconds: numberOrNull(change.target.value) })} slotProps={{ htmlInput: { min: 0, step: 1 } }} InputProps={{ endAdornment: <InputAdornment position="end">초</InputAdornment> }} />}
                    {event.type === "seizure" && <TextField select label="강도" size="small" value={event.severity ?? ""} onChange={change => updateTimedEvent(event.id, { severity: (change.target.value || null) as SeizureSeverity | null })}><MenuItem value=""><em>미기록</em></MenuItem>{Object.entries(seizureSeverityLabels).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</TextField>}
                    <TextField label={event.type === "seizure" ? "발작 전후·회복 상태 메모" : "메모"} size="small" value={event.notes} onChange={change => updateTimedEvent(event.id, { notes: change.target.value })} placeholder={event.type === "seizure" ? "경련 양상, 의식, 회복까지 걸린 시간" : "선택 입력"} />
                    <IconButton aria-label={`${timedEventLabels[event.type]} 시간 기록 삭제`} color="error" onClick={() => removeTimedEvent(event.id)}><DeleteOutlineRounded /></IconButton>
                  </Box>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>아직 시간별 기록이 없습니다.</Typography>
          )}
          {mealEvents.length > 0 && (
            <Alert severity="info" sx={{ mt: 1.5 }}>
              오늘 기록된 급여량 <strong>{mealTotalGrams}g</strong>
              {dailyTargetGrams > 0 && <> / 등록 목표 <strong>{dailyTargetGrams}g</strong></>}
              {mealCalories > 0 && <> · 약 <strong>{Math.round(mealCalories)}kcal</strong></>}
              <Typography component="span" variant="caption" sx={{ ml: 1 }}>저장하면 선택한 사료 재고에서 급여량이 자동 차감됩니다.</Typography>
            </Alert>
          )}
          {waterEvents.length > 0 && (
            <Alert severity="info" sx={{ mt: 1.5 }}>
              시간별로 기록한 물 마심 <strong>{waterEventCount}회</strong> · 저장하면 오늘 총 횟수에 자동 반영됩니다.
            </Alert>
          )}
        </Box>

        <Divider />

        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <WarningAmberRounded color="warning" fontSize="small" />
            <Typography variant="subtitle1" fontWeight={700}>이상 징후</Typography>
            <Chip label="해당할 때만 체크" size="small" variant="outlined" />
          </Stack>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 0.5,
            }}
          >
            <FormControlLabel
              control={<Checkbox checked={draft.urinationStraining} onChange={event => update("urinationStraining", event.target.checked)} />}
              label="소변을 볼 때 힘을 줌"
            />
            <FormControlLabel
              control={<Checkbox color="error" checked={draft.urineNotProduced} onChange={event => update("urineNotProduced", event.target.checked)} />}
              label="배뇨를 시도하지만 소변이 나오지 않음"
            />
            <FormControlLabel
              control={<Checkbox checked={draft.bloodInUrine} onChange={event => update("bloodInUrine", event.target.checked)} />}
              label="혈뇨가 보임"
            />
            <FormControlLabel
              control={<Checkbox color="error" checked={draft.breathingDifficulty} onChange={event => update("breathingDifficulty", event.target.checked)} />}
              label="호흡이 힘들어 보임"
            />
            <FormControlLabel
              control={<Checkbox color="error" checked={draft.collapseOrSeizure} onChange={event => update("collapseOrSeizure", event.target.checked)} />}
              label="쓰러짐 또는 경련"
            />
          </Box>
        </Box>

        {cat.medications.length > 0 && (
          <>
            <Divider />
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <MedicationRounded color="primary" fontSize="small" />
                <Typography variant="subtitle1" fontWeight={700}>투약 체크</Typography>
              </Stack>
              <Stack spacing={0.5}>
                {cat.medications.map(medication => (
                  <FormControlLabel
                    key={medication.id}
                    control={
                      <Checkbox
                        checked={Boolean(draft.medicationChecks[medication.id])}
                        onChange={event =>
                          update("medicationChecks", {
                            ...draft.medicationChecks,
                            [medication.id]: event.target.checked,
                          })
                        }
                      />
                    }
                    label={
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 0, sm: 1 }}>
                        <Typography>{medication.name}</Typography>
                        {medication.scheduleNote && (
                          <Typography variant="body2" color="text.secondary">
                            {medication.scheduleNote}
                          </Typography>
                        )}
                      </Stack>
                    }
                  />
                ))}
              </Stack>
            </Box>
          </>
        )}

        <TextField
          label="오늘의 메모"
          value={draft.notes}
          onChange={event => update("notes", event.target.value)}
          placeholder="식사, 보행, 그루밍, 야간 울음 등 평소와 달랐던 점"
          minRows={3}
          multiline
          fullWidth
        />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
          <Button
            variant="contained"
            size="large"
            startIcon={<SaveRounded />}
            onClick={handleSave}
            sx={{ minWidth: { xs: "100%", sm: 180 } }}
          >
            {record ? "기록 수정" : "기록 저장"}
          </Button>
          {saved && <Typography color="success.main" variant="body2">이 기기에 안전하게 저장했습니다.</Typography>}
        </Stack>
      </Stack>
    </Paper>
  );
}
