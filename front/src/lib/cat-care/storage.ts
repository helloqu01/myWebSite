import type { CareSchedule, CareState, CatProfile, DailyRecord, LabReport } from "@/types/cat-care";

export const CAT_CARE_STORAGE_KEY = "ohj-senior-cat-care-v1";

export const EMPTY_CARE_STATE: CareState = {
  version: 3,
  cats: [],
  records: [],
  schedules: [],
  labReports: [],
};

export function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function loadCareState(): CareState {
  if (typeof window === "undefined") return EMPTY_CARE_STATE;

  try {
    const raw = window.localStorage.getItem(CAT_CARE_STORAGE_KEY);
    if (!raw) return EMPTY_CARE_STATE;

    const parsed = JSON.parse(raw) as Partial<CareState>;
    if (!Array.isArray(parsed.cats) || !Array.isArray(parsed.records)) {
      return EMPTY_CARE_STATE;
    }

    return {
      version: 3,
      cats: parsed.cats as CatProfile[],
      records: parsed.records as DailyRecord[],
      schedules: Array.isArray(parsed.schedules)
        ? parsed.schedules as CareSchedule[]
        : [],
      labReports: Array.isArray(parsed.labReports)
        ? parsed.labReports as LabReport[]
        : [],
    };
  } catch {
    return EMPTY_CARE_STATE;
  }
}

export function saveCareState(state: CareState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CAT_CARE_STORAGE_KEY, JSON.stringify(state));
}

function downloadText(filename: string, content: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportCareJson(state: CareState): void {
  const payload = {
    exportedAt: new Date().toISOString(),
    app: "노묘 건강관리",
    data: state,
  };
  downloadText(
    `senior-cat-care-${toLocalDateKey(new Date())}.json`,
    JSON.stringify(payload, null, 2),
    "application/json;charset=utf-8",
  );
}

function csvCell(value: unknown): string {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function exportCareCsv(state: CareState): void {
  const catsById = new Map(state.cats.map(cat => [cat.id, cat]));
  const headers = [
    "날짜",
    "고양이",
    "음수량(ml)",
    "소변 횟수",
    "소변 덩어리",
    "대변 횟수",
    "대변 양",
    "변 상태(1-7)",
    "식욕",
    "체중(kg)",
    "구토 횟수",
    "활동성",
    "측정 신뢰도",
    "배뇨 힘주기",
    "소변 안 나옴",
    "혈뇨",
    "호흡 곤란",
    "쓰러짐/경련",
    "투약 완료 수",
    "메모",
  ];

  const rows = [...state.records]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(record => {
      const cat = catsById.get(record.catId);
      const medicationDone = Object.values(record.medicationChecks).filter(Boolean).length;
      return [
        record.date,
        cat?.name ?? "삭제된 고양이",
        record.waterMl,
        record.urineCount,
        record.urineSize,
        record.stoolCount,
        record.stoolAmount,
        record.stoolScore,
        record.appetite,
        record.weightKg,
        record.vomitCount,
        record.activity,
        record.measurementConfidence,
        record.urinationStraining,
        record.urineNotProduced,
        record.bloodInUrine,
        record.breathingDifficulty,
        record.collapseOrSeizure,
        medicationDone,
        record.notes,
      ]
        .map(csvCell)
        .join(",");
    });

  const csv = `\uFEFF${headers.map(csvCell).join(",")}\n${rows.join("\n")}`;
  downloadText(
    `senior-cat-care-${toLocalDateKey(new Date())}.csv`,
    csv,
    "text/csv;charset=utf-8",
  );
}

export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
