"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import DriveFolderUploadRounded from "@mui/icons-material/DriveFolderUploadRounded";
import PictureAsPdfRounded from "@mui/icons-material/PictureAsPdfRounded";
import ScienceRounded from "@mui/icons-material/ScienceRounded";
import type { CatProfile, ExaminationType, LabReport, LabResultItem } from "@/types/cat-care";
import {
  IMPORT_EXAMINATION_LABELS,
  planMedicalImport,
  type MedicalImportGroup,
} from "@/lib/cat-care/medical-import";
import {
  labReportDocuments,
  medicalDocumentDisplayName,
  MEDICAL_DOCUMENT_MAX_BYTES,
  uploadMedicalDocuments,
} from "@/lib/cat-care/medical-documents";
import { parseLabText } from "@/lib/cat-care/lab-results";
import { parseMedicalChartText } from "@/lib/cat-care/medical-chart";
import { recognizeMedicalDocument } from "@/lib/cat-care/medical-ocr";
import { createId, toLocalDateKey } from "@/lib/cat-care/storage";

interface MedicalFolderImportDialogProps {
  cat: CatProfile;
  reports: LabReport[];
  onSave: (report: LabReport) => void;
}

interface GroupAnalysis {
  working: boolean;
  progress: number;
  label: string;
  rawText: string;
  items: LabResultItem[];
  confidence: number | null;
  confirmed: boolean;
  error: string;
}

const EMPTY_ANALYSIS: GroupAnalysis = {
  working: false,
  progress: 0,
  label: "",
  rawText: "",
  items: [],
  confidence: null,
  confirmed: false,
  error: "",
};

