import type { MedicationAdministration } from "@/types/cat-care";

export function completedLogForSchedule(
  logs: MedicationAdministration[],
  input: { catId: string; medicationId: string; scheduleId: string; scheduledTime: string; date: string },
): MedicationAdministration | undefined {
  return logs.find(log => log.catId === input.catId
    && log.medicationId === input.medicationId
    && log.date === input.date
    && (log.status === "given" || log.status === "vomited")
    && (log.linkedScheduleId === input.scheduleId
      || (!log.linkedScheduleId && log.scheduledTime === input.scheduledTime)));
}
