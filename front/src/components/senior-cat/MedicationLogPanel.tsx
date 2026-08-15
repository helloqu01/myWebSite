"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import MedicationRounded from "@mui/icons-material/MedicationRounded";
import type {
  CareSchedule,
  CatProfile,
  MedicationAdministration,
  MedicationAdministrationStatus,
} from "@/types/cat-care";
import { schedulesDueOn } from "@/lib/cat-care/schedules";
import { createId } from "@/lib/cat-care/storage";

interface MedicationLogPanelProps {
  cat: CatProfile;
  date: string;
  schedules: CareSchedule[];
  logs: MedicationAdministration[];
  openRequestKey: number;
  onSave: (log: MedicationAdministration) => void;
  onDelete: (log: MedicationAdministration) => void;
}

const statusLabels: Record<MedicationAdministrationStatus, string> = {
  given: "복용 완료",
  missed: "누락",
  failed: "투약 실패",
  vomited: "복용 후 구토",
};

const statusColors: Record<MedicationAdministrationStatus, "success" | "warning" | "error"> = {
  given: "success",
  missed: "warning",
  failed: "error",
  vomited: "error",
};

function nowTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function blankLog(cat: CatProfile, date: string, schedules: CareSchedule[], medicationId?: string): MedicationAdministration {
  const medication = cat.medications.find(item => item.id === medicationId) ?? cat.medications[0];
  const due = schedulesDueOn(schedules, cat.id, date).find(schedule => schedule.type === "medication"
    && medication
    && (schedule.title.includes(medication.name) || medication.name.includes(schedule.title)));
  const now = new Date().toISOString();
  return {
    id: createId("medication-log"),
    catId: cat.id,
    medicationId: medication?.id ?? "",
    date,
    scheduledTime: due?.time ?? "",
    actualTime: nowTime(),
    dose: null,
    doseUnit: medication?.stockUnit || "정",
    status: "given",
    administeredBy: "",
    sideEffects: "",
    notes: "",
    linkedScheduleId: due?.id ?? null,
    stockDeducted: false,
    scheduleCompletedByLog: false,
    createdAt: now,
    updatedAt: now,
  };
}

