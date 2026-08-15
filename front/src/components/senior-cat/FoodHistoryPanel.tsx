"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import PhotoCameraRounded from "@mui/icons-material/PhotoCameraRounded";
import RestaurantRounded from "@mui/icons-material/RestaurantRounded";
import type { CatProfile, DailyRecord, FoodCategory, FoodItem, FoodNutrientAnalysis } from "@/types/cat-care";
import { EMPTY_FOOD_NUTRIENTS, parseFoodLabelText } from "@/lib/cat-care/food-label";
import {
  createMedicalDocumentSignedUrl,
  deleteMedicalDocuments,
  uploadMedicalDocument,
} from "@/lib/cat-care/medical-documents";
import { createId, toLocalDateKey } from "@/lib/cat-care/storage";

interface FoodHistoryPanelProps {
  cat: CatProfile;
  items: FoodItem[];
  records: DailyRecord[];
  openRequestKey: number;
  onSave: (item: FoodItem) => void | Promise<void>;
  onDelete: (item: FoodItem) => void;
}

interface FoodDraft {
  category: FoodCategory;
  brand: string;
  productName: string;
  startDate: string;
  endDate: string;
  openedDate: string;
  expiresDate: string;
  packageSizeGrams: string;
  remainingGrams: string;
  dailyTargetGrams: string;
  caloriesPer100g: string;
  nutrients: Record<keyof FoodNutrientAnalysis, string>;
  ingredients: string;
  vitaminsMinerals: string;
  additives: string;
  labelRawText: string;
  notes: string;
}

const foodCategoryLabels: Record<FoodCategory, string> = {
  dry: "건사료",
  wet: "습식사료",
  prescription: "처방식",
  treat: "간식",
  other: "기타",
};

const nutrientFields: Array<{ key: keyof FoodNutrientAnalysis; label: string; unit: string }> = [
  { key: "proteinMinPercent", label: "조단백(이상)", unit: "%" },
  { key: "fatMinPercent", label: "조지방(이상)", unit: "%" },
  { key: "fiberMaxPercent", label: "조섬유(이하)", unit: "%" },
  { key: "ashMaxPercent", label: "조회분(이하)", unit: "%" },
  { key: "moistureMaxPercent", label: "수분(이하)", unit: "%" },
  { key: "calciumMinPercent", label: "칼슘(이상)", unit: "%" },
  { key: "phosphorusMinPercent", label: "인(이상)", unit: "%" },
  { key: "omega6Percent", label: "오메가-6", unit: "%" },
  { key: "omega3Percent", label: "오메가-3", unit: "%" },
  { key: "magnesiumPercent", label: "마그네슘", unit: "%" },
  { key: "sodiumPercent", label: "나트륨", unit: "%" },
  { key: "energyKcalPerKg", label: "대사에너지", unit: "kcal/kg" },
];

function valueOrEmpty(value: number | null): string {
  return value == null ? "" : String(value);
}

function numberOrNull(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function createHighContrastOcrImage(file: File): Promise<Blob> {
  if (typeof createImageBitmap === "undefined") return file;
  const bitmap = await createImageBitmap(file);
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width * scale;
  canvas.height = bitmap.height * scale;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    bitmap.close();
    throw new Error("사진 전처리 화면을 만들지 못했습니다.");
  }
  context.imageSmoothingEnabled = true;
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let index = 0; index < image.data.length; index += 4) {
    const gray = image.data[index] * 0.299 + image.data[index + 1] * 0.587 + image.data[index + 2] * 0.114;
    const value = gray < 220 ? 0 : 255;
    image.data[index] = value;
    image.data[index + 1] = value;
    image.data[index + 2] = value;
  }
  context.putImageData(image, 0, 0);
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("사진 전처리에 실패했습니다.")), "image/png");
  });
}

function contiguousRanges(active: boolean[], minimumLength: number): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  let start = -1;
  active.forEach((value, index) => {
    if (value && start < 0) start = index;
    if ((!value || index === active.length - 1) && start >= 0) {
      const end = value && index === active.length - 1 ? index + 1 : index;
      if (end - start >= minimumLength) ranges.push([start, end]);
      start = -1;
    }
  });
  return ranges;
}

