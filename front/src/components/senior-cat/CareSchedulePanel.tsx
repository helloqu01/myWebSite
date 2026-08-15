"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import AddAlarmRounded from "@mui/icons-material/AddAlarmRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import EventAvailableRounded from "@mui/icons-material/EventAvailableRounded";
import type {
  CareSchedule,
  CareScheduleRepeat,
  CareScheduleType,
  CatProfile,
} from "@/types/cat-care";
import { createId } from "@/lib/cat-care/storage";
import {
  isScheduleCompleted,
  scheduleRepeatLabel,
  scheduleTypeLabel,
  schedulesDueOn,
} from "@/lib/cat-care/schedules";

interface CareSchedulePanelProps {
  cat: CatProfile;
  date: string;
  schedules: CareSchedule[];
  onSave: (schedule: CareSchedule) => void;
  onDelete: (schedule: CareSchedule) => void;
  onToggle: (schedule: CareSchedule, date: string) => void;
}

interface ScheduleDraft {
  title: string;
  type: CareScheduleType;
  repeat: CareScheduleRepeat;
  startDate: string;
  time: string;
  notes: string;
  enabled: boolean;
}

function toDraft(schedule: CareSchedule | null, date: string): ScheduleDraft {
  return schedule
    ? {
        title: schedule.title,
        type: schedule.type,
        repeat: schedule.repeat,
        startDate: schedule.startDate,
        time: schedule.time,
        notes: schedule.notes,
        enabled: schedule.enabled,
      }
    : {
        title: "",
        type: "care",
        repeat: "none",
        startDate: date,
        time: "09:00",
        notes: "",
        enabled: true,
      };
}

export default function CareSchedulePanel({
  cat,
  date,
  schedules,
  onSave,
  onDelete,
  onToggle,
}: CareSchedulePanelProps) {
  const catSchedules = schedules.filter(schedule => schedule.catId === cat.id);
  const dueSchedules = schedulesDueOn(schedules, cat.id, date);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CareSchedule | null>(null);
  const [draft, setDraft] = useState<ScheduleDraft>(() => toDraft(null, date));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!dialogOpen) return;
    setDraft(toDraft(editing, date));
    setError("");
  }, [date, dialogOpen, editing]);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (schedule: CareSchedule) => {
    setEditing(schedule);
    setDialogOpen(true);
  };

  const update = <K extends keyof ScheduleDraft>(key: K, value: ScheduleDraft[K]) => {
    setDraft(current => ({ ...current, [key]: value }));
  };

  const save = () => {
    if (!draft.title.trim()) {
      setError("일정 이름을 입력해 주세요.");
      return;
    }
    const now = new Date().toISOString();
    onSave({
      id: editing?.id ?? createId("schedule"),
      catId: cat.id,
      title: draft.title.trim(),
      type: draft.type,
      repeat: draft.repeat,
      startDate: draft.startDate,
      time: draft.time,
      notes: draft.notes.trim(),
      completedDates: editing?.completedDates ?? [],
      enabled: draft.enabled,
      createdAt: editing?.createdAt ?? now,
      updatedAt: now,
    });
    setDialogOpen(false);
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: "1px solid var(--card-border)", borderRadius: 4 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={800}>케어 일정</Typography>
          <Typography variant="body2" color="text.secondary">{date}에 해야 할 투약·측정·병원 일정을 관리합니다.</Typography>
        </Box>
        <Button startIcon={<AddAlarmRounded />} onClick={openNew} variant="outlined">일정 추가</Button>
      </Stack>

      {dueSchedules.length ? (
        <Stack spacing={1}>
          {dueSchedules.map(schedule => {
            const completed = isScheduleCompleted(schedule, date);
            return (
              <Box
                key={schedule.id}
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  border: "1px solid",
                  borderColor: completed ? "success.main" : "divider",
                  bgcolor: completed ? "rgba(34,197,94,0.06)" : "var(--surface)",
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                    <Checkbox checked={completed} onChange={() => onToggle(schedule, date)} />
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Typography fontWeight={800} sx={{ textDecoration: completed ? "line-through" : "none" }}>{schedule.title}</Typography>
                        <Chip label={scheduleTypeLabel[schedule.type]} size="small" />
                        <Chip label={scheduleRepeatLabel[schedule.repeat]} size="small" variant="outlined" />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {schedule.time || "시간 미지정"}{schedule.notes ? ` · ${schedule.notes}` : ""}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row">
                    <Tooltip title="수정"><IconButton size="small" onClick={() => openEdit(schedule)}><EditRounded fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="삭제"><IconButton size="small" color="error" onClick={() => onDelete(schedule)}><DeleteOutlineRounded fontSize="small" /></IconButton></Tooltip>
                  </Stack>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      ) : (
        <Stack alignItems="center" spacing={1} sx={{ py: 3, color: "text.secondary" }}>
          <EventAvailableRounded />
          <Typography variant="body2">선택한 날짜에 예정된 케어 일정이 없습니다.</Typography>
        </Stack>
      )}

      {catSchedules.length > 0 && (
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 2, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center", mr: 0.5 }}>전체 일정</Typography>
          {catSchedules.map(schedule => (
            <Chip
              key={schedule.id}
              label={`${schedule.title} · ${scheduleRepeatLabel[schedule.repeat]}`}
              size="small"
              variant="outlined"
              onClick={() => openEdit(schedule)}
              sx={{ opacity: schedule.enabled ? 1 : 0.5 }}
            />
          ))}
        </Stack>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "케어 일정 수정" : `${cat.name} 케어 일정 추가`}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {error && <Typography color="error.main" variant="body2">{error}</Typography>}
            <TextField label="일정 이름" value={draft.title} onChange={event => update("title", event.target.value)} placeholder="예: 신장약, 체중 측정, 정기 검진" autoFocus fullWidth />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>종류</InputLabel>
                <Select label="종류" value={draft.type} onChange={event => update("type", event.target.value as CareScheduleType)}>
                  {Object.entries(scheduleTypeLabel).map(([value, label]) => <MenuItem value={value} key={value}>{label}</MenuItem>)}
                </Select>
              </FormControl>
              <Box sx={{ width: "100%" }}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>반복 주기</Typography>
                <ToggleButtonGroup
                  exclusive
                  fullWidth
                  size="small"
                  value={draft.repeat}
                  onChange={(_, value: CareScheduleRepeat | null) => value && update("repeat", value)}
                  aria-label="케어 일정 반복 주기"
                  sx={{ flexWrap: { xs: "wrap", sm: "nowrap" }, "& .MuiToggleButton-root": { flex: { xs: "1 1 45%", sm: "1 1 0" } } }}
                >
                  {Object.entries(scheduleRepeatLabel).map(([value, label]) => <ToggleButton value={value} key={value}>{label}</ToggleButton>)}
                </ToggleButtonGroup>
              </Box>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label={draft.repeat === "none" ? "일정 날짜" : "반복 시작일"} type="date" value={draft.startDate} onChange={event => update("startDate", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
              <TextField label="시간" type="time" value={draft.time} onChange={event => update("time", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            </Stack>
            <TextField label="메모" value={draft.notes} onChange={event => update("notes", event.target.value)} minRows={2} multiline fullWidth />
            <FormControlLabel
              control={<Checkbox checked={draft.enabled} onChange={event => update("enabled", event.target.checked)} />}
              label="일정 활성화"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">취소</Button>
          <Button onClick={save} variant="contained">저장</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
