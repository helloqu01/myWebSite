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
  FormControl,
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
  Medication,
  CareScheduleRepeat,
} from "@/types/cat-care";
import { scheduleRepeatLabel, schedulesDueOn } from "@/lib/cat-care/schedules";
import { createId } from "@/lib/cat-care/storage";

interface MedicationLogPanelProps {
  cat: CatProfile;
  date: string;
  schedules: CareSchedule[];
  logs: MedicationAdministration[];
  openRequestKey: number;
  onSave: (log: MedicationAdministration) => void;
  onDelete: (log: MedicationAdministration) => void;
  onSaveSchedule: (schedule: CareSchedule) => void;
  onDeleteSchedule: (schedule: CareSchedule) => void;
  onMedicationChange: (medication: Medication) => void;
  onEditMedications: () => void;
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
    && (schedule.medicationId === medication.id || (!schedule.medicationId && (schedule.title.includes(medication.name) || medication.name.includes(schedule.title)))));
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

export default function MedicationLogPanel({ cat, date, schedules, logs, openRequestKey, onSave, onDelete, onSaveSchedule, onDeleteSchedule, onMedicationChange, onEditMedications }: MedicationLogPanelProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MedicationAdministration | null>(null);
  const [draft, setDraft] = useState<MedicationAdministration>(() => blankLog(cat, date, schedules));
  const [error, setError] = useState("");
  const [scheduleMedication, setScheduleMedication] = useState<Medication | null>(null);
  const [scheduleRepeat, setScheduleRepeat] = useState<CareScheduleRepeat>("daily");
  const [scheduleStartDate, setScheduleStartDate] = useState(date);
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [scheduleNotes, setScheduleNotes] = useState("");
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const dayLogs = useMemo(
    () => logs.filter(log => log.catId === cat.id && log.date === date).sort((a, b) => (b.actualTime || b.scheduledTime).localeCompare(a.actualTime || a.scheduledTime)),
    [cat.id, date, logs],
  );
  const medicationSchedules = schedules.filter(schedule => schedule.catId === cat.id && schedule.type === "medication");

  const schedulesFor = (medication: Medication) => medicationSchedules
    .filter(schedule => schedule.medicationId === medication.id
      || (!schedule.medicationId && (schedule.title.includes(medication.name) || medication.name.includes(schedule.title))))
    .sort((a, b) => a.time.localeCompare(b.time));

  const openSchedule = (medication: Medication, schedule?: CareSchedule) => {
    setScheduleMedication(medication);
    setEditingScheduleId(schedule?.id ?? null);
    setScheduleRepeat(schedule?.repeat ?? "daily");
    setScheduleStartDate(schedule?.startDate ?? date);
    setScheduleTime(schedule?.time ?? "09:00");
    setScheduleNotes(schedule?.notes ?? medication.scheduleNote);
  };

  const saveSchedule = () => {
    if (!scheduleMedication) return;
    const existing = editingScheduleId ? medicationSchedules.find(schedule => schedule.id === editingScheduleId) : undefined;
    const now = new Date().toISOString();
    onSaveSchedule({
      id: existing?.id ?? createId("schedule"),
      catId: cat.id,
      medicationId: scheduleMedication.id,
      title: scheduleMedication.name,
      type: "medication",
      repeat: scheduleRepeat,
      startDate: scheduleStartDate,
      time: scheduleTime,
      notes: scheduleNotes.trim(),
      completedDates: existing?.completedDates ?? [],
      enabled: true,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    const nextScheduleCount = schedulesFor(scheduleMedication).length + (existing ? 0 : 1);
    onMedicationChange({ ...scheduleMedication, scheduleNote: `${nextScheduleCount}개 반복 일정 등록됨` });
    setScheduleMedication(null);
    setEditingScheduleId(null);
  };

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
      && (schedule.medicationId === medication.id || (!schedule.medicationId && (schedule.title.includes(medication.name) || medication.name.includes(schedule.title)))));
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
          <Stack direction="row" spacing={1} alignItems="center"><MedicationRounded color="primary" /><Typography variant="h6" fontWeight={800}>투약 관리</Typography></Stack>
          <Typography variant="body2" color="text.secondary">약 등록, 반복 일정, 재고와 상세 투약 이력을 한곳에서 관리합니다. 오늘 투약 체크는 상단 알림에서 할 수 있습니다.</Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap><Button onClick={onEditMedications}>약 추가·이름 수정</Button><Button variant="outlined" startIcon={<AddRounded />} onClick={openNew} disabled={!cat.medications.length}>상세 기록 추가</Button></Stack>
      </Stack>

      {!cat.medications.length ? (
        <Alert severity="info" action={<Button color="inherit" size="small" onClick={onEditMedications}>약 등록</Button>}>등록된 약이 없습니다. 약을 등록한 뒤 매일·매주·매달 복용 일정을 설정해 주세요.</Alert>
      ) : (
        <Stack spacing={1} sx={{ mb: 2 }}>
            {cat.medications.map(medication => {
              const medicationScheduleList = schedulesFor(medication);
              return (
                <Paper key={medication.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
                  <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={1.5}>
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Typography fontWeight={800}>{medication.name}</Typography>
                        {medicationScheduleList.length ? <Chip size="small" color="primary" label={`${medicationScheduleList.length}개 일정`} /> : <Chip size="small" color="warning" label="복용 일정 미설정" />}
                      </Stack>
                      {medicationScheduleList.length ? <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>{medicationScheduleList.map(schedule => <Chip key={schedule.id} size="small" variant="outlined" label={`${scheduleRepeatLabel[schedule.repeat]} ${schedule.time || "시간 미지정"}`} onClick={() => openSchedule(medication, schedule)} onDelete={() => onDeleteSchedule(schedule)} />)}</Stack> : <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{medication.scheduleNote || "복용 메모 없음"}</Typography>}
                    </Box>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
                      <TextField label="현재 재고" type="number" size="small" value={medication.stockCount ?? ""} onChange={event => onMedicationChange({ ...medication, stockCount: event.target.value === "" ? null : Math.max(0, Number(event.target.value)) })} sx={{ width: { sm: 115 } }} />
                      <TextField label="재고 알림" type="number" size="small" value={medication.refillThreshold ?? ""} onChange={event => onMedicationChange({ ...medication, refillThreshold: event.target.value === "" ? null : Math.max(0, Number(event.target.value)) })} sx={{ width: { sm: 115 } }} />
                      <TextField label="단위" size="small" value={medication.stockUnit} onChange={event => onMedicationChange({ ...medication, stockUnit: event.target.value })} sx={{ width: { sm: 90 } }} />
                      <Button variant="contained" size="small" onClick={() => openSchedule(medication)}>일정 추가</Button>
                    </Stack>
                  </Stack>
                </Paper>
              );
            })}
        </Stack>
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

      <Dialog open={Boolean(scheduleMedication)} onClose={() => { setScheduleMedication(null); setEditingScheduleId(null); }} fullWidth maxWidth="sm">
        <DialogTitle>{scheduleMedication?.name} {editingScheduleId ? "투약 일정 수정" : "투약 일정 추가"}</DialogTitle>
        <DialogContent dividers><Stack spacing={2} sx={{ pt: 0.5 }}><Alert severity="info">설정한 주기에 맞는 날에 상단 ‘오늘 할 일·알림’에 투약 체크박스가 나타납니다.</Alert><FormControl fullWidth><InputLabel>복용 주기</InputLabel><Select label="복용 주기" value={scheduleRepeat} onChange={event => setScheduleRepeat(event.target.value as CareScheduleRepeat)}>{Object.entries(scheduleRepeatLabel).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</Select></FormControl><Stack direction={{ xs: "column", sm: "row" }} spacing={2}><TextField label={scheduleRepeat === "none" ? "투약 날짜" : "반복 시작일"} type="date" value={scheduleStartDate} onChange={event => setScheduleStartDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} helperText={scheduleRepeat === "weekly" ? "이 날짜와 같은 요일마다 표시" : scheduleRepeat === "monthly" ? "이 날짜와 같은 날짜마다 표시" : undefined} fullWidth /><TextField label="예정 시각" type="time" value={scheduleTime} onChange={event => setScheduleTime(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} fullWidth /></Stack><TextField label="복용 방법·메모" value={scheduleNotes} onChange={event => setScheduleNotes(event.target.value)} placeholder="예: 식후 1정" multiline minRows={2} /></Stack></DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}><Button color="inherit" onClick={() => { setScheduleMedication(null); setEditingScheduleId(null); }}>취소</Button><Button variant="contained" onClick={saveSchedule}>일정 저장</Button></DialogActions>
      </Dialog>

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