async function createTableCellOcrImages(file: File): Promise<Blob[]> {
  if (typeof createImageBitmap === "undefined") return [];
  const bitmap = await createImageBitmap(file);
  const source = document.createElement("canvas");
  source.width = bitmap.width;
  source.height = bitmap.height;
  const context = source.getContext("2d", { willReadFrequently: true });
  if (!context) {
    bitmap.close();
    return [];
  }
  context.drawImage(bitmap, 0, 0);
  const pixels = context.getImageData(0, 0, source.width, source.height).data;
  const isWhite = (x: number, y: number) => {
    const index = (y * source.width + x) * 4;
    return pixels[index] > 235 && pixels[index + 1] > 235 && pixels[index + 2] > 235;
  };
  const hasVisibleContent = (x: number, y: number) => {
    const index = (y * source.width + x) * 4;
    return pixels[index] < 245 || pixels[index + 1] < 245 || pixels[index + 2] < 245;
  };
  // Screenshots often include wide white margins. Excluding those margins keeps
  // them from being mistaken for table cells and makes the thresholds relative
  // to the label itself rather than the whole screenshot.
  const contentColumns = Array.from({ length: source.width }, (_, x) => {
    let visible = 0;
    for (let y = 0; y < source.height; y += 2) if (hasVisibleContent(x, y)) visible += 1;
    return visible > source.height * 0.01;
  });
  const visibleColumnIndexes = contentColumns.flatMap((active, index) => active ? [index] : []);
  const contentLeft = visibleColumnIndexes[0] ?? 0;
  const contentRight = (visibleColumnIndexes.at(-1) ?? (source.width - 1)) + 1;
  const contentWidth = contentRight - contentLeft;
  const activeRows = Array.from({ length: source.height }, (_, y) => {
    let white = 0;
    for (let x = contentLeft; x < contentRight; x += 2) if (isWhite(x, y)) white += 1;
    return white > contentWidth * 0.12;
  });
  const rowRanges = contiguousRanges(activeRows, Math.max(30, Math.floor(source.height * 0.06)));
  const regions: Array<{ x: number; y: number; width: number; height: number }> = [];
  rowRanges.forEach(([top, bottom]) => {
    const height = bottom - top;
    const sampleRows = [top + 4, top + Math.floor(height * 0.24), bottom - 5]
      .map(value => Math.max(top, Math.min(bottom - 1, value)));
    const activeColumns = Array.from(
      { length: contentWidth },
      (_, x) => sampleRows.filter(y => isWhite(contentLeft + x, y)).length >= 2,
    );
    contiguousRanges(activeColumns, Math.max(35, Math.floor(contentWidth * 0.05))).forEach(([left, right]) => {
      regions.push({ x: contentLeft + left, y: top, width: right - left, height });
    });
  });
  if (regions.length < 5 || regions.length > 20) {
    bitmap.close();
    return [];
  }
  const blobs: Blob[] = [];
  for (const region of regions) {
    const scale = 3;
    const cell = document.createElement("canvas");
    cell.width = region.width * scale;
    cell.height = region.height * scale;
    const cellContext = cell.getContext("2d", { willReadFrequently: true });
    if (!cellContext) continue;
    cellContext.drawImage(bitmap, region.x, region.y, region.width, region.height, 0, 0, cell.width, cell.height);
    const blob = await new Promise<Blob | null>(resolve => cell.toBlob(resolve, "image/png"));
    if (blob) blobs.push(blob);
  }
  bitmap.close();
  return blobs;
}

function nutrientDraft(nutrients: FoodNutrientAnalysis = EMPTY_FOOD_NUTRIENTS): FoodDraft["nutrients"] {
  return Object.fromEntries(
    nutrientFields.map(field => [field.key, valueOrEmpty(nutrients[field.key])]),
  ) as FoodDraft["nutrients"];
}

