import { describe, expect, it } from "vitest";
import type { MedicationAdministration } from "@/types/cat-care";
import { completedLogForSchedule } from "./medications";

function log(scheduleId: string, scheduledTime: string): MedicationAdministration {
  return {
    id: `log-${scheduleId}`,
    catId: "cat-1",
    medicationId: "med-1",
    date: "2026-08-15",
    scheduledTime,
    actualTime: scheduledTime,
    dose: null,
    doseUnit: "정",
    status: "given",
    administeredBy: "",
    sideEffects: "",
    notes: "",
    linkedScheduleId: scheduleId,
    stockDeducted: true,
    scheduleCompletedByLog: true,
    createdAt: "2026-08-15T00:00:00.000Z",
    updatedAt: "2026-08-15T00:00:00.000Z",
  };
}

describe("completedLogForSchedule", () => {
  it("does not let a morning dose complete the evening dose", () => {
    const logs = [log("morning", "09:00")];
    expect(completedLogForSchedule(logs, { catId: "cat-1", medicationId: "med-1", scheduleId: "morning", scheduledTime: "09:00", date: "2026-08-15" })).toBeDefined();
    expect(completedLogForSchedule(logs, { catId: "cat-1", medicationId: "med-1", scheduleId: "evening", scheduledTime: "21:00", date: "2026-08-15" })).toBeUndefined();
  });
});
