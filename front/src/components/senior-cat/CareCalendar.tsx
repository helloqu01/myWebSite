"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Box, Chip, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import type { CareSchedule, CatProfile, DailyRecord } from "@/types/cat-care";
import { isScheduleDue } from "@/lib/cat-care/schedules";
import { toLocalDateKey } from "@/lib/cat-care/storage";

interface CareCalendarProps {
  catId?: string;
  cats?: CatProfile[];
  records: DailyRecord[];
  schedules: CareSchedule[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

function hasAttention(record?: DailyRecord): boolean {
  if (!record) return false;
  return Boolean(
    record.urineNotProduced ||
    record.breathingDifficulty ||
    record.collapseOrSeizure ||
    record.urinationStraining ||
    record.bloodInUrine ||
    record.appetite === "none" ||
    record.vomitCount >= 2 ||
    (record.restingRespiratoryRate != null && record.restingRespiratoryRate > 35),
  );
}

export default function CareCalendar({
  catId,
  cats = [],
  records,
  schedules,
  selectedDate,
  onSelectDate,
}: CareCalendarProps) {
  const [cursor, setCursor] = useState(() => {
    const date = new Date(`${selectedDate}T00:00:00`);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  useEffect(() => {
    const date = new Date(`${selectedDate}T00:00:00`);
    if (date.getFullYear() !== cursor.getFullYear() || date.getMonth() !== cursor.getMonth()) {
      setCursor(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  }, [cursor, selectedDate]);

  const calendarDays = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const leading = new Date(year, month, 1).getDay();
    const count = new Date(year, month + 1, 0).getDate();
    return [
      ...Array.from({ length: leading }, () => null),
      ...Array.from({ length: count }, (_, index) => new Date(year, month, index + 1)),
    ];
  }, [cursor]);

  const recordsByDate = useMemo(() => {
    const grouped = new Map<string, DailyRecord[]>();
    records
      .filter(record => !catId || record.catId === catId)
      .forEach(record => grouped.set(record.date, [...(grouped.get(record.date) ?? []), record]));
    return grouped;
  }, [catId, records]);
  const catSchedules = schedules.filter(schedule => !catId || schedule.catId === catId);
  const unified = !catId;
  const today = toLocalDateKey(new Date());

  const moveMonth = (amount: number) => {
    setCursor(current => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

  return (
    <Paper
      elevation={0}
      sx={{ p: { xs: 2, sm: 3 }, border: "1px solid var(--card-border)", borderRadius: 4 }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={800}>{unified ? "전체 고양이 건강 캘린더" : "건강 캘린더"}</Typography>
          <Typography variant="body2" color="text.secondary">{unified ? "모든 고양이의 기록과 일정을 날짜별로 모아 봅니다." : "날짜를 누르면 해당 일자의 기록과 일정을 확인합니다."}</Typography>
        </Box>
        <Stack direction="row" alignItems="center">
          <IconButton onClick={() => moveMonth(-1)} aria-label="이전 달"><ChevronLeftRounded /></IconButton>
          <Typography fontWeight={800} sx={{ minWidth: 100, textAlign: "center" }}>
            {cursor.getFullYear()}년 {cursor.getMonth() + 1}월
          </Typography>
          <IconButton onClick={() => moveMonth(1)} aria-label="다음 달"><ChevronRightRounded /></IconButton>
        </Stack>
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: { xs: 0.5, sm: 1 } }}>
        {weekDays.map((day, index) => (
          <Typography
            key={day}
            variant="caption"
            fontWeight={800}
            color={index === 0 ? "error.main" : index === 6 ? "info.main" : "text.secondary"}
            textAlign="center"
            sx={{ py: 0.5 }}
          >
            {day}
          </Typography>
        ))}
        {calendarDays.map((date, index) => {
          if (!date) return <Box key={`blank-${index}`} />;
          const dateKey = toLocalDateKey(date);
          const dayRecords = recordsByDate.get(dateKey) ?? [];
          const due = catSchedules.filter(schedule => isScheduleDue(schedule, dateKey));
          const complete = due.length > 0 && due.every(schedule => schedule.completedDates.includes(dateKey));
          const attentionRecords = dayRecords.filter(record => hasAttention(record));
          const record = dayRecords[0];
          const recordedNames = unified
            ? dayRecords.map(item => cats.find(cat => cat.id === item.catId)?.name).filter(Boolean).join(" · ")
            : "";
          return (
            <Tooltip
              key={dateKey}
              title={`${dayRecords.length ? unified ? `기록 ${dayRecords.length}마리${recordedNames ? ` (${recordedNames})` : ""}` : "건강 기록 있음" : "건강 기록 없음"}${attentionRecords.length ? ` · 주의 ${attentionRecords.length}마리` : ""}${due.length ? ` · 일정 ${due.length}개` : ""}`}
              arrow
            >
              <Box
                component="button"
                type="button"
                onClick={() => onSelectDate(dateKey)}
                sx={{
                  minHeight: { xs: 62, sm: 78 },
                  p: { xs: 0.5, sm: 1 },
                  borderRadius: 2.5,
                  border: "1px solid",
                  borderColor: selectedDate === dateKey ? "primary.main" : "divider",
                  backgroundColor:
                    selectedDate === dateKey
                      ? "rgba(139,92,246,0.12)"
                      : dateKey === today
                        ? "rgba(34,211,238,0.07)"
                        : "transparent",
                  color: "text.primary",
                  cursor: "pointer",
                  textAlign: "left",
                  font: "inherit",
                  "&:hover": { borderColor: "primary.main", backgroundColor: "rgba(139,92,246,0.07)" },
                }}
              >
                <Typography variant="body2" fontWeight={dateKey === today ? 900 : 600}>{date.getDate()}</Typography>
                {unified && (dayRecords.length > 0 || due.length > 0) && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25, lineHeight: 1.2 }}>
                    {dayRecords.length > 0 ? `기록 ${dayRecords.length}/${cats.length}` : ""}{dayRecords.length > 0 && due.length > 0 ? " · " : ""}{due.length > 0 ? `일정 ${due.length}` : ""}
                  </Typography>
                )}
                <Stack direction="row" spacing={0.4} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                  {record && <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: attentionRecords.length ? "error.main" : "success.main" }} />}
                  {due.length > 0 && <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: complete ? "success.main" : "warning.main" }} />}
                </Stack>
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
        <Chip size="small" label="● 건강 기록" sx={{ color: "success.main" }} variant="outlined" />
        <Chip size="small" label="● 주의 기록" sx={{ color: "error.main" }} variant="outlined" />
        <Chip size="small" label="● 미완료 일정" sx={{ color: "warning.main" }} variant="outlined" />
      </Stack>
    </Paper>
  );
}
