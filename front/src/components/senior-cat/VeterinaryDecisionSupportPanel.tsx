"use client";

import React, { useMemo } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import HealthAndSafetyRounded from "@mui/icons-material/HealthAndSafetyRounded";
import LocalHospitalRounded from "@mui/icons-material/LocalHospitalRounded";
import type { CatProfile, DailyRecord, LabReport } from "@/types/cat-care";
import { analyzeVeterinaryConcerns, type VeterinaryConcernLevel } from "@/lib/cat-care/veterinary-suspicions";

interface VeterinaryDecisionSupportPanelProps {
  cat: CatProfile;
  records: DailyRecord[];
  reports: LabReport[];
}

const levelStyle: Record<VeterinaryConcernLevel, { label: string; color: "default" | "info" | "warning" | "error" }> = {
  monitor: { label: "관찰·재확인", color: "default" },
  appointment: { label: "진료 시 상담", color: "info" },
  prompt: { label: "빠른 상담 권장", color: "warning" },
  urgent: { label: "즉시 병원 연락", color: "error" },
};

const confidenceLabel = { low: "근거 제한적", medium: "근거 보통", high: "근거 여러 개" } as const;

export default function VeterinaryDecisionSupportPanel({ cat, records, reports }: VeterinaryDecisionSupportPanelProps) {
  const analysis = useMemo(() => analyzeVeterinaryConcerns(cat, records, reports), [cat, records, reports]);
  const urgentCount = analysis.concerns.filter(concern => concern.level === "urgent").length;

  return (
    <Paper component="section" elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: "1px solid var(--card-border)", borderRadius: 4 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1.5} sx={{ mb: 2 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <HealthAndSafetyRounded color="primary" />
            <Typography variant="h6" fontWeight={900}>수의학적 확인 포인트</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            최신 검사 수치와 검사일 전후 7일의 일상 기록을 함께 보고, 주치의에게 확인할 가능성과 예상 증상을 정리합니다.
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap alignItems="center">
          {analysis.labDate && <Chip size="small" variant="outlined" label={`기준 검사일 ${analysis.labDate}`} />}
          <Chip size="small" color={urgentCount ? "error" : analysis.concerns.length ? "warning" : "success"} label={urgentCount ? `응급 신호 ${urgentCount}개` : analysis.concerns.length ? `확인 포인트 ${analysis.concerns.length}개` : "자동 의심 소견 없음"} />
        </Stack>
      </Stack>

      <Alert severity={urgentCount ? "error" : "warning"} sx={{ mb: 2 }}>
        {urgentCount
          ? "응급으로 표시된 증상은 앱 분석을 기다리지 말고 지금 동물병원에 연락하세요."
          : "이 결과는 진단이나 처방이 아닙니다. OCR 오류, 검사실별 기준범위, 수분 상태와 병원 스트레스에 따라 달라질 수 있으므로 원본과 주치의 판단이 우선입니다."}
      </Alert>

      {!analysis.labDate ? (
        <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>기준범위가 포함된 검사 수치를 저장하면 수의학적 확인 포인트가 표시됩니다.</Typography>
      ) : !analysis.concerns.length ? (
        <Alert severity="info">최신 검사에서 현재 규칙에 해당하는 조합을 찾지 못했습니다. 질환이 없다는 뜻은 아니며, 판독 소견과 신체검사도 함께 확인해야 합니다.</Alert>
      ) : (
        <Stack spacing={1.25}>
          {analysis.concerns.map((concern, index) => (
            <Accordion key={concern.id} defaultExpanded={index === 0 || concern.level === "urgent"} disableGutters elevation={0} sx={{ border: "1px solid", borderColor: concern.level === "urgent" ? "error.main" : concern.level === "prompt" ? "warning.main" : "divider", borderRadius: "12px !important", "&::before": { display: "none" } }}>
              <AccordionSummary expandIcon={<ExpandMoreRounded />}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }} sx={{ width: "100%", pr: 1 }}>
                  <Typography fontWeight={900} sx={{ flex: 1 }}>{concern.title}</Typography>
                  <Stack direction="row" spacing={0.75}>
                    <Chip size="small" color={levelStyle[concern.level].color} label={levelStyle[concern.level].label} />
                    <Chip size="small" variant="outlined" label={confidenceLabel[concern.confidence]} />
                  </Stack>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1.5}>
                  <Typography variant="body2">{concern.summary}</Typography>

                  <Box>
                    <Typography variant="caption" fontWeight={800} color="text.secondary">판단에 사용한 기록</Typography>
                    <Stack spacing={0.35} sx={{ mt: 0.5 }}>{concern.evidence.map(evidence => <Typography key={evidence} variant="body2">• {evidence}</Typography>)}</Stack>
                  </Box>

                  {concern.matchedSigns.length > 0 && <Box><Typography variant="caption" fontWeight={800} color="error.main">일상 기록에서 함께 확인됨</Typography><Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>{concern.matchedSigns.map(sign => <Chip key={sign} size="small" color="warning" variant="outlined" label={sign} />)}</Stack></Box>}

                  <Box>
                    <Typography variant="caption" fontWeight={800} color="text.secondary">집에서 추가로 확인할 수 있는 증상</Typography>
                    <Typography variant="body2" sx={{ mt: 0.35 }}>{concern.possibleSigns.join(" · ")}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" fontWeight={800} color="text.secondary">주치의에게 물어볼 확인 검사</Typography>
                    <Stack spacing={0.35} sx={{ mt: 0.5 }}>{concern.nextChecks.map(check => <Typography key={check} variant="body2">• {check}</Typography>)}</Stack>
                  </Box>

                  <Alert severity="info" icon={<LocalHospitalRounded />}>{concern.caveat}</Alert>
                  <Link href={concern.sourceUrl} target="_blank" rel="noreferrer" variant="caption">근거: {concern.sourceLabel}</Link>
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}
    </Paper>
  );
}
