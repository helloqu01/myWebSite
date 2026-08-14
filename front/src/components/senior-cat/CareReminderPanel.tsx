"use client";

import React, { useEffect, useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import MedicationRounded from "@mui/icons-material/MedicationRounded";
import NotificationsActiveRounded from "@mui/icons-material/NotificationsActiveRounded";
import type { CareState, Medication, NotificationSettings } from "@/types/cat-care";
import { buildCareReminders } from "@/lib/cat-care/reminders";

interface CareReminderPanelProps {
  care: CareState;
  onSettingsChange: (settings: NotificationSettings) => void;
  onMedicationChange: (catId: string, medication: Medication) => void;
  onMessage: (message: string) => void;
}

export default function CareReminderPanel({ care, onSettingsChange, onMedicationChange, onMessage }: CareReminderPanelProps) {
  const reminders = useMemo(() => buildCareReminders(care), [care]);
  const settings = care.notificationSettings;

  useEffect(() => {
    if (!settings.browserEnabled || typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const fresh = reminders.filter(reminder => !settings.lastNotifiedKeys.includes(reminder.id)).slice(0, 4);
    fresh.forEach(reminder => new Notification(reminder.title, { body: reminder.detail, tag: reminder.id, icon: "/icons/cat-care.svg" }));
    if (!fresh.length) return;
    const retained = [...settings.lastNotifiedKeys, ...fresh.map(item => item.id)].slice(-80);
    onSettingsChange({ ...settings, lastNotifiedKeys: retained });
  }, [reminders, settings, onSettingsChange]);

  const enableBrowserNotifications = async () => {
    if (!("Notification" in window)) { onMessage("이 브라우저는 알림을 지원하지 않습니다."); return; }
    try { await navigator.serviceWorker?.register("/sw.js"); } catch { /* 알림은 서비스 워커 없이도 현재 열린 페이지에서 동작합니다. */ }
    const permission = await Notification.requestPermission();
    const enabled = permission === "granted";
    onSettingsChange({ ...settings, browserEnabled: enabled });
    onMessage(enabled ? "브라우저 알림을 켰습니다." : "브라우저 알림 권한이 허용되지 않았습니다.");
  };

  const updateNumber = (catId: string, medication: Medication, key: "stockCount" | "refillThreshold", value: string) => {
    const parsed = value.trim() ? Number(value) : null;
    onMedicationChange(catId, { ...medication, [key]: parsed != null && Number.isFinite(parsed) ? parsed : null });
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: "1px solid var(--card-border)", borderRadius: 4 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2}>
        <Box><Stack direction="row" spacing={1} alignItems="center"><NotificationsActiveRounded color="primary" /><Typography variant="h6" fontWeight={800}>알림·약 재고</Typography></Stack><Typography variant="body2" color="text.secondary">투약·검진·기록 누락과 약 재고 부족을 한곳에서 확인합니다.</Typography></Box>
        <Button variant={settings.browserEnabled ? "outlined" : "contained"} startIcon={<NotificationsActiveRounded />} onClick={enableBrowserNotifications}>{settings.browserEnabled ? "알림 권한 다시 확인" : "브라우저 알림 켜기"}</Button>
      </Stack>

      <Stack direction="row" flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
        <FormControlLabel control={<Switch checked={settings.scheduleAlerts} onChange={event => onSettingsChange({ ...settings, scheduleAlerts: event.target.checked })} />} label="케어 일정" />
        <FormControlLabel control={<Switch checked={settings.missingRecordAlerts} onChange={event => onSettingsChange({ ...settings, missingRecordAlerts: event.target.checked })} />} label="기록 누락" />
        <FormControlLabel control={<Switch checked={settings.refillAlerts} onChange={event => onSettingsChange({ ...settings, refillAlerts: event.target.checked })} />} label="약 재고" />
        <TextField label="누락 알림 시각" type="number" size="small" value={settings.missingRecordHour} onChange={event => onSettingsChange({ ...settings, missingRecordHour: Math.min(23, Math.max(0, Number(event.target.value))) })} slotProps={{ htmlInput: { min: 0, max: 23 } }} sx={{ width: 145 }} />
        <TextField label="일정 사전 알림(분)" type="number" size="small" value={settings.reminderLeadMinutes} onChange={event => onSettingsChange({ ...settings, reminderLeadMinutes: Math.min(1440, Math.max(0, Number(event.target.value))) })} slotProps={{ htmlInput: { min: 0, max: 1440 } }} sx={{ width: 165 }} />
      </Stack>

      <Stack spacing={1} sx={{ mt: 2 }}>
        {reminders.length ? reminders.slice(0, 8).map(reminder => <Alert key={reminder.id} severity={reminder.severity} variant="outlined"><Typography fontWeight={800}>{reminder.title}</Typography><Typography variant="body2">{reminder.detail}</Typography></Alert>) : <Alert severity="success">현재 확인할 알림이 없습니다.</Alert>}
      </Stack>

      {care.cats.some(cat => cat.medications.length > 0) && <Box sx={{ mt: 2.5, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}><MedicationRounded color="primary" /><Typography fontWeight={800}>약 재고 설정</Typography><Chip size="small" label="임계값 이하 알림" variant="outlined" /></Stack>
        <Stack spacing={1}>
          {care.cats.flatMap(cat => cat.medications.map(medication => <Stack key={`${cat.id}-${medication.id}`} direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} gap={1} sx={{ p: 1.25, bgcolor: "var(--surface)", borderRadius: 2 }}><Typography fontWeight={800} sx={{ minWidth: 160 }}>{cat.name} · {medication.name}</Typography><TextField label="현재 재고" type="number" size="small" value={medication.stockCount ?? ""} onChange={event => updateNumber(cat.id, medication, "stockCount", event.target.value)} sx={{ width: 130 }} /><TextField label="알림 기준" type="number" size="small" value={medication.refillThreshold ?? ""} onChange={event => updateNumber(cat.id, medication, "refillThreshold", event.target.value)} sx={{ width: 130 }} /><TextField label="단위" size="small" value={medication.stockUnit} onChange={event => onMedicationChange(cat.id, { ...medication, stockUnit: event.target.value })} sx={{ width: 110 }} /></Stack>))}
        </Stack>
      </Box>}
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>브라우저 알림은 사이트가 열려 있을 때 가장 안정적으로 동작합니다. 앱이 완전히 종료된 상태의 원격 푸시는 별도 서버 설정이 필요합니다.</Typography>
    </Paper>
  );
}
