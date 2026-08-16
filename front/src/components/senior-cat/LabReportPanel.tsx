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
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import ScienceRounded from "@mui/icons-material/ScienceRounded";
import RotateRightRounded from "@mui/icons-material/RotateRightRounded";
import type { CatProfile, ExaminationType, LabReport, LabResultItem } from "@/types/cat-care";
import { createMedicalDocumentSignedUrl, labReportDocuments, medicalDocumentDisplayName, uploadMedicalDocument } from "@/lib/cat-care/medical-documents";
import { createId, toLocalDateKey } from "@/lib/cat-care/storage";
import { labMarkerOptions, markerDetails, parseLabText, updateLabFlag } from "@/lib/cat-care/lab-results";
import type { OcrRotation } from "@/lib/cat-care/ocr-image";
import { recognizeMedicalDocument } from "@/lib/cat-care/medical-ocr";
import MedicalFolderImportDialog from "./MedicalFolderImportDialog";

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

const examinationTypeLabels: Record<ExaminationType, string> = {
  blood: "혈액검사",
  urine: "소변검사",
  stool: "분변검사",
  xray: "엑스레이·방사선",
  ultrasound: "초음파",
  cardiac: "심장검사",
  blood_pressure: "혈압검사",
  thyroid: "갑상선검사",
  pathology: "세포·조직검사",
  dental: "치과검사",
  other: "기타 검사",
};