function bytesLabel(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

export default function MedicalFolderImportDialog({ cat, reports, onSave }: MedicalFolderImportDialogProps) {
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<Array<MedicalImportGroup<File>>>([]);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [unsupportedCount, setUnsupportedCount] = useState(0);
  const [folderWarning, setFolderWarning] = useState("");
  const [error, setError] = useState("");
  const [analyses, setAnalyses] = useState<Record<string, GroupAnalysis>>({});
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [saveLabel, setSaveLabel] = useState("");

  useEffect(() => {
    const input = folderInputRef.current;
    if (!input) return;
    input.setAttribute("webkitdirectory", "");
    input.setAttribute("directory", "");
  }, []);

  const existingDocuments = useMemo(
    () => reports.filter(report => report.catId === cat.id).flatMap(labReportDocuments),
    [cat.id, reports],
  );

  const totalFiles = groups.reduce((sum, group) => sum + group.files.length, 0);
  const totalBytes = groups.reduce((sum, group) => sum + group.files.reduce((fileSum, file) => fileSum + file.size, 0), 0);

  const reset = () => {
    setGroups([]);
    setDuplicateCount(0);
    setUnsupportedCount(0);
    setFolderWarning("");
    setError("");
    setAnalyses({});
    setSaveProgress(0);
    setSaveLabel("");
    if (folderInputRef.current) folderInputRef.current.value = "";
  };

  const selectFolder = () => folderInputRef.current?.click();

  const handleFiles = (files: File[]) => {
    setError("");
    const tooLarge = files.filter(file => file.size > MEDICAL_DOCUMENT_MAX_BYTES);
    if (tooLarge.length) {
      setError(`10MB를 넘는 파일 ${tooLarge.length}개는 가져올 수 없습니다.`);
    }
    const accepted = files.filter(file => file.size <= MEDICAL_DOCUMENT_MAX_BYTES);
    const plan = planMedicalImport(accepted, toLocalDateKey(new Date()), existingDocuments);
    setGroups(plan.groups);
    setDuplicateCount(plan.duplicates.length);
    setUnsupportedCount(plan.unsupported.length + tooLarge.length);
    setAnalyses({});
    const selectedRoot = accepted[0]?.webkitRelativePath.split("/")[0]?.normalize("NFC") ?? "";
    setFolderWarning(selectedRoot && !selectedRoot.includes(cat.name.normalize("NFC"))
      ? `선택한 폴더는 '${selectedRoot}'입니다. 현재 ${cat.name}에게 저장되는 것이 맞는지 확인해 주세요.`
      : "");
  };

  const updateGroup = <K extends keyof MedicalImportGroup<File>>(id: string, key: K, value: MedicalImportGroup<File>[K]) => {
    setGroups(current => current.map(group => group.id === id ? { ...group, [key]: value } : group));
  };

  const removeGroup = (id: string) => {
    setGroups(current => current.filter(group => group.id !== id));
    setAnalyses(current => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const analyzeGroup = async (group: MedicalImportGroup<File>) => {
    const analyzable = group.files.filter(file => file.type === "application/pdf" || group.type === "blood");
    if (!analyzable.length) return;
    setAnalyses(current => ({ ...current, [group.id]: { ...EMPTY_ANALYSIS, working: true, label: "검사 자료 준비 중" } }));
    try {
      const texts: string[] = [];
      const confidenceValues: number[] = [];
      for (let index = 0; index < analyzable.length; index += 1) {
        const file = analyzable[index];
        const result = await recognizeMedicalDocument(file, 0, progress => {
          const combined = Math.round(((index + progress.percent / 100) / analyzable.length) * 100);
          setAnalyses(current => ({
            ...current,
            [group.id]: { ...(current[group.id] ?? EMPTY_ANALYSIS), working: true, progress: combined, label: progress.label },
          }));
        });
        if (result.text) texts.push(result.text);
        if (result.confidence != null) confidenceValues.push(result.confidence);
      }
      const rawText = texts.join("\n\n=== 다음 원본 ===\n\n");
      const items = parseLabText(rawText);
      const detectedDate = parseMedicalChartText(rawText).date;
      if (group.needsDateReview && detectedDate) {
        setGroups(current => current.map(candidate => candidate.id === group.id
          ? { ...candidate, date: detectedDate, needsDateReview: false }
          : candidate));
      }
      setAnalyses(current => ({
        ...current,
        [group.id]: {
          working: false,
          progress: 100,
          label: "분석 완료",
          rawText,
          items,
          confidence: confidenceValues.length
            ? Math.round(confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length)
            : null,
          confirmed: false,
          error: rawText ? "" : "글자를 찾지 못했습니다. 원본은 저장할 수 있으며 판독 내용은 직접 입력해 주세요.",
        },
      }));
    } catch (caught) {
      setAnalyses(current => ({
        ...current,
        [group.id]: {
          ...EMPTY_ANALYSIS,
          error: caught instanceof Error ? caught.message : "검사 자료를 읽지 못했습니다.",
        },
      }));
    }
  };

  const save = async () => {
    if (!groups.length) {
      setError("저장할 검사 자료가 없습니다.");
      return;
    }
    if (groups.some(group => !group.date)) {
      setError("모든 검사 기록의 날짜를 확인해 주세요.");
      return;
    }
    const unconfirmed = groups.filter(group => {
      const analysis = analyses[group.id];
      return Boolean(analysis?.items.length && !analysis.confirmed);
    });
    if (unconfirmed.length) {
      setError(`자동 추출된 검사 수치를 원본과 비교해 확인해 주세요. 확인이 필요한 기록: ${unconfirmed.length}건`);
      return;
    }
    setSaving(true);
    setError("");
    let completedFiles = 0;
    try {
      for (let index = 0; index < groups.length; index += 1) {
        const group = groups[index];
        const reportId = createId("lab-report");
        setSaveLabel(`${group.date} ${IMPORT_EXAMINATION_LABELS[group.type]} 저장 중`);
        const originalDocuments = await uploadMedicalDocuments({
          files: group.files,
          catId: cat.id,
          recordId: reportId,
          kind: "examination",
          onProgress: done => {
            setSaveProgress(Math.round(((completedFiles + done) / totalFiles) * 100));
          },
        });
        const analysis = analyses[group.id] ?? EMPTY_ANALYSIS;
        const now = new Date().toISOString();
        onSave({
          id: reportId,
          catId: cat.id,
          date: group.date,
          type: group.type,
          title: group.title.trim() || IMPORT_EXAMINATION_LABELS[group.type],
          hospital: "",
          sourceFileName: `${group.files.length}개 원본 일괄 가져오기`,
          rawText: analysis.rawText,
          originalDocuments,
          originalDocument: originalDocuments[0] ?? null,
          items: analysis.items,
          findings: "",
          interpretation: "",
          recommendations: "",
          notes: "폴더에서 자동 분류한 기록입니다. 검사일·종류와 병원 판독 내용을 확인해 주세요.",
          createdAt: now,
          updatedAt: now,
        });
        completedFiles += group.files.length;
        setSaveProgress(Math.round((completedFiles / totalFiles) * 100));
        setGroups(current => current.filter(candidate => candidate.id !== group.id));
      }
      setOpen(false);
      reset();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "검사 자료를 저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <input
        ref={folderInputRef}
        hidden
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={event => handleFiles(Array.from(event.target.files ?? []))}
      />
      <Button variant="outlined" startIcon={<DriveFolderUploadRounded />} onClick={() => { reset(); setOpen(true); }}>
        병원 자료 폴더 가져오기
      </Button>
      <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>{cat.name} 병원 자료 폴더 가져오기</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Alert severity="info">
              파일명과 폴더명에서 검사일과 종류를 자동 분류합니다. 자동 결과를 확인한 뒤 저장하세요. 영상 사진만으로 진단명이나 판독 소견을 만들지는 않습니다.
            </Alert>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems={{ sm: "center" }}>
              <Button variant="contained" startIcon={<DriveFolderUploadRounded />} onClick={selectFolder} disabled={saving}>
                {groups.length ? "다른 폴더 선택" : "고양이 폴더 선택"}
              </Button>
              {groups.length > 0 && <Typography variant="body2" color="text.secondary">검사 {groups.length}건 · 원본 {totalFiles}개 · {bytesLabel(totalBytes)}</Typography>}
            </Stack>
            {folderWarning && <Alert severity="warning">{folderWarning}</Alert>}
            {(duplicateCount > 0 || unsupportedCount > 0) && (
              <Alert severity="info">중복 원본 {duplicateCount}개는 제외했고, 지원하지 않거나 10MB를 넘는 파일 {unsupportedCount}개는 건너뛰었습니다.</Alert>
            )}
            {error && <Alert severity="error">{error}</Alert>}

            {groups.map(group => {
              const analysis = analyses[group.id] ?? EMPTY_ANALYSIS;
              const canAnalyze = group.files.some(file => file.type === "application/pdf") || group.type === "blood";
              return (
                <Box key={group.id} sx={{ p: 2, border: "1px solid", borderColor: group.needsDateReview || group.needsTypeReview ? "warning.main" : "divider", borderRadius: 3 }}>
                  <Stack direction="row" justifyContent="space-between" gap={1} alignItems="flex-start">
                    <Stack direction={{ xs: "column", md: "row" }} spacing={1.25} sx={{ flex: 1 }}>
                      <TextField label="검사일" type="date" size="small" value={group.date} onChange={event => { updateGroup(group.id, "date", event.target.value); updateGroup(group.id, "needsDateReview", false); }} slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 160 }} />
                      <TextField select label="검사 종류" size="small" value={group.type} onChange={event => {
                        const nextType = event.target.value as ExaminationType;
                        updateGroup(group.id, "type", nextType);
                        updateGroup(group.id, "needsTypeReview", false);
                        if (group.title === IMPORT_EXAMINATION_LABELS[group.type]) updateGroup(group.id, "title", IMPORT_EXAMINATION_LABELS[nextType]);
                      }} sx={{ minWidth: 180 }}>
                        {Object.entries(IMPORT_EXAMINATION_LABELS).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                      </TextField>
                      <TextField label="검사명" size="small" value={group.title} onChange={event => updateGroup(group.id, "title", event.target.value)} fullWidth />
                    </Stack>
                    <IconButton color="error" size="small" onClick={() => removeGroup(group.id)} disabled={saving} aria-label="이 검사 묶음 제외"><DeleteOutlineRounded /></IconButton>
                  </Stack>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                    <Chip size="small" color="primary" variant="outlined" label={`원본 ${group.files.length}개`} />
                    {group.needsDateReview && <Chip size="small" color="warning" label="날짜 확인 필요" />}
                    {group.needsTypeReview && <Chip size="small" color="warning" label="종류 확인 필요" />}
                    {group.files.some(file => file.type === "application/pdf") && <Chip size="small" icon={<PictureAsPdfRounded />} color="error" variant="outlined" label="PDF 포함" />}
                  </Stack>
                  <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 1, overflowWrap: "anywhere" }}>
                    {group.files.slice(0, 4).map(file => medicalDocumentDisplayName(file.name)).join(" · ")}{group.files.length > 4 ? ` · 외 ${group.files.length - 4}개` : ""}
                  </Typography>
                  {canAnalyze && (
                    <Stack spacing={1} sx={{ mt: 1.5 }}>
                      <Button size="small" variant="outlined" startIcon={analysis.working ? <CircularProgress size={16} /> : <ScienceRounded />} onClick={() => analyzeGroup(group)} disabled={analysis.working || saving} sx={{ alignSelf: "flex-start" }}>
                        {analysis.working ? "검사값 읽는 중" : analysis.rawText ? "검사값 다시 읽기" : "PDF·혈액검사 값 읽기"}
                      </Button>
                      {analysis.working && <Box><LinearProgress variant="determinate" value={analysis.progress} /><Typography variant="caption" color="text.secondary">{analysis.label} · {analysis.progress}%</Typography></Box>}
                      {analysis.items.length > 0 && <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>{analysis.items.slice(0, 8).map(item => <Chip key={item.id} size="small" color="success" variant="outlined" label={`${item.code} ${item.value ?? "—"}${item.unit ? ` ${item.unit}` : ""}`} />)}{analysis.items.length > 8 && <Chip size="small" label={`+${analysis.items.length - 8}`} />}</Stack>}
                      {analysis.items.length > 0 && <FormControlLabel control={<Checkbox checked={analysis.confirmed} onChange={event => setAnalyses(current => ({ ...current, [group.id]: { ...(current[group.id] ?? EMPTY_ANALYSIS), confirmed: event.target.checked } }))} />} label="원본 검사표와 추출 수치·단위·기준범위를 비교해 확인했습니다" />}
                      {analysis.items.length > 0 && <Button size="small" color="inherit" onClick={() => setAnalyses(current => ({ ...current, [group.id]: { ...(current[group.id] ?? EMPTY_ANALYSIS), items: [], confirmed: false } }))} sx={{ alignSelf: "flex-start" }}>자동 추출 수치 제외하고 원본만 저장</Button>}
                      {analysis.rawText && !analysis.items.length && <Alert severity="warning">글자는 읽었지만 수치 항목은 자동 분류하지 못했습니다. 저장 후 원본과 OCR 내용을 대조해 주세요.</Alert>}
                      {analysis.confidence != null && <Typography variant="caption" color="text.secondary">OCR 신뢰도 {analysis.confidence}% · 원본 검사표와 반드시 대조하세요.</Typography>}
                      {analysis.error && <Alert severity="warning">{analysis.error}</Alert>}
                    </Stack>
                  )}
                </Box>
              );
            })}

            {!groups.length && <Box sx={{ py: 5, textAlign: "center", border: "1px dashed", borderColor: "divider", borderRadius: 3 }}><DriveFolderUploadRounded color="disabled" sx={{ fontSize: 48 }} /><Typography color="text.secondary">냥냥이·예쁜이·쵸비·보비 중 현재 선택한 고양이의 폴더를 선택하세요.</Typography></Box>}
            {saving && <Box><LinearProgress variant="determinate" value={saveProgress} /><Typography variant="caption" color="text.secondary">{saveLabel} · {saveProgress}%</Typography></Box>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button color="inherit" onClick={() => setOpen(false)} disabled={saving}>취소</Button>
          <Button variant="contained" onClick={save} disabled={saving || !groups.length}>{saving ? "비공개 원본 저장 중" : `${groups.length}건 저장`}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
