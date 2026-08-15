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
  MedicationAdministration,
  NotificationSettings,
  ObservationMediaRecord,
  QualityOfLifeCheck,
  WeeklyWellnessCheck,
} from "@/types/cat-care";
import { EMPTY_FOOD_NUTRIENTS } from "./food-label";

export const CAT_CARE_STORAGE_KEY = "ohj-senior-cat-care-v1";

export const EMPTY_CARE_STATE: CareState = {
  version: 13,
  cats: [],
  records: [],
  foodItems: [],
  medicationAdministrations: [],
  qualityOfLifeChecks: [],
  observationMedia: [],
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
    version: 13,
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
                .filter(event => ["water", "meal", "urine", "stool", "seizure"].includes(event.type))
                .map(event => ({
                  ...event,
                  time: typeof event.time === "string" ? event.time : "",
                  amountMl: typeof event.amountMl === "number" ? event.amountMl : null,
                  amountGrams: typeof event.amountGrams === "number" ? event.amountGrams : null,
                  durationSeconds: typeof event.durationSeconds === "number" ? event.durationSeconds : null,
                  severity: event.severity && ["mild", "moderate", "severe"].includes(event.severity) ? event.severity : null,
                  foodItemId: typeof event.foodItemId === "string" ? event.foodItemId : null,
                  notes: event.notes ?? "",
                }))
            : [];
          return {
            ...record,
            waterCount: typeof record.waterCount === "number"
              ? record.waterCount
              : timedEvents.filter(event => event.type === "water").length || null,
            timedEvents,
            collapseOrSeizure: Boolean(record.collapseOrSeizure) || timedEvents.some(event => event.type === "seizure"),
          };
        })
      : [],
    foodItems: Array.isArray(input.foodItems)
      ? (input.foodItems as FoodItem[]).map(item => ({
          ...item,
          catIds: Array.isArray(item.catIds) && item.catIds.length
            ? [...new Set(item.catIds.filter(catId => typeof catId === "string" && catId))]
            : item.catId ? [item.catId] : [],
          category: item.category ?? "other",
          brand: item.brand ?? "",
          productName: item.productName ?? "",
          startDate: item.startDate ?? "",
          endDate: item.endDate ?? "",
          openedDate: item.openedDate ?? "",
          expiresDate: item.expiresDate ?? "",
          packageSizeGrams: typeof item.packageSizeGrams === "number" ? item.packageSizeGrams : null,
          remainingGrams: typeof item.remainingGrams === "number" ? item.remainingGrams : null,
          dailyTargetGrams: typeof item.dailyTargetGrams === "number" ? item.dailyTargetGrams : null,
          caloriesPer100g: typeof item.caloriesPer100g === "number" ? item.caloriesPer100g : null,
          nutrients: Object.fromEntries(
            Object.keys(EMPTY_FOOD_NUTRIENTS).map(key => {
              const value = item.nutrients?.[key as keyof typeof EMPTY_FOOD_NUTRIENTS];
              return [key, typeof value === "number" ? value : null];
            }),
          ) as unknown as FoodItem["nutrients"],
          ingredients: item.ingredients ?? "",
          vitaminsMinerals: item.vitaminsMinerals ?? "",
          additives: item.additives ?? "",
          labelRawText: item.labelRawText ?? "",
          labelDocuments: Array.isArray(item.labelDocuments) ? item.labelDocuments : [],
          notes: item.notes ?? "",
        }))
      : [],
    medicationAdministrations: Array.isArray(input.medicationAdministrations)
      ? (input.medicationAdministrations as MedicationAdministration[]).map(item => ({
          ...item,
          scheduledTime: item.scheduledTime ?? "",
          actualTime: item.actualTime ?? "",
          dose: typeof item.dose === "number" ? item.dose : null,
          doseUnit: item.doseUnit ?? "정",
          administeredBy: item.administeredBy ?? "",
          sideEffects: item.sideEffects ?? "",
          notes: item.notes ?? "",
          linkedScheduleId: item.linkedScheduleId ?? null,
          stockDeducted: Boolean(item.stockDeducted),
          scheduleCompletedByLog: Boolean(item.scheduleCompletedByLog),
        }))
      : [],
    qualityOfLifeChecks: Array.isArray(input.qualityOfLifeChecks)
      ? (input.qualityOfLifeChecks as QualityOfLifeCheck[]).map(item => ({
          ...item,
          appetite: Math.min(4, Math.max(0, Number(item.appetite) || 0)),
          painComfort: Math.min(4, Math.max(0, Number(item.painComfort) || 0)),
          hygiene: Math.min(4, Math.max(0, Number(item.hygiene) || 0)),
          mobility: Math.min(4, Math.max(0, Number(item.mobility) || 0)),
          interaction: Math.min(4, Math.max(0, Number(item.interaction) || 0)),
          sleep: Math.min(4, Math.max(0, Number(item.sleep) || 0)),
          notes: item.notes ?? "",
        }))
      : [],
    observationMedia: Array.isArray(input.observationMedia)
      ? (input.observationMedia as ObservationMediaRecord[])
          .filter(item => Boolean(item.document?.storagePath))
          .map(item => ({ ...item, title: item.title ?? "", notes: item.notes ?? "" }))
      : [],
    schedules: Array.isArray(input.schedules)
      ? (input.schedules as CareSchedule[]).map(schedule => ({ ...schedule, medicationId: schedule.medicationId ?? null }))
      : [],
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
    weeklyChecks: Array.isArray(input.weeklyChecks)
      ? (input.weeklyChecks as WeeklyWellnessCheck[]).map(check => ({
          ...check,
          weightKg: typeof check.weightKg === "number" ? check.weightKg : null,
          jumpingDifficulty: Boolean(check.jumpingDifficulty),
          stairDifficulty: Boolean(check.stairDifficulty),
          limping: Boolean(check.limping),
          disorientation: Boolean(check.disorientation),
          nightVocalizationCount: typeof check.nightVocalizationCount === "number" ? check.nightVocalizationCount : null,
          hidingHours: typeof check.hidingHours === "number" ? check.hidingHours : null,
        }))
      : [],
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
    "물 마신 횟수",
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
    "시간별 물 마심·식사·배변·발작",
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
        record.waterCount,
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
            const label = { water: "물 마심", meal: "식사", urine: "소변", stool: "대변", seizure: "발작" }[event.type];
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

  const foodRows = state.foodItems.map(item => [
    item.catIds.map(catId => catsById.get(catId)?.name ?? "삭제된 고양이").join(" · "),
    item.category,
    item.brand,
    item.productName,
    item.startDate,
    item.endDate,
    item.openedDate,
    item.expiresDate,
    item.packageSizeGrams,
    item.remainingGrams,
    item.dailyTargetGrams,
    item.caloriesPer100g,
    item.nutrients.proteinMinPercent,
    item.nutrients.fatMinPercent,
    item.nutrients.fiberMaxPercent,
    item.nutrients.ashMaxPercent,
    item.nutrients.moistureMaxPercent,
    item.nutrients.calciumMinPercent,
    item.nutrients.phosphorusMinPercent,
    item.nutrients.omega6Percent,
    item.nutrients.omega3Percent,
    item.nutrients.magnesiumPercent,
    item.nutrients.sodiumPercent,
    item.nutrients.energyKcalPerKg,
    item.ingredients,
    item.vitaminsMinerals,
    item.additives,
    item.labelDocuments.length,
    item.notes,
  ].map(csvCell).join(","));
  const medicationRows = state.medicationAdministrations.map(log => {
    const cat = catsById.get(log.catId);
    const medication = cat?.medications.find(item => item.id === log.medicationId);
    return [log.date, cat?.name ?? "삭제된 고양이", medication?.name ?? "삭제된 약", log.status, log.scheduledTime, log.actualTime, log.dose, log.doseUnit, log.administeredBy, log.sideEffects, log.notes].map(csvCell).join(",");
  });
  const qualityRows = state.qualityOfLifeChecks.map(check => {
    const score = Math.round((check.appetite + check.painComfort + check.hygiene + check.mobility + check.interaction + check.sleep) / 24 * 100);
    return [check.date, catsById.get(check.catId)?.name ?? "삭제된 고양이", score, check.appetite, check.painComfort, check.hygiene, check.mobility, check.interaction, check.sleep, check.notes].map(csvCell).join(",");
  });
  const mediaRows = state.observationMedia.map(record => [record.date, record.time, catsById.get(record.catId)?.name ?? "삭제된 고양이", record.category, record.title, record.document.fileName, record.document.mimeType, record.notes].map(csvCell).join(","));

  const sections = [
    `${headers.map(csvCell).join(",")}\n${rows.join("\n")}`,
    `${["고양이", "종류", "브랜드", "제품명", "급여 시작일", "종료일", "개봉일", "유통기한", "포장용량(g)", "남은양(g)", "하루목표(g)", "kcal/100g", "조단백(%)", "조지방(%)", "조섬유(%)", "조회분(%)", "수분(%)", "칼슘(%)", "인(%)", "오메가6(%)", "오메가3(%)", "마그네슘(%)", "나트륨(%)", "대사에너지(kcal/kg)", "사용 원재료", "비타민·미네랄", "첨가제", "라벨 사진 수", "메모"].map(csvCell).join(",")}\n${foodRows.join("\n")}`,
    `${["날짜", "고양이", "약", "결과", "예정시각", "실제시각", "용량", "단위", "투약자", "이상반응", "메모"].map(csvCell).join(",")}\n${medicationRows.join("\n")}`,
    `${["날짜", "고양이", "총점", "식욕", "편안함", "청결", "이동", "교감", "수면", "메모"].map(csvCell).join(",")}\n${qualityRows.join("\n")}`,
    `${["날짜", "시각", "고양이", "관찰종류", "제목", "파일명", "파일형식", "메모"].map(csvCell).join(",")}\n${mediaRows.join("\n")}`,
  ];
  const csv = `\uFEFF${sections.join("\n\n")}`;
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

export function foodAppliesToCat(item: FoodItem, catId: string): boolean {
  return item.catIds?.length ? item.catIds.includes(catId) : item.catId === catId;
}
