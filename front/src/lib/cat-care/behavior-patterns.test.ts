import { describe, expect, it } from "vitest";
import type { DailyRecord, TimedCareEvent, TimedCareEventType } from "@/types/cat-care";
import { analyzeCatBehavior } from "./behavior-patterns";

function event(type: TimedCareEventType, time: string, durationMinutes: number | null = null): TimedCareEvent {
  return {
    id: `${type}-${time}`,
    type,
    time,
    amountMl: null,
    amountGrams: null,
    durationSeconds: null,
    durationMinutes,
    severity: null,
    foodItemId: null,
    notes: "",
  };
}

function record(date: string, timedEvents: TimedCareEvent[]): DailyRecord {
  return {
    id: `record-${date}`,
    catId: "cat-1",
    date,
    waterCount: null,
    urineCount: null,
    urineSize: null,
    stoolCount: null,
    stoolAmount: null,
    stoolScore: null,
    appetite: "normal",
    weightKg: null,
    vomitCount: 0,
    activity: "normal",
    restingRespiratoryRate: null,
    measurementConfidence: "high",
    medicationChecks: {},
    urinationStraining: false,
    urineNotProduced: false,
    bloodInUrine: false,
    breathingDifficulty: false,
    collapseOrSeizure: false,
    timedEvents,
    notes: "",
    updatedAt: `${date}T00:00:00.000Z`,
  };
}

describe("analyzeCatBehavior", () => {
  it("finds the dominant time period and most frequent routine", () => {
    const records = [1, 2, 3, 4, 5].map(day => record(
      `2026-08-${String(day + 10).padStart(2, "0")}`,
      [event("play", "20:00", 15), event("meal", "20:30")],
    ));

    const result = analyzeCatBehavior(records, "cat-1", "2026-08-15");

    expect(result.status).toBe("steady");
    expect(result.dominantPeriod).toBe("evening");
    expect(result.topBehavior).toBe("play");
    expect(result.behaviorCounts.play).toBe(5);
    expect(result.routineSummaries[0]).toContain("총 75분");
  });

  it("flags increased hiding and reduced play against the earlier baseline", () => {
    const baseline = [8, 9, 10, 11].map(day => record(
      `2026-08-${String(day).padStart(2, "0")}`,
      [event("play", "19:00"), event("play", "21:00")],
    ));
    const recent = [12, 13, 14].map(day => record(
      `2026-08-${day}`,
      [event("hiding", "22:00")],
    ));

    const result = analyzeCatBehavior([...baseline, ...recent], "cat-1", "2026-08-14");

    expect(result.status).toBe("changed");
    expect(result.changes).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "hiding", direction: "up", attention: true }),
      expect.objectContaining({ type: "play", direction: "down", attention: true }),
    ]));
  });

  it("stays in learning mode until enough routine records exist", () => {
    const result = analyzeCatBehavior(
      [record("2026-08-15", [event("grooming", "10:00")])],
      "cat-1",
      "2026-08-15",
    );

    expect(result.status).toBe("learning");
    expect(result.coverageDays).toBe(1);
  });
});
