import type { CareState, DailyRecord } from "@/types/cat-care";
import { isScheduleCompleted, isScheduleDue } from "./schedules";
import { toLocalDateKey } from "./storage";

export type CareReminderAction = "daily_record" | "schedule" | "weekly_check" | "medication_stock" | "food_history" | "medication_log" | "quality_of_life";

export interface CareReminder {
  id: string;
  title: string;
  detail: string;
  severity: "info" | "warning" | "error";
  action: CareReminderAction;
  actionLabel: string;
  notifyNow: boolean;
  catId?: string;
  targetDate?: string;
}

function datePlus(date: Date, days: number): string {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return toLocalDateKey(next);
}

function missingDailyItems(record: DailyRecord | undefined): string[] {
  if (!record) return ["음수량", "식사 시간", "소변 횟수·시간", "대변 횟수·시간"];

  const missing: string[] = [];
  if (record.waterMl == null) missing.push("음수량");
  if (record.appetite !== "none" && !record.timedEvents.some(event => event.type === "meal")) missing.push("식사 시간");
  if (record.urineCount == null || (record.urineCount > 0 && !record.timedEvents.some(event => event.type === "urine"))) missing.push("소변 횟수·시간");
  if (record.stoolCount == null || (record.stoolCount > 0 && !record.timedEvents.some(event => event.type === "stool"))) missing.push("대변 횟수·시간");
  return missing;
}

function qualityScore(check: CareState["qualityOfLifeChecks"][number]): number {
  return Math.round((check.appetite + check.painComfort + check.hygiene + check.mobility + check.interaction + check.sleep) / 24 * 100);
}