function detectExaminationType(text: string): ExaminationType {
  if (/초음파|ultrasound|sonograph/i.test(text)) return "ultrasound";
  if (/x[\s-]?ray|radiograph|방사선|엑스레이/i.test(text)) return "xray";
  if (/urinalysis|urine|요검사|소변검사/i.test(text)) return "urine";
  if (/fecal|stool|분변검사|대변검사/i.test(text)) return "stool";
  if (/echocardi|심장검사|심초음파|pro[\s-]?bnp/i.test(text)) return "cardiac";
  if (/thyroid|갑상선|\bT4\b|\bTT4\b/i.test(text)) return "thyroid";
  if (/cytology|histopath|pathology|세포검사|조직검사|병리검사/i.test(text)) return "pathology";
  if (/dental|치과검사|구강검사/i.test(text)) return "dental";
  if (/blood pressure|혈압검사|\bBP\b/i.test(text)) return "blood_pressure";
  if (/CBC|chemistry|hematology|혈액검사|혈청검사|혈구검사/i.test(text)) return "blood";
  return "other";
}

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
  const [reportId, setReportId] = useState(() => createId("lab-report"));
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [date, setDate] = useState(() => toLocalDateKey(new Date()));
  const [type, setType] = useState<ExaminationType>("blood");
  const [title, setTitle] = useState("");
  const [hospital, setHospital] = useState("");
  const [findings, setFindings] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [notes, setNotes] = useState("");
  const [rawText, setRawText] = useState("");
  const [items, setItems] = useState<LabResultItem[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError] = useState("");
  const [rotation, setRotation] = useState<OcrRotation>(0);
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null);
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
    setReportId(createId("lab-report"));
    setFile(null);
    setDate(toLocalDateKey(new Date()));
    setType("blood");
    setTitle("");
    setHospital("");
    setFindings("");
    setInterpretation("");
    setRecommendations("");
    setNotes("");
    setRawText("");
    setItems([]);
    setProgress(0);
    setProgressLabel("");
    setError("");
    setRotation(0);
    setOcrConfidence(null);
  };

  const open = () => {
    reset();
    setDialogOpen(true);
  };

  const close = () => {
    if (analyzing || uploading) return;
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
    try {
      const result = await recognizeMedicalDocument(file, rotation, current => {
        setProgress(current.percent);
        setProgressLabel(current.label);
      });
      setOcrConfidence(result.confidence);
      const text = result.text.trim();
      const parsed = parseLabText(text);
      setRawText(text);
      setItems(parsed);
      const detectedType = detectExaminationType(text);
      setType(detectedType);
      setTitle(current => current || examinationTypeLabels[detectedType]);
      if (!parsed.length) {
        setError("수치 항목은 자동으로 찾지 못했습니다. OCR 원문은 저장할 수 있으니 영상·병리 검사라면 판독 소견을 직접 확인해 입력해 주세요.");
      }
    } catch (caught) {
      console.error(caught);
      setError("사진 글자를 읽지 못했습니다. 네트워크 연결과 사진 선명도를 확인한 뒤 다시 시도해 주세요.");
    } finally {
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

  const viewOriginalDocument = async (storagePath: string) => {
    const popup = window.open("", "_blank");
    if (popup) popup.opener = null;
    try {
      const signedUrl = await createMedicalDocumentSignedUrl(storagePath);
      if (popup) popup.location.href = signedUrl;
      else window.open(signedUrl, "_blank", "noopener,noreferrer");
    } catch (caught) {
      popup?.close();
      window.alert(caught instanceof Error ? caught.message : "원본 사진을 열지 못했습니다.");
    }
  };

  const save = async () => {
    const validItems = items.filter(item => item.code.trim() && item.value != null);
    if (!validItems.length && !rawText.trim() && !findings.trim() && !interpretation.trim() && !file) {
      setError("검사 수치, OCR 원문, 판독 소견 또는 결론 중 하나 이상을 입력해 주세요.");
      return;
    }
    setUploading(Boolean(file));
    setError("");
    try {
      const originalDocument = file
        ? await uploadMedicalDocument({ file, catId: cat.id, recordId: reportId, kind: "examination" })
        : null;
      const now = new Date().toISOString();
      onSave({
        id: reportId,
        catId: cat.id,
        date,
        type,
        title: title.trim() || examinationTypeLabels[type],
        hospital: hospital.trim(),
        sourceFileName: file ? medicalDocumentDisplayName(file.name) : "직접 입력",
        rawText: rawText.trim(),
        originalDocuments: originalDocument ? [originalDocument] : [],
        originalDocument,
        items: validItems,
        findings: findings.trim(),
        interpretation: interpretation.trim(),
        recommendations: recommendations.trim(),
        notes: notes.trim(),
        createdAt: now,
        updatedAt: now,
      });
      setDialogOpen(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "원본 사진을 저장하지 못했습니다.");
    } finally {
      setUploading(false);
    }
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
            피검사부터 소변·분변·엑스레이·초음파·병리검사까지 수치와 판독 내용, 원본 사진을 고양이별로 저장합니다.
          </Typography>
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <MedicalFolderImportDialog cat={cat} reports={reports} onSave={onSave} />
          <Button variant="contained" startIcon={<CameraAltRounded />} onClick={open}>검사 기록 추가·사진 분석</Button>
        </Stack>
      </Stack>

      {catReports.length ? (
        <Stack spacing={1.25}>
          {catReports.map(report => {
            const documents = labReportDocuments(report);
            return <Box key={report.id} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                <Box>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap alignItems="center">
                    <Typography fontWeight={800}>{report.date}{report.hospital ? ` · ${report.hospital}` : ""}</Typography>
                    <Chip size="small" label={examinationTypeLabels[report.type]} color="primary" variant="outlined" />
                    {report.title && report.title !== examinationTypeLabels[report.type] && <Chip size="small" label={report.title} variant="outlined" />}
                    {report.rawText && <Chip size="small" label="OCR 원문 저장됨" color="secondary" variant="outlined" />}
                    {documents.length > 0 && <Chip size="small" label={`비공개 원본 ${documents.length}개 저장됨`} color="success" variant="outlined" />}
                  </Stack>
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
                  {report.findings && <Typography variant="body2" sx={{ mt: 1, whiteSpace: "pre-wrap" }}><strong>판독 소견:</strong> {report.findings}</Typography>}
                  {report.interpretation && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}><strong>결론:</strong> {report.interpretation}</Typography>}
                  {documents.length > 0 && <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>{documents.map((document, index) => <Button key={document.storagePath} size="small" startIcon={<OpenInNewRounded />} onClick={() => viewOriginalDocument(document.storagePath)}>{medicalDocumentDisplayName(document.fileName) || `원본 ${index + 1}`}</Button>)}</Stack>}
                </Box>
                <Tooltip title="검사 기록 삭제">
                  <IconButton size="small" color="error" onClick={() => onDelete(report)}><DeleteOutlineRounded fontSize="small" /></IconButton>
                </Tooltip>
              </Stack>
            </Box>;
          })}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>아직 저장된 검사결과가 없습니다.</Typography>
      )}

      <Dialog open={dialogOpen} onClose={close} fullWidth maxWidth="lg">
        <DialogTitle>{cat.name} 검사 기록 추가·사진 분석</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Alert severity="info">
              원본 사진은 로그인한 가족 공간의 비공개 Storage에 저장되며 가족 구성원만 열람할 수 있습니다. OCR 값과 분류는 사진 품질에 따라 틀릴 수 있으니 검사표와 반드시 대조하세요.
            </Alert>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "0.8fr 1fr 1.2fr 1.2fr" }, gap: 2 }}>
              <TextField label="검사일" type="date" value={date} onChange={event => setDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
              <TextField select label="검사 종류" value={type} onChange={event => setType(event.target.value as ExaminationType)} fullWidth>
                {Object.entries(examinationTypeLabels).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
              </TextField>
              <TextField label="검사명" value={title} onChange={event => setTitle(event.target.value)} placeholder={examinationTypeLabels[type]} fullWidth />
              <TextField label="동물병원" value={hospital} onChange={event => setHospital(event.target.value)} placeholder="선택 입력" fullWidth />
            </Box>
            <input
              ref={fileInputRef}
              hidden
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={event => { setFile(event.target.files?.[0] ?? null); setRotation(0); setOcrConfidence(null); }}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems={{ sm: "center" }}>
              <Button variant="outlined" startIcon={<CameraAltRounded />} onClick={() => fileInputRef.current?.click()} disabled={analyzing || uploading}>
                {file ? "다른 사진 선택" : "사진 선택 또는 촬영"}
              </Button>
              <Typography variant="body2" color="text.secondary">{file ? medicalDocumentDisplayName(file.name) : "JPG, PNG, WebP, PDF · 최대 10MB"}</Typography>
              {file && file.type !== "application/pdf" && <Button size="small" startIcon={<RotateRightRounded />} onClick={() => setRotation(current => ((current + 90) % 360) as OcrRotation)} disabled={analyzing || uploading}>회전 {rotation}°</Button>}
              <Button variant="contained" onClick={analyze} disabled={!file || analyzing || uploading} sx={{ ml: { sm: "auto" } }}>
                {analyzing ? <><CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />분석 중</> : "사진에서 값 읽기"}
              </Button>
            </Stack>
            {analyzing && <Box><LinearProgress variant="determinate" value={progress} /><Typography variant="caption" color="text.secondary">{progressLabel} · {progress}%</Typography></Box>}
            {ocrConfidence != null && <Alert severity={ocrConfidence < 60 ? "warning" : "success"}>OCR 인식 신뢰도 {ocrConfidence}% · {ocrConfidence < 60 ? "회전 후 다시 분석하거나 OCR 원문과 수치를 직접 확인해 주세요." : "추출된 수치와 기준범위를 원본 검사표와 대조해 주세요."}</Alert>}
            {previewUrl && file?.type !== "application/pdf" && <Box component="img" src={previewUrl} alt="선택한 검사결과 사진" sx={{ display: "block", maxWidth: "100%", maxHeight: 360, mx: "auto", borderRadius: 2, objectFit: "contain", transform: `rotate(${rotation}deg)` }} />}
            {file?.type === "application/pdf" && <Alert severity="info">PDF의 각 페이지에서 텍스트를 읽고, 스캔 페이지는 OCR로 분석합니다. 최대 10쪽까지 분석합니다.</Alert>}
            {error && <Alert severity="warning">{error}</Alert>}

            <Divider />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" fontWeight={800}>추출 결과 검토</Typography>
                <Typography variant="body2" color="text.secondary">수치와 기준범위를 원본 검사표에 맞게 고쳐 주세요.</Typography>
              </Box>
              <Button startIcon={<AddRounded />} onClick={() => setItems(current => [...current, blankItem()])}>항목 직접 추가</Button>
            </Stack>
            <datalist id="lab-marker-options">
              {markerOptions.map(option => <option key={option.code} value={option.code}>{option.name}</option>)}
            </datalist>
            <Stack spacing={1.5}>
              {items.map(item => (
                <Box key={item.id} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "0.9fr 1.3fr repeat(4, 1fr) auto" }, gap: 1.25, alignItems: "center" }}>
                    <TextField label="검사 코드" size="small" value={item.code} onChange={event => updateMarker(item.id, event.target.value)} slotProps={{ htmlInput: { list: "lab-marker-options" } }} />
                    <TextField label="검사 항목명" size="small" value={item.name} onChange={event => updateItem(item.id, { name: event.target.value })} />
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
            <TextField label="OCR 원문" value={rawText} onChange={event => setRawText(event.target.value)} placeholder="사진 분석 결과가 여기에 저장됩니다. 직접 붙여넣거나 수정할 수도 있습니다." multiline minRows={5} fullWidth />
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 2 }}>
              <TextField label="검사·영상 판독 소견" value={findings} onChange={event => setFindings(event.target.value)} placeholder="관찰된 소견, 병변 위치·크기, 수의사 설명" multiline minRows={3} fullWidth />
              <TextField label="결론·의심 진단" value={interpretation} onChange={event => setInterpretation(event.target.value)} placeholder="검사 결론 또는 의심되는 질환" multiline minRows={3} fullWidth />
              <TextField label="추가 검사·추적 권고" value={recommendations} onChange={event => setRecommendations(event.target.value)} placeholder="재검 시기, 추가 검사, 관찰 사항" multiline minRows={2} fullWidth />
              <TextField label="보호자 메모" value={notes} onChange={event => setNotes(event.target.value)} multiline minRows={2} fullWidth />
            </Box>
            <Typography variant="caption" color="text.secondary">
              기준범위는 검사 장비·검사실마다 다를 수 있습니다. 참고 근거: {" "}
              <Link href="https://www.vet.cornell.edu/animal-health-diagnostic-center/laboratories/clinical-pathology/reference-intervals" target="_blank" rel="noreferrer">Cornell 검사실 기준범위 안내</Link>, {" "}
              <Link href="https://www.iris-kidney.com/s/IRIS_CAT_Treatment_Recommendations_2023.pdf" target="_blank" rel="noreferrer">IRIS 고양이 신장질환 안내</Link>
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={close} color="inherit" disabled={analyzing || uploading}>취소</Button>
          <Button onClick={save} variant="contained" disabled={analyzing || uploading}>{uploading ? <><CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />원본 사진 저장 중</> : "검토한 결과 저장"}</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
