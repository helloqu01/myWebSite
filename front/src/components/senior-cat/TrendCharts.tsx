"use client";

import React from "react";
import { Box, Paper, Stack, Typography, useTheme } from "@mui/material";
import WaterDropRounded from "@mui/icons-material/WaterDropRounded";
import MonitorWeightRounded from "@mui/icons-material/MonitorWeightRounded";
import WcRounded from "@mui/icons-material/WcRounded";
import SpaRounded from "@mui/icons-material/SpaRounded";
import type { DailyRecord } from "@/types/cat-care";

interface TrendChartsProps {
  records: DailyRecord[];
}

interface MetricChartProps {
  title: string;
  unit: string;
  color: string;
  icon: React.ReactNode;
  records: DailyRecord[];
  value: (record: DailyRecord) => number | null;
  decimals?: number;
}

function MetricChart({
  title,
  unit,
  color,
  icon,
  records,
  value,
  decimals = 0,
}: MetricChartProps) {
  const points = records
    .map((record, index) => ({ date: record.date, value: value(record), index }))
    .filter((point): point is { date: string; value: number; index: number } => point.value != null);
  const values = points.map(point => point.value);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;
  const spread = max - min || Math.max(Math.abs(max) * 0.2, 1);
  const totalSlots = Math.max(records.length - 1, 1);
  const coordinates = points.map(point => {
    const x = 8 + (point.index / totalSlots) * 84;
    const y = 70 - ((point.value - min) / spread) * 48;
    return { ...point, x, y };
  });
  const latest = values.at(-1);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        minHeight: 188,
        border: "1px solid var(--card-border)",
        background: "var(--surface)",
        borderRadius: 3,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ color, display: "flex" }}>{icon}</Box>
          <Typography variant="subtitle2" fontWeight={700}>{title}</Typography>
        </Stack>
        <Typography variant="h6" fontWeight={800}>
          {latest == null ? "—" : latest.toFixed(decimals)}
          {latest != null && <Typography component="span" variant="caption" color="text.secondary"> {unit}</Typography>}
        </Typography>
      </Stack>

      {coordinates.length >= 2 ? (
        <Box sx={{ width: "100%", mt: 1 }}>
          <svg viewBox="0 0 100 82" width="100%" height="108" role="img" aria-label={`${title} 추세 그래프`}>
            {[22, 46, 70].map(y => (
              <line
                key={y}
                x1="8"
                x2="92"
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.1"
                strokeWidth="0.5"
              />
            ))}
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={coordinates.map(point => `${point.x},${point.y}`).join(" ")}
            />
            {coordinates.map(point => (
              <circle key={`${point.date}-${point.index}`} cx={point.x} cy={point.y} r="2.2" fill={color}>
                <title>{`${point.date}: ${point.value}${unit}`}</title>
              </circle>
            ))}
          </svg>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: -1 }}>
            <Typography variant="caption" color="text.secondary">
              {coordinates[0].date.slice(5).replace("-", "/")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {coordinates.at(-1)!.date.slice(5).replace("-", "/")}
            </Typography>
          </Stack>
        </Box>
      ) : (
        <Stack justifyContent="center" alignItems="center" sx={{ height: 122 }}>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            기록을 2개 이상 남기면
            <br />추세를 표시합니다.
          </Typography>
        </Stack>
      )}
    </Paper>
  );
}

export default function TrendCharts({ records }: TrendChartsProps) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
        gap: 2,
      }}
    >
      <MetricChart
        title="음수량"
        unit="ml"
        color={theme.palette.info.main}
        icon={<WaterDropRounded fontSize="small" />}
        records={records}
        value={record => record.waterMl}
      />
      <MetricChart
        title="체중"
        unit="kg"
        color={theme.palette.secondary.main}
        icon={<MonitorWeightRounded fontSize="small" />}
        records={records}
        value={record => record.weightKg}
        decimals={2}
      />
      <MetricChart
        title="소변"
        unit="회"
        color={theme.palette.primary.main}
        icon={<WcRounded fontSize="small" />}
        records={records}
        value={record => record.urineCount}
      />
      <MetricChart
        title="대변"
        unit="회"
        color={theme.palette.success.main}
        icon={<SpaRounded fontSize="small" />}
        records={records}
        value={record => record.stoolCount}
      />
    </Box>
  );
}

