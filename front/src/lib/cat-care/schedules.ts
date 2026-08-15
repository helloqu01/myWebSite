import type { CareSchedule } from "@/types/cat-care";

function localDate(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00`);
}

export function isScheduleDue(schedule: CareSchedule, dateKey: string): boolean {
  if (!schedule.enabled || !schedule.startDate || dateKey < schedule.startDate) return false;
  if (schedule.repeat === "none") return dateKey === schedule.startDate;
  if (schedule.repeat === "daily") return true;

  const start = localDate(schedule.startDate);
  const target = localDate(dateKey);
  if (schedule.repeat === "weekly") return start.getDay() === target.getDay();
  return start.getDate() === target.getDate();
}

export function isScheduleCompleted(schedule: CareSchedule, dateKey: string): boolean {
  return schedule.completedDates.includes(dateKey);
}

export function schedulesDueOn(
  schedules: CareSchedule[],
  catId: string,
  dateKey: string,
): CareSchedule[] {
  return schedules
    .filter(schedule => schedule.catId === catId && isScheduleDue(schedule, dateKey))
    .sort((a, b) => a.time.localeCompare(b.time) || a.title.localeCompare(b.title, "ko"));
}

export const scheduleTypeLabel = {
  medication: "투약",
  weight: "체중 측정",
  vet: "병원 일정",
  care: "기타 케어",
} as const;

export const scheduleRepeatLabel = {
  none: "반복 안 함",
  daily: "매일 반복",
  weekly: "매주 반복",
  monthly: "매달 반복",
} as const;
