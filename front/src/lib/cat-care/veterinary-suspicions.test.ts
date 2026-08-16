import { describe, expect, it } from "vitest";
import type { CatProfile, DailyRecord, LabReport, LabResultFlag, LabResultItem } from "@/types/cat-care";
import { analyzeVeterinaryConcerns } from "./veterinary-suspicions";

const cat = { id: "cat-1", name: "냥냥이" } as CatProfile;

function item(code: string, flag: LabResultFlag, value = 1): LabResultItem {
  return {
    id: `item-${code}`,
    code,
    name: code,
    value,
    unit: "",
    referenceLow: 0,
    referenceHigh: 1,
    flag,
    explanation: "",
  };
}

function report(date: string, items: LabResultItem[]): LabReport {
  return {
    id: `report-${date}-${items.map(value => value.code).join("-")}`,
    catId: cat.id,
    date,
    type: "blood",
    title: "혈액검사",
    hospital: "",
    sourceFileName: "",
    rawText: "",
    originalDocuments: [],
    originalDocument: null,
    items,
    findings: "",
    interpretation: "",
    recommendations: "",
    notes: "",
    createdAt: `${date}T00:00:00.000Z`,
    updatedAt: `${date}T00:00:00.000Z`,
  };
}

function daily(date: string, patch: Partial<DailyRecord>): DailyRecord {
  return {
    id: `daily-${date}`,
    catId: cat.id,
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
    timedEvents: [],
    notes: "",
    updatedAt: `${date}T00:00:00.000Z`,
    ...patch,
  };
}

describe("analyzeVeterinaryConcerns", () => {
  it("keeps isolated hyperglycemia low-confidence because cats can have stress hyperglycemia", () => {
    const analysis = analyzeVeterinaryConcerns(cat, [], [report("2026-08-16", [item("GLU", "high", 220)])]);
    const concern = analysis.concerns.find(value => value.id === "diabetes");

    expect(concern).toMatchObject({ level: "appointment", confidence: "low" });
    expect(concern?.caveat).toContain("단일 혈당");
  });

  it("raises kidney confidence only when abnormalities repeat and combine", () => {
    const analysis = analyzeVeterinaryConcerns(cat, [], [
      report("2026-05-01", [item("CREA", "high", 2.1), item("SDMA", "high", 20)]),
      report("2026-08-16", [item("CREA", "high", 2.3), item("SDMA", "high", 22), item("USG", "low", 1.015)]),
    ]);
    const concern = analysis.concerns.find(value => value.id === "kidney");

    expect(concern).toMatchObject({ level: "prompt", confidence: "high" });
    expect(concern?.caveat).toContain("병기");
  });

  it("marks anemia indicators with breathing difficulty as urgent", () => {
    const analysis = analyzeVeterinaryConcerns(
      cat,
      [daily("2026-08-16", { breathingDifficulty: true, activity: "low" })],
      [report("2026-08-16", [item("HCT", "low", 15), item("HGB", "low", 5)])],
    );

    expect(analysis.concerns.find(value => value.id === "anemia")).toMatchObject({ level: "urgent" });
  });

  it("does not call normal results disease-free or create a concern", () => {
    const analysis = analyzeVeterinaryConcerns(cat, [], [report("2026-08-16", [item("CREA", "normal", 1.2), item("GLU", "normal", 100)])]);
    expect(analysis.concerns).toEqual([]);
  });

  it("analyzes the selected historical date without leaking newer or older values", () => {
    const reports = [
      report("2025-06-07", [item("GLU", "high", 220)]),
      report("2026-08-16", [item("GLU", "normal", 100)]),
    ];

    const historical = analyzeVeterinaryConcerns(cat, [], reports, "2025-06-07");
    const latest = analyzeVeterinaryConcerns(cat, [], reports);

    expect(historical).toMatchObject({ labDate: "2025-06-07", reportCount: 1 });
    expect(historical.concerns.some(value => value.id === "diabetes")).toBe(true);
    expect(latest).toMatchObject({ labDate: "2026-08-16", reportCount: 1, concerns: [] });
  });
});