function toDraft(item: FoodItem | null): FoodDraft {
  return item
    ? {
        category: item.category,
        brand: item.brand,
        productName: item.productName,
        startDate: item.startDate,
        endDate: item.endDate,
        openedDate: item.openedDate,
        expiresDate: item.expiresDate,
        packageSizeGrams: valueOrEmpty(item.packageSizeGrams),
        remainingGrams: valueOrEmpty(item.remainingGrams),
        dailyTargetGrams: valueOrEmpty(item.dailyTargetGrams),
        caloriesPer100g: valueOrEmpty(item.caloriesPer100g),
        nutrients: nutrientDraft(item.nutrients),
        ingredients: item.ingredients,
        vitaminsMinerals: item.vitaminsMinerals,
        additives: item.additives,
        labelRawText: item.labelRawText,
        notes: item.notes,
      }
    : {
        category: "dry",
        brand: "",
        productName: "",
        startDate: toLocalDateKey(new Date()),
        endDate: "",
        openedDate: toLocalDateKey(new Date()),
        expiresDate: "",
        packageSizeGrams: "",
        remainingGrams: "",
        dailyTargetGrams: "",
        caloriesPer100g: "",
        nutrients: nutrientDraft(),
        ingredients: "",
        vitaminsMinerals: "",
        additives: "",
        labelRawText: "",
        notes: "",
      };
}

function isActive(item: FoodItem, today: string): boolean {
  return item.startDate <= today && (!item.endDate || item.endDate >= today);
}

function addDays(date: string, days: number): string {
  const next = new Date(`${date}T00:00:00`);
  next.setDate(next.getDate() + days);
  return toLocalDateKey(next);
}

function transitionSummary(records: DailyRecord[], startDate: string, from: number, to: number): string {
  const start = addDays(startDate, from);
  const end = addDays(startDate, to);
  const windowRecords = records.filter(record => record.date >= start && record.date <= end);
  if (!windowRecords.length) return "기록 없음";
  const vomit = windowRecords.reduce((sum, record) => sum + record.vomitCount, 0);
  const lowAppetite = windowRecords.filter(record => record.appetite === "low" || record.appetite === "none").length;
  const stoolScores = windowRecords.map(record => record.stoolScore).filter((value): value is number => value != null);
  const stool = stoolScores.length ? (stoolScores.reduce((sum, value) => sum + value, 0) / stoolScores.length).toFixed(1) : "—";
  return `${windowRecords.length}일 · 구토 ${vomit}회 · 식욕저하 ${lowAppetite}일 · 평균 변 점수 ${stool}`;
}

