"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import PetsRounded from "@mui/icons-material/PetsRounded";
import StarRounded from "@mui/icons-material/StarRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import DownloadRounded from "@mui/icons-material/DownloadRounded";
import HealthAndSafetyRounded from "@mui/icons-material/HealthAndSafetyRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import CalendarMonthRounded from "@mui/icons-material/CalendarMonthRounded";
import MonitorHeartRounded from "@mui/icons-material/MonitorHeartRounded";
import LockRounded from "@mui/icons-material/LockRounded";
import PlaylistAddCheckRounded from "@mui/icons-material/PlaylistAddCheckRounded";
import PrintRounded from "@mui/icons-material/PrintRounded";
import CatProfileDialog from "@/components/senior-cat/CatProfileDialog";
import CareCalendar from "@/components/senior-cat/CareCalendar";
import CareSchedulePanel from "@/components/senior-cat/CareSchedulePanel";
import CareReminderPanel from "@/components/senior-cat/CareReminderPanel";
import CloudSyncPanel from "@/components/senior-cat/CloudSyncPanel";
import DailyRecordForm from "@/components/senior-cat/DailyRecordForm";
import EmergencyCardPanel from "@/components/senior-cat/EmergencyCardPanel";
import FoodHistoryPanel from "@/components/senior-cat/FoodHistoryPanel";
import HealthCheckupPanel from "@/components/senior-cat/HealthCheckupPanel";
import HouseholdLitterPanel from "@/components/senior-cat/HouseholdLitterPanel";
import LabReportPanel from "@/components/senior-cat/LabReportPanel";
import LabTrendCharts from "@/components/senior-cat/LabTrendCharts";
import QuickRecordDialog from "@/components/senior-cat/QuickRecordDialog";
import TrendCharts from "@/components/senior-cat/TrendCharts";
import WeeklyWellnessPanel from "@/components/senior-cat/WeeklyWellnessPanel";
import type {
  AlertLevel,
  CareSchedule,
  CareState,
  CatProfile,
  DailyRecord,
  EmergencyInfo,
  FoodItem,
  HealthAlert,
  HealthCheckup,
  HouseholdLitterRecord,
  LabReport,
  Medication,
  NotificationSettings,
  TimedCareEvent,
  WeeklyWellnessCheck,
} from "@/types/cat-care";
import { MAX_CATS } from "@/types/cat-care";
import {
  EMPTY_CARE_STATE,
  exportCareCsv,
  exportCareJson,
  loadCareState,
  normalizeCareState,
  saveCareState,
  toLocalDateKey,
} from "@/lib/cat-care/storage";
import { deleteMedicalDocument, deleteMedicalDocuments } from "@/lib/cat-care/medical-documents";
import {
  buildCatAlerts,
  getCatAge,
  getHighestAlertLevel,
  getRecordsInRange,
  recordsForCat,
} from "@/lib/cat-care/insights";
import { openVetReport } from "@/lib/cat-care/reports";
import type { CareReminder } from "@/lib/cat-care/reminders";

const statusStyle: Record<AlertLevel | "stable", { label: string; color: "default" | "info" | "warning" | "error" | "success" }> = {
  stable: { label: "안정적", color: "success" },
  info: { label: "기준선 준비 중", color: "info" },
  watch: { label: "관찰 필요", color: "warning" },
  consult: { label: "상담 권장", color: "warning" },
  urgent: { label: "즉시 진료", color: "error" },
};

const confidenceLabel = {
  high: "신뢰도 높음",
  medium: "신뢰도 보통",
  low: "신뢰도 낮음",
};

function formatDate(date: string): string {
  const [, month, day] = date.split("-");
  return `${Number(month)}월 ${Number(day)}일`;
}

function latestValue(record: DailyRecord | undefined, key: "waterMl" | "urineCount" | "stoolCount" | "weightKg", unit: string) {
  const value = record?.[key];
  return value == null ? "—" : `${value}${unit}`;
}

function timedCareEventText(event: TimedCareEvent, foodItems: FoodItem[]): string {
  const label = { meal: "식사", urine: "소변", stool: "대변", seizure: "발작" }[event.type];
  const amount = event.type === "meal" && event.amountGrams != null ? ` ${event.amountGrams}g` : "";
  const duration = event.type === "seizure" && event.durationSeconds != null ? ` ${event.durationSeconds}초` : "";
  const food = event.foodItemId ? foodItems.find(item => item.id === event.foodItemId) : null;
  const foodName = food ? ` ${food.brand}${food.productName ? ` ${food.productName}` : ""}` : "";
  return `${event.time || "--:--"} ${label}${amount}${duration}${foodName}`;
}

