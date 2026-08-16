import type { ExaminationType, MedicalDocumentReference } from "@/types/cat-care";

export interface MedicalImportFileLike {
  name: string;
  type: string;
  size: number;
  lastModified: number;
  webkitRelativePath?: string;
}

export interface MedicalImportGroup<T extends MedicalImportFileLike = MedicalImportFileLike> {
  id: string;
  date: string;
  type: ExaminationType;
  title: string;
  files: T[];
  dateSource: MedicalImportDateSource;
  detectedTimes: string[];
  needsDateReview: boolean;
  needsTypeReview: boolean;
}

export type MedicalImportDateSource = "filename" | "folder" | "same_folder" | "ocr" | "manual" | "fallback";

export interface MedicalFileDateDetection {
  date: string;
  time: string | null;
  source: "filename" | "folder";
}

export interface MedicalImportPlan<T extends MedicalImportFileLike = MedicalImportFileLike> {
  groups: MedicalImportGroup<T>[];
  duplicates: T[];
  unsupported: T[];
}

const SUPPORTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

export const IMPORT_EXAMINATION_LABELS: Record<ExaminationType, string> = {
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

function validDate(year: number, month: number, day: number): string | null {
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

function dateFromCompactText(text: string): { date: string; time: string | null } | null {
  const matches = [...text.matchAll(/(?:^|\D)(20\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])(?:([01]\d|2[0-3])([0-5]\d)([0-5]\d))?(?=\D|$)/g)];
  for (const match of matches) {
    const date = validDate(Number(match[1]), Number(match[2]), Number(match[3]));
    if (!date) continue;
    const time = match[4] ? `${match[4]}:${match[5]}:${match[6]}` : null;
    return { date, time };
  }
  return null;
}

function dateFromSeparatedText(text: string): { date: string; time: string | null } | null {
  const match = text.match(/(?:^|\D)(20\d{2})[.\/_-](0?[1-9]|1[0-2])[.\/_-](0?[1-9]|[12]\d|3[01])(?:[T_\s-]([01]?\d|2[0-3])[:._-]?([0-5]\d)(?:[:._-]?([0-5]\d))?)?(?=\D|$)/);
  if (!match) return null;
  const date = validDate(Number(match[1]), Number(match[2]), Number(match[3]));
  if (!date) return null;
  const time = match[4] ? `${match[4].padStart(2, "0")}:${match[5]}:${match[6] ?? "00"}` : null;
  return { date, time };
}

export function detectMedicalFileDateInfo(path: string): MedicalFileDateDetection | null {
  const normalized = path.normalize("NFC");
  const fileName = normalized.split("/").at(-1) ?? normalized;
  const fileNameDate = dateFromCompactText(fileName) ?? dateFromSeparatedText(fileName);
  if (fileNameDate) return { ...fileNameDate, source: "filename" };

  const pathDate = dateFromCompactText(normalized) ?? dateFromSeparatedText(normalized);
  if (pathDate) return { ...pathDate, source: "folder" };

  const korean = normalized.match(/(?:^|[/\s])(\d{2}|20\d{2})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  if (!korean) return null;
  const year = korean[1].length === 2 ? 2000 + Number(korean[1]) : Number(korean[1]);
  const date = validDate(year, Number(korean[2]), Number(korean[3]));
  return date ? { date, time: null, source: "folder" } : null;
}

export function detectMedicalFileDate(path: string): string | null {
  return detectMedicalFileDateInfo(path)?.date ?? null;
}

export function detectMedicalFileType(path: string, mimeType = ""): ExaminationType {
  const normalized = path.normalize("NFC");
  if (/\(US\)|초음파|ultrasound/i.test(normalized)) return "ultrasound";
  if (/\(DX\)|엑스레이|방사선|x[\s-]?ray|radiograph/i.test(normalized)) return "xray";
  if (/혈액|blood|CBC|chemistry/i.test(normalized) || mimeType === "application/pdf") return "blood";
  if (/소변|urine|urinalysis/i.test(normalized)) return "urine";
  if (/분변|대변|stool|fecal/i.test(normalized)) return "stool";
  if (/심장|cardiac|echo/i.test(normalized)) return "cardiac";
  if (/갑상선|thyroid|T4/i.test(normalized)) return "thyroid";
  if (/병리|조직|세포|pathology|cytology/i.test(normalized)) return "pathology";
  if (/치과|구강|dental/i.test(normalized)) return "dental";
  return "other";
}

function filePath(file: MedicalImportFileLike): string {
  return file.webkitRelativePath || file.name;
}

function directoryOf(file: MedicalImportFileLike): string {
  const path = filePath(file).normalize("NFC");
  const separator = path.lastIndexOf("/");
  return separator < 0 ? "" : path.slice(0, separator);
}

function documentKey(name: string, size: number): string {
  return `${name.normalize("NFC").toLocaleLowerCase("ko-KR")}|${size}`;
}

export function planMedicalImport<T extends MedicalImportFileLike>(
  files: T[],
  fallbackDate: string,
  existingDocuments: MedicalDocumentReference[] = [],
): MedicalImportPlan<T> {
  const existingKeys = new Set(existingDocuments.map(document => documentKey(document.fileName, document.sizeBytes)));
  const unsupported: T[] = [];
  const duplicates: T[] = [];
  const supported = files.filter(file => {
    if (!SUPPORTED_TYPES.has(file.type)) {
      unsupported.push(file);
      return false;
    }
    if (existingKeys.has(documentKey(file.name, file.size))) {
      duplicates.push(file);
      return false;
    }
    return true;
  });

  const detectedDirectoryDates = new Map<string, Set<string>>();
  for (const file of supported) {
    const detected = detectMedicalFileDateInfo(filePath(file));
    if (!detected) continue;
    const dates = detectedDirectoryDates.get(directoryOf(file)) ?? new Set<string>();
    dates.add(detected.date);
    detectedDirectoryDates.set(directoryOf(file), dates);
  }

  const grouped = new Map<string, MedicalImportGroup<T>>();
  for (const file of supported) {
    const path = filePath(file);
    const direct = detectMedicalFileDateInfo(path);
    const directoryDates = detectedDirectoryDates.get(directoryOf(file));
    const inheritedDate = directoryDates?.size === 1 ? [...directoryDates][0] : null;
    const date = direct?.date || inheritedDate || fallbackDate;
    const type = detectMedicalFileType(path, file.type);
    const key = `${date}|${type}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.files.push(file);
      if (direct?.time && !existing.detectedTimes.includes(direct.time)) existing.detectedTimes.push(direct.time);
      if (direct?.source === "filename") existing.dateSource = "filename";
      else if (direct?.source === "folder" && existing.dateSource !== "filename") existing.dateSource = "folder";
      existing.needsDateReview ||= !direct && !inheritedDate;
      continue;
    }
    grouped.set(key, {
      id: key,
      date,
      type,
      title: IMPORT_EXAMINATION_LABELS[type],
      files: [file],
      dateSource: direct?.source ?? (inheritedDate ? "same_folder" : "fallback"),
      detectedTimes: direct?.time ? [direct.time] : [],
      needsDateReview: !direct && !inheritedDate,
      needsTypeReview: type === "other",
    });
  }

  return {
    groups: [...grouped.values()]
      .map(group => ({ ...group, files: [...group.files].sort((a, b) => filePath(a).localeCompare(filePath(b), "ko-KR")) }))
      .sort((a, b) => b.date.localeCompare(a.date) || a.type.localeCompare(b.type)),
    duplicates,
    unsupported,
  };
}