export default function FoodHistoryPanel({ cat, items, records, openRequestKey, onSave, onDelete }: FoodHistoryPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FoodItem | null>(null);
  const [draft, setDraft] = useState<FoodDraft>(() => toDraft(null));
  const [files, setFiles] = useState<File[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const today = toLocalDateKey(new Date());
  const orderedItems = useMemo(
    () => [...items].sort((a, b) => Number(isActive(b, today)) - Number(isActive(a, today)) || b.startDate.localeCompare(a.startDate)),
    [items, today],
  );
  const latestTransition = [...items].filter(item => item.category !== "treat").sort((a, b) => b.startDate.localeCompare(a.startDate))[0];

  const openNew = () => {
    setEditing(null);
    setDraft(toDraft(null));
    setFiles([]);
    setError("");
    setNotice("");
    setDialogOpen(true);
  };

  useEffect(() => {
    if (openRequestKey > 0) openNew();
  }, [openRequestKey]);

  const openEdit = (item: FoodItem) => {
    setEditing(item);
    setDraft(toDraft(item));
    setFiles([]);
    setError("");
    setNotice("");
    setDialogOpen(true);
  };

  const update = <K extends keyof FoodDraft>(key: K, value: FoodDraft[K]) => {
    setDraft(current => ({ ...current, [key]: value }));
  };

  const updateNutrient = (key: keyof FoodNutrientAnalysis, value: string) => {
    setDraft(current => ({ ...current, nutrients: { ...current.nutrients, [key]: value } }));
  };

  const analyzeLabels = async () => {
    if (!files.length) {
      setError("먼저 사료 라벨 사진을 선택해 주세요.");
      return;
    }
    setAnalyzing(true);
    setError("");
    setNotice("");
    setProgress(0);
    setProgressLabel("OCR 엔진 준비 중");
    let worker: Awaited<ReturnType<typeof import("tesseract.js")["createWorker"]>> | null = null;
    try {
      const { createWorker, PSM } = await import("tesseract.js");
      setProgressLabel("사진 선명화·표 셀 찾는 중");
      const sourceGroups = await Promise.all(files.map(async file => ({
        base: [file, await createHighContrastOcrImage(file)] as Array<File | Blob>,
        cells: await createTableCellOcrImages(file),
      })));
      let passIndex = 0;
      const totalPasses = sourceGroups.reduce((sum, group) => sum + group.base.length + group.cells.length, 0);
      worker = await createWorker(["eng", "kor"], 1, {
        logger: log => {
          if (typeof log.progress === "number") setProgress(Math.round(((passIndex + log.progress) / totalPasses) * 100));
          if (log.status) setProgressLabel(`${Math.min(passIndex + 1, totalPasses)}/${totalPasses} · ${log.status}`);
        },
      });
      await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO, preserve_interword_spaces: "1" });
      const texts: string[] = [];
      for (let fileIndex = 0; fileIndex < sourceGroups.length; fileIndex += 1) {
        const group = sourceGroups[fileIndex];
        for (let sourceIndex = 0; sourceIndex < group.base.length; sourceIndex += 1) {
          await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO });
          const result = await worker.recognize(group.base[sourceIndex]);
          if (result.data.text.trim()) texts.push(`[라벨 사진 ${fileIndex + 1} · 분석 ${sourceIndex + 1}]\n${result.data.text.trim()}`);
          passIndex += 1;
        }
        for (let cellIndex = 0; cellIndex < group.cells.length; cellIndex += 1) {
          await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_BLOCK });
          const result = await worker.recognize(group.cells[cellIndex]);
          if (result.data.text.trim()) texts.push(`[라벨 사진 ${fileIndex + 1} · 성분표 셀 ${cellIndex + 1}]\n${result.data.text.trim()}`);
          passIndex += 1;
        }
      }
      const rawText = texts.join("\n\n");
      if (!rawText) {
        setError("사진에서 글자를 찾지 못했습니다. 라벨이 크게 보이는 선명한 사진으로 다시 시도해 주세요.");
        return;
      }
      const parsed = parseFoodLabelText(rawText);
      setDraft(current => ({
        ...current,
        caloriesPer100g: parsed.nutrients.energyKcalPerKg != null
          ? String(parsed.nutrients.energyKcalPerKg / 10)
          : current.caloriesPer100g,
        nutrients: Object.fromEntries(nutrientFields.map(field => [
          field.key,
          parsed.nutrients[field.key] == null ? current.nutrients[field.key] : String(parsed.nutrients[field.key]),
        ])) as FoodDraft["nutrients"],
        ingredients: parsed.ingredients || current.ingredients,
        vitaminsMinerals: parsed.vitaminsMinerals || current.vitaminsMinerals,
        additives: parsed.additives || current.additives,
        labelRawText: [editing?.labelRawText, rawText].filter(Boolean).join("\n\n"),
      }));
      setProgress(100);
      setNotice(`${parsed.detectedFieldCount}개 항목을 자동 입력했습니다. 저장 전에 숫자와 문장을 사진과 대조해 주세요.`);
      if (!parsed.detectedFieldCount) setError("글자는 읽었지만 항목을 분류하지 못했습니다. OCR 원문을 보고 직접 입력해 주세요.");
    } catch (caught) {
      console.error(caught);
      setError("사료 라벨을 읽지 못했습니다. 네트워크 연결과 사진 선명도를 확인해 주세요.");
    } finally {
      await worker?.terminate();
      setAnalyzing(false);
      setProgressLabel("");
    }
  };

  const viewOriginal = async (storagePath: string) => {
    const popup = window.open("", "_blank");
    if (popup) popup.opener = null;
    try {
      const signedUrl = await createMedicalDocumentSignedUrl(storagePath);
      if (popup) popup.location.href = signedUrl;
      else window.open(signedUrl, "_blank", "noopener,noreferrer");
    } catch (caught) {
      popup?.close();
      window.alert(caught instanceof Error ? caught.message : "라벨 원본을 열지 못했습니다.");
    }
  };

  const save = async () => {
    if (!draft.brand.trim()) {
      setError("브랜드를 입력해 주세요.");
      return;
    }
    if (!draft.startDate) {
      setError("급여 시작일을 입력해 주세요.");
      return;
    }
    if (draft.endDate && draft.endDate < draft.startDate) {
      setError("급여 종료일은 시작일보다 빠를 수 없습니다.");
      return;
    }
    const packageSizeGrams = numberOrNull(draft.packageSizeGrams);
    const remainingGrams = numberOrNull(draft.remainingGrams) ?? (editing ? editing.remainingGrams : packageSizeGrams);
    if (packageSizeGrams != null && remainingGrams != null && remainingGrams > packageSizeGrams) {
      setError("남은 양은 포장 용량보다 클 수 없습니다.");
      return;
    }

    setSaving(true);
    setError("");
    const itemId = editing?.id ?? createId("food");
    const uploaded = [] as FoodItem["labelDocuments"];
    try {
      for (const file of files) {
        uploaded.push(await uploadMedicalDocument({ file, catId: cat.id, recordId: itemId, kind: "food-label" }));
      }
      const now = new Date().toISOString();
      await onSave({
        id: itemId,
        catId: cat.id,
        category: draft.category,
        brand: draft.brand.trim(),
        productName: draft.productName.trim(),
        startDate: draft.startDate,
        endDate: draft.endDate,
        openedDate: draft.openedDate,
        expiresDate: draft.expiresDate,
        packageSizeGrams,
        remainingGrams,
        dailyTargetGrams: numberOrNull(draft.dailyTargetGrams),
        caloriesPer100g: numberOrNull(draft.caloriesPer100g),
        nutrients: Object.fromEntries(nutrientFields.map(field => [field.key, numberOrNull(draft.nutrients[field.key])])) as unknown as FoodNutrientAnalysis,
        ingredients: draft.ingredients.trim(),
        vitaminsMinerals: draft.vitaminsMinerals.trim(),
        additives: draft.additives.trim(),
        labelRawText: draft.labelRawText.trim(),
        labelDocuments: [...(editing?.labelDocuments ?? []), ...uploaded],
        notes: draft.notes.trim(),
        createdAt: editing?.createdAt ?? now,
        updatedAt: now,
      });
      setDialogOpen(false);
    } catch (caught) {
      if (uploaded.length) await deleteMedicalDocuments(uploaded.map(document => document.storagePath)).catch(() => undefined);
      setError(caught instanceof Error ? caught.message : "사료 정보를 저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: "1px solid var(--card-border)", borderRadius: 4 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center"><RestaurantRounded color="primary" /><Typography variant="h6" fontWeight={800}>사료·간식·재고</Typography></Stack>
          <Typography variant="body2" color="text.secondary">라벨 사진을 읽어 성분·원재료를 자동 입력하고, 급여 기간·재고를 함께 관리합니다.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<AddRounded />} onClick={openNew} data-testid="add-food-item">사료·간식 추가</Button>
      </Stack>

      {latestTransition && records.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography fontWeight={800}>{latestTransition.brand} 급여 시작 전후 7일 비교</Typography>
          <Typography variant="body2">이전: {transitionSummary(records, latestTransition.startDate, -7, -1)}</Typography>
          <Typography variant="body2">이후: {transitionSummary(records, latestTransition.startDate, 0, 6)}</Typography>
        </Alert>
      )}

      {orderedItems.length ? (
        <Stack spacing={1}>
          {orderedItems.map(item => {
            const active = isActive(item, today);
            const expirySoon = Boolean(item.expiresDate && item.expiresDate >= today && item.expiresDate <= addDays(today, 7));
            const nutrientCount = Object.values(item.nutrients).filter(value => value != null).length;
            return (
              <Box key={item.id} sx={{ p: 1.5, border: "1px solid", borderColor: active ? "primary.light" : "divider", bgcolor: active ? "rgba(139,92,246,0.05)" : "var(--surface)", borderRadius: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography fontWeight={800}>{item.brand}{item.productName ? ` · ${item.productName}` : ""}</Typography>
                      <Chip size="small" label={foodCategoryLabels[item.category]} />
                      {active && <Chip size="small" color="primary" variant="outlined" label="현재 급여 중" />}
                      {expirySoon && <Chip size="small" color="warning" label="유통기한 임박" />}
                      {item.labelDocuments.length > 0 && <Chip size="small" color="success" variant="outlined" label={`라벨 사진 ${item.labelDocuments.length}장`} />}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{item.startDate} ~ {item.endDate || "현재"}</Typography>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
                      {item.dailyTargetGrams != null && <Chip size="small" variant="outlined" label={`하루 목표 ${item.dailyTargetGrams}g`} />}
                      {item.remainingGrams != null && <Chip size="small" variant="outlined" label={`남은 양 ${Math.round(item.remainingGrams)}g`} />}
                      {item.caloriesPer100g != null && <Chip size="small" variant="outlined" label={`${item.caloriesPer100g}kcal/100g`} />}
                      {nutrientCount > 0 && <Chip size="small" variant="outlined" label={`성분 ${nutrientCount}개`} />}
                      {item.openedDate && <Chip size="small" variant="outlined" label={`개봉 ${item.openedDate}`} />}
                      {item.expiresDate && <Chip size="small" variant="outlined" label={`유통기한 ${item.expiresDate}`} />}
                    </Stack>
                    {item.ingredients && <Typography variant="body2" sx={{ mt: 0.75 }}><strong>원재료</strong> · {item.ingredients}</Typography>}
                    {item.labelDocuments.length > 0 && <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>{item.labelDocuments.map((document, index) => <Button key={document.storagePath} size="small" startIcon={<OpenInNewRounded />} onClick={() => viewOriginal(document.storagePath)}>라벨 {index + 1}</Button>)}</Stack>}
                    {item.notes && <Typography variant="body2" sx={{ mt: 0.5 }}>{item.notes}</Typography>}
                  </Box>
                  <Stack direction="row">
                    <Tooltip title="수정"><IconButton size="small" onClick={() => openEdit(item)}><EditRounded fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="삭제"><IconButton size="small" color="error" onClick={() => onDelete(item)}><DeleteOutlineRounded fontSize="small" /></IconButton></Tooltip>
                  </Stack>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      ) : <Box sx={{ py: 3, textAlign: "center", color: "text.secondary" }}><RestaurantRounded /><Typography variant="body2">등록된 사료·간식 이력이 없습니다.</Typography></Box>}

      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>{editing ? "사료·간식 정보 수정" : `${cat.name} 사료·간식 추가`}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {notice && <Alert severity="success">{notice}</Alert>}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={1.5} alignItems={{ md: "center" }}>
                <Box><Typography fontWeight={800}>사료 라벨 사진 자동 입력</Typography><Typography variant="body2" color="text.secondary">성분표·원재료 사진을 여러 장 선택할 수 있습니다. 원본은 로그인한 가족 공간에 비공개 저장됩니다.</Typography></Box>
                <Stack direction="row" spacing={1}>
                  <Button component="label" variant="outlined" startIcon={<PhotoCameraRounded />}>사진 선택<input hidden type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={event => setFiles(Array.from(event.target.files ?? []))} data-testid="food-label-files" /></Button>
                  <Button variant="contained" startIcon={analyzing ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeRounded />} disabled={!files.length || analyzing || saving} onClick={analyzeLabels} data-testid="analyze-food-label">사진 분석</Button>
                </Stack>
              </Stack>
              {(files.length > 0 || editing?.labelDocuments.length) && <Typography variant="caption" display="block" sx={{ mt: 1 }}>새 사진 {files.length}장{editing?.labelDocuments.length ? ` · 저장된 원본 ${editing.labelDocuments.length}장` : ""}</Typography>}
              {analyzing && <Box sx={{ mt: 1.5 }}><LinearProgress variant="determinate" value={progress} /><Typography variant="caption" color="text.secondary">{progressLabel || `${progress}%`}</Typography></Box>}
            </Paper>

            <FormControl fullWidth><InputLabel>종류</InputLabel><Select label="종류" value={draft.category} onChange={event => update("category", event.target.value as FoodCategory)}>{Object.entries(foodCategoryLabels).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}</Select></FormControl>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="브랜드" value={draft.brand} onChange={event => update("brand", event.target.value)} placeholder="예: 로얄캐닌" autoFocus required fullWidth inputProps={{ "data-testid": "food-brand" }} />
              <TextField label="제품명" value={draft.productName} onChange={event => update("productName", event.target.value)} placeholder="예: 인도어 7+" fullWidth />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="급여 시작일" type="date" value={draft.startDate} onChange={event => update("startDate", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} required fullWidth />
              <TextField label="급여 종료일" type="date" value={draft.endDate} onChange={event => update("endDate", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} helperText="계속 먹이는 중이면 비워 두세요." fullWidth />
              <TextField label="개봉일" type="date" value={draft.openedDate} onChange={event => update("openedDate", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
              <TextField label="유통기한" type="date" value={draft.expiresDate} onChange={event => update("expiresDate", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            </Stack>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2 }}>
              <TextField label="포장 용량(g)" type="number" value={draft.packageSizeGrams} onChange={event => update("packageSizeGrams", event.target.value)} slotProps={{ htmlInput: { min: 0 } }} />
              <TextField label="현재 남은 양(g)" type="number" value={draft.remainingGrams} onChange={event => update("remainingGrams", event.target.value)} slotProps={{ htmlInput: { min: 0 } }} helperText="식사 저장 시 자동 차감" />
              <TextField label="하루 목표량(g)" type="number" value={draft.dailyTargetGrams} onChange={event => update("dailyTargetGrams", event.target.value)} slotProps={{ htmlInput: { min: 0 } }} />
              <TextField label="100g당 kcal" type="number" value={draft.caloriesPer100g} onChange={event => update("caloriesPer100g", event.target.value)} slotProps={{ htmlInput: { min: 0 } }} />
            </Box>

            <Divider><Chip label="보증성분·대사에너지" size="small" /></Divider>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 1.5 }}>
              {nutrientFields.map(field => <TextField key={field.key} label={field.label} type="number" value={draft.nutrients[field.key]} onChange={event => updateNutrient(field.key, event.target.value)} slotProps={{ htmlInput: { min: 0, step: "any" } }} helperText={field.unit} inputProps={{ "data-testid": `food-nutrient-${field.key}` }} />)}
            </Box>
            <TextField label="사용 원재료" value={draft.ingredients} onChange={event => update("ingredients", event.target.value)} minRows={3} multiline fullWidth />
            <TextField label="비타민 및 미네랄/kg" value={draft.vitaminsMinerals} onChange={event => update("vitaminsMinerals", event.target.value)} minRows={3} multiline fullWidth />
            <TextField label="기술 첨가제" value={draft.additives} onChange={event => update("additives", event.target.value)} minRows={2} multiline fullWidth />
            {draft.labelRawText && <TextField label="사진 OCR 원문" value={draft.labelRawText} onChange={event => update("labelRawText", event.target.value)} minRows={4} multiline fullWidth helperText="자동 분류가 잘못됐을 때 원문을 확인할 수 있습니다." />}
            <TextField label="메모" value={draft.notes} onChange={event => update("notes", event.target.value)} placeholder="기호성, 알레르기 반응, 사료 교체 방법 등" minRows={3} multiline fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}><Button color="inherit" disabled={saving} onClick={() => setDialogOpen(false)}>취소</Button><Button variant="contained" disabled={saving || analyzing} onClick={save} data-testid="save-food-item">{saving ? "저장 중…" : "저장"}</Button></DialogActions>
      </Dialog>
    </Paper>
  );
}