interface CatCardProps {
  cat: CatProfile;
  selected: boolean;
  records: DailyRecord[];
  alerts: HealthAlert[];
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function CatCard({ cat, selected, records, alerts, onSelect, onEdit, onDelete }: CatCardProps) {
  const level = getHighestAlertLevel(alerts);
  const status = statusStyle[level];
  const today = toLocalDateKey(new Date());
  const todayRecord = records.find(record => record.date === today);
  const age = getCatAge(cat.birthDate);

  return (
    <Card
      elevation={0}
      onClick={onSelect}
      sx={{
        p: 2.25,
        cursor: "pointer",
        borderRadius: 3.5,
        borderColor: selected ? "primary.main" : "var(--card-border)",
        boxShadow: selected ? "0 0 0 2px rgba(139,92,246,0.16)" : "var(--shadow-soft)",
        transition: "transform 0.2s ease, border-color 0.2s ease",
        "&:hover": { transform: "translateY(-2px)", borderColor: "primary.main" },
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: cat.focusCare ? "primary.main" : "secondary.main", width: 46, height: 46 }}>
              <PetsRounded />
            </Avatar>
            <Box>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography variant="h6" fontWeight={800}>{cat.name}</Typography>
                {cat.focusCare && <StarRounded sx={{ color: "#f59e0b", fontSize: 18 }} />}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {age == null ? "나이 미등록" : `${age}살`} · {cat.isSenior ? "노묘" : "일반관리"}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={0.25}>
            <Tooltip title="프로필 수정">
              <IconButton size="small" onClick={event => { event.stopPropagation(); onEdit(); }}>
                <EditRounded fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="삭제">
              <IconButton size="small" color="error" onClick={event => { event.stopPropagation(); onDelete(); }}>
                <DeleteOutlineRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          <Chip label={status.label} color={status.color} size="small" />
          {cat.focusCare && <Chip label="집중관리" size="small" variant="outlined" color="primary" />}
          <Chip
            label={todayRecord ? "오늘 기록 완료" : "오늘 미기록"}
            size="small"
            variant="outlined"
          />
        </Stack>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
          {[
            ["물", latestValue(todayRecord, "waterMl", "ml")],
            ["소변", latestValue(todayRecord, "urineCount", "회")],
            ["대변", latestValue(todayRecord, "stoolCount", "회")],
          ].map(([label, value]) => (
            <Box key={label} sx={{ p: 1, borderRadius: 2, bgcolor: "var(--surface)" }}>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
              <Typography variant="body2" fontWeight={700}>{value}</Typography>
            </Box>
          ))}
        </Box>
      </Stack>
    </Card>
  );
}

function AlertItem({ alert, catName }: { alert: HealthAlert; catName?: string }) {
  const severity = alert.level === "urgent" ? "error" : alert.level === "consult" || alert.level === "watch" ? "warning" : "info";
  return (
    <Alert severity={severity} variant="outlined" sx={{ alignItems: "flex-start", borderRadius: 3 }}>
      <Stack spacing={0.5}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          {catName && <Typography fontWeight={800}>{catName}</Typography>}
          <Typography fontWeight={700}>{alert.title}</Typography>
          <Chip label={confidenceLabel[alert.confidence]} size="small" variant="outlined" />
        </Stack>
        <Typography variant="body2">{alert.detail}</Typography>
        <Typography variant="caption" color="text.secondary">근거: {alert.evidence}</Typography>
      </Stack>
    </Alert>
  );
}

export default function SeniorCatPage() {
  const [care, setCare] = useState<CareState>(EMPTY_CARE_STATE);
  const [ready, setReady] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<CatProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateKey(new Date()));
  const [quickRecordOpen, setQuickRecordOpen] = useState(false);
  const [quickRecordDate, setQuickRecordDate] = useState(() => toLocalDateKey(new Date()));
  const [range, setRange] = useState<7 | 30>(7);
  const [reportRange, setReportRange] = useState<7 | 30 | 90>(30);
  const [foodDialogRequest, setFoodDialogRequest] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = loadCareState();
    setCare(stored);
    const first = [...stored.cats].sort((a, b) => Number(b.focusCare) - Number(a.focusCare))[0];
    setSelectedCatId(first?.id ?? null);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveCareState(care);
  }, [care, ready]);

  const orderedCats = useMemo(
    () => [...care.cats].sort((a, b) => {
      if (a.focusCare !== b.focusCare) return Number(b.focusCare) - Number(a.focusCare);
      if (a.isSenior !== b.isSenior) return Number(b.isSenior) - Number(a.isSenior);
      return a.name.localeCompare(b.name, "ko");
    }),
    [care.cats],
  );

  const alertsByCat = useMemo(
    () => new Map(care.cats.map(cat => [cat.id, buildCatAlerts(cat, care.records)])),
    [care.cats, care.records],
  );

  const attentionAlerts = useMemo(
    () => care.cats
      .flatMap(cat => (alertsByCat.get(cat.id) ?? []).map(alert => ({ alert, cat })))
      .filter(({ alert }) => alert.level === "urgent" || alert.level === "consult" || alert.level === "watch")
      .slice(0, 6),
    [alertsByCat, care.cats],
  );

  const selectedCat = care.cats.find(cat => cat.id === selectedCatId) ?? null;
  const selectedCatRecords = selectedCat ? recordsForCat(care.records, selectedCat.id) : [];
  const selectedRecord = selectedCatRecords.find(record => record.date === selectedDate) ?? null;
  const selectedAlerts = selectedCat ? alertsByCat.get(selectedCat.id) ?? [] : [];
  const chartRecords = selectedCat ? getRecordsInRange(care.records, selectedCat.id, range) : [];

  const openNewProfile = () => {
    if (care.cats.length >= MAX_CATS) {
      setMessage(`1차 버전에서는 최대 ${MAX_CATS}마리까지 등록할 수 있습니다.`);
      return;
    }
    setEditingProfile(null);
    setProfileDialogOpen(true);
  };

  const openEditProfile = (cat: CatProfile) => {
    setEditingProfile(cat);
    setProfileDialogOpen(true);
  };

  const saveProfile = (profile: CatProfile) => {
    setCare(current => {
      const exists = current.cats.some(cat => cat.id === profile.id);
      if (!exists && current.cats.length >= MAX_CATS) return current;
      return {
        ...current,
        cats: exists
          ? current.cats.map(cat => cat.id === profile.id ? profile : cat)
          : [...current.cats, profile],
      };
    });
    setSelectedCatId(profile.id);
    setProfileDialogOpen(false);
    setMessage(`${profile.name} 프로필을 저장했습니다.`);
  };

  const deleteProfile = async (cat: CatProfile) => {
    const recordCount = care.records.filter(record => record.catId === cat.id).length;
    const scheduleCount = care.schedules.filter(schedule => schedule.catId === cat.id).length;
    const labReportCount = care.labReports.filter(report => report.catId === cat.id).length;
    const healthCheckupCount = care.healthCheckups.filter(checkup => checkup.catId === cat.id).length;
    const weeklyCheckCount = care.weeklyChecks.filter(check => check.catId === cat.id).length;
    const confirmed = window.confirm(
      `${cat.name} 프로필과 건강 기록 ${recordCount}개, 케어 일정 ${scheduleCount}개, 건강검진 ${healthCheckupCount}개, 검사결과 ${labReportCount}개, 주간 체크 ${weeklyCheckCount}개를 이 기기에서 삭제할까요? 삭제 전 JSON 백업을 권장합니다.`,
    );
    if (!confirmed) return;

    const originalDocumentPaths = [
      ...care.labReports.filter(report => report.catId === cat.id).map(report => report.originalDocument?.storagePath),
      ...care.healthCheckups.filter(checkup => checkup.catId === cat.id).map(checkup => checkup.originalDocument?.storagePath),
    ].filter((path): path is string => Boolean(path));
    try {
      await deleteMedicalDocuments(originalDocumentPaths);
    } catch (caught) {
      window.alert(caught instanceof Error ? caught.message : "저장된 원본 사진을 삭제하지 못했습니다.");
      return;
    }

    setCare(current => ({
      ...current,
      cats: current.cats.filter(item => item.id !== cat.id),
      records: current.records.filter(record => record.catId !== cat.id),
      foodItems: current.foodItems.filter(item => item.catId !== cat.id),
      schedules: current.schedules.filter(schedule => schedule.catId !== cat.id),
      labReports: current.labReports.filter(report => report.catId !== cat.id),
      healthCheckups: current.healthCheckups.filter(checkup => checkup.catId !== cat.id),
      weeklyChecks: current.weeklyChecks.filter(check => check.catId !== cat.id),
      householdLitterRecords: current.householdLitterRecords.map(record => record.catId === cat.id ? { ...record, catId: null, confidence: "low" } : record),
      emergencyInfo: current.emergencyInfo.filter(info => info.catId !== cat.id),
    }));
    const next = orderedCats.find(item => item.id !== cat.id);
    setSelectedCatId(next?.id ?? null);
    setMessage(`${cat.name} 프로필과 관련 건강 데이터를 삭제했습니다.`);
  };

  const saveRecord = (record: DailyRecord) => {
    saveRecords([record]);
    setMessage(`${selectedCat?.name ?? "고양이"}의 ${formatDate(record.date)} 기록을 저장했습니다.`);
  };

  const saveRecords = (incoming: DailyRecord[]) => {
    setCare(current => {
      const records = [...current.records];
      incoming.forEach(record => {
        const existingIndex = records.findIndex(item => item.catId === record.catId && item.date === record.date);
        if (existingIndex >= 0) records[existingIndex] = { ...record, id: records[existingIndex].id };
        else records.push(record);
      });

      return {
        ...current,
        cats: current.cats.map(cat => {
          const latestWeight = incoming
            .filter(record => record.catId === cat.id && record.weightKg != null)
            .sort((a, b) => b.date.localeCompare(a.date))[0];
          return latestWeight
            ? { ...cat, currentWeightKg: latestWeight.weightKg, updatedAt: new Date().toISOString() }
            : cat;
        }),
        records,
      };
    });
  };

  const saveQuickRecords = (records: DailyRecord[]) => {
    saveRecords(records);
    setMessage(`${formatDate(quickRecordDate)} 기록을 ${records.length}마리에게 저장했습니다.`);
  };

  const saveFoodItem = (item: FoodItem) => {
    setCare(current => ({
      ...current,
      foodItems: current.foodItems.some(existing => existing.id === item.id)
        ? current.foodItems.map(existing => existing.id === item.id ? item : existing)
        : [...current.foodItems, item],
    }));
    setMessage(`${item.brand}${item.productName ? ` · ${item.productName}` : ""} 급여 이력을 저장했습니다.`);
  };

  const deleteFoodItem = (item: FoodItem) => {
    if (!window.confirm(`${item.brand}${item.productName ? ` · ${item.productName}` : ""} 급여 이력을 삭제할까요?`)) return;
    setCare(current => ({
      ...current,
      foodItems: current.foodItems.filter(existing => existing.id !== item.id),
      records: current.records.map(record => ({
        ...record,
        timedEvents: record.timedEvents.map(event => event.foodItemId === item.id ? { ...event, foodItemId: null } : event),
      })),
    }));
    setMessage("사료·간식 급여 이력을 삭제했습니다.");
  };

  const saveSchedule = (schedule: CareSchedule) => {
    setCare(current => ({
      ...current,
      schedules: current.schedules.some(item => item.id === schedule.id)
        ? current.schedules.map(item => item.id === schedule.id ? schedule : item)
        : [...current.schedules, schedule],
    }));
    setMessage(`${schedule.title} 일정을 저장했습니다.`);
  };

  const deleteSchedule = (schedule: CareSchedule) => {
    if (!window.confirm(`${schedule.title} 일정을 삭제할까요?`)) return;
    setCare(current => ({ ...current, schedules: current.schedules.filter(item => item.id !== schedule.id) }));
    setMessage(`${schedule.title} 일정을 삭제했습니다.`);
  };

  const toggleSchedule = (schedule: CareSchedule, date: string) => {
    const completed = schedule.completedDates.includes(date);
    setCare(current => ({
      ...current,
      cats: current.cats.map(cat => {
        if (cat.id !== schedule.catId || schedule.type !== "medication") return cat;
        const medicationIndex = cat.medications.findIndex(medication => schedule.title.includes(medication.name) || medication.name.includes(schedule.title));
        if (medicationIndex < 0 || cat.medications[medicationIndex].stockCount == null) return cat;
        return {
          ...cat,
          medications: cat.medications.map((medication, index) => index === medicationIndex
            ? { ...medication, stockCount: Math.max(0, medication.stockCount! + (completed ? 1 : -1)) }
            : medication),
          updatedAt: new Date().toISOString(),
        };
      }),
      schedules: current.schedules.map(item => item.id === schedule.id
        ? {
            ...item,
            completedDates: completed
              ? item.completedDates.filter(completedDate => completedDate !== date)
              : [...item.completedDates, date],
            updatedAt: new Date().toISOString(),
          }
        : item),
    }));
  };

  const saveLabReport = (report: LabReport) => {
    setCare(current => ({ ...current, labReports: [...current.labReports, report] }));
    setMessage(`${formatDate(report.date)} 검사결과 ${report.items.length}개를 저장했습니다.`);
  };

  const deleteLabReport = async (report: LabReport) => {
    if (!window.confirm(`${formatDate(report.date)} 검사결과를 삭제할까요?`)) return;
    try {
      if (report.originalDocument) await deleteMedicalDocument(report.originalDocument.storagePath);
    } catch (caught) {
      window.alert(caught instanceof Error ? caught.message : "저장된 원본 사진을 삭제하지 못했습니다.");
      return;
    }
    setCare(current => ({
      ...current,
      labReports: current.labReports.filter(item => item.id !== report.id),
      healthCheckups: current.healthCheckups.map(checkup => ({
        ...checkup,
        relatedLabReportIds: checkup.relatedLabReportIds.filter(id => id !== report.id),
      })),
    }));
    setMessage("검사결과를 삭제했습니다.");
  };

  const saveHealthCheckup = (checkup: HealthCheckup) => {
    setCare(current => ({
      ...current,
      cats: current.cats.map(cat => cat.id === checkup.catId && checkup.weightKg != null
        ? { ...cat, currentWeightKg: checkup.weightKg, updatedAt: checkup.updatedAt }
        : cat),
      healthCheckups: current.healthCheckups.some(item => item.id === checkup.id)
        ? current.healthCheckups.map(item => item.id === checkup.id ? checkup : item)
        : [...current.healthCheckups, checkup],
    }));
    setMessage(`${formatDate(checkup.date)} 건강검진·진료 내용을 저장했습니다.`);
  };

  const deleteHealthCheckup = async (checkup: HealthCheckup) => {
    if (!window.confirm(`${formatDate(checkup.date)} 건강검진·진료 기록을 삭제할까요?`)) return;
    try {
      if (checkup.originalDocument) await deleteMedicalDocument(checkup.originalDocument.storagePath);
    } catch (caught) {
      window.alert(caught instanceof Error ? caught.message : "저장된 원본 사진을 삭제하지 못했습니다.");
      return;
    }
    setCare(current => ({ ...current, healthCheckups: current.healthCheckups.filter(item => item.id !== checkup.id) }));
    setMessage("건강검진·진료 기록을 삭제했습니다.");
  };

  const saveWeeklyCheck = (check: WeeklyWellnessCheck) => {
    setCare(current => ({
      ...current,
      weeklyChecks: current.weeklyChecks.some(item => item.catId === check.catId && item.date === check.date)
        ? current.weeklyChecks.map(item => item.catId === check.catId && item.date === check.date ? { ...check, id: item.id } : item)
        : [...current.weeklyChecks, check],
    }));
    setMessage(`${formatDate(check.date)} 주간 상태 체크를 저장했습니다.`);
  };

  const saveLitterRecord = (record: HouseholdLitterRecord) => {
    setCare(current => ({
      ...current,
      householdLitterRecords: current.householdLitterRecords.some(item => item.id === record.id)
        ? current.householdLitterRecords.map(item => item.id === record.id ? record : item)
        : [...current.householdLitterRecords, record],
    }));
    setMessage("공동 화장실 기록을 저장했습니다.");
  };

  const deleteLitterRecord = (record: HouseholdLitterRecord) => {
    setCare(current => ({ ...current, householdLitterRecords: current.householdLitterRecords.filter(item => item.id !== record.id) }));
    setMessage("공동 화장실 기록을 삭제했습니다.");
  };

  const saveEmergencyInfo = (info: EmergencyInfo) => {
    setCare(current => ({
      ...current,
      emergencyInfo: current.emergencyInfo.some(item => item.catId === info.catId)
        ? current.emergencyInfo.map(item => item.catId === info.catId ? info : item)
        : [...current.emergencyInfo, info],
    }));
    setMessage("응급·병원 정보를 저장했습니다.");
  };

  const updateNotificationSettings = (notificationSettings: NotificationSettings) => {
    setCare(current => ({ ...current, notificationSettings }));
  };

  const updateMedication = (catId: string, medication: Medication) => {
    setCare(current => ({
      ...current,
      cats: current.cats.map(cat => cat.id === catId
        ? { ...cat, medications: cat.medications.map(item => item.id === medication.id ? medication : item), updatedAt: new Date().toISOString() }
        : cat),
    }));
  };

  const handleReminderAction = (reminder: CareReminder) => {
    if (reminder.catId) setSelectedCatId(reminder.catId);
    if (reminder.targetDate) setSelectedDate(reminder.targetDate);
    if (reminder.action === "food_history") setFoodDialogRequest(current => current + 1);

    const targetId = {
      daily_record: "daily-record-section",
      schedule: "schedule-care-section",
      weekly_check: "weekly-care-section",
      medication_stock: "medication-stock-section",
      food_history: "food-history-section",
    }[reminder.action];
    window.setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const restoreCloudCare = (nextCare: CareState) => {
    const normalized = normalizeCareState(nextCare);
    setCare(normalized);
    setSelectedCatId(current => normalized.cats.some(cat => cat.id === current) ? current : normalized.cats[0]?.id ?? null);
    setMessage("클라우드 건강 기록을 이 기기에 적용했습니다.");
  };

  const clearLocalCareAfterLogout = () => {
    const cleared = normalizeCareState(EMPTY_CARE_STATE);
    saveCareState(cleared);
    setCare(cleared);
    setSelectedCatId(null);
    setEditingProfile(null);
    setProfileDialogOpen(false);
    setQuickRecordOpen(false);
  };

  const showVetReport = () => {
    if (!selectedCat) return;
    const opened = openVetReport({
      cat: selectedCat,
      records: getRecordsInRange(care.records, selectedCat.id, reportRange),
      alerts: selectedAlerts,
      schedules: care.schedules,
      foodItems: care.foodItems,
      labReports: care.labReports,
      healthCheckups: care.healthCheckups,
      weeklyChecks: care.weeklyChecks,
      emergencyInfo: care.emergencyInfo.find(info => info.catId === selectedCat.id) ?? null,
      days: reportRange,
    });
    if (!opened) setMessage("팝업이 차단되었습니다. 이 사이트의 팝업을 허용한 뒤 다시 시도해 주세요.");
  };

  if (!ready) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: "70vh" }} spacing={2}>
        <CircularProgress />
        <Typography color="text.secondary">건강 기록을 불러오는 중입니다.</Typography>
      </Stack>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", pb: 8, overflow: "hidden" }}>
      <Box
        sx={{
          position: "relative",
          py: { xs: 7, md: 10 },
          borderBottom: "1px solid var(--card-border)",
          "&::before": {
            content: '\"\"',
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 12% 20%, rgba(34,197,94,0.16), transparent 38%), radial-gradient(circle at 82% 5%, rgba(56,189,248,0.18), transparent 40%)",
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: "relative" }}>
          <Stack spacing={3}>
            <Chip
              icon={<PetsRounded />}
              label="우리 고양이 건강 루틴"
              color="primary"
              variant="outlined"
              sx={{ width: "fit-content" }}
            />
            <Box>
              <Typography variant="h2" sx={{ fontSize: { xs: "2.25rem", md: "3.75rem" }, maxWidth: 800 }}>
                네 마리의 오늘을 기록하고,
                <Box component="span" className="gradient-text"> 작은 변화를 먼저 발견하세요.</Box>
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 2, maxWidth: 720, fontSize: { md: "1.08rem" } }}>
                음수량, 배변, 체중, 식욕과 투약을 고양이별로 관리합니다. 자동 알림은 진단이 아닌
                개인 기준선의 변화를 알려주는 관찰 도구입니다.
              </Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddRounded />}
                onClick={openNewProfile}
                disabled={care.cats.length >= MAX_CATS}
              >
                고양이 등록 {care.cats.length}/{MAX_CATS}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<PlaylistAddCheckRounded />}
                disabled={!care.cats.length}
                onClick={() => {
                  setQuickRecordDate(toLocalDateKey(new Date()));
                  setQuickRecordOpen(true);
                }}
              >
                전체 고양이 빠른 기록
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<DownloadRounded />}
                disabled={!care.cats.length}
                onClick={() => exportCareJson(care)}
              >
                JSON 백업
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<DownloadRounded />}
                disabled={!care.records.length}
                onClick={() => exportCareCsv(care)}
              >
                CSV 내보내기
              </Button>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <LockRounded sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                기본값은 현재 브라우저에만 저장됩니다. 클라우드 동기화를 직접 켠 경우에만 로그인한 가족 공간으로 전송됩니다.
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: { xs: 4, md: 6 } }}>
        <Stack spacing={5}>
          <Box component="section" aria-label="백업과 알림 도구">
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 0.85fr) minmax(0, 1.15fr)" }, gap: 3 }}>
              <CloudSyncPanel care={care} onRestore={restoreCloudCare} onLogout={clearLocalCareAfterLogout} onMessage={setMessage} />
              <CareReminderPanel
                care={care}
                onSettingsChange={updateNotificationSettings}
                onMedicationChange={updateMedication}
                onReminderAction={handleReminderAction}
                onMessage={setMessage}
              />
            </Box>
          </Box>

          {care.cats.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                py: { xs: 7, md: 10 },
                px: 3,
                textAlign: "center",
                border: "1px dashed",
                borderColor: "primary.main",
                borderRadius: 4,
                background: "var(--surface)",
              }}
            >
              <Avatar sx={{ mx: "auto", mb: 2, width: 64, height: 64, bgcolor: "primary.main" }}>
                <PetsRounded fontSize="large" />
              </Avatar>
              <Typography variant="h4" fontWeight={800}>첫 고양이를 등록해 주세요</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                최대 네 마리를 등록하고, 노묘 세 마리는 집중관리로 지정할 수 있습니다.
              </Typography>
              <Button variant="contained" size="large" startIcon={<AddRounded />} onClick={openNewProfile}>
                고양이 등록 시작
              </Button>
            </Paper>
          ) : (
            <>
              <Box component="section" aria-labelledby="cats-heading">
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={2}
                  sx={{ mb: 2 }}
                >
                  <Box>
                    <Typography id="cats-heading" variant="h4" fontWeight={800}>우리 고양이</Typography>
                    <Typography variant="body2" color="text.secondary">집중관리와 노묘가 먼저 표시됩니다.</Typography>
                  </Box>
                  {care.cats.length < MAX_CATS && (
                    <Button startIcon={<AddRounded />} onClick={openNewProfile}>고양이 추가</Button>
                  )}
                </Stack>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" },
                    gap: 2,
                  }}
                >
                  {orderedCats.map(cat => (
                    <CatCard
                      key={cat.id}
                      cat={cat}
                      selected={cat.id === selectedCatId}
                      records={recordsForCat(care.records, cat.id)}
                      alerts={alertsByCat.get(cat.id) ?? []}
                      onSelect={() => setSelectedCatId(cat.id)}
                      onEdit={() => openEditProfile(cat)}
                      onDelete={() => deleteProfile(cat)}
                    />
                  ))}
                </Box>
              </Box>

              <Box component="section" aria-labelledby="attention-heading">
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <MonitorHeartRounded color="warning" />
                  <Typography id="attention-heading" variant="h5" fontWeight={800}>지금 확인할 내용</Typography>
                </Stack>
                {attentionAlerts.length ? (
                  <Stack spacing={1.25}>
                    {attentionAlerts.map(({ alert, cat }) => (
                      <AlertItem key={alert.id} alert={alert} catName={cat.name} />
                    ))}
                  </Stack>
                ) : (
                  <Alert severity="success" icon={<CheckCircleRounded />} sx={{ borderRadius: 3 }}>
                    현재 저장된 기록에서 주의가 필요한 변화는 발견되지 않았습니다.
                  </Alert>
                )}
              </Box>

              <HouseholdLitterPanel
                cats={orderedCats}
                records={care.householdLitterRecords}
                onSave={saveLitterRecord}
                onDelete={deleteLitterRecord}
              />

              {selectedCat && (
                <Box component="section" aria-labelledby="selected-cat-heading">
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2.5, md: 3.5 },
                      mb: 3,
                      border: "1px solid var(--card-border)",
                      borderRadius: 4,
                      background: "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(34,211,238,0.06))",
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", md: "center" }}
                      spacing={2}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 58, height: 58, bgcolor: "primary.main" }}><PetsRounded /></Avatar>
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                            <Typography id="selected-cat-heading" variant="h4" fontWeight={800}>{selectedCat.name}</Typography>
                            {selectedCat.focusCare && <Chip icon={<StarRounded />} label="집중관리" color="primary" size="small" />}
                            {selectedCat.isSenior && <Chip label="노묘" variant="outlined" size="small" />}
                          </Stack>
                          <Typography color="text.secondary">
                            {getCatAge(selectedCat.birthDate) == null ? "나이 미등록" : `${getCatAge(selectedCat.birthDate)}살`}
                            {selectedCat.currentWeightKg != null && ` · 최근 ${selectedCat.currentWeightKg}kg`}
                            {selectedCat.conditions.length > 0 && ` · ${selectedCat.conditions.join(", ")}`}
                          </Typography>
                        </Box>
                      </Stack>
                      <Button variant="outlined" startIcon={<EditRounded />} onClick={() => openEditProfile(selectedCat)}>
                        관리 정보 수정
                      </Button>
                    </Stack>
                    {(selectedCat.vetTargets || selectedCat.notes) && (
                      <>
                        <Divider sx={{ my: 2.5 }} />
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 2 }}>
                          {selectedCat.vetTargets && (
                            <Box>
                              <Typography variant="caption" color="text.secondary">주치의 목표·관리 기준</Typography>
                              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{selectedCat.vetTargets}</Typography>
                            </Box>
                          )}
                          {selectedCat.notes && (
                            <Box>
                              <Typography variant="caption" color="text.secondary">프로필 메모</Typography>
                              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{selectedCat.notes}</Typography>
                            </Box>
                          )}
                        </Box>
                      </>
                    )}
                  </Paper>

                  {selectedAlerts.length > 0 && (
                    <Stack spacing={1.25} sx={{ mb: 3 }}>
                      {selectedAlerts.slice(0, 4).map(alert => <AlertItem key={alert.id} alert={alert} />)}
                    </Stack>
                  )}

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
                      gap: 3,
                      mb: 3,
                    }}
                  >
                    <Box id="weekly-care-section" sx={{ scrollMarginTop: 96 }}>
                      <WeeklyWellnessPanel cat={selectedCat} checks={care.weeklyChecks} onSave={saveWeeklyCheck} />
                    </Box>
                    <EmergencyCardPanel
                      cat={selectedCat}
                      info={care.emergencyInfo.find(info => info.catId === selectedCat.id) ?? null}
                      onSave={saveEmergencyInfo}
                      onMessage={setMessage}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
                      gap: 3,
                      mb: 3,
                    }}
                  >
                    <CareCalendar
                      catId={selectedCat.id}
                      records={care.records}
                      schedules={care.schedules}
                      selectedDate={selectedDate}
                      onSelectDate={setSelectedDate}
                    />
                    <Box id="schedule-care-section" sx={{ scrollMarginTop: 96 }}>
                      <CareSchedulePanel
                        cat={selectedCat}
                        date={selectedDate}
                        schedules={care.schedules}
                        onSave={saveSchedule}
                        onDelete={deleteSchedule}
                        onToggle={toggleSchedule}
                      />
                    </Box>
                  </Box>

                  <Box id="food-history-section" sx={{ mb: 3, scrollMarginTop: 96 }}>
                    <FoodHistoryPanel
                      cat={selectedCat}
                      items={care.foodItems.filter(item => item.catId === selectedCat.id)}
                      openRequestKey={foodDialogRequest}
                      onSave={saveFoodItem}
                      onDelete={deleteFoodItem}
                    />
                  </Box>

                  <Box id="daily-record-section" sx={{ scrollMarginTop: 96 }}>
                    <DailyRecordForm
                      cat={selectedCat}
                      foodItems={care.foodItems.filter(item => item.catId === selectedCat.id)}
                      date={selectedDate}
                      record={selectedRecord}
                      onDateChange={setSelectedDate}
                      onSave={saveRecord}
                    />
                  </Box>

                  <Box sx={{ mt: 4 }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      spacing={2}
                      sx={{ mb: 2 }}
                    >
                      <Box>
                        <Typography variant="h5" fontWeight={800}>건강 추세</Typography>
                        <Typography variant="body2" color="text.secondary">측정된 값만 그래프에 반영됩니다.</Typography>
                      </Box>
                      <ToggleButtonGroup
                        value={range}
                        exclusive
                        size="small"
                        onChange={(_, value: 7 | 30 | null) => value && setRange(value)}
                      >
                        <ToggleButton value={7}>7일</ToggleButton>
                        <ToggleButton value={30}>30일</ToggleButton>
                      </ToggleButtonGroup>
                    </Stack>
                    <TrendCharts records={chartRecords} />
                  </Box>

                  <Paper
                    elevation={0}
                    sx={{ mt: 3, p: { xs: 2, sm: 3 }, border: "1px solid var(--card-border)", borderRadius: 4 }}
                  >
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", md: "center" }}
                      gap={2}
                    >
                      <Box>
                        <Typography variant="h6" fontWeight={800}>병원 공유 리포트</Typography>
                        <Typography variant="body2" color="text.secondary">
                          프로필, 자동 감지 내용, 케어 일정과 일별 기록을 인쇄하거나 PDF로 저장합니다.
                        </Typography>
                      </Box>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                        <ToggleButtonGroup
                          value={reportRange}
                          exclusive
                          size="small"
                          onChange={(_, value: 7 | 30 | 90 | null) => value && setReportRange(value)}
                        >
                          <ToggleButton value={7}>7일</ToggleButton>
                          <ToggleButton value={30}>30일</ToggleButton>
                          <ToggleButton value={90}>90일</ToggleButton>
                        </ToggleButtonGroup>
                        <Button variant="contained" startIcon={<PrintRounded />} onClick={showVetReport}>
                          리포트 열기
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>

                  <Box sx={{ mt: 4 }}>
                    <HealthCheckupPanel
                      cat={selectedCat}
                      checkups={care.healthCheckups}
                      labReports={care.labReports}
                      onSave={saveHealthCheckup}
                      onDelete={deleteHealthCheckup}
                    />
                  </Box>

                  <Box sx={{ mt: 4 }}>
                    <LabReportPanel
                      cat={selectedCat}
                      reports={care.labReports}
                      onSave={saveLabReport}
                      onDelete={deleteLabReport}
                    />
                  </Box>

                  <Box sx={{ mt: 4 }}>
                    <LabTrendCharts catId={selectedCat.id} reports={care.labReports} />
                  </Box>

                  <Paper
                    elevation={0}
                    sx={{ mt: 4, p: { xs: 2, sm: 3 }, border: "1px solid var(--card-border)", borderRadius: 4 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <CalendarMonthRounded color="primary" />
                      <Typography variant="h6" fontWeight={800}>최근 기록</Typography>
                    </Stack>
                    {selectedCatRecords.length ? (
                      <Box sx={{ overflowX: "auto" }}>
                        <Box component="table" sx={{ width: "100%", minWidth: 860, borderCollapse: "collapse" }}>
                          <Box component="thead">
                            <Box component="tr">
                              {["날짜", "음수량", "소변", "대변", "식욕", "체중", "시간 기록", "투약"].map(label => (
                                <Box component="th" key={label} sx={{ textAlign: "left", py: 1.25, px: 1, color: "text.secondary", fontSize: 13, borderBottom: "1px solid", borderColor: "divider" }}>
                                  {label}
                                </Box>
                              ))}
                            </Box>
                          </Box>
                          <Box component="tbody">
                            {[...selectedCatRecords].reverse().slice(0, 10).map(record => {
                              const done = Object.values(record.medicationChecks).filter(Boolean).length;
                              return (
                                <Box
                                  component="tr"
                                  key={record.id}
                                  onClick={() => { setSelectedDate(record.date); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                                  sx={{ cursor: "pointer", "&:hover": { bgcolor: "var(--surface)" } }}
                                >
                                  <Box component="td" sx={{ py: 1.25, px: 1, fontWeight: 700 }}>{formatDate(record.date)}</Box>
                                  <Box component="td" sx={{ py: 1.25, px: 1 }}>{record.waterMl == null ? "—" : `${record.waterMl}ml`}</Box>
                                  <Box component="td" sx={{ py: 1.25, px: 1 }}>{record.urineCount == null ? "—" : `${record.urineCount}회`}</Box>
                                  <Box component="td" sx={{ py: 1.25, px: 1 }}>{record.stoolCount == null ? "—" : `${record.stoolCount}회`}</Box>
                                  <Box component="td" sx={{ py: 1.25, px: 1 }}>{{ good: "좋음", normal: "평소", low: "감소", none: "없음" }[record.appetite]}</Box>
                                  <Box component="td" sx={{ py: 1.25, px: 1 }}>{record.weightKg == null ? "—" : `${record.weightKg}kg`}</Box>
                                  <Box component="td" sx={{ py: 1.25, px: 1, minWidth: 180 }}>
                                    {record.timedEvents.length
                                      ? record.timedEvents.slice().sort((a, b) => a.time.localeCompare(b.time)).map(event => timedCareEventText(event, care.foodItems)).join(" · ")
                                      : "—"}
                                  </Box>
                                  <Box component="td" sx={{ py: 1.25, px: 1 }}>{selectedCat.medications.length ? `${done}/${selectedCat.medications.length}` : "—"}</Box>
                                </Box>
                              );
                            })}
                          </Box>
                        </Box>
                      </Box>
                    ) : (
                      <Typography color="text.secondary">아직 저장된 기록이 없습니다.</Typography>
                    )}
                  </Paper>
                </Box>
              )}
            </>
          )}

          <Alert
            severity="info"
            icon={<HealthAndSafetyRounded />}
            sx={{ borderRadius: 3 }}
          >
            이 서비스는 보호자의 관찰을 돕는 기록 도구이며 수의사의 진단을 대신하지 않습니다. 소변이 나오지 않음,
            호흡 곤란, 쓰러짐·경련 등 응급 징후가 있으면 기록 여부와 관계없이 즉시 동물병원에 연락하세요.
          </Alert>
        </Stack>
      </Container>

      <CatProfileDialog
        open={profileDialogOpen}
        profile={editingProfile}
        onClose={() => setProfileDialogOpen(false)}
        onSave={saveProfile}
      />

      <QuickRecordDialog
        open={quickRecordOpen}
        cats={orderedCats}
        records={care.records}
        date={quickRecordDate}
        onDateChange={setQuickRecordDate}
        onClose={() => setQuickRecordOpen(false)}
        onSave={saveQuickRecords}
      />

      <Snackbar
        open={Boolean(message)}
        autoHideDuration={3500}
        onClose={() => setMessage("")}
        message={message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}
