import type {
  CareSchedule,
  CareState,
  CatProfile,
  DailyRecord,
  EmergencyInfo,
  FoodItem,
  HealthCheckup,
  HouseholdLitterRecord,
  LabReport,
  Medication,
  NotificationSettings,
  WeeklyWellnessCheck,
} from "@/types/cat-care";

export const CAT_CARE_STORAGE_KEY = "ohj-senior-cat-care-v1";

export const EMPTY_CARE_STATE: CareState = {
  version: 9,
  cats: [],
  records: [],
  foodItems: [],
  schedules: [],
  labReports: [],
  healthCheckups: [],
  weeklyChecks: [],
  householdLitterRecords: [],
  emergencyInfo: [],
  notificationSettings: {
    browserEnabled: false,
    scheduleAlerts: true,
    missingRecordAlerts: true,
    refillAlerts: true,
    missingRecordHour: 20,
    reminderLeadMinutes: 30,
    lastNotifiedKeys: [],
  },
};

function normalizeMedication(medication: Medication): Medication {
  return {
    ...medication,
    stockCount: typeof medication.stockCount === "number" ? medication.stockCount : null,
    refillThreshold: typeof medication.refillThreshold === "number" ? medication.refillThreshold : null,
    stockUnit: typeof medication.stockUnit === "string" && medication.stockUnit ? medication.stockUnit : "회분",
  };
}

function normalizeNotificationSettings(settings?: Partial<NotificationSettings>): NotificationSettings {
  return {
    ...EMPTY_CARE_STATE.notificationSettings,
    ...settings,
    lastNotifiedKeys: Array.isArray(settings?.lastNotifiedKeys) ? settings.lastNotifiedKeys : [],
  };
}

export function normalizeCareState(input: Partial<CareState>): CareState {
  return {
    version: 9,
    cats: Array.isArray(input.cats)
      ? (input.cats as CatProfile[]).map(cat => ({
          ...cat,
          medications: Array.isArray(cat.medications) ? cat.medications.map(normalizeMedication) : [],
        }))
      : [],
    records: Array.isArray(input.records)
      ? (input.records as DailyRecord[]).map(record => {
          const timedEvents = Array.isArray(record.timedEvents)
            ? record.timedEvents
                .filter(event => ["meal", "urine", "stool", "seizure"].includes(event.type))
                .map(event => ({
                  ...event,
                  time: typeof event.time === "string" ? event.time : "",
                  amountGrams: typeof event.amountGrams === "number" ? event.amountGrams : null,
                  durationSeconds: typeof event.durationSeconds === "number" ? event.durationSeconds : null,
                  severity: event.severity && ["mild", "moderate", "severe"].includes(event.severity) ? event.severity : null,
                  foodItemId: typeof event.foodItemId === "string" ? event.foodItemId : null,
                  notes: event.notes ?? "",
                }))
            : [];
          return {
            ...record,
            timedEvents,
            collapseOrSeizure: Boolean(record.collapseOrSeizure) || timedEvents.some(event => event.type === "seizure"),
          };
        })
      : [],
    foodItems: Array.isArray(input.foodItems)
      ? (input.foodItems as FoodItem[]).map(item => ({
          ...item,
          category: item.category ?? "other",
          brand: item.brand ?? "",
          productName: item.productName ?? "",
          startDate: item.startDate ?? "",
          endDate: item.endDate ?? "",
          notes: item.notes ?? "",
        }))
      : [],
    schedules: Array.isArray(input.schedules) ? input.schedules as CareSchedule[] : [],
    labReports: Array.isArray(input.labReports)
      ? (input.labReports as LabReport[]).map(report => ({
          ...report,
          type: report.type ?? "blood",
          title: report.title ?? "",
          sourceFileName: report.sourceFileName ?? "",
          rawText: report.rawText ?? "",
          originalDocument: report.originalDocument?.storagePath ? report.originalDocument : null,
          items: Array.isArray(report.items) ? report.items : [],
          findings: report.findings ?? "",
          interpretation: report.interpretation ?? "",
          recommendations: report.recommendations ?? "",
          notes: report.notes ?? "",
        }))
      : [],
    healthCheckups: Array.isArray(input.healthCheckups)
      ? (input.healthCheckups as HealthCheckup[]).map(checkup => ({
          ...checkup,
          diagnoses: Array.isArray(checkup.diagnoses) ? checkup.diagnoses : [],
          relatedLabReportIds: Array.isArray(checkup.relatedLabReportIds) ? checkup.relatedLabReportIds : [],
          testsAndProcedures: checkup.testsAndProcedures ?? "",
          treatments: checkup.treatments ?? "",
          prescriptions: checkup.prescriptions ?? "",
          recommendations: checkup.recommendations ?? "",
          sourceFileName: checkup.sourceFileName ?? "",
          chartRawText: checkup.chartRawText ?? "",
          chartDetectedFields: Array.isArray(checkup.chartDetectedFields) ? checkup.chartDetectedFields : [],
          originalDocument: checkup.originalDocument?.storagePath ? checkup.originalDocument : null,
          documentNotes: checkup.documentNotes ?? "",
          notes: checkup.notes ?? "",
        }))
      : [],
    weeklyChecks: Array.isArray(input.weeklyChecks) ? input.weeklyChecks as WeeklyWellnessCheck[] : [],
    householdLitterRecords: Array.isArray(input.householdLitterRecords)
      ? input.householdLitterRecords as HouseholdLitterRecord[]
      : [],
    emergencyInfo: Array.isArray(input.emergencyInfo) ? input.emergencyInfo as EmergencyInfo[] : [],
    notificationSettings: normalizeNotificationSettings(input.notificationSettings),
  };
}

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

    return normalizeCareState(parsed);
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
  const foodById = new Map(state.foodItems.map(item => [item.id, item]));
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
    "시간별 식사·배변·발작",
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
        record.timedEvents
          .slice()
          .sort((a, b) => a.time.localeCompare(b.time))
          .map(event => {
            const label = { meal: "식사", urine: "소변", stool: "대변", seizure: "발작" }[event.type];
            const details = event.type === "meal" && event.amountGrams != null
              ? ` ${event.amountGrams}g`
              : event.type === "seizure" && event.durationSeconds != null
                ? ` ${event.durationSeconds}초`
                : "";
            const severity = event.type === "seizure" && event.severity
              ? ` ${{ mild: "경미", moderate: "중간", severe: "심함" }[event.severity]}`
              : "";
            const food = event.foodItemId ? foodById.get(event.foodItemId) : null;
            const foodName = food ? ` ${food.brand}${food.productName ? ` ${food.productName}` : ""}` : "";
            return `${event.time} ${label}${details}${severity}${foodName}${event.notes ? ` (${event.notes})` : ""}`;
          })
          .join(" / "),
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
