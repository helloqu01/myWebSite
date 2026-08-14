"use client";

import React, { useMemo, useState } from "react";
import { Alert, Box, Chip, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Typography, useTheme } from "@mui/material";
import TimelineRounded from "@mui/icons-material/TimelineRounded";
import type { LabReport, LabResultFlag } from "@/types/cat-care";

interface LabTrendChartsProps {
  catId: string;
  reports: LabReport[];
}

const flagLabel: Record<LabResultFlag, string> = {
  low: "낮음",
  normal: "기준 내",
  high: "높음",
  unknown: "확인 필요",
};

export default function LabTrendCharts({ catId, reports }: LabTrendChartsProps) {
  const theme = useTheme();
  const catReports = useMemo(
    () => reports.filter(report => report.catId === catId).sort((a, b) => a.date.localeCompare(b.date)),
    [catId, reports],
  );
  const markers = useMemo(() => {
    const found = new Map<string, string>();
    catReports.forEach(report => report.items.forEach(item => found.set(item.code, item.name)));
    return [...found.entries()].map(([code, name]) => ({ code, name }));
  }, [catReports]);
  const [selectedCode, setSelectedCode] = useState("");
  const activeCode = markers.some(marker => marker.code === selectedCode) ? selectedCode : markers[0]?.code ?? "";
  const points = catReports.flatMap(report => report.items
    .filter(item => item.code === activeCode && item.value != null)
    .map(item => ({
      date: report.date,
      hospital: report.hospital,
      value: item.value!,
      unit: item.unit,
      low: item.referenceLow,
      high: item.referenceHigh,
      flag: item.flag,
      explanation: item.explanation,
    })));
  const values = points.map(point => point.value);
  const referenceValues = points.flatMap(point => [point.low, point.high]).filter((value): value is number => value != null);
  const allValues = [...values, ...referenceValues];
  const min = allValues.length ? Math.min(...allValues) : 0;
  const max = allValues.length ? Math.max(...allValues) : 1;
  const padding = Math.max((max - min) * 0.15, Math.abs(max) * 0.05, 0.1);
  const chartMin = min - padding;
  const chartSpread = max - min + padding * 2;
  const slots = Math.max(points.length - 1, 1);
  const coordinate = (value: number, index: number) => ({
    x: 8 + (index / slots) * 84,
    y: 72 - ((value - chartMin) / chartSpread) * 54,
  });
  const latest = points.at(-1);
  const previous = points.at(-2);
  const change = latest && previous && previous.value !== 0
    ? ((latest.value - previous.value) / Math.abs(previous.value)) * 100
    : null;

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: "1px solid var(--card-border)", borderRadius: 4 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <TimelineRounded color="primary" />
            <Typography variant="h6" fontWeight={800}>검사결과 변화</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">병원별 기준범위 선과 실제 결과를 검사일 순서로 비교합니다.</Typography>
        </Box>
        {markers.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 210 }}>
            <InputLabel>검사 항목</InputLabel>
            <Select label="검사 항목" value={activeCode} onChange={event => setSelectedCode(event.target.value)}>
              {markers.map(marker => <MenuItem value={marker.code} key={marker.code}>{marker.code} · {marker.name}</MenuItem>)}
            </Select>
          </FormControl>
        )}
      </Stack>

      {!markers.length ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>검사결과를 1개 이상 저장하면 항목별 추세가 표시됩니다.</Typography>
      ) : points.length < 2 ? (
        <Alert severity="info">같은 검사 항목이 2회 이상 저장되면 변화 그래프와 이전 검사 대비 증감률을 표시합니다.</Alert>
      ) : (
        <>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
            <Typography variant="h5" fontWeight={900}>{latest!.value} <Typography component="span" variant="body2">{latest!.unit}</Typography></Typography>
            <Chip label={flagLabel[latest!.flag]} color={latest!.flag === "high" ? "error" : latest!.flag === "low" ? "info" : latest!.flag === "normal" ? "success" : "default"} size="small" />
            {change != null && <Chip label={`이전 검사 대비 ${change > 0 ? "+" : ""}${change.toFixed(1)}%`} variant="outlined" size="small" />}
          </Stack>
          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <svg viewBox="0 0 100 86" width="100%" height="240" role="img" aria-label={`${activeCode} 검사결과 변화 그래프`}>
              {[18, 45, 72].map(y => <line key={y} x1="8" x2="92" y1={y} y2={y} stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />)}
              {points.every(point => point.high != null) && (
                <polyline fill="none" stroke={theme.palette.warning.main} strokeDasharray="3 2" strokeWidth="1" points={points.map((point, index) => { const c = coordinate(point.high!, index); return `${c.x},${c.y}`; }).join(" ")} />
              )}
              {points.every(point => point.low != null) && (
                <polyline fill="none" stroke={theme.palette.info.main} strokeDasharray="3 2" strokeWidth="1" points={points.map((point, index) => { const c = coordinate(point.low!, index); return `${c.x},${c.y}`; }).join(" ")} />
              )}
              <polyline fill="none" stroke={theme.palette.primary.main} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points.map((point, index) => { const c = coordinate(point.value, index); return `${c.x},${c.y}`; }).join(" ")} />
              {points.map((point, index) => {
                const c = coordinate(point.value, index);
                return <circle key={`${point.date}-${index}`} cx={c.x} cy={c.y} r="2.3" fill={point.flag === "high" ? theme.palette.error.main : point.flag === "low" ? theme.palette.info.main : theme.palette.success.main}><title>{`${point.date} ${point.value}${point.unit} · ${point.hospital || "병원 미입력"}`}</title></circle>;
              })}
            </svg>
          </Box>
          <Stack direction="row" justifyContent="space-between" color="text.secondary">
            <Typography variant="caption">{points[0].date}</Typography>
            <Typography variant="caption">점선: 각 검사표의 하한·상한</Typography>
            <Typography variant="caption">{points.at(-1)!.date}</Typography>
          </Stack>
          <Alert severity="warning" sx={{ mt: 2 }}>검사실·장비가 달라지면 기준범위도 달라질 수 있습니다. 변화는 주치의와 함께 해석해 주세요.</Alert>
        </>
      )}
    </Paper>
  );
}
