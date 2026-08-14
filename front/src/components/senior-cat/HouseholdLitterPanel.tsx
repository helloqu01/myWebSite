"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import WcRounded from "@mui/icons-material/WcRounded";
import type { CatProfile, HouseholdLitterRecord, LitterRecordType, MeasurementConfidence, SizeLevel } from "@/types/cat-care";
import { createId, toLocalDateKey } from "@/lib/cat-care/storage";

interface HouseholdLitterPanelProps {
  cats: CatProfile[];
  records: HouseholdLitterRecord[];
  onSave: (record: HouseholdLitterRecord) => void;
  onDelete: (record: HouseholdLitterRecord) => void;
}

function currentTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export default function HouseholdLitterPanel({ cats, records, onSave, onDelete }: HouseholdLitterPanelProps) {
  const [catId, setCatId] = useState("shared");
  const [date, setDate] = useState(() => toLocalDateKey(new Date()));
  const [time, setTime] = useState(currentTime);
  const [type, setType] = useState<LitterRecordType>("urine");
  const [urineAmount, setUrineAmount] = useState<SizeLevel | "">("");
  const [stoolAmount, setStoolAmount] = useState<SizeLevel | "">("");
  const [confidence, setConfidence] = useState<MeasurementConfidence>("medium");
  const [notes, setNotes] = useState("");
  const recent = [...records].sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)).slice(0, 8);

  const save = () => {
    onSave({
      id: createId("litter"),
      catId: catId === "shared" ? null : catId,
      date,
      time,
      type,
      urineAmount: type === "stool" ? null : urineAmount || null,
      stoolAmount: type === "urine" ? null : stoolAmount || null,
      confidence: catId === "shared" ? "low" : confidence,
      notes: notes.trim(),
      updatedAt: new Date().toISOString(),
    });
    setNotes("");
    setTime(currentTime());
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: "1px solid var(--card-border)", borderRadius: 4 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}><WcRounded color="primary" /><Typography variant="h6" fontWeight={800}>공동 화장실 기록</Typography></Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>누구의 배변인지 모를 때 가정 기록으로 남기고, 나중에 고양이를 지정할 수 있습니다.</Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "1.3fr 1fr 0.8fr 1fr" }, gap: 1.25 }}>
        <FormControl size="small"><InputLabel>고양이</InputLabel><Select label="고양이" value={catId} onChange={event => setCatId(event.target.value)}><MenuItem value="shared">공동·미확인</MenuItem>{cats.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}</Select></FormControl>
        <TextField size="small" label="날짜" type="date" value={date} onChange={event => setDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField size="small" label="시간" type="time" value={time} onChange={event => setTime(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        <FormControl size="small"><InputLabel>종류</InputLabel><Select label="종류" value={type} onChange={event => setType(event.target.value as LitterRecordType)}><MenuItem value="urine">소변</MenuItem><MenuItem value="stool">대변</MenuItem><MenuItem value="both">소변+대변</MenuItem></Select></FormControl>
        {type !== "stool" && <FormControl size="small"><InputLabel>소변 양</InputLabel><Select label="소변 양" value={urineAmount} onChange={event => setUrineAmount(event.target.value as SizeLevel)}><MenuItem value="">미입력</MenuItem><MenuItem value="small">적음</MenuItem><MenuItem value="normal">보통</MenuItem><MenuItem value="large">많음</MenuItem></Select></FormControl>}
        {type !== "urine" && <FormControl size="small"><InputLabel>대변 양</InputLabel><Select label="대변 양" value={stoolAmount} onChange={event => setStoolAmount(event.target.value as SizeLevel)}><MenuItem value="">미입력</MenuItem><MenuItem value="small">적음</MenuItem><MenuItem value="normal">보통</MenuItem><MenuItem value="large">많음</MenuItem></Select></FormControl>}
        <FormControl size="small"><InputLabel>확실도</InputLabel><Select label="확실도" value={catId === "shared" ? "low" : confidence} disabled={catId === "shared"} onChange={event => setConfidence(event.target.value as MeasurementConfidence)}><MenuItem value="high">직접 확인</MenuItem><MenuItem value="medium">대부분 확실</MenuItem><MenuItem value="low">추정</MenuItem></Select></FormControl>
        <TextField size="small" label="메모" value={notes} onChange={event => setNotes(event.target.value)} />
      </Box>
      <Button startIcon={<AddRounded />} variant="contained" onClick={save} sx={{ mt: 1.5 }}>화장실 기록 추가</Button>

      {recent.length > 0 && <Stack spacing={1} sx={{ mt: 2.5 }}>
        {recent.map(record => <Stack key={record.id} direction="row" alignItems="center" justifyContent="space-between" gap={1} sx={{ p: 1.25, bgcolor: "var(--surface)", borderRadius: 2 }}>
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography fontWeight={800}>{record.date.slice(5)} {record.time}</Typography>
            <Select
              size="small"
              value={record.catId ?? "shared"}
              onChange={event => onSave({ ...record, catId: event.target.value === "shared" ? null : event.target.value, confidence: event.target.value === "shared" ? "low" : record.confidence, updatedAt: new Date().toISOString() })}
              sx={{ minWidth: 120, height: 30, fontSize: 13 }}
            >
              <MenuItem value="shared">공동·미확인</MenuItem>
              {cats.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
            </Select>
            <Chip label={{ urine: "소변", stool: "대변", both: "소변+대변" }[record.type]} variant="outlined" size="small" />
            {record.notes && <Typography variant="caption" color="text.secondary">{record.notes}</Typography>}
          </Stack>
          <Tooltip title="삭제"><IconButton size="small" color="error" onClick={() => onDelete(record)}><DeleteOutlineRounded fontSize="small" /></IconButton></Tooltip>
        </Stack>)}
      </Stack>}
    </Paper>
  );
}
