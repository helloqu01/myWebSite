import type { CareState, DailyRecord } from "@/types/cat-care";
import { isScheduleCompleted, isScheduleDue } from "./schedules";
import { toLocalDateKey } from "./storage";

export type CareReminderAction = "daily_record" | "schedule" | "weekly_check" | "medication_stock" | "food_history";

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
      action: "schedule",
      actionLabel: "일정 확인",
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
        title: `${cat.name} 주간 체크 필요`,
        detail: latest ? `마지막 체크는 ${latest.date}입니다.` : "아직 주간 상태 체크가 없습니다.",
        severity: "info",
        action: "weekly_check",
        actionLabel: "주간 체크",
        notifyNow: true,
        catId: cat.id,
        targetDate: today,
      });
    }
  });

  care.cats.forEach(cat => {
    const hasCurrentFood = care.foodItems.some(item => item.catId === cat.id
      && item.category !== "treat"
      && item.startDate <= today
      && (!item.endDate || item.endDate >= today));
    if (hasCurrentFood) return;
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
  });

  return reminders;
}
