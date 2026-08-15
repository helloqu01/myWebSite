import { describe, expect, it } from "vitest";
import { normalizeCareState } from "./storage";

describe("normalizeCareState", () => {
  it("migrates legacy timed water events into a count without losing events", () => {
    const normalized = normalizeCareState({
      cats: [],
      records: [{
        id: "record-1",
        catId: "cat-1",
        date: "2026-08-15",
        timedEvents: [{ id: "water-1", type: "water", time: "08:10", notes: "" }],
      }] as never,
    });
    expect(normalized.records[0].waterCount).toBe(1);
    expect(normalized.records[0].timedEvents).toHaveLength(1);
  });

  it("keeps separate medication schedule links", () => {
    const normalized = normalizeCareState({
      cats: [],
      records: [],
      medicationAdministrations: [{ linkedScheduleId: "evening", stockDeducted: true }] as never,
    });
    expect(normalized.medicationAdministrations[0].linkedScheduleId).toBe("evening");
  });
});
