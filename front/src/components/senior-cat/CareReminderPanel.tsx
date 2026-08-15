"use client";

import React, { useEffect, useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import NotificationsActiveRounded from "@mui/icons-material/NotificationsActiveRounded";
import type { CareState, MedicationAdministration, NotificationSettings } from "@/types/cat-care";
import { buildCareReminders, type CareReminder } from "@/lib/cat-care/reminders";
import { schedulesDueOn } from "@/lib/cat-care/schedules";
import { createId, toLocalDateKey } from "@/lib/cat-care/storage";

interface CareReminderPanelProps {
  care: CareState;
  onSettingsChange: (settings: NotificationSettings) => void;
  onMedicationSave: (log: MedicationAdministration) => void;
  onMedicationDelete: (log: MedicationAdministration) => void;
  onReminderAction: (reminder: CareReminder) => void;
  onMessage: (message: string) => void;
}

export default function CareReminderPanel({ care, onSettingsChange, onMedicationSave, onMedicationDelete, onReminderAction, onMessage }: CareReminderPanelProps) {
  const reminders = useMemo(() => buildCareReminders(care), [care]);
  const settings = care.notificationSettings;
  const today = toLocalDateKey(new Date());
  const dueMedications = care.cats.flatMap(cat => schedulesDueOn(care.schedules, cat.id, today)
    .filter(schedule => schedule.type === "medication")
    .flatMap(schedule => {
      const medication = cat.medications.find(item => item.id === schedule.medicationId)
        ?? cat.medications.find(item => schedule.title.includes(item.name) || item.name.includes(schedule.title));
      if (!medication) return [];
      const completedLog = care.medicationAdministrations.find(log => log.catId === cat.id && log.medicationId === medication.id && log.date === today && (log.status === "given" || log.status === "vomited"));
      return [{ cat, medication, schedule, completedLog }];
    }));
  const pendingMedications = dueMedications.filter(item => !item.completedLog);
  const completedMedications = dueMedications.filter(item => item.completedLog);
  const visibleReminders = reminders.filter(reminder => reminder.action !== "medication_log");

  useEffect(() => {
    if (!settings.browserEnabled || typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const fresh = reminders
      .filter(reminder => reminder.notifyNow && !settings.lastNotifiedKeys.includes(reminder.id))
      .slice(0, 4);
    fresh.forEach(reminder => {
      const notification = new Notification(reminder.title, { body: reminder.detail, tag: reminder.id, icon: "/icons/cat-care.svg" });
      notification.onclick = () => {
        window.focus();
        onReminderAction(reminder);
        notification.close();
      };
    });
    if (!fresh.length) return;
    const retained = [...settings.lastNotifiedKeys, ...fresh.map(item => item.id)].slice(-80);
    onSettingsChange({ ...settings, lastNotifiedKeys: retained });
  }, [reminders, settings, onSettingsChange, onReminderAction]);

  const enableBrowserNotifications = async () => {
    if (!("Notification" in window)) {
      onMessage("이 브라우저는 알림을 지원하지 않습니다.");
      return;
    }
    try {
      await navigator.serviceWorker?.register("/sw.js");
    } catch {
      // 알림은 서비스 워커 없이도 현재 열린 페이지에서 동작합니다.
    }
    const permission = await Notification.requestPermission();
    const enabled = permission === "granted";
    onSettingsChange({ ...settings, browserEnabled: enabled });
    onMessage(enabled ? "브라우저 알림을 켰습니다." : "브라우저 알림 권한을 허용하지 않았습니다.");
  };

  const completeMedication = (item: typeof dueMedications[number]) => {
    const now = new Date();
    const actualTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const timestamp = now.toISOString();
    onMedicationSave({
      id: createId("medication-log"),
      catId: item.cat.id,
      medicationId: item.medication.id,
      date: today,
      scheduledTime: item.schedule.time,
      actualTime,
      dose: null,
      doseUnit: item.medication.stockUnit || "정",
      status: "given",
      administeredBy: "",
      sideEffects: "",
      notes: "알림에서 완료 체크",
      linkedScheduleId: item.schedule.id,
      stockDeducted: false,
      scheduleCompletedByLog: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: "1px solid var(--card-border)", borderRadius: 4 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <NotificationsActiveRounded color="primary" />
            <Typography variant="h6" fontWeight={800}>오늘 할 일·알림</Typography>
            <Chip size="small" label={`${visibleReminders.length + pendingMedications.length}개`} color={visibleReminders.length + pendingMedications.length ? "primary" : "success"} variant="outlined" />
          </Stack>
          <Typography variant="body2" color="text.secondary">항목을 눌러 바로 기록하고, 저장하거나 완료하면 목록에서 자동으로 사라집니다.</Typography>
        </Box>
        <Button variant={settings.browserEnabled ? "outlined" : "contained"} startIcon={<NotificationsActiveRounded />} onClick={enableBrowserNotifications}>
          {settings.browserEnabled ? "알림 권한 다시 확인" : "브라우저 알림 켜기"}
        </Button>
      </Stack>

      <Stack direction="row" flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
        <FormControlLabel control={<Switch checked={settings.scheduleAlerts} onChange={event => onSettingsChange({ ...settings, scheduleAlerts: event.target.checked })} />} label="케어 일정" />
        <FormControlLabel control={<Switch checked={settings.missingRecordAlerts} onChange={event => onSettingsChange({ ...settings, missingRecordAlerts: event.target.checked })} />} label="기록 할 일" />
        <FormControlLabel control={<Switch checked={settings.refillAlerts} onChange={event => onSettingsChange({ ...settings, refillAlerts: event.target.checked })} />} label="약 재고" />
        <TextField label="미기록 알림 시각" type="number" size="small" value={settings.missingRecordHour} onChange={event => onSettingsChange({ ...settings, missingRecordHour: Math.min(23, Math.max(0, Number(event.target.value))) })} slotProps={{ htmlInput: { min: 0, max: 23 } }} sx={{ width: 145 }} />
        <TextField label="일정 사전 알림(분)" type="number" size="small" value={settings.reminderLeadMinutes} onChange={event => onSettingsChange({ ...settings, reminderLeadMinutes: Math.min(1440, Math.max(0, Number(event.target.value))) })} slotProps={{ htmlInput: { min: 0, max: 1440 } }} sx={{ width: 165 }} />
      </Stack>

      <Paper variant="outlined" sx={{ mt: 2, p: 1.5, borderRadius: 2.5 }}>
        <Typography fontWeight={900}>오늘 투약</Typography>
        <Typography variant="body2" color="text.secondary">체크하면 투약 시각·재고·반복 일정에 반영되고 아래 완료 목록으로 이동합니다.</Typography>
        {pendingMedications.length ? (
          <Stack spacing={0.25} sx={{ mt: 1 }}>
            {pendingMedications.map(item => (
              <FormControlLabel
                key={item.schedule.id}
                control={<Checkbox checked={false} onChange={event => event.target.checked && completeMedication(item)} />}
                label={<Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 0, sm: 1 }} alignItems={{ sm: "center" }}><Typography fontWeight={800}>{item.cat.name} · {item.medication.name}</Typography><Typography variant="body2" color="text.secondary">{item.schedule.time || "시간 미지정"}{item.schedule.notes ? ` · ${item.schedule.notes}` : ""}</Typography></Stack>}
              />
            ))}
          </Stack>
        ) : <Alert severity="success" sx={{ mt: 1 }}>남은 투약이 없습니다.</Alert>}
        {completedMedications.length > 0 && (
          <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
            <Typography variant="subtitle2" color="success.main">오늘 투약 완료</Typography>
            <Stack spacing={0.25} sx={{ mt: 0.5 }}>
              {completedMedications.map(item => (
                <FormControlLabel
                  key={item.schedule.id}
                  control={<Checkbox checked onChange={event => !event.target.checked && item.completedLog && onMedicationDelete(item.completedLog)} />}
                  label={<Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 0, sm: 1 }} alignItems={{ sm: "center" }}><Typography fontWeight={800} sx={{ textDecoration: "line-through" }}>{item.cat.name} · {item.medication.name}</Typography><Typography variant="body2" color="text.secondary">완료 {item.completedLog?.actualTime || "시각 미기록"}</Typography></Stack>}
                />
              ))}
            </Stack>
          </Box>
        )}
        {care.cats.some(cat => cat.medications.length > 0) && dueMedications.length === 0 && <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>오늘 예정된 약이 없습니다. 각 고양이 상세의 ‘투약 관리’에서 매일·매주·매달 반복 일정을 설정할 수 있습니다.</Typography>}
      </Paper>

      <Stack spacing={1} sx={{ mt: 2 }} data-testid="care-reminders">
        {visibleReminders.length ? visibleReminders.map(reminder => (
          <Alert key={reminder.id} severity={reminder.severity} variant="outlined">
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={1}>
              <Box>
                <Typography fontWeight={800}>{reminder.title}</Typography>
                <Typography variant="body2">{reminder.detail}</Typography>
              </Box>
              <Button size="small" variant="text" endIcon={<ArrowForwardRounded />} onClick={() => onReminderAction(reminder)} sx={{ flexShrink: 0 }}>
                {reminder.actionLabel}
              </Button>
            </Stack>
          </Alert>
        )) : <Alert severity="success">{pendingMedications.length ? "투약 외에 남은 기록이나 일정이 없습니다." : "오늘 남은 기록이나 일정이 없습니다."}</Alert>}
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
        브라우저 알림은 사이트가 열려 있을 때 가장 안정적으로 동작합니다. 완전히 종료된 상태의 푸시 알림은 별도 서버 설정이 필요합니다.
      </Typography>
    </Paper>
  );
}
