"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
import EditRounded from "@mui/icons-material/EditRounded";
import LocalHospitalRounded from "@mui/icons-material/LocalHospitalRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import RotateRightRounded from "@mui/icons-material/RotateRightRounded";
import type { CatProfile, HealthCheckup, HealthCheckupType, LabReport } from "@/types/cat-care";
import { parseMedicalChartText } from "@/lib/cat-care/medical-chart";
import { createMedicalDocumentSignedUrl, deleteMedicalDocument, uploadMedicalDocument } from "@/lib/cat-care/medical-documents";
import { createId, toLocalDateKey } from "@/lib/cat-care/storage";
import { prepareImageForOcr, type OcrRotation } from "@/lib/cat-care/ocr-image";
import { getLocalTesseractOptions, tesseractStatusLabel, withOcrInitializationTimeout } from "@/lib/cat-care/tesseract-local";

interface HealthCheckupPanelProps {
  cat: CatProfile;
  checkups: HealthCheckup[];
  labReports: LabReport[];
  onSave: (checkup: HealthCheckup) => void;
  onDelete: (checkup: HealthCheckup) => void;
}

const typeLabels: Record<HealthCheckupType, string> = {
  routine: "정기 건강검진",
  follow_up: "추적 진료",
  symptom: "증상 진료",
  emergency: "응급 진료",
  vaccination: "예방접종",
  other: "기타",
};

function optionalNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function blankCheckup(catId: string): HealthCheckup {
  const now = new Date().toISOString();
  return {
    id: createId("checkup"),
    catId,
    date: toLocalDateKey(new Date()),
    type: "routine",
    hospital: "",
    veterinarian: "",
    reason: "",
    summary: "",
    diagnoses: [],
    testsAndProcedures: "",
    treatments: "",
    prescriptions: "",
    recommendations: "",
    nextVisitDate: "",
    weightKg: null,
    temperatureC: null,
    systolicBloodPressure: null,
    diastolicBloodPressure: null,
    costWon: null,
    relatedLabReportIds: [],
    sourceFileName: "",
    chartRawText: "",
    chartDetectedFields: [],
    originalDocument: null,
    documentNotes: "",
    notes: "",
    createdAt: now,
    updatedAt: now,
  };
}

