import { describe, expect, it } from "vitest";
import {
  getLocalTesseractOptions,
  tesseractStatusLabel,
  withOcrInitializationTimeout,
} from "./tesseract-local";

describe("로컬 Tesseract 설정", () => {
  it("OCR 실행 파일과 언어 데이터를 같은 사이트에서 불러온다", () => {
    expect(getLocalTesseractOptions()).toEqual({
      workerPath: "/ocr/worker/worker.min.js",
      corePath: "/ocr/core",
      langPath: "/ocr/lang",
      workerBlobURL: false,
      gzip: true,
    });
  });

  it("엔진 상태를 사용자용 문구로 표시한다", () => {
    expect(tesseractStatusLabel("initializing tesseract")).toBe("OCR 엔진 초기화 중");
    expect(tesseractStatusLabel("recognizing text")).toBe("글자와 검사 수치 읽는 중");
  });

  it("초기화가 끝나지 않으면 무한 대기하지 않는다", async () => {
    await expect(withOcrInitializationTimeout(new Promise(() => undefined), 1))
      .rejects.toThrow("OCR 엔진을 불러오는 데 시간이 너무 오래 걸립니다");
  });
});
