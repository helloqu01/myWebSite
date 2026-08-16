import { prepareImageForOcr, type OcrRotation } from "./ocr-image";

export interface MedicalOcrProgress {
  percent: number;
  label: string;
}

export interface MedicalOcrResult {
  text: string;
  confidence: number | null;
  pageCount: number;
  truncated: boolean;
}

type ProgressHandler = (progress: MedicalOcrProgress) => void;

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("PDF 페이지 이미지를 만들지 못했습니다.")), "image/png");
  });
}

function embeddedText(items: Array<unknown>): string {
  return items.map(item => {
    if (!item || typeof item !== "object" || !("str" in item)) return "";
    const textItem = item as { str: string; hasEOL?: boolean };
    return `${textItem.str}${textItem.hasEOL ? "\n" : " "}`;
  }).join("").replace(/[ \t]+\n/g, "\n").trim();
}

export async function recognizeMedicalDocument(
  file: File,
  rotation: OcrRotation = 0,
  onProgress?: ProgressHandler,
  maxPdfPages = 10,
): Promise<MedicalOcrResult> {
  type TesseractWorker = Awaited<ReturnType<typeof import("tesseract.js")["createWorker"]>>;
  const workerRef: { current: TesseractWorker | null } = { current: null };
  let currentPage = 0;
  let totalPages = 1;
  const confidences: number[] = [];
  const texts: string[] = [];

  const recognizeBlob = async (blob: Blob, pageIndex: number): Promise<void> => {
    if (!workerRef.current) {
      const { createWorker } = await import("tesseract.js");
      workerRef.current = await createWorker(["eng", "kor"], 1, {
        logger: log => {
          if (typeof log.progress !== "number") return;
          const percent = Math.round(((currentPage + log.progress) / totalPages) * 100);
          onProgress?.({ percent, label: log.status || `페이지 ${currentPage + 1} 분석 중` });
        },
      });
    }
    currentPage = pageIndex;
    const result = await workerRef.current.recognize(blob);
    texts.push(result.data.text.trim());
    confidences.push(result.data.confidence);
  };

  try {
    if (file.type !== "application/pdf") {
      onProgress?.({ percent: 0, label: "사진 회전·선명화 중" });
      const prepared = await prepareImageForOcr(file, rotation);
      await recognizeBlob(prepared, 0);
      return {
        text: texts.filter(Boolean).join("\n\n"),
        confidence: confidences.length ? Math.round(confidences.reduce((sum, value) => sum + value, 0) / confidences.length) : null,
        pageCount: 1,
        truncated: false,
      };
    }

    onProgress?.({ percent: 0, label: "PDF 여는 중" });
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
    }
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
    const pdf = await loadingTask.promise;
    totalPages = Math.min(pdf.numPages, maxPdfPages);
    try {
      for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
        currentPage = pageIndex;
        onProgress?.({ percent: Math.round((pageIndex / totalPages) * 100), label: `PDF ${pageIndex + 1}/${totalPages}쪽 확인 중` });
        const page = await pdf.getPage(pageIndex + 1);
        const textContent = await page.getTextContent();
        const text = embeddedText(textContent.items);
        if (text.replace(/\s/g, "").length >= 40) {
          texts.push(text);
        } else {
          const viewport = page.getViewport({ scale: 2, rotation });
          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          await page.render({ canvas, viewport }).promise;
          await recognizeBlob(await canvasBlob(canvas), pageIndex);
          canvas.width = 1;
          canvas.height = 1;
        }
        page.cleanup();
      }
    } finally {
      await pdf.destroy();
    }
    onProgress?.({ percent: 100, label: "PDF 분석 완료" });
    return {
      text: texts.filter(Boolean).join("\n\n--- 다음 페이지 ---\n\n"),
      confidence: confidences.length ? Math.round(confidences.reduce((sum, value) => sum + value, 0) / confidences.length) : null,
      pageCount: pdf.numPages,
      truncated: pdf.numPages > maxPdfPages,
    };
  } finally {
    await workerRef.current?.terminate();
  }
}
