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

interface PositionedOcrWord {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

interface OcrBlockLike {
  paragraphs: Array<{ lines: Array<{ words: PositionedOcrWord[] }> }>;
}

/**
 * Tesseract는 표를 열 단위로 읽는 경우가 있어 일반 OCR 원문만으로는
 * "검사항목-참고치-결과-단위" 관계가 사라집니다. 단어 좌표의 Y축을
 * 기준으로 같은 행을 다시 묶어 검사표 파서가 한 줄씩 처리할 수 있게 합니다.
 */
export function reconstructOcrTableRows(blocks: OcrBlockLike[] | null): string {
  const words = (blocks ?? [])
    .flatMap(block => block.paragraphs)
    .flatMap(paragraph => paragraph.lines)
    .flatMap(line => line.words)
    .filter(word => word.text.trim() && Number.isFinite(word.bbox.x0) && Number.isFinite(word.bbox.y0))
    .map(word => ({
      ...word,
      centerY: (word.bbox.y0 + word.bbox.y1) / 2,
      height: Math.max(1, word.bbox.y1 - word.bbox.y0),
    }))
    .sort((a, b) => a.centerY - b.centerY || a.bbox.x0 - b.bbox.x0);

  const rows: Array<{ centerY: number; height: number; words: typeof words }> = [];
  words.forEach(word => {
    let nearest: typeof rows[number] | undefined;
    let nearestDistance = Number.POSITIVE_INFINITY;
    rows.forEach(row => {
      const distance = Math.abs(row.centerY - word.centerY);
      const tolerance = Math.max(5, Math.min(row.height, word.height) * 0.65);
      if (distance <= tolerance && distance < nearestDistance) {
        nearest = row;
        nearestDistance = distance;
      }
    });
    if (!nearest) {
      rows.push({ centerY: word.centerY, height: word.height, words: [word] });
      return;
    }
    const row = nearest as typeof rows[number];
    const count = row.words.length;
    row.centerY = (row.centerY * count + word.centerY) / (count + 1);
    row.height = Math.max(row.height, word.height);
    row.words.push(word);
  });

  return rows
    .sort((a, b) => a.centerY - b.centerY)
    .map(row => row.words.sort((a, b) => a.bbox.x0 - b.bbox.x0).map(word => word.text.trim()).join(" "))
    .filter(Boolean)
    .join("\n");
}

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
      const { createWorker, PSM } = await import("tesseract.js");
      workerRef.current = await createWorker(["eng", "kor"], 1, {
        logger: log => {
          if (typeof log.progress !== "number") return;
          const percent = Math.round(((currentPage + log.progress) / totalPages) * 100);
          onProgress?.({ percent, label: log.status || `페이지 ${currentPage + 1} 분석 중` });
        },
      });
      await workerRef.current.setParameters({
        tessedit_pageseg_mode: PSM.SPARSE_TEXT,
        preserve_interword_spaces: "1",
        user_defined_dpi: "300",
      });
    }
    currentPage = pageIndex;
    const result = await workerRef.current.recognize(blob, {}, { text: true, blocks: true });
    const tableRows = reconstructOcrTableRows(result.data.blocks);
    texts.push([tableRows, result.data.text.trim()].filter(Boolean).join("\n\n--- OCR 기본 배열 ---\n\n"));
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
          const viewport = page.getViewport({ scale: 3, rotation });
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
