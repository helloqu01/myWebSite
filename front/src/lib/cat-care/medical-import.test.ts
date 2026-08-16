import { describe, expect, it } from "vitest";
import { detectMedicalFileDate, detectMedicalFileType, planMedicalImport, type MedicalImportFileLike } from "./medical-import";

function file(name: string, path: string, type = "image/jpeg", size = 100): MedicalImportFileLike {
  return { name, webkitRelativePath: path, type, size, lastModified: 1 };
}

describe("medical import classification", () => {
  it("detects dates and examination types from hospital filenames", () => {
    const path = "냥냥이/202400956-보호자(냥냥이)(US)(20250607133423)001.jpg";
    expect(detectMedicalFileDate(path)).toBe("2025-06-07");
    expect(detectMedicalFileType(path)).toBe("ultrasound");
    expect(detectMedicalFileType("예쁜이/24년8월31일/검사(DX)001.jpg")).toBe("xray");
  });

  it("inherits the single known visit date for undated images in the same folder", () => {
    const plan = planMedicalImport([
      file("US000.jpg", "냥냥이/검사(US)(20250607133420)000.jpg"),
      file("US009.jpg", "냥냥이/검사(US)009.jpg"),
      file("혈액검사.jpg", "냥냥이/혈액검사.jpg"),
    ], "2026-08-16");

    expect(plan.groups).toHaveLength(2);
    expect(plan.groups.every(group => group.date === "2025-06-07")).toBe(true);
    expect(plan.groups.find(group => group.type === "ultrasound")?.files).toHaveLength(2);
  });

  it("marks root PDFs without a reliable date for review and skips duplicates", () => {
    const plan = planMedicalImport([
      file("혈액검사.pdf", "예쁜이/혈액검사.pdf", "application/pdf", 500),
      file("검사.jpg", "예쁜이/24년3월31일/검사.jpg"),
    ], "2026-08-16", [{ storagePath: "old", fileName: "검사.jpg", mimeType: "image/jpeg", sizeBytes: 100, uploadedAt: "" }]);

    expect(plan.duplicates).toHaveLength(1);
    expect(plan.groups[0]).toMatchObject({ date: "2026-08-16", type: "blood", needsDateReview: true });
  });
});
