import { describe, expect, it } from "vitest";
import { getMedicalOcrProfile, reconstructOcrTableRows } from "./medical-ocr";

describe("getMedicalOcrProfile", () => {
  it("uses a lighter English-only profile for lab values", () => {
    const full = getMedicalOcrProfile("document");
    const fast = getMedicalOcrProfile("lab-fast");

    expect(fast.languages).toEqual(["eng"]);
    expect(fast.pdfScale).toBeLessThan(full.pdfScale);
    expect(fast.allowImageDownscale).toBe(true);
  });
});

describe("reconstructOcrTableRows", () => {
  it("reassembles words from separately detected table columns into rows", () => {
    const blocks = [
      { paragraphs: [{ lines: [{ words: [
        { text: "ALT", bbox: { x0: 20, y0: 100, x1: 50, y1: 116 } },
        { text: "Glucose", bbox: { x0: 20, y0: 130, x1: 80, y1: 146 } },
      ] }] }] },
      { paragraphs: [{ lines: [{ words: [
        { text: "12-130", bbox: { x0: 150, y0: 101, x1: 205, y1: 117 } },
        { text: "36", bbox: { x0: 245, y0: 99, x1: 265, y1: 115 } },
        { text: "U/L", bbox: { x0: 285, y0: 100, x1: 310, y1: 116 } },
        { text: "60-131", bbox: { x0: 150, y0: 131, x1: 205, y1: 147 } },
        { text: "139", bbox: { x0: 245, y0: 129, x1: 275, y1: 145 } },
        { text: "mg/dl", bbox: { x0: 285, y0: 130, x1: 330, y1: 146 } },
      ] }] }] },
    ];

    expect(reconstructOcrTableRows(blocks)).toBe("ALT 12-130 36 U/L\nGlucose 60-131 139 mg/dl");
  });
});
