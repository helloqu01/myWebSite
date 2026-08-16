import { describe, expect, it } from "vitest";
import { parseLabText } from "./lab-results";

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
});
