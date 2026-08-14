import type { CareState } from "@/types/cat-care";
import { isScheduleCompleted, isScheduleDue } from "./schedules";
import { toLocalDateKey } from "./storage";

export interface CareReminder {
  id: string;
  title: string;
  detail: string;
  severity: "info" | "warning" | "error";
  catId?: string;
}

function datePlus(date: Date, days: number): string {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return toLocalDateKey(next);
}

export function buildCareReminders(care: CareState, now = new Date()): CareReminder[] {
  const today = toLocalDateKey(now);
  const reminders: CareReminder[] = [];

  if (care.notificationSettings.scheduleAlerts) care.schedules.forEach(schedule => {
    const cat = care.cats.find(item => item.id === schedule.catId);
    if (!cat || !isScheduleDue(schedule, today) || isScheduleCompleted(schedule, today)) return;
    if (schedule.time) {
      const [hours, minutes] = schedule.time.split(":").map(Number);
      const dueMinutes = hours * 60 + minutes;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      if (currentMinutes < dueMinutes - care.notificationSettings.reminderLeadMinutes) return;
    }
    reminders.push({
      id: `schedule-${schedule.id}-${today}`,
      title: `${cat.name} · ${schedule.title}`,
      detail: `${schedule.time || "시간 미지정"} 예정 케어가 아직 완료되지 않았습니다.`,
      severity: schedule.type === "medication" ? "warning" : "info",
      catId: cat.id,
    });
  });

  if (care.notificationSettings.missingRecordAlerts && now.getHours() >= care.notificationSettings.missingRecordHour) {
    care.cats.forEach(cat => {
      if (care.records.some(record => record.catId === cat.id && record.date === today)) return;
      reminders.push({ id: `missing-${cat.id}-${today}`, title: `${cat.name} 오늘 미기록`, detail: "음수량·배변·식욕 중 확인 가능한 항목을 기록해 주세요.", severity: "warning", catId: cat.id });
    });
  }

  if (care.notificationSettings.refillAlerts) {
    care.cats.forEach(cat => cat.medications.forEach(medication => {
      if (medication.stockCount == null || medication.refillThreshold == null || medication.stockCount > medication.refillThreshold) return;
      reminders.push({ id: `refill-${cat.id}-${medication.id}-${medication.stockCount}`, title: `${cat.name} · ${medication.name} 재고 부족`, detail: `남은 재고 ${medication.stockCount}${medication.stockUnit}. 처방·구매 일정을 확인해 주세요.`, severity: medication.stockCount <= 0 ? "error" : "warning", catId: cat.id });
    }));
  }

  care.cats.filter(cat => cat.isSenior).forEach(cat => {
    const latest = care.weeklyChecks.filter(check => check.catId === cat.id).sort((a, b) => b.date.localeCompare(a.date))[0];
    if (!latest || latest.date < datePlus(now, -7)) {
      reminders.push({ id: `weekly-${cat.id}-${today}`, title: `${cat.name} 주간 체크 필요`, detail: latest ? `마지막 체크는 ${latest.date}입니다.` : "아직 주간 상태 체크가 없습니다.", severity: "info", catId: cat.id });
    }
  });

  if (care.notificationSettings.scheduleAlerts) care.schedules.filter(schedule => schedule.type === "vet" && schedule.enabled).forEach(schedule => {
    const cat = care.cats.find(item => item.id === schedule.catId);
    if (!cat) return;
    for (let offset = 1; offset <= 7; offset += 1) {
      const target = datePlus(now, offset);
      if (!isScheduleDue(schedule, target)) continue;
      reminders.push({ id: `upcoming-${schedule.id}-${target}`, title: `${cat.name} 병원 일정`, detail: `${target} ${schedule.time || ""} · ${schedule.title}`, severity: "info", catId: cat.id });
      break;
    }
  });

  return reminders;
}
