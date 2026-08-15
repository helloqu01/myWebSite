"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import OndemandVideoRounded from "@mui/icons-material/OndemandVideoRounded";
import PetsRounded from "@mui/icons-material/PetsRounded";
import SaveRounded from "@mui/icons-material/SaveRounded";
import type {
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
import { createId, foodAppliesToCat, toLocalDateKey } from "@/lib/cat-care/storage";

interface MultiCatEventLoggerProps {
  cats: CatProfile[];
  records: DailyRecord[];
  foodItems: FoodItem[];
  onSave: (records: DailyRecord[], date: string, rowCount: number) => void;
}

interface DailyDraft {
  waterCount: string;
  urineCount: string;
  stoolCount: string;
  weightKg: string;
  appetite: AppetiteLevel;
  confidence: MeasurementConfidence;
  notes: string;
}

interface LedgerRow {
  id: string;
  time: string;
  catId: string;
  type: TimedCareEventType;
  amount: string;
  size: SizeLevel | "";
  foodItemId: string;
  severity: SeizureSeverity | "";
  notes: string;
}

const eventLabels: Record<TimedCareEventType, string> = {
  water: "물 마심",
  meal: "식사",
  urine: "소변",
  stool: "대변",
  seizure: "발작",
};

const appetiteLabels: Record<AppetiteLevel, string> = {
  good: "좋음",
  normal: "평소",
  low: "감소",
  none: "먹지 않음",
};

const confidenceLabels: Record<MeasurementConfidence, string> = {
  high: "직접 확인",
  medium: "대부분 확인",
  low: "추정",
};

const sizeLabels: Record<SizeLevel, string> = {
  small: "적음",
  normal: "보통",
  large: "많음",
};

function currentTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function blankRow(previous?: LedgerRow): LedgerRow {
  return {
    id: createId("care-event"),
    time: currentTime(),
    catId: previous?.catId ?? "",
    type: previous?.type ?? "urine",
    amount: "",
    size: "",
    foodItemId: "",
    severity: "",
    notes: "",
  };
}

function dailyDraft(record?: DailyRecord): DailyDraft {
  return {
    waterCount: record?.waterCount?.toString() ?? "",
    urineCount: record?.urineCount?.toString() ?? "",
    stoolCount: record?.stoolCount?.toString() ?? "",
    weightKg: record?.weightKg?.toString() ?? "",
    appetite: record?.appetite ?? "normal",
    confidence: record?.measurementConfidence ?? "high",
    notes: record?.notes ?? "",
  };
}

function rowFromEvent(record: DailyRecord, event: TimedCareEvent): LedgerRow {
  return {
    id: event.id,
    time: event.time,
    catId: record.catId,
    type: event.type,
    amount: event.type === "meal"
        ? event.amountGrams?.toString() ?? ""
        : event.type === "seizure"
          ? event.durationSeconds?.toString() ?? ""
          : "",
    size: event.type === "urine" ? record.urineSize ?? "" : event.type === "stool" ? record.stoolAmount ?? "" : "",
    foodItemId: event.foodItemId ?? "",
    severity: event.severity ?? "",
    notes: event.notes,
  };
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
    weightKg: null,
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

function nullableNumber(value: string): number | null {
  if (!value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function positiveNumber(value: string): number | null {
  const number = nullableNumber(value);
  return number != null && number > 0 ? number : null;
}

export default function MultiCatEventLogger({ cats, records, foodItems, onSave }: MultiCatEventLoggerProps) {
  const [date, setDate] = useState(toLocalDateKey(new Date()));
  const [drafts, setDrafts] = useState<Record<string, DailyDraft>>({});
  const [rows, setRows] = useState<LedgerRow[]>([blankRow()]);
  const [changedCatIds, setChangedCatIds] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const dayRecords = records.filter(record => record.date === date);
    setDrafts(Object.fromEntries(cats.map(cat => [
      cat.id,
      dailyDraft(dayRecords.find(record => record.catId === cat.id)),
    ])));
    const existingRows = dayRecords
      .flatMap(record => record.timedEvents.map(event => rowFromEvent(record, event)))
      .sort((a, b) => a.time.localeCompare(b.time));
    setRows(existingRows.length ? existingRows : [blankRow()]);
    setChangedCatIds([]);
    setError("");
  }, [cats, date, records]);

  const markChanged = (...catIds: string[]) => {
    setChangedCatIds(current => [...new Set([...current, ...catIds.filter(Boolean)])]);
  };

  const updateDraft = <K extends keyof DailyDraft>(catId: string, key: K, value: DailyDraft[K]) => {
    setDrafts(current => ({ ...current, [catId]: { ...current[catId], [key]: value } }));
    markChanged(catId);
    setError("");
  };

  const syncDraftCountsWithRows = (previousRows: LedgerRow[], nextRows: LedgerRow[], catIds: string[]) => {
    const count = (source: LedgerRow[], catId: string, type: TimedCareEventType) => source.filter(row => row.catId === catId && row.type === type).length;
    const syncValue = (value: string, previousCount: number, nextCount: number) => {
      if (previousCount === 0 && nextCount === 0) return value;
      const aggregate = nullableNumber(value);
      return String(aggregate == null || aggregate === previousCount || aggregate < nextCount ? nextCount : aggregate);
    };
    setDrafts(current => {
      const updated = { ...current };
      [...new Set(catIds.filter(Boolean))].forEach(catId => {
        const draft = updated[catId];
        if (!draft) return;
        updated[catId] = {
          ...draft,
          waterCount: syncValue(draft.waterCount, count(previousRows, catId, "water"), count(nextRows, catId, "water")),
          urineCount: syncValue(draft.urineCount, count(previousRows, catId, "urine"), count(nextRows, catId, "urine")),
          stoolCount: syncValue(draft.stoolCount, count(previousRows, catId, "stool"), count(nextRows, catId, "stool")),
        };
      });
      return updated;
    });
  };

  const updateRow = (id: string, patch: Partial<LedgerRow>) => {
    const previous = rows.find(row => row.id === id);
    const nextRows = rows.map(row => row.id === id ? { ...row, ...patch } : row);
    setRows(nextRows);
    syncDraftCountsWithRows(rows, nextRows, [previous?.catId ?? "", patch.catId ?? previous?.catId ?? ""]);
    markChanged(previous?.catId ?? "", patch.catId ?? "");
    setError("");
  };

  const addRow = () => {
    const next = blankRow(rows.at(-1));
    const nextRows = [...rows, next];
    setRows(nextRows);
    syncDraftCountsWithRows(rows, nextRows, [next.catId]);
    markChanged(next.catId);
  };
  const duplicateRow = (row: LedgerRow) => {
    const nextRows = [...rows, { ...row, id: createId("care-event") }];
    setRows(nextRows);
    syncDraftCountsWithRows(rows, nextRows, [row.catId]);
    markChanged(row.catId);
  };
  const deleteRow = (id: string) => {
    const deleted = rows.find(row => row.id === id);
    const remaining = rows.filter(row => row.id !== id);
    const nextRows = remaining.length ? remaining : [blankRow()];
    setRows(nextRows);
    syncDraftCountsWithRows(rows, nextRows, [deleted?.catId ?? ""]);
    markChanged(deleted?.catId ?? "");
  };

  const activeRows = rows.filter(row => row.catId);
  const summaries = useMemo(() => cats.map(cat => {
    const draft = drafts[cat.id];
    const assigned = activeRows.filter(row => row.catId === cat.id);
    const mealCount = assigned.filter(row => row.type === "meal").length;
    const eventWaterCount = assigned.filter(row => row.type === "water").length;
    const eventUrineCount = assigned.filter(row => row.type === "urine").length;
    const eventStoolCount = assigned.filter(row => row.type === "stool").length;
    const enteredWaterCount = draft ? nullableNumber(draft.waterCount) : null;
    const enteredUrineCount = draft ? nullableNumber(draft.urineCount) : null;
    const enteredStoolCount = draft ? nullableNumber(draft.stoolCount) : null;
    return {
      cat,
      recorded: changedCatIds.includes(cat.id) || records.some(record => record.catId === cat.id && record.date === date),
      waterCount: enteredWaterCount == null && eventWaterCount === 0 ? "—" : String(Math.max(enteredWaterCount ?? 0, eventWaterCount)),
      urineCount: enteredUrineCount == null && eventUrineCount === 0 ? "—" : String(Math.max(enteredUrineCount ?? 0, eventUrineCount)),
      stoolCount: enteredStoolCount == null && eventStoolCount === 0 ? "—" : String(Math.max(enteredStoolCount ?? 0, eventStoolCount)),
      mealCount,
      eventWaterCount,
      eventUrineCount,
      eventStoolCount,
    };
  }), [activeRows, cats, changedCatIds, date, drafts, records]);

  const save = () => {
    if (!date) {
      setError("기록 날짜를 선택해 주세요.");
      return;
    }
    const incompleteRow = rows.find(row => !row.catId && (row.notes.trim() || row.amount || row.foodItemId || row.severity || row.size));
    if (incompleteRow || activeRows.some(row => !row.time)) {
      setError("시간 기록 행의 고양이와 시각을 확인해 주세요.");
      return;
    }
    if (!changedCatIds.length) {
      setError("변경한 기록이 없습니다.");
      return;
    }

    const now = new Date().toISOString();
    const updatedRecords = cats.flatMap(cat => {
      if (!changedCatIds.includes(cat.id)) return [];
      const draft = drafts[cat.id];
      if (!draft) return [];
      const base = records.find(record => record.catId === cat.id && record.date === date) ?? emptyRecord(cat, date);
      const catRows = activeRows.filter(row => row.catId === cat.id);
      const events: TimedCareEvent[] = catRows.map(row => ({
        id: row.id,
        type: row.type,
        time: row.time,
        amountMl: null,
        amountGrams: row.type === "meal" ? positiveNumber(row.amount) : null,
        durationSeconds: row.type === "seizure" ? positiveNumber(row.amount) : null,
        severity: row.type === "seizure" ? row.severity || null : null,
        foodItemId: row.type === "meal" ? row.foodItemId || null : null,
        notes: row.notes.trim(),
      }));
      const waterFromEvents = events.filter(event => event.type === "water").length;
      const urineFromEvents = events.filter(event => event.type === "urine").length;
      const stoolFromEvents = events.filter(event => event.type === "stool").length;
      const enteredWaterCount = nullableNumber(draft.waterCount);
      const enteredUrineCount = nullableNumber(draft.urineCount);
      const enteredStoolCount = nullableNumber(draft.stoolCount);
      const lastUrineSize = [...catRows].reverse().find(row => row.type === "urine" && row.size)?.size || null;
      const lastStoolSize = [...catRows].reverse().find(row => row.type === "stool" && row.size)?.size || null;
      return [{
        ...base,
        waterCount: enteredWaterCount == null
          ? (waterFromEvents > 0 ? waterFromEvents : null)
          : Math.max(enteredWaterCount, waterFromEvents),
        urineCount: enteredUrineCount == null
          ? (urineFromEvents > 0 ? urineFromEvents : null)
          : Math.max(enteredUrineCount, urineFromEvents),
        urineSize: lastUrineSize || base.urineSize,
        stoolCount: enteredStoolCount == null
          ? (stoolFromEvents > 0 ? stoolFromEvents : null)
          : Math.max(enteredStoolCount, stoolFromEvents),
        stoolAmount: lastStoolSize || base.stoolAmount,
        appetite: draft.appetite,
        weightKg: nullableNumber(draft.weightKg),
        measurementConfidence: draft.confidence,
        collapseOrSeizure: base.collapseOrSeizure || events.some(event => event.type === "seizure"),
        timedEvents: events.sort((a, b) => a.time.localeCompare(b.time)),
        notes: draft.notes.trim(),
        updatedAt: now,
      }];
    });

    onSave(updatedRecords, date, activeRows.length);
    setChangedCatIds([]);
    setError("");
  };

  return (
    <Paper id="daily-record-section" component="section" elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid var(--card-border)", borderRadius: 4, scrollMarginTop: 96 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={2} sx={{ mb: 2.5 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <PetsRounded color="primary" />
            <Typography variant="h5" fontWeight={800}>4마리 통합 하루 기록</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            네 마리의 하루 상태와 영상 속 시간별 행동을 한 화면에서 기록합니다. 저장한 값은 고양이별 건강 추세에 바로 반영됩니다.
          </Typography>
        </Box>
        <TextField label="기록 날짜" type="date" size="small" value={date} onChange={event => setDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 180 }} inputProps={{ "data-testid": "multi-event-date" }} />
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
        {cats.map(cat => {
          const draft = drafts[cat.id];
          if (!draft) return null;
          const existing = records.some(record => record.catId === cat.id && record.date === date);
          const changed = changedCatIds.includes(cat.id);
          const summary = summaries.find(item => item.cat.id === cat.id);
          return (
            <Paper key={cat.id} variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: changed ? "primary.main" : "divider", bgcolor: changed ? "rgba(139,92,246,0.05)" : "var(--surface)" }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <Avatar sx={{ width: 34, height: 34, bgcolor: cat.focusCare ? "primary.main" : "secondary.main" }}><PetsRounded fontSize="small" /></Avatar>
                <Typography fontWeight={800}>{cat.name}</Typography>
                {existing && <Chip size="small" color="success" variant="outlined" label="저장된 기록" />}
                {changed && <Chip size="small" color="primary" label="수정됨" />}
              </Stack>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" }, gap: 1.25 }}>
                <TextField label="물 마심(회)" type="number" size="small" value={draft.waterCount} onChange={event => updateDraft(cat.id, "waterCount", event.target.value)} slotProps={{ htmlInput: { min: 0, step: 1 } }} helperText={summary?.eventWaterCount ? `시간 행 ${summary.eventWaterCount}회 반영` : undefined} />
                <TextField label="식사(회)" type="number" size="small" value={summary?.mealCount ?? 0} slotProps={{ htmlInput: { readOnly: true, min: 0, step: 1 } }} helperText={summary?.mealCount ? "시간 행 자동 집계" : "행에서 자동 집계"} />
                <TextField label="소변(회)" type="number" size="small" value={draft.urineCount} onChange={event => updateDraft(cat.id, "urineCount", event.target.value)} slotProps={{ htmlInput: { min: 0, step: 1 } }} helperText={summary?.eventUrineCount ? `시간 행 ${summary.eventUrineCount}회 반영` : undefined} />
                <TextField label="대변(회)" type="number" size="small" value={draft.stoolCount} onChange={event => updateDraft(cat.id, "stoolCount", event.target.value)} slotProps={{ htmlInput: { min: 0, step: 1 } }} helperText={summary?.eventStoolCount ? `시간 행 ${summary.eventStoolCount}회 반영` : undefined} />
                <TextField label="체중(kg)" type="number" size="small" value={draft.weightKg} onChange={event => updateDraft(cat.id, "weightKg", event.target.value)} slotProps={{ htmlInput: { min: 0.3, max: 30, step: 0.01 } }} />
                <TextField select label="식욕" size="small" value={draft.appetite} onChange={event => updateDraft(cat.id, "appetite", event.target.value as AppetiteLevel)}>{Object.entries(appetiteLabels).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</TextField>
                <TextField select label="기록 신뢰도" size="small" value={draft.confidence} onChange={event => updateDraft(cat.id, "confidence", event.target.value as MeasurementConfidence)}>{Object.entries(confidenceLabels).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</TextField>
                <TextField label="하루 메모" size="small" value={draft.notes} onChange={event => updateDraft(cat.id, "notes", event.target.value)} placeholder="구토, 활동성, 특이사항" multiline minRows={2} sx={{ gridColumn: "1 / -1" }} />
              </Box>
            </Paper>
          );
        })}
      </Box>

      <Divider sx={{ my: 3 }}><Chip icon={<OndemandVideoRounded />} label="시간별·영상 기록 (선택)" /></Divider>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        영상에서 확인한 식사·물·배변 시각을 한 줄씩 남기세요. 식사와 물 마심은 한 줄을 각각 1회로 계산합니다.
      </Typography>

      <Stack spacing={1}>
        {rows.map((row, index) => {
          const catFoods = foodItems.filter(item => foodAppliesToCat(item, row.catId));
          return (
            <Box key={row.id} data-testid={`multi-event-row-${index}`} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: row.type === "meal" ? "60px 115px 125px 105px minmax(150px,1fr) 120px minmax(140px,1fr) auto" : row.type === "seizure" ? "60px 115px 125px 105px 120px minmax(140px,1fr) auto" : "60px 115px 125px 105px minmax(150px,1fr) auto" }, gap: 1, alignItems: "center", p: 1.25, border: "1px solid", borderColor: row.type === "seizure" ? "error.light" : "divider", borderRadius: 2.5 }}>
              <Chip label={index + 1} size="small" variant="outlined" />
              <TextField label="시각" type="time" size="small" value={row.time} onChange={event => updateRow(row.id, { time: event.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField select label="고양이" size="small" value={row.catId} onChange={event => updateRow(row.id, { catId: event.target.value, foodItemId: "" })}>
                <MenuItem value=""><em>선택</em></MenuItem>
                {cats.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
              </TextField>
              <TextField select label="기록" size="small" value={row.type} onChange={event => updateRow(row.id, { type: event.target.value as TimedCareEventType, amount: "", size: "", foodItemId: "", severity: "" })}>
                {Object.entries(eventLabels).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
              </TextField>
              {(row.type === "meal" || row.type === "seizure") && <TextField label={row.type === "meal" ? "먹은 양(g, 선택)" : "지속시간(초)"} type="number" size="small" value={row.amount} onChange={event => updateRow(row.id, { amount: event.target.value })} slotProps={{ htmlInput: { min: 0, step: 1 } }} />}
              {row.type === "meal" && <TextField select label="사료·간식" size="small" value={row.foodItemId} onChange={event => updateRow(row.id, { foodItemId: event.target.value })}><MenuItem value=""><em>미선택</em></MenuItem>{catFoods.map(item => <MenuItem key={item.id} value={item.id}>{item.brand}{item.productName ? ` · ${item.productName}` : ""}</MenuItem>)}</TextField>}
              {(row.type === "urine" || row.type === "stool") && <TextField select label="양" size="small" value={row.size} onChange={event => updateRow(row.id, { size: event.target.value as SizeLevel | "" })}><MenuItem value=""><em>미기록</em></MenuItem>{Object.entries(sizeLabels).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</TextField>}
              {row.type === "seizure" && <TextField select label="강도" size="small" value={row.severity} onChange={event => updateRow(row.id, { severity: event.target.value as SeizureSeverity | "" })}><MenuItem value=""><em>미기록</em></MenuItem><MenuItem value="mild">경미</MenuItem><MenuItem value="moderate">중간</MenuItem><MenuItem value="severe">심함</MenuItem></TextField>}
              <TextField label="메모" size="small" value={row.notes} onChange={event => updateRow(row.id, { notes: event.target.value })} placeholder="선택 입력" />
              <Stack direction="row" justifyContent="flex-end">
                <Tooltip title="이 행 복제"><IconButton size="small" onClick={() => duplicateRow(row)}><ContentCopyRounded fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="행 삭제"><IconButton size="small" color="error" onClick={() => deleteRow(row.id)}><DeleteOutlineRounded fontSize="small" /></IconButton></Tooltip>
              </Stack>
            </Box>
          );
        })}
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "center" }} gap={2} sx={{ mt: 2 }}>
        <Button variant="outlined" startIcon={<AddRounded />} onClick={addRow}>시간 기록 행 추가</Button>
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {summaries.map(summary => <Chip key={summary.cat.id} color={summary.recorded ? "primary" : "default"} variant="outlined" label={`${summary.cat.name} · 물 ${summary.waterCount}회 · 식사 ${summary.mealCount}회 · 소변 ${summary.urineCount} · 대변 ${summary.stoolCount}`} />)}
        </Stack>
        <Button variant="contained" size="large" startIcon={<SaveRounded />} onClick={save} disabled={!changedCatIds.length}>통합 하루 기록 저장</Button>
      </Stack>
    </Paper>
  );
}