export default function HealthCheckupPanel({ cat, checkups, labReports, onSave, onDelete }: HealthCheckupPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<HealthCheckup>(() => blankCheckup(cat.id));
  const [diagnosesText, setDiagnosesText] = useState("");
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [rotation, setRotation] = useState<OcrRotation>(0);
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null);

  const catCheckups = useMemo(
    () => checkups.filter(checkup => checkup.catId === cat.id).sort((a, b) => b.date.localeCompare(a.date)),
    [cat.id, checkups],
  );
  const catLabReports = useMemo(
    () => labReports.filter(report => report.catId === cat.id).sort((a, b) => b.date.localeCompare(a.date)),
    [cat.id, labReports],
  );
  const labById = useMemo(() => new Map(catLabReports.map(report => [report.id, report])), [catLabReports]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const update = <K extends keyof HealthCheckup>(key: K, value: HealthCheckup[K]) => {
    setDraft(current => ({ ...current, [key]: value }));
  };

  const openNew = () => {
    setDraft(blankCheckup(cat.id));
    setDiagnosesText("");
    setError("");
    setFile(null);
    setProgress(0);
    setProgressLabel("");
    setRotation(0);
    setOcrConfidence(null);
    setDialogOpen(true);
  };

  const openEdit = (checkup: HealthCheckup) => {
    setDraft({ ...checkup, diagnoses: [...checkup.diagnoses], relatedLabReportIds: [...checkup.relatedLabReportIds] });
    setDiagnosesText(checkup.diagnoses.join(", "));
    setError("");
    setFile(null);
    setProgress(0);
    setProgressLabel("");
    setRotation(0);
    setOcrConfidence(null);
    setDialogOpen(true);
  };

  const toggleLabReport = (reportId: string) => {
    update(
      "relatedLabReportIds",
      draft.relatedLabReportIds.includes(reportId)
        ? draft.relatedLabReportIds.filter(id => id !== reportId)
        : [...draft.relatedLabReportIds, reportId],
    );
  };

  const analyzeChart = async () => {
    if (!file) {
      setError("먼저 병원 차트 사진을 선택해 주세요.");
      return;
    }
    setAnalyzing(true);
    setError("");
    setProgress(0);
    setProgressLabel("OCR 엔진 준비 중");
    let worker: Awaited<ReturnType<typeof import("tesseract.js")["createWorker"]>> | null = null;
    try {
      const { createWorker } = await import("tesseract.js");
      worker = await withOcrInitializationTimeout(createWorker(["eng", "kor"], 1, {
        ...getLocalTesseractOptions(),
        logger: log => {
          if (typeof log.progress === "number") setProgress(Math.round(log.progress * 100));
          if (log.status) setProgressLabel(tesseractStatusLabel(log.status));
        },
      }));
      setProgressLabel("사진 회전·선명화 중");
      const prepared = await prepareImageForOcr(file, rotation);
      const result = await worker.recognize(prepared);
      setOcrConfidence(Math.round(result.data.confidence));
      const text = result.data.text.trim();
      if (!text) {
        setError("차트에서 글자를 찾지 못했습니다. 더 선명한 사진으로 다시 시도해 주세요.");
        return;
      }
      const detected = parseMedicalChartText(text);
      setDraft(current => ({
        ...current,
        date: detected.date || current.date,
        hospital: current.hospital || detected.hospital,
        reason: current.reason || detected.reason,
        summary: current.summary || detected.summary,
        weightKg: detected.weightKg ?? current.weightKg,
        temperatureC: detected.temperatureC ?? current.temperatureC,
        systolicBloodPressure: detected.systolicBloodPressure ?? current.systolicBloodPressure,
        diastolicBloodPressure: detected.diastolicBloodPressure ?? current.diastolicBloodPressure,
        sourceFileName: file.name,
        chartRawText: text,
        chartDetectedFields: detected.detectedFields,
      }));
      if (!diagnosesText.trim() && detected.diagnoses.length) setDiagnosesText(detected.diagnoses.join(", "));
      if (!detected.detectedFields.length) {
        setError("글자는 읽었지만 자동으로 분류한 항목이 없습니다. OCR 원문을 확인해 직접 입력해 주세요.");
      }
    } catch (caught) {
      console.error(caught);
      setError(caught instanceof Error ? caught.message : "병원 차트 사진을 읽지 못했습니다. 사진 선명도를 확인해 주세요.");
    } finally {
      await worker?.terminate();
      setAnalyzing(false);
      setProgressLabel("");
    }
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
    if (!draft.date) {
      setError("검진 날짜를 입력해 주세요.");
      return;
    }
    if (!draft.summary.trim() && !draft.reason.trim() && !diagnosesText.trim()) {
      setError("검진 사유, 종합소견 또는 진단 내용을 한 가지 이상 입력해 주세요.");
      return;
    }
    setUploading(Boolean(file));
    setError("");
    try {
      const previousDocument = draft.originalDocument;
      const originalDocument = file
        ? await uploadMedicalDocument({ file, catId: cat.id, recordId: draft.id, kind: "chart" })
        : previousDocument;
      onSave({
        ...draft,
        catId: cat.id,
        hospital: draft.hospital.trim(),
        veterinarian: draft.veterinarian.trim(),
        reason: draft.reason.trim(),
        summary: draft.summary.trim(),
        diagnoses: diagnosesText.split(",").map(value => value.trim()).filter(Boolean),
        testsAndProcedures: draft.testsAndProcedures.trim(),
        treatments: draft.treatments.trim(),
        prescriptions: draft.prescriptions.trim(),
        recommendations: draft.recommendations.trim(),
        sourceFileName: file?.name || draft.sourceFileName || "",
        originalDocument,
        documentNotes: draft.documentNotes.trim(),
        notes: draft.notes.trim(),
        updatedAt: new Date().toISOString(),
      });
      if (file && previousDocument && previousDocument.storagePath !== originalDocument?.storagePath) {
        void deleteMedicalDocument(previousDocument.storagePath).catch(console.error);
      }
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
            <LocalHospitalRounded color="primary" />
            <Typography variant="h6" fontWeight={800}>건강검진·진료 이력</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {cat.name}의 검진 소견, 진단, 처치·처방, 다음 진료일과 관련 검사결과를 한 건으로 묶어 저장합니다.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddRounded />} onClick={openNew}>검진 기록 추가</Button>
      </Stack>

      {catCheckups.length ? (
        <Stack spacing={1.5}>
          {catCheckups.map(checkup => {
            const relatedLabs = checkup.relatedLabReportIds.map(id => labById.get(id)).filter(Boolean) as LabReport[];
            return (
              <Box key={checkup.id} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1.5}>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap alignItems="center">
                      <Typography fontWeight={900}>{checkup.date}</Typography>
                      <Chip label={typeLabels[checkup.type]} size="small" color={checkup.type === "emergency" ? "error" : "primary"} variant="outlined" />
                      {checkup.hospital && <Chip label={checkup.hospital} size="small" variant="outlined" />}
                      {checkup.nextVisitDate && <Chip label={`다음 진료 ${checkup.nextVisitDate}`} size="small" color="warning" />}
                      {checkup.chartRawText && <Chip label="차트 OCR 저장됨" size="small" color="secondary" variant="outlined" />}
                      {checkup.originalDocument && <Chip label="원본 사진 비공개 저장됨" size="small" color="success" variant="outlined" />}
                    </Stack>
                    {checkup.summary && <Typography sx={{ mt: 1, whiteSpace: "pre-wrap" }}>{checkup.summary}</Typography>}
                    {checkup.diagnoses.length > 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                        진단·관심 항목: {checkup.diagnoses.join(", ")}
                      </Typography>
                    )}
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                      {checkup.weightKg != null && <Chip label={`체중 ${checkup.weightKg}kg`} size="small" />}
                      {checkup.temperatureC != null && <Chip label={`체온 ${checkup.temperatureC}℃`} size="small" />}
                      {checkup.systolicBloodPressure != null && <Chip label={`혈압 ${checkup.systolicBloodPressure}${checkup.diastolicBloodPressure != null ? `/${checkup.diastolicBloodPressure}` : ""}`} size="small" />}
                      {relatedLabs.map(report => <Chip key={report.id} label={`검사 ${report.date} · ${report.items.length}항목`} size="small" color="secondary" variant="outlined" />)}
                    </Stack>
                    {checkup.originalDocument && <Button size="small" startIcon={<OpenInNewRounded />} onClick={() => viewOriginalDocument(checkup.originalDocument!.storagePath)} sx={{ mt: 1 }}>원본 사진 보기</Button>}
                  </Box>
                  <Stack direction="row" sx={{ alignSelf: { xs: "flex-end", sm: "flex-start" } }}>
                    <Tooltip title="검진 기록 수정"><IconButton size="small" onClick={() => openEdit(checkup)}><EditRounded fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="검진 기록 삭제"><IconButton size="small" color="error" onClick={() => onDelete(checkup)}><DeleteOutlineRounded fontSize="small" /></IconButton></Tooltip>
                  </Stack>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>아직 저장된 건강검진·진료 기록이 없습니다.</Typography>
      )}

      <Dialog open={dialogOpen} onClose={() => { if (!analyzing && !uploading) setDialogOpen(false); }} fullWidth maxWidth="md">
        <DialogTitle>{cat.name} 건강검진·진료 기록</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Alert severity="info">병원 차트 사진은 OCR 분석 후 로그인한 가족 공간의 비공개 Storage에 원본으로 저장됩니다. 가족 구성원만 열람할 수 있으며 자동 입력 내용은 차트와 대조해 주세요.</Alert>
            {error && <Alert severity="warning">{error}</Alert>}
            <input
              ref={fileInputRef}
              hidden
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={event => { setFile(event.target.files?.[0] ?? null); setRotation(0); setOcrConfidence(null); }}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems={{ sm: "center" }}>
              <Button variant="outlined" startIcon={<CameraAltRounded />} onClick={() => fileInputRef.current?.click()} disabled={analyzing || uploading}>
                {file ? "다른 차트 사진 선택" : "병원 차트 사진 선택·촬영"}
              </Button>
              <Typography variant="body2" color="text.secondary">{file?.name ?? (draft.sourceFileName || "JPG, PNG, WebP 지원")}</Typography>
              {file && <Button size="small" startIcon={<RotateRightRounded />} onClick={() => setRotation(current => ((current + 90) % 360) as OcrRotation)} disabled={analyzing || uploading}>회전 {rotation}°</Button>}
              <Button variant="contained" onClick={analyzeChart} disabled={!file || analyzing || uploading} sx={{ ml: { sm: "auto" } }}>
                {analyzing ? <><CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />분석 중</> : "차트 내용 자동 분석"}
              </Button>
            </Stack>
            {analyzing && <Box><LinearProgress variant="determinate" value={progress} /><Typography variant="caption" color="text.secondary">{progressLabel} · {progress}%</Typography></Box>}
            {ocrConfidence != null && <Alert severity={ocrConfidence < 60 ? "warning" : "success"}>OCR 인식 신뢰도 {ocrConfidence}% · {ocrConfidence < 60 ? "흐림·기울어짐을 확인하고 회전 후 다시 분석하거나 원문을 직접 수정해 주세요." : "자동 입력값을 원본 차트와 최종 대조해 주세요."}</Alert>}
            {previewUrl && <Box component="img" src={previewUrl} alt="선택한 병원 차트 사진" sx={{ display: "block", maxWidth: "100%", maxHeight: 360, mx: "auto", borderRadius: 2, objectFit: "contain", transform: `rotate(${rotation}deg)` }} />}
            {draft.chartDetectedFields.length > 0 && (
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>자동 감지:</Typography>
                {draft.chartDetectedFields.map(field => <Chip key={field} label={field} size="small" color="secondary" variant="outlined" />)}
              </Stack>
            )}
            {draft.chartRawText && <TextField label="차트 OCR 원문" value={draft.chartRawText} onChange={event => update("chartRawText", event.target.value)} helperText="사진에서 읽은 원문입니다. 잘못 인식된 내용을 수정할 수 있습니다." multiline minRows={5} />}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2 }}>
              <TextField label="검진·진료일" type="date" value={draft.date} onChange={event => update("date", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} required />
              <TextField select label="진료 구분" value={draft.type} onChange={event => update("type", event.target.value as HealthCheckupType)}>
                {Object.entries(typeLabels).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
              </TextField>
              <TextField label="동물병원" value={draft.hospital} onChange={event => update("hospital", event.target.value)} />
              <TextField label="담당 수의사" value={draft.veterinarian} onChange={event => update("veterinarian", event.target.value)} />
            </Box>
            <TextField label="검진·진료 사유" value={draft.reason} onChange={event => update("reason", event.target.value)} placeholder="예: 정기검진, 식욕 저하 추적" multiline minRows={2} />
            <TextField label="종합소견" value={draft.summary} onChange={event => update("summary", event.target.value)} multiline minRows={3} />
            <TextField label="진단·관심 항목" value={diagnosesText} onChange={event => setDiagnosesText(event.target.value)} placeholder="쉼표로 구분: 만성신장질환, 치주염" />
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2 }}>
              <TextField label="검사·시술" value={draft.testsAndProcedures} onChange={event => update("testsAndProcedures", event.target.value)} multiline minRows={2} />
              <TextField label="처치 내용" value={draft.treatments} onChange={event => update("treatments", event.target.value)} multiline minRows={2} />
              <TextField label="처방약·복용법" value={draft.prescriptions} onChange={event => update("prescriptions", event.target.value)} multiline minRows={2} />
              <TextField label="관리 권고·주의사항" value={draft.recommendations} onChange={event => update("recommendations", event.target.value)} multiline minRows={2} />
            </Box>
            <Divider />
            <Typography fontWeight={800}>검진 당시 측정값</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(5, 1fr)" }, gap: 1.5 }}>
              <TextField label="체중(kg)" type="number" value={draft.weightKg ?? ""} onChange={event => update("weightKg", optionalNumber(event.target.value))} />
              <TextField label="체온(℃)" type="number" value={draft.temperatureC ?? ""} onChange={event => update("temperatureC", optionalNumber(event.target.value))} />
              <TextField label="수축기 혈압" type="number" value={draft.systolicBloodPressure ?? ""} onChange={event => update("systolicBloodPressure", optionalNumber(event.target.value))} />
              <TextField label="이완기 혈압" type="number" value={draft.diastolicBloodPressure ?? ""} onChange={event => update("diastolicBloodPressure", optionalNumber(event.target.value))} />
              <TextField label="진료비(원)" type="number" value={draft.costWon ?? ""} onChange={event => update("costWon", optionalNumber(event.target.value))} />
            </Box>
            <TextField label="다음 진료일" type="date" value={draft.nextVisitDate} onChange={event => update("nextVisitDate", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ maxWidth: 280 }} />
            <Divider />
            <Box>
              <Typography fontWeight={800}>관련 병원 검사결과</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>이미 저장한 검사표를 선택하면 이 검진 기록과 함께 묶입니다.</Typography>
              {catLabReports.length ? (
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  {catLabReports.map(report => (
                    <Chip
                      key={report.id}
                      clickable
                      label={`${report.date}${report.hospital ? ` · ${report.hospital}` : ""} · ${report.items.length}항목`}
                      color={draft.relatedLabReportIds.includes(report.id) ? "secondary" : "default"}
                      variant={draft.relatedLabReportIds.includes(report.id) ? "filled" : "outlined"}
                      onClick={() => toggleLabReport(report.id)}
                    />
                  ))}
                </Stack>
              ) : <Typography variant="body2" color="text.secondary">연결할 검사결과가 없습니다.</Typography>}
            </Box>
            <TextField label="관련 문서·자료 메모" value={draft.documentNotes} onChange={event => update("documentNotes", event.target.value)} placeholder="예: 초음파 판독지, 처방전, 병원 안내사항의 핵심 내용" multiline minRows={2} />
            <TextField label="보호자 추가 메모" value={draft.notes} onChange={event => update("notes", event.target.value)} multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setDialogOpen(false)} disabled={analyzing || uploading}>취소</Button>
          <Button variant="contained" onClick={save} disabled={analyzing || uploading}>{uploading ? <><CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />원본 사진 저장 중</> : "검진 기록 저장"}</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
