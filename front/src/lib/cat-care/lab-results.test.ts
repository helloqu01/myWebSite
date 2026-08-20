import { describe, expect, it } from "vitest";
import { parseDatedLabText, parseLabText } from "./lab-results";

describe("parseLabText", () => {
  it("parses Korean hospital tables where the reference range comes before the result", () => {
    const items = parseLabText([
      "ALT 12-130 36 U/L",
      "Glucose 60-131 139 mg/dl",
      "HCT(idexx) 30,3-52,3 53.3 %",
    ].join("\n"));

    expect(items.find(item => item.code === "ALT")).toMatchObject({ value: 36, referenceLow: 12, referenceHigh: 130, flag: "normal" });
    expect(items.find(item => item.code === "GLU")).toMatchObject({ value: 139, referenceLow: 60, referenceHigh: 131, flag: "high" });
    expect(items.find(item => item.code === "HCT")).toMatchObject({ value: 53.3, referenceLow: 30.3, referenceHigh: 52.3, flag: "high" });
  });

  it("keeps result-first tables working", () => {
    const [item] = parseLabText("CREA 2.3 mg/dL 0.8 - 2.4");
    expect(item).toMatchObject({ code: "CREA", value: 2.3, referenceLow: 0.8, referenceHigh: 2.4, flag: "normal" });
  });

  it("repairs common OCR code errors and keeps differential percentages separate", () => {
    const items = parseLabText([
      "HC T(idexx) 30,3-52.3 53.3 %",
      "MCW(idexx) 35.9-53.1 45.1 fL",
      "%MNEU(idexx) 47.6 %",
      "NEU(idexx) 1.48-10.29 6.23 K/uL",
    ].join("\n"));

    expect(items.find(item => item.code === "HCT")).toMatchObject({ value: 53.3, flag: "high" });
    expect(items.find(item => item.code === "MCV")).toMatchObject({ value: 45.1, flag: "normal" });
    expect(items.filter(item => item.code === "NEU")).toHaveLength(1);
    expect(items.find(item => item.code === "NEU")).toMatchObject({ value: 6.23, unit: "K/uL" });
  });

  it("normalizes the marker names and urine rows used by the uploaded hospital reports", () => {
    const items = parseLabText([
      "T.Bilirubin 0.0-0.9 0.2 mg/dl",
      "T.Protein 57-89 8.5 g/dl",
      "Globulin 285.1 5.6 g/dL",
      "Creatinine 0.8-2.4 1.5 mg/dl",
      "Phosphorus 3.1-7.5 5.2 mg/dl",
      "Blood 0-7 100",
      "Protein(L) 0-29 30",
      "Glucose(ARC) 0-50 0 mg/dl",
      "S.G.(U) 1.035-1.065 1.039",
      "WBC(U) 0-0.5 100 HPF",
    ].join("\n"));

    expect(items.find(item => item.code === "TBIL")?.value).toBe(0.2);
    expect(items.find(item => item.code === "TP")).toMatchObject({ value: 8.5, referenceLow: 5.7, referenceHigh: 8.9 });
    expect(items.find(item => item.code === "GLOB")).toMatchObject({ value: 5.6, referenceLow: 2.8, referenceHigh: 5.1, flag: "high" });
    expect(items.find(item => item.code === "CREA")?.value).toBe(1.5);
    expect(items.find(item => item.code === "PHOS")?.value).toBe(5.2);
    expect(items.find(item => item.code === "UBLOOD")?.value).toBe(100);
    expect(items.find(item => item.code === "UPRO")?.value).toBe(30);
    expect(items.find(item => item.code === "UGLU")?.value).toBe(0);
    expect(items.find(item => item.code === "USG")?.value).toBe(1.039);
    expect(items.find(item => item.code === "UWBC")?.value).toBe(100);
  });
});

describe("parseDatedLabText", () => {
  it("splits a multi-visit PDF and ignores its export footer date", () => {
    const groups = parseDatedLabText([
      "검사일 : 2025-06-07",
      "CREA 0.8-2.4 1.2 mg/dl",
      "2026-08-16 오후 04:08 Page: 1",
      "BUN 16-36 30 mg/dl",
      "검사일 : 2026-02-18",
      "CREA 0.8-2.4 1.4 mg/dl",
      "검사일 : 2026-02-19",
      "fPL 0-3.5 6.3 ng/ml",
    ].join("\n"), "2026-08-20").filter(group => group.items.length > 0);

    expect(groups.map(group => group.date)).toEqual(["2025-06-07", "2026-02-18", "2026-02-19"]);
    expect(groups[0].items.find(item => item.code === "BUN")?.value).toBe(30);
    expect(groups[2].items.find(item => item.code === "FPL")?.value).toBe(6.3);
  });
});
