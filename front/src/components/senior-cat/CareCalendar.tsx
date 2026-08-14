"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Box, Chip, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import type { CareSchedule, DailyRecord } from "@/types/cat-care";
import { isScheduleDue } from "@/lib/cat-care/schedules";
import { toLocalDateKey } from "@/lib/cat-care/storage";

interface CareCalendarProps {
  catId: string;
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
    record.vomitCount >= 2,
  );
}

export default function CareCalendar({
  catId,
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

  const recordsByDate = useMemo(
    () => new Map(records.filter(record => record.catId === catId).map(record => [record.date, record])),
    [catId, records],
  );
  const catSchedules = schedules.filter(schedule => schedule.catId === catId);
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
          <Typography variant="h6" fontWeight={800}>건강 캘린더</Typography>
          <Typography variant="body2" color="text.secondary">날짜를 누르면 해당 일자의 기록과 일정을 확인합니다.</Typography>
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
          const record = recordsByDate.get(dateKey);
          const due = catSchedules.filter(schedule => isScheduleDue(schedule, dateKey));
          const complete = due.length > 0 && due.every(schedule => schedule.completedDates.includes(dateKey));
          const attention = hasAttention(record);
          return (
            <Tooltip
              key={dateKey}
              title={`${record ? "건강 기록 있음" : "건강 기록 없음"}${due.length ? ` · 일정 ${due.length}개` : ""}`}
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
                <Stack direction="row" spacing={0.4} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                  {record && <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: attention ? "error.main" : "success.main" }} />}
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

