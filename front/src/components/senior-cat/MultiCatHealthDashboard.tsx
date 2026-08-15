"use client";

import React, { useMemo } from "react";
import { Avatar, Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import DashboardRounded from "@mui/icons-material/DashboardRounded";
import EventAvailableRounded from "@mui/icons-material/EventAvailableRounded";
import PetsRounded from "@mui/icons-material/PetsRounded";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import type { CareSchedule, CatProfile, DailyRecord } from "@/types/cat-care";
import { isScheduleDue } from "@/lib/cat-care/schedules";

interface MultiCatHealthDashboardProps {
  cats: CatProfile[];
  records: DailyRecord[];
  schedules: CareSchedule[];
  selectedDate: string;
  onSelectCat: (catId: string) => void;
}

function needsAttention(record?: DailyRecord): boolean {
  if (!record) return false;
  return Boolean(
    record.urineNotProduced
    || record.breathingDifficulty
    || record.collapseOrSeizure
    || record.urinationStraining
    || record.bloodInUrine
    || record.appetite === "none"
    || record.vomitCount >= 2,
  );
}

function displayCount(value: number | null | undefined): string {
  return value == null ? "—" : `${value}회`;
}

export default function MultiCatHealthDashboard({ cats, records, schedules, selectedDate, onSelectCat }: MultiCatHealthDashboardProps) {
  const rows = useMemo(() => cats.map(cat => {
    const record = records.find(item => item.catId === cat.id && item.date === selectedDate);
    const due = schedules.filter(schedule => schedule.catId === cat.id && isScheduleDue(schedule, selectedDate));
    const completedSchedules = due.filter(schedule => schedule.completedDates.includes(selectedDate)).length;
    const mealCount = record?.timedEvents.filter(event => event.type === "meal").length ?? 0;
    const medicationDone = cat.medications.filter(medication => Boolean(record?.medicationChecks[medication.id])).length;
    const latestWeight = records
      .filter(item => item.catId === cat.id && item.date <= selectedDate && item.weightKg != null)
      .sort((a, b) => b.date.localeCompare(a.date))[0]?.weightKg ?? cat.currentWeightKg;
    return { cat, record, due, completedSchedules, mealCount, medicationDone, latestWeight, attention: needsAttention(record) };
  }), [cats, records, schedules, selectedDate]);

  const recordedCount = rows.filter(row => row.record).length;
  const attentionCount = rows.filter(row => row.attention).length;
  const dueCount = rows.reduce((sum, row) => sum + row.due.length, 0);
  const completedScheduleCount = rows.reduce((sum, row) => sum + row.completedSchedules, 0);
  const medicationTotal = rows.reduce((sum, row) => sum + row.cat.medications.length, 0);
  const medicationDone = rows.reduce((sum, row) => sum + row.medicationDone, 0);

  return (
    <Paper component="section" elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: "1px solid var(--card-border)", borderRadius: 4 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1} sx={{ mb: 2.5 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center"><DashboardRounded color="primary" /><Typography variant="h5" fontWeight={900}>전체 고양이 통합 대시보드</Typography></Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{selectedDate} 하루 상태를 한눈에 비교합니다.</Typography>
        </Box>
        <Chip color={attentionCount ? "warning" : "success"} icon={attentionCount ? <WarningAmberRounded /> : <CheckCircleRounded />} label={attentionCount ? `주의 기록 ${attentionCount}마리` : "주의 기록 없음"} />
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 1.25, mb: 2.5 }}>
        {[
          ["하루 기록", `${recordedCount}/${cats.length}마리`],
          ["주의 확인", `${attentionCount}마리`],
          ["케어 일정", dueCount ? `${completedScheduleCount}/${dueCount} 완료` : "일정 없음"],
          ["투약 체크", medicationTotal ? `${medicationDone}/${medicationTotal} 완료` : "등록 약 없음"],
        ].map(([label, value]) => (
          <Box key={label} sx={{ p: 1.5, bgcolor: "var(--surface)", borderRadius: 2.5 }}>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
            <Typography fontWeight={900}>{value}</Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" }, gap: 1.5 }}>
        {rows.map(row => (
          <Paper key={row.cat.id} variant="outlined" sx={{ p: 1.75, borderRadius: 3, borderColor: row.attention ? "warning.main" : row.record ? "success.light" : "divider" }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ width: 34, height: 34, bgcolor: row.cat.focusCare ? "primary.main" : "secondary.main" }}><PetsRounded fontSize="small" /></Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}><Typography fontWeight={900}>{row.cat.name}</Typography><Typography variant="caption" color="text.secondary">{row.record ? "하루 기록 완료" : "하루 기록 없음"}</Typography></Box>
              {row.attention && <WarningAmberRounded color="warning" fontSize="small" />}
            </Stack>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 0.75, my: 1.5 }}>
              {[
                ["물", displayCount(row.record?.waterCount)],
                ["식사", row.record ? `${row.mealCount}회` : "—"],
                ["소변", displayCount(row.record?.urineCount)],
                ["대변", displayCount(row.record?.stoolCount)],
              ].map(([label, value]) => <Box key={label} sx={{ p: 0.85, bgcolor: "var(--surface)", borderRadius: 2 }}><Typography variant="caption" color="text.secondary">{label}</Typography><Typography variant="body2" fontWeight={800}>{value}</Typography></Box>)}
            </Box>

            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">체중 {row.latestWeight == null ? "—" : `${row.latestWeight}kg`}</Typography>
              <Typography variant="caption" color="text.secondary">투약 {row.cat.medications.length ? `${row.medicationDone}/${row.cat.medications.length}` : "등록 약 없음"}</Typography>
              <Typography variant="caption" color="text.secondary">일정 {row.due.length ? `${row.completedSchedules}/${row.due.length} 완료` : "없음"}</Typography>
            </Stack>
            <Button size="small" endIcon={<ArrowForwardRounded />} onClick={() => onSelectCat(row.cat.id)} sx={{ mt: 1 }}>개별 상세 보기</Button>
          </Paper>
        ))}
      </Box>

      {dueCount > completedScheduleCount && <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 2 }}><EventAvailableRounded color="warning" fontSize="small" /><Typography variant="body2">선택한 날짜에 완료하지 않은 케어 일정이 {dueCount - completedScheduleCount}개 있습니다.</Typography></Stack>}
    </Paper>
  );
}