export default function MedicationLogPanel({ cat, date, schedules, logs, openRequestKey, onSave, onDelete }: MedicationLogPanelProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MedicationAdministration | null>(null);
  const [draft, setDraft] = useState<MedicationAdministration>(() => blankLog(cat, date, schedules));
  const [error, setError] = useState("");
  const dayLogs = useMemo(
    () => logs.filter(log => log.catId === cat.id && log.date === date).sort((a, b) => (b.actualTime || b.scheduledTime).localeCompare(a.actualTime || a.scheduledTime)),
    [cat.id, date, logs],
  );

  const openNew = () => {
    setEditing(null);
    setDraft(blankLog(cat, date, schedules));
    setError("");
    setOpen(true);
  };

  useEffect(() => {
    if (openRequestKey > 0) openNew();
  }, [openRequestKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const openEdit = (log: MedicationAdministration) => {
    setEditing(log);
    setDraft({ ...log });
    setError("");
    setOpen(true);
  };

  const update = <K extends keyof MedicationAdministration>(key: K, value: MedicationAdministration[K]) => {
    setDraft(current => ({ ...current, [key]: value }));
  };

  const selectMedication = (medicationId: string) => {
    const medication = cat.medications.find(item => item.id === medicationId);
    const due = schedulesDueOn(schedules, cat.id, draft.date).find(schedule => schedule.type === "medication"
      && medication
      && (schedule.title.includes(medication.name) || medication.name.includes(schedule.title)));
    setDraft(current => ({
      ...current,
      medicationId,
      doseUnit: medication?.stockUnit || current.doseUnit,
      scheduledTime: due?.time ?? current.scheduledTime,
      linkedScheduleId: due?.id ?? null,
    }));
  };

  const save = () => {
    if (!draft.medicationId) {
      setError("투약할 약을 선택해 주세요.");
      return;
    }
    if (!draft.actualTime && draft.status !== "missed") {
      setError("실제 투약 시각을 입력해 주세요.");
      return;
    }
    onSave({ ...draft, catId: cat.id, updatedAt: new Date().toISOString() });
    setOpen(false);
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: "1px solid var(--card-border)", borderRadius: 4 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center"><MedicationRounded color="primary" /><Typography variant="h6" fontWeight={800}>오늘 투약 체크</Typography></Stack>
          <Typography variant="body2" color="text.secondary">복용한 약을 체크하면 현재 시각으로 기록되고 재고와 연결 일정도 함께 반영됩니다.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<AddRounded />} onClick={openNew} disabled={!cat.medications.length}>상세 기록 추가</Button>
      </Stack>

      {!cat.medications.length ? (
        <Alert severity="info">먼저 고양이 관리 정보에 복용약을 등록해 주세요.</Alert>
      ) : (
        <Paper variant="outlined" sx={{ p: 1.5, mb: dayLogs.length ? 2 : 0, borderRadius: 2.5 }}>
          <Stack spacing={0.5}>
            {cat.medications.map(medication => {
              const completedLog = dayLogs.find(log => log.medicationId === medication.id && (log.status === "given" || log.status === "vomited"));
              return (
                <FormControlLabel
                  key={medication.id}
                  control={<Checkbox checked={Boolean(completedLog)} onChange={event => {
                    if (event.target.checked) onSave(blankLog(cat, date, schedules, medication.id));
                    else if (completedLog) onDelete(completedLog);
                  }} />}
                  label={
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 0, sm: 1 }} alignItems={{ sm: "center" }}>
                      <Typography fontWeight={700}>{medication.name}</Typography>
                      {medication.scheduleNote && <Typography variant="body2" color="text.secondary">{medication.scheduleNote}</Typography>}
                      {medication.stockCount != null && <Chip size="small" variant="outlined" label={`재고 ${medication.stockCount}${medication.stockUnit}`} />}
                    </Stack>
                  }
                />
              );
            })}
          </Stack>
        </Paper>
      )}

      {dayLogs.length ? (
        <Stack spacing={1}>
          <Typography variant="subtitle2" color="text.secondary">선택한 날짜의 상세 기록</Typography>
          {dayLogs.map(log => {
            const medication = cat.medications.find(item => item.id === log.medicationId);
            return (
              <Box key={log.id} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2.5, bgcolor: "var(--surface)" }}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1}>
                  <Box>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap alignItems="center">
                      <Typography fontWeight={800}>{medication?.name ?? "삭제된 약"}</Typography>
                      <Chip size="small" color={statusColors[log.status]} label={statusLabels[log.status]} />
                      {log.stockDeducted && <Chip size="small" variant="outlined" label="재고 반영" />}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      예정 {log.scheduledTime || "—"} · 실제 {log.actualTime || "—"}{log.dose != null ? ` · ${log.dose}${log.doseUnit}` : ""}{log.administeredBy ? ` · ${log.administeredBy}` : ""}
                    </Typography>
                    {log.sideEffects && <Typography variant="body2" color="error.main">이상 반응: {log.sideEffects}</Typography>}
                    {log.notes && <Typography variant="body2">{log.notes}</Typography>}
                  </Box>
                  <Stack direction="row" alignSelf={{ xs: "flex-end", sm: "flex-start" }}>
                    <Button size="small" onClick={() => openEdit(log)}>수정</Button>
                    <Button size="small" color="error" onClick={() => onDelete(log)}>삭제</Button>
                  </Stack>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      ) : cat.medications.length ? <Typography color="text.secondary" sx={{ pt: 2 }}>아직 체크한 투약이 없습니다.</Typography> : null}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "투약 기록 수정" : `${cat.name} 투약 기록`}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="날짜" type="date" value={draft.date} disabled={Boolean(editing)} onChange={event => update("date", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
              <FormControl fullWidth disabled={Boolean(editing)}>
                <InputLabel>약 이름</InputLabel>
                <Select label="약 이름" value={draft.medicationId} onChange={event => selectMedication(event.target.value)}>
                  {cat.medications.map(medication => <MenuItem key={medication.id} value={medication.id}>{medication.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>
            <FormControl fullWidth>
              <InputLabel>투약 결과</InputLabel>
              <Select label="투약 결과" value={draft.status} onChange={event => update("status", event.target.value as MedicationAdministrationStatus)}>
                {Object.entries(statusLabels).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
              </Select>
            </FormControl>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="예정 시각" type="time" value={draft.scheduledTime} onChange={event => update("scheduledTime", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
              <TextField label="실제 시각" type="time" value={draft.actualTime} onChange={event => update("actualTime", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="용량" type="number" value={draft.dose ?? ""} onChange={event => update("dose", event.target.value === "" ? null : Number(event.target.value))} slotProps={{ htmlInput: { min: 0, step: 0.01 } }} fullWidth />
              <TextField label="용량 단위" value={draft.doseUnit} onChange={event => update("doseUnit", event.target.value)} placeholder="정, ml, 포" fullWidth />
              <TextField label="투약자" value={draft.administeredBy} onChange={event => update("administeredBy", event.target.value)} placeholder="선택 입력" fullWidth />
            </Stack>
            <TextField label="이상 반응" value={draft.sideEffects} onChange={event => update("sideEffects", event.target.value)} placeholder="예: 침 흘림, 구토, 비틀거림" multiline minRows={2} />
            <TextField label="메모" value={draft.notes} onChange={event => update("notes", event.target.value)} multiline minRows={2} />
            {draft.status === "vomited" && <Alert severity="warning">복용 후 토했다면 임의로 다시 투약하지 말고 처방 병원에 재투약 여부를 확인하세요.</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}><Button color="inherit" onClick={() => setOpen(false)}>취소</Button><Button variant="contained" onClick={save}>저장</Button></DialogActions>
      </Dialog>
    </Paper>
  );
}