export function buildCareReminders(care: CareState, now = new Date()): CareReminder[] {
  const today = toLocalDateKey(now);
  const reminders: CareReminder[] = [];

  if (care.notificationSettings.scheduleAlerts) care.schedules.forEach(schedule => {
    const cat = care.cats.find(item => item.id === schedule.catId);
    if (!cat || !isScheduleDue(schedule, today) || isScheduleCompleted(schedule, today)) return;
    let notifyNow = true;
    if (schedule.time) {
      const [hours, minutes] = schedule.time.split(":").map(Number);
      const dueMinutes = hours * 60 + minutes;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      notifyNow = currentMinutes >= dueMinutes - care.notificationSettings.reminderLeadMinutes;
    }
    reminders.push({
      id: `schedule-${schedule.id}-${today}`,
      title: `${cat.name} · ${schedule.title}`,
      detail: `${schedule.time || "시간 미지정"} 일정이 아직 완료되지 않았습니다.`,
      severity: schedule.type === "medication" ? "warning" : "info",
      action: schedule.type === "medication" ? "medication_log" : "schedule",
      actionLabel: schedule.type === "medication" ? "투약 기록" : "일정 확인",
      notifyNow,
      catId: cat.id,
      targetDate: today,
    });
  });

  if (care.notificationSettings.missingRecordAlerts) care.cats.forEach(cat => {
    const record = care.records.find(item => item.catId === cat.id && item.date === today);
    const missing = missingDailyItems(record);
    if (!missing.length) return;
    const overdue = now.getHours() >= care.notificationSettings.missingRecordHour;
    reminders.push({
      id: `missing-${cat.id}-${today}-${missing.join("-")}`,
      title: `${cat.name} 오늘 기록할 내용 ${missing.length}개`,
      detail: missing.join(" · "),
      severity: overdue ? "warning" : "info",
      action: "daily_record",
      actionLabel: "기록 추가",
      notifyNow: overdue,
      catId: cat.id,
      targetDate: today,
    });
  });

  if (care.notificationSettings.refillAlerts) {
    care.cats.forEach(cat => cat.medications.forEach(medication => {
      if (medication.stockCount == null || medication.refillThreshold == null || medication.stockCount > medication.refillThreshold) return;
      reminders.push({
        id: `refill-${cat.id}-${medication.id}-${medication.stockCount}`,
        title: `${cat.name} · ${medication.name} 재고 부족`,
        detail: `남은 재고 ${medication.stockCount}${medication.stockUnit}. 처방·구매 일정을 확인해 주세요.`,
        severity: medication.stockCount <= 0 ? "error" : "warning",
        action: "medication_stock",
        actionLabel: "재고 입력",
        notifyNow: true,
        catId: cat.id,
      });
    }));
  }

  care.cats.filter(cat => cat.isSenior).forEach(cat => {
    const latest = care.weeklyChecks.filter(check => check.catId === cat.id).sort((a, b) => b.date.localeCompare(a.date))[0];
    if (!latest || latest.date < datePlus(now, -7)) {
      reminders.push({
        id: `weekly-${cat.id}-${today}`,
        title: `${cat.name} 주간 체크·체중 측정 필요`,
        detail: latest ? `마지막 주간 체크는 ${latest.date}입니다.` : "아직 주간 상태·체중 기록이 없습니다.",
        severity: "info",
        action: "weekly_check",
        actionLabel: "체중·상태 기록",
        notifyNow: true,
        catId: cat.id,
        targetDate: today,
      });
    }

    const qualityChecks = care.qualityOfLifeChecks.filter(check => check.catId === cat.id).sort((a, b) => b.date.localeCompare(a.date));
    const latestQuality = qualityChecks[0];
    if (!latestQuality || latestQuality.date < datePlus(now, -7)) {
      reminders.push({
        id: `quality-due-${cat.id}-${today}`,
        title: `${cat.name} 삶의 질 평가 필요`,
        detail: latestQuality ? `마지막 평가는 ${latestQuality.date}입니다.` : "아직 삶의 질 평가 기록이 없습니다.",
        severity: "info",
        action: "quality_of_life",
        actionLabel: "오늘 평가",
        notifyNow: true,
        catId: cat.id,
        targetDate: today,
      });
    }
    if (latestQuality) {
      const latestScore = qualityScore(latestQuality);
      const previousScore = qualityChecks[1] ? qualityScore(qualityChecks[1]) : null;
      if (latestScore < 50 || (previousScore != null && latestScore <= previousScore - 20)) {
        reminders.push({
          id: `quality-change-${cat.id}-${latestQuality.id}-${latestScore}`,
          title: `${cat.name} 삶의 질 점수 변화`,
          detail: `최근 점수 ${latestScore}점${previousScore != null ? ` · 이전 ${previousScore}점` : ""}. 변화 항목을 확인해 주세요.`,
          severity: latestScore < 35 ? "error" : "warning",
          action: "quality_of_life",
          actionLabel: "평가 확인",
          notifyNow: true,
          catId: cat.id,
        });
      }
    }
  });

  care.cats.forEach(cat => {
    const currentFoods = care.foodItems.filter(item => item.catId === cat.id
      && item.category !== "treat"
      && item.startDate <= today
      && (!item.endDate || item.endDate >= today));
    if (!currentFoods.length) {
      reminders.push({
        id: `food-${cat.id}-${today}`,
        title: `${cat.name} 현재 사료 정보 미등록`,
        detail: "먹이고 있는 사료의 브랜드·제품과 급여 시작일을 기록해 주세요.",
        severity: "info",
        action: "food_history",
        actionLabel: "사료 추가",
        notifyNow: true,
        catId: cat.id,
      });
      return;
    }
    currentFoods.forEach(food => {
      const lowThreshold = Math.max((food.dailyTargetGrams ?? 0) * 3, (food.packageSizeGrams ?? 0) * 0.1);
      if (food.remainingGrams != null && lowThreshold > 0 && food.remainingGrams <= lowThreshold) {
        reminders.push({
          id: `food-stock-${food.id}-${Math.round(food.remainingGrams)}`,
          title: `${cat.name} · ${food.brand} 재고 부족`,
          detail: `남은 양 약 ${Math.round(food.remainingGrams)}g. 새 사료 준비가 필요합니다.`,
          severity: food.remainingGrams <= 0 ? "error" : "warning",
          action: "food_history",
          actionLabel: "재고 확인",
          notifyNow: true,
          catId: cat.id,
        });
      }
      const expiryLimit = datePlus(new Date(`${today}T00:00:00`), 7);
      if (food.expiresDate && food.expiresDate >= today && food.expiresDate <= expiryLimit) {
        reminders.push({
          id: `food-expiry-${food.id}-${food.expiresDate}`,
          title: `${cat.name} · ${food.brand} 유통기한 임박`,
          detail: `${food.expiresDate}까지입니다. 포장 상태와 제품 안내를 확인해 주세요.`,
          severity: "warning",
          action: "food_history",
          actionLabel: "사료 확인",
          notifyNow: true,
          catId: cat.id,
        });
      }
    });
  });

  care.medicationAdministrations.filter(log => log.date === today && (log.status === "vomited" || Boolean(log.sideEffects))).forEach(log => {
    const cat = care.cats.find(item => item.id === log.catId);
    const medication = cat?.medications.find(item => item.id === log.medicationId);
    if (!cat) return;
    reminders.push({
      id: `medication-reaction-${log.id}-${log.updatedAt}`,
      title: `${cat.name} 투약 후 확인 필요`,
      detail: `${medication?.name ?? "약"} · ${log.status === "vomited" ? "복용 후 구토" : log.sideEffects}`,
      severity: "warning",
      action: "medication_log",
      actionLabel: "투약 기록 확인",
      notifyNow: true,
      catId: cat.id,
      targetDate: log.date,
    });
  });

  return reminders;
}
