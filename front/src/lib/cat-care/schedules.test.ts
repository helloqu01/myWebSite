import { describe, expect, it } from "vitest";
import type { CareSchedule } from "@/types/cat-care";
import { isScheduleDue, schedulesDueOn } from "./schedules";

function schedule(id: string, time: string, repeat: CareSchedule["repeat"] = "daily"): CareSchedule {
  return {
    id,
    catId: "cat-1",
    medicationId: "med-1",
    title: "약",
    type: "medication",
    repeat,
    startDate: "2026-08-01",
    time,
    notes: "",
    completedDates: [],
    enabled: true,
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
  };
}

describe("medication schedules", () => {
  it("keeps multiple daily doses as separate due schedules", () => {
    const schedules = [schedule("morning", "09:00"), schedule("evening", "21:00")];
    expect(schedulesDueOn(schedules, "cat-1", "2026-08-15").map(item => item.id)).toEqual(["morning", "evening"]);
  });

  it("matches weekly and monthly repetition from the start date", () => {
    expect(isScheduleDue(schedule("weekly", "09:00", "weekly"), "2026-08-15")).toBe(true);
    expect(isScheduleDue(schedule("monthly", "09:00", "monthly"), "2026-09-01")).toBe(true);
    expect(isScheduleDue(schedule("monthly", "09:00", "monthly"), "2026-09-02")).toBe(false);
  });
});
