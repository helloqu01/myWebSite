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

  it("keeps daily routine events and their duration", () => {
    const normalized = normalizeCareState({
      cats: [],
      records: [{
        id: "record-2",
        catId: "cat-1",
        date: "2026-08-16",
        timedEvents: [{ id: "play-1", type: "play", time: "20:10", durationMinutes: 15, notes: "장난감 놀이" }],
      }] as never,
    });

    expect(normalized.records[0].timedEvents[0]).toMatchObject({ type: "play", durationMinutes: 15 });
  });
});
