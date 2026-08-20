export interface TesseractProgressLog {
  progress?: number;
  status?: string;
}

export const OCR_INITIALIZATION_TIMEOUT_MS = 45_000;

/**
 * 배포 환경에서 외부 CDN 차단이나 지연 때문에 OCR이 0%에서 멈추지 않도록
 * Tesseract 실행 파일과 언어 데이터를 모두 같은 도메인에서 불러옵니다.
 */
export function getLocalTesseractOptions() {
  return {
    workerPath: "/ocr/worker/worker.min.js",
    corePath: "/ocr/core",
    langPath: "/ocr/lang",
    workerBlobURL: false,
    gzip: true,
  } as const;
}

const statusLabels: Record<string, string> = {
  "loading tesseract core": "OCR 실행 파일 불러오는 중",
  "initializing tesseract": "OCR 엔진 초기화 중",
  "loading language traineddata": "OCR 언어 데이터 불러오는 중",
  "initializing api": "OCR 분석기 준비 중",
  "recognizing text": "글자와 검사 수치 읽는 중",
};

export function tesseractStatusLabel(status: string | undefined, fallback = "OCR 분석 중"): string {
  if (!status) return fallback;
  return statusLabels[status.toLowerCase()] ?? status;
}

export async function withOcrInitializationTimeout<T>(
  workerPromise: Promise<T>,
  timeoutMs = OCR_INITIALIZATION_TIMEOUT_MS,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("OCR 엔진을 불러오는 데 시간이 너무 오래 걸립니다. 인터넷 연결을 확인한 뒤 새로고침하고 다시 시도해 주세요."));
    }, timeoutMs);
  });

  try {
    return await Promise.race([workerPromise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
