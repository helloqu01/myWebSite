"use client";

import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
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
import SaveRounded from "@mui/icons-material/SaveRounded";
import type {
  CatProfile,
  DailyRecord,
  FoodItem,
  SeizureSeverity,
  SizeLevel,
  TimedCareEvent,
  TimedCareEventType,
} from "@/types/cat-care";
import { createId, toLocalDateKey } from "@/lib/cat-care/storage";

interface MultiCatEventLoggerProps {
  cats: CatProfile[];
  records: DailyRecord[];
  foodItems: FoodItem[];
  onSave: (records: DailyRecord[], date: string, rowCount: number) => void;
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
    id: createId("video-row"),
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

function emptyRecord(cat: CatProfile, date: string): DailyRecord {
  return {
    id: createId("record"),
    catId: cat.id,
    date,
    waterMl: null,
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

function positiveNumber(value: string): number | null {
  const number = Number(value);
  return value.trim() && Number.isFinite(number) && number > 0 ? number : null;
}

export default function MultiCatEventLogger({ cats, records, foodItems, onSave }: MultiCatEventLoggerProps) {
  const [date, setDate] = useState(toLocalDateKey(new Date()));
  const [rows, setRows] = useState<LedgerRow[]>([blankRow()]);
  const [error, setError] = useState("");

  const summaries = useMemo(() => cats.map(cat => {
    const assigned = rows.filter(row => row.catId === cat.id);
    return {
      cat,
      rowCount: assigned.length,
      waterMl: assigned.filter(row => row.type === "water").reduce((sum, row) => sum + (positiveNumber(row.amount) ?? 0), 0),
      mealGrams: assigned.filter(row => row.type === "meal").reduce((sum, row) => sum + (positiveNumber(row.amount) ?? 0), 0),
      urineCount: assigned.filter(row => row.type === "urine").length,
      stoolCount: assigned.filter(row => row.type === "stool").length,
      seizureCount: assigned.filter(row => row.type === "seizure").length,
    };
  }).filter(summary => summary.rowCount > 0), [cats, rows]);

  const updateRow = (id: string, patch: Partial<LedgerRow>) => {
    setRows(current => current.map(row => row.id === id ? { ...row, ...patch } : row));
    setError("");
  };

  const addRow = () => setRows(current => [...current, blankRow(current.at(-1))]);
  const duplicateRow = (row: LedgerRow) => setRows(current => [
    ...current,
    { ...row, id: createId("video-row") },
  ]);
  const deleteRow = (id: string) => setRows(current => {
    const next = current.filter(row => row.id !== id);
    return next.length ? next : [blankRow()];
  });

  const save = () => {
    if (!date) {
      setError("기록 날짜를 선택해 주세요.");
      return;
    }
    if (rows.some(row => !row.catId || !row.time)) {
      setError("모든 행의 고양이와 시각을 선택해 주세요.");
      return;
    }
    if (rows.some(row => (row.type === "water" || row.type === "meal") && positiveNumber(row.amount) == null)) {
      setError("음수량은 ml, 식사량은 g 단위로 0보다 크게 입력해 주세요.");
      return;
    }

    const updatedRecords = cats.flatMap(cat => {
      const catRows = rows.filter(row => row.catId === cat.id);
      if (!catRows.length) return [];
      const base = records.find(record => record.catId === cat.id && record.date === date) ?? emptyRecord(cat, date);
      const events: TimedCareEvent[] = catRows.map(row => ({
        id: createId("care-event"),
        type: row.type,
        time: row.time,
        amountMl: row.type === "water" ? positiveNumber(row.amount) : null,
        amountGrams: row.type === "meal" ? positiveNumber(row.amount) : null,
        durationSeconds: row.type === "seizure" ? positiveNumber(row.amount) : null,
        severity: row.type === "seizure" ? row.severity || null : null,
        foodItemId: row.type === "meal" ? row.foodItemId || null : null,
        notes: row.notes.trim(),
      }));
      const waterAdded = events.filter(event => event.type === "water").reduce((sum, event) => sum + (event.amountMl ?? 0), 0);
      const urineAdded = events.filter(event => event.type === "urine").length;
      const stoolAdded = events.filter(event => event.type === "stool").length;
      const lastUrineSize = [...catRows].reverse().find(row => row.type === "urine" && row.size)?.size || null;
      const lastStoolSize = [...catRows].reverse().find(row => row.type === "stool" && row.size)?.size || null;
      return [{
        ...base,
        waterMl: waterAdded > 0 ? (base.waterMl ?? 0) + waterAdded : base.waterMl,
        urineCount: urineAdded > 0 ? (base.urineCount ?? 0) + urineAdded : base.urineCount,
        urineSize: lastUrineSize || base.urineSize,
        stoolCount: stoolAdded > 0 ? (base.stoolCount ?? 0) + stoolAdded : base.stoolCount,
        stoolAmount: lastStoolSize || base.stoolAmount,
        collapseOrSeizure: base.collapseOrSeizure || events.some(event => event.type === "seizure"),
        timedEvents: [...base.timedEvents, ...events].sort((a, b) => a.time.localeCompare(b.time)),
        updatedAt: new Date().toISOString(),
      }];
    });

    onSave(updatedRecords, date, rows.length);
    setRows([blankRow()]);
    setError("");
  };

  return (
    <Paper component="section" elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid var(--card-border)", borderRadius: 4 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <OndemandVideoRounded color="primary" />
            <Typography variant="h5" fontWeight={800}>4마리 영상 빠른 기록</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            영상을 보며 시각·고양이·행동을 한 줄씩 추가하세요. 저장하면 고양이별 당일 음수량·식사량·배변 횟수와 시간 기록이 함께 반영됩니다.
          </Typography>
        </Box>
        <TextField label="기록 날짜" type="date" size="small" value={date} onChange={event => setDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 180 }} inputProps={{ "data-testid": "multi-event-date" }} />
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stack spacing={1}>
        {rows.map((row, index) => {
          const catFoods = foodItems.filter(item => item.catId === row.catId);
          return (
            <Box key={row.id} data-testid={`multi-event-row-${index}`} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: row.type === "meal" ? "80px 120px 130px 110px minmax(180px,1fr) 110px minmax(150px,1fr) auto" : row.type === "water" ? "80px 120px 130px 110px minmax(180px,1fr) auto" : row.type === "seizure" ? "80px 120px 130px 120px 120px minmax(150px,1fr) auto" : "80px 120px 130px 110px minmax(180px,1fr) auto" }, gap: 1, alignItems: "center", p: 1.25, border: "1px solid", borderColor: row.type === "seizure" ? "error.light" : "divider", borderRadius: 2.5 }}>
              <Chip label={index + 1} size="small" variant="outlined" />
              <TextField label="시각" type="time" size="small" value={row.time} onChange={event => updateRow(row.id, { time: event.target.value })} slotProps={{ inputLabel: { shrink: true } }} inputProps={{ "data-testid": "multi-event-time" }} />
              <TextField select label="고양이" size="small" value={row.catId} onChange={event => updateRow(row.id, { catId: event.target.value, foodItemId: "" })} inputProps={{ "data-testid": "multi-event-cat" }}>
                <MenuItem value=""><em>선택</em></MenuItem>
                {cats.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
              </TextField>
              <TextField select label="기록" size="small" value={row.type} onChange={event => updateRow(row.id, { type: event.target.value as TimedCareEventType, amount: "", size: "", foodItemId: "", severity: "" })} inputProps={{ "data-testid": "multi-event-type" }}>
                {Object.entries(eventLabels).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
              </TextField>
              {(row.type === "water" || row.type === "meal" || row.type === "seizure") && <TextField label={row.type === "water" ? "마신 양(ml)" : row.type === "meal" ? "먹은 양(g)" : "지속시간(초)"} type="number" size="small" value={row.amount} onChange={event => updateRow(row.id, { amount: event.target.value })} slotProps={{ htmlInput: { min: 0, step: 1 } }} inputProps={{ "data-testid": "multi-event-amount" }} />}
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

      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={2} sx={{ mt: 2 }}>
        <Button variant="outlined" startIcon={<AddRounded />} onClick={addRow} data-testid="add-multi-event-row">행 추가</Button>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {summaries.map(summary => <Chip key={summary.cat.id} color="primary" variant="outlined" label={`${summary.cat.name} · 물 ${summary.waterMl}ml · 식사 ${summary.mealGrams}g · 소변 ${summary.urineCount} · 대변 ${summary.stoolCount}${summary.seizureCount ? ` · 발작 ${summary.seizureCount}` : ""}`} />)}
        </Stack>
        <Button variant="contained" startIcon={<SaveRounded />} onClick={save} data-testid="save-multi-events">전체 저장</Button>
      </Stack>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
        소변·대변은 행 1개가 1회로 계산됩니다. 식사량은 선택한 사료 재고에서도 자동 차감됩니다.
      </Typography>
    </Paper>
  );
}
