"use client";

import React, { useMemo } from "react";
import {
  Alert,
  Avatar,
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import BedtimeRounded from "@mui/icons-material/BedtimeRounded";
import InsightsRounded from "@mui/icons-material/InsightsRounded";
import PetsRounded from "@mui/icons-material/PetsRounded";
import ScheduleRounded from "@mui/icons-material/ScheduleRounded";
import TimelineRounded from "@mui/icons-material/TimelineRounded";
import type { CatProfile, DailyRecord } from "@/types/cat-care";
import {
  analyzeCatBehavior,
  DAY_PERIOD_LABELS,
  type BehaviorPatternStatus,
  type DayPeriod,
} from "@/lib/cat-care/behavior-patterns";
import { TIMED_EVENT_LABELS } from "@/lib/cat-care/events";

interface BehaviorPatternDashboardProps {
  cats: CatProfile[];
  records: DailyRecord[];
  selectedDate: string;
}

const statusMeta: Record<BehaviorPatternStatus, { label: string; color: "info" | "success" | "warning" }> = {
  learning: { label: "패턴 학습 중", color: "info" },
  steady: { label: "평소 흐름", color: "success" },
  changed: { label: "변화 확인", color: "warning" },
};

const periodColors: Record<DayPeriod, string> = {
  dawn: "#5c6bc0",
  morning: "#f9a825",
  afternoon: "#ef6c00",
  evening: "#7e57c2",
};

export default function BehaviorPatternDashboard({ cats, records, selectedDate }: BehaviorPatternDashboardProps) {
  const results = useMemo(
    () => cats.map(cat => ({ cat, pattern: analyzeCatBehavior(records, cat.id, selectedDate) })),
    [cats, records, selectedDate],
  );
  const learnedCount = results.filter(item => item.pattern.status !== "learning").length;
  const changedCount = results.filter(item => item.pattern.status === "changed").length;

  return (
    <Paper component="section" elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid var(--card-border)", borderRadius: 4 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1.5} sx={{ mb: 2.5 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <InsightsRounded color="secondary" />
            <Typography variant="h5" fontWeight={900}>일과·행동 패턴 분석</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {selectedDate}까지 최근 14일의 시간 기록을 비교해 생활 리듬과 평소 대비 변화를 찾습니다.
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          <Chip icon={<TimelineRounded />} label={`패턴 분석 가능 ${learnedCount}/${cats.length}마리`} variant="outlined" />
          {changedCount > 0 && <Chip color="warning" label={`변화 확인 ${changedCount}마리`} />}
        </Stack>
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" }, gap: 1.5 }}>
        {results.map(({ cat, pattern }) => {
          const meta = statusMeta[pattern.status];
          const maxPeriodCount = Math.max(1, ...Object.values(pattern.periodCounts));
          const visibleChanges = pattern.changes.slice(0, 2);
          return (
            <Paper key={cat.id} variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: pattern.status === "changed" ? "warning.main" : "divider" }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar sx={{ width: 36, height: 36, bgcolor: cat.focusCare ? "primary.main" : "secondary.main" }}>
                  <PetsRounded fontSize="small" />
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontWeight={900}>{cat.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    일과 기록 {pattern.coverageDays}일 · 분석 이벤트 {pattern.totalEvents}건
                  </Typography>
                </Box>
                <Chip size="small" color={meta.color} label={meta.label} />
              </Stack>

              {pattern.totalEvents === 0 ? (
                <Alert severity="info" sx={{ mt: 1.5 }}>
                  통합 하루기록에서 시간과 함께 일과를 추가하면 분석을 시작합니다.
                </Alert>
              ) : (
                <>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1, my: 1.5 }}>
                    <Box sx={{ p: 1.25, bgcolor: "var(--surface)", borderRadius: 2.5 }}>
                      <Stack direction="row" spacing={0.75} alignItems="center"><ScheduleRounded fontSize="small" color="primary" /><Typography variant="caption" color="text.secondary">주요 시간대</Typography></Stack>
                      <Typography variant="body2" fontWeight={900} sx={{ mt: 0.25 }}>{pattern.dominantPeriod ? DAY_PERIOD_LABELS[pattern.dominantPeriod] : "분석 중"}</Typography>
                    </Box>
                    <Box sx={{ p: 1.25, bgcolor: "var(--surface)", borderRadius: 2.5 }}>
                      <Stack direction="row" spacing={0.75} alignItems="center"><BedtimeRounded fontSize="small" color="secondary" /><Typography variant="caption" color="text.secondary">가장 잦은 일과</Typography></Stack>
                      <Typography variant="body2" fontWeight={900} sx={{ mt: 0.25 }}>{pattern.topBehavior ? TIMED_EVENT_LABELS[pattern.topBehavior] : "일과 입력 필요"}</Typography>
                    </Box>
                  </Box>

                  <Typography variant="caption" color="text.secondary">시간대별 생활 기록</Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 0.75, mt: 0.75 }}>
                    {(Object.entries(pattern.periodCounts) as Array<[DayPeriod, number]>).map(([period, count]) => (
                      <Box key={period} sx={{ minWidth: 0 }}>
                        <Box sx={{ height: 7, borderRadius: 99, bgcolor: "action.hover", overflow: "hidden" }}>
                          <Box sx={{ width: `${Math.max(count ? 12 : 0, count / maxPeriodCount * 100)}%`, height: "100%", bgcolor: periodColors[period], borderRadius: 99 }} />
                        </Box>
                        <Typography variant="caption" color="text.secondary" noWrap>{DAY_PERIOD_LABELS[period].split(" ")[0]} {count}</Typography>
                      </Box>
                    ))}
                  </Box>

                  {pattern.routineSummaries.length > 0 && (
                    <Stack spacing={0.5} sx={{ mt: 1.5 }}>
                      {pattern.routineSummaries.map(summary => (
                        <Typography key={summary} variant="body2">• {summary}</Typography>
                      ))}
                    </Stack>
                  )}

                  {pattern.status === "learning" && (
                    <Alert severity="info" sx={{ mt: 1.5 }}>
                      5일 이상, 일과 이벤트 5건 이상 기록하면 평소 패턴과 최근 변화를 비교합니다.
                    </Alert>
                  )}
                  {visibleChanges.map(change => (
                    <Alert key={`${change.type}-${change.direction}`} severity={change.attention ? "warning" : "info"} sx={{ mt: 1 }}>
                      {change.message}{change.attention ? " 컨디션과 다른 증상도 함께 확인하세요." : ""}
                    </Alert>
                  ))}
                </>
              )}
            </Paper>
          );
        })}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
        행동 패턴은 입력한 관찰 기록을 요약한 결과이며 진단이 아닙니다. 갑작스러운 숨기, 울음, 활동 감소가 지속되면 다른 건강 기록과 함께 확인하세요.
      </Typography>
    </Paper>
  );
}
