"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import CameraAltRounded from "@mui/icons-material/CameraAltRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import ScienceRounded from "@mui/icons-material/ScienceRounded";
import type { CatProfile, LabReport, LabResultItem } from "@/types/cat-care";
import { createId, toLocalDateKey } from "@/lib/cat-care/storage";
import { labMarkerOptions, markerDetails, parseLabText, updateLabFlag } from "@/lib/cat-care/lab-results";

interface LabReportPanelProps {
  cat: CatProfile;
  reports: LabReport[];
  onSave: (report: LabReport) => void;
  onDelete: (report: LabReport) => void;
}

const flagStyle = {
  low: { label: "낮음", color: "info" },
  normal: { label: "기준 내", color: "success" },
  high: { label: "높음", color: "error" },
  unknown: { label: "확인 필요", color: "default" },
} as const;

function nullableNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function blankItem(): LabResultItem {
  const details = markerDetails("BUN");
  return {
    id: createId("lab-item"),
    ...details,
    value: null,
    unit: "",
    referenceLow: null,
    referenceHigh: null,
    flag: "unknown",
  };
}

export default function LabReportPanel({ cat, reports, onSave, onDelete }: LabReportPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [date, setDate] = useState(() => toLocalDateKey(new Date()));
  const [hospital, setHospital] = useState("");
  const [notes, setNotes] = useState("");
  const [rawText, setRawText] = useState("");
  const [items, setItems] = useState<LabResultItem[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError] = useState("");
  const markerOptions = labMarkerOptions();
  const catReports = reports
    .filter(report => report.catId === cat.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const reset = () => {
    setFile(null);
    setDate(toLocalDateKey(new Date()));
    setHospital("");
    setNotes("");
    setRawText("");
    setItems([]);
    setProgress(0);
    setProgressLabel("");
    setError("");
  };

  const open = () => {
    reset();
    setDialogOpen(true);
  };

  const close = () => {
    if (analyzing) return;
    setDialogOpen(false);
  };

  const analyze = async () => {
    if (!file) {
      setError("먼저 검사결과 사진을 선택해 주세요.");
      return;
    }
    setAnalyzing(true);
    setError("");
    setProgress(0);
    setProgressLabel("OCR 엔진 준비 중");
    let worker: Awaited<ReturnType<typeof import("tesseract.js")["createWorker"]>> | null = null;
    try {
      const { createWorker } = await import("tesseract.js");
      worker = await createWorker(["eng", "kor"], 1, {
        logger: log => {
          if (typeof log.progress === "number") setProgress(Math.round(log.progress * 100));
          if (log.status) setProgressLabel(log.status);
        },
      });
      const result = await worker.recognize(file);
      const text = result.data.text.trim();
      const parsed = parseLabText(text);
      setRawText(text);
      setItems(parsed);
      if (!parsed.length) {
        setError("자동으로 찾은 검사 항목이 없습니다. 사진을 더 선명하게 찍거나 아래에서 항목을 직접 추가해 주세요.");
      }
    } catch (caught) {
      console.error(caught);
      setError("사진 글자를 읽지 못했습니다. 네트워크 연결과 사진 선명도를 확인한 뒤 다시 시도해 주세요.");
    } finally {
      await worker?.terminate();
      setAnalyzing(false);
      setProgressLabel("");
    }
  };

  const updateItem = (id: string, patch: Partial<LabResultItem>) => {
    setItems(current => current.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, ...patch };
      return updateLabFlag(updated);
    }));
  };

  const updateMarker = (id: string, code: string) => {
    updateItem(id, markerDetails(code));
  };

  const save = () => {
    const validItems = items.filter(item => item.code.trim() && item.value != null);
    if (!validItems.length) {
      setError("저장할 검사 항목과 결과값을 한 개 이상 확인해 주세요.");
      return;
    }
    const now = new Date().toISOString();
    onSave({
      id: createId("lab-report"),
      catId: cat.id,
      date,
      hospital: hospital.trim(),
      sourceFileName: file?.name ?? "직접 입력",
      rawText,
      items: validItems,
      notes: notes.trim(),
      createdAt: now,
      updatedAt: now,
    });
    setDialogOpen(false);
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: "1px solid var(--card-border)", borderRadius: 4 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <ScienceRounded color="primary" />
            <Typography variant="h6" fontWeight={800}>병원 검사결과</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            검사표 사진을 기기 안에서 읽고, 확인한 값만 저장합니다. 원본 사진은 저장하지 않습니다.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<CameraAltRounded />} onClick={open}>검사표 사진 분석</Button>
      </Stack>

      {catReports.length ? (
        <Stack spacing={1.25}>
          {catReports.map(report => (
            <Box key={report.id} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                <Box>
                  <Typography fontWeight={800}>{report.date}{report.hospital ? ` · ${report.hospital}` : ""}</Typography>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                    {report.items.slice(0, 8).map(item => (
                      <Chip
                        key={item.id}
                        size="small"
                        label={`${item.code} ${item.value ?? "—"}${item.unit ? ` ${item.unit}` : ""}`}
                        color={flagStyle[item.flag].color}
                        variant={item.flag === "unknown" ? "outlined" : "filled"}
                      />
                    ))}
                    {report.items.length > 8 && <Chip size="small" label={`+${report.items.length - 8}`} variant="outlined" />}
                  </Stack>
                </Box>
                <Tooltip title="검사 기록 삭제">
                  <IconButton size="small" color="error" onClick={() => onDelete(report)}><DeleteOutlineRounded fontSize="small" /></IconButton>
                </Tooltip>
              </Stack>
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>아직 저장된 검사결과가 없습니다.</Typography>
      )}

      <Dialog open={dialogOpen} onClose={close} fullWidth maxWidth="lg">
        <DialogTitle>{cat.name} 검사결과 사진 분석</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Alert severity="info">
              OCR 값은 사진 품질에 따라 틀릴 수 있습니다. 검사표 원본과 항목·소수점·단위·기준범위를 반드시 대조한 뒤 저장하세요.
            </Alert>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField label="검사일" type="date" value={date} onChange={event => setDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
              <TextField label="동물병원" value={hospital} onChange={event => setHospital(event.target.value)} placeholder="선택 입력" fullWidth />
            </Stack>
            <input
              ref={fileInputRef}
              hidden
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={event => setFile(event.target.files?.[0] ?? null)}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems={{ sm: "center" }}>
              <Button variant="outlined" startIcon={<CameraAltRounded />} onClick={() => fileInputRef.current?.click()} disabled={analyzing}>
                {file ? "다른 사진 선택" : "사진 선택 또는 촬영"}
              </Button>
              <Typography variant="body2" color="text.secondary">{file?.name ?? "JPG, PNG, WebP 지원"}</Typography>
              <Button variant="contained" onClick={analyze} disabled={!file || analyzing} sx={{ ml: { sm: "auto" } }}>
                {analyzing ? <><CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />분석 중</> : "사진에서 값 읽기"}
              </Button>
            </Stack>
            {analyzing && <Box><LinearProgress variant="determinate" value={progress} /><Typography variant="caption" color="text.secondary">{progressLabel} · {progress}%</Typography></Box>}
            {previewUrl && <Box component="img" src={previewUrl} alt="선택한 검사결과 사진" sx={{ display: "block", maxWidth: "100%", maxHeight: 360, mx: "auto", borderRadius: 2, objectFit: "contain" }} />}
            {error && <Alert severity="warning">{error}</Alert>}

            <Divider />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" fontWeight={800}>추출 결과 검토</Typography>
                <Typography variant="body2" color="text.secondary">수치와 기준범위를 원본 검사표에 맞게 고쳐 주세요.</Typography>
              </Box>
              <Button startIcon={<AddRounded />} onClick={() => setItems(current => [...current, blankItem()])}>항목 직접 추가</Button>
            </Stack>
            <Stack spacing={1.5}>
              {items.map(item => (
                <Box key={item.id} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "1.4fr repeat(4, 1fr) auto" }, gap: 1.25, alignItems: "center" }}>
                    <TextField select label="검사 항목" size="small" value={item.code} onChange={event => updateMarker(item.id, event.target.value)}>
                      {markerOptions.map(option => <MenuItem key={option.code} value={option.code}>{option.code} · {option.name}</MenuItem>)}
                    </TextField>
                    <TextField label="결과값" size="small" type="number" value={item.value ?? ""} onChange={event => updateItem(item.id, { value: nullableNumber(event.target.value) })} />
                    <TextField label="단위" size="small" value={item.unit} onChange={event => updateItem(item.id, { unit: event.target.value })} />
                    <TextField label="기준 하한" size="small" type="number" value={item.referenceLow ?? ""} onChange={event => updateItem(item.id, { referenceLow: nullableNumber(event.target.value) })} />
                    <TextField label="기준 상한" size="small" type="number" value={item.referenceHigh ?? ""} onChange={event => updateItem(item.id, { referenceHigh: nullableNumber(event.target.value) })} />
                    <Stack direction="row" alignItems="center">
                      <Chip label={flagStyle[item.flag].label} color={flagStyle[item.flag].color} size="small" />
                      <IconButton size="small" color="error" onClick={() => setItems(current => current.filter(candidate => candidate.id !== item.id))}><DeleteOutlineRounded fontSize="small" /></IconButton>
                    </Stack>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1.25 }}>{item.explanation}</Typography>
                </Box>
              ))}
            </Stack>
            <TextField label="검사 관련 메모" value={notes} onChange={event => setNotes(event.target.value)} multiline minRows={2} fullWidth />
            <Typography variant="caption" color="text.secondary">
              기준범위는 검사 장비·검사실마다 다를 수 있습니다. 참고 근거: {" "}
              <Link href="https://www.vet.cornell.edu/animal-health-diagnostic-center/laboratories/clinical-pathology/reference-intervals" target="_blank" rel="noreferrer">Cornell 검사실 기준범위 안내</Link>, {" "}
              <Link href="https://www.iris-kidney.com/s/IRIS_CAT_Treatment_Recommendations_2023.pdf" target="_blank" rel="noreferrer">IRIS 고양이 신장질환 안내</Link>
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={close} color="inherit" disabled={analyzing}>취소</Button>
          <Button onClick={save} variant="contained" disabled={analyzing}>검토한 결과 저장</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
