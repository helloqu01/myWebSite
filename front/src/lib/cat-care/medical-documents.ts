import type { MedicalDocumentReference } from "@/types/cat-care";
import { getCloudClient } from "./cloud";

export const MEDICAL_DOCUMENT_BUCKET = "cat-medical-documents";
export const MEDICAL_DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;
export const OBSERVATION_MEDIA_MAX_BYTES = 30 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_MEDICAL_DOCUMENT_TYPES = new Set([...ALLOWED_IMAGE_TYPES, "application/pdf"]);
const ALLOWED_OBSERVATION_TYPES = new Set([...ALLOWED_IMAGE_TYPES, "video/mp4", "video/webm", "video/quicktime"]);

type MedicalDocumentKind = "chart" | "examination" | "observation" | "food-label";

interface UploadMedicalDocumentInput {
  file: File;
  catId: string;
  recordId: string;
  kind: MedicalDocumentKind;
}

interface HouseholdUploadContext {
  id: string;
  role: "owner" | "editor" | "viewer";
}

function safePathSegment(value: string, fallback: string): string {
  const sanitized = value.trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return (sanitized || fallback).slice(0, 100);
}

function uploadError(message: string): Error {
  return new Error(message);
}

async function getUploadContext(): Promise<{
  client: NonNullable<ReturnType<typeof getCloudClient>>;
  household: HouseholdUploadContext;
}> {
  const client = getCloudClient();
  if (!client) throw uploadError("클라우드 연결 설정이 필요합니다.");

  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) throw uploadError("원본 사진을 저장하려면 먼저 로그인해 주세요.");

  const { data, error } = await client.rpc("get_my_cat_care_household");
  if (error) throw uploadError(`가족 공간을 확인하지 못했습니다: ${error.message}`);
  const row = (Array.isArray(data) ? data[0] : data) as Partial<HouseholdUploadContext> | null;
  if (!row?.id) throw uploadError("원본 사진을 저장하려면 먼저 가족 공간을 만들거나 참여해 주세요.");
  if (row.role === "viewer") throw uploadError("보기 전용 구성원은 원본 사진을 업로드하거나 삭제할 수 없습니다.");

  return {
    client,
    household: { id: row.id, role: row.role === "owner" ? "owner" : "editor" },
  };
}

export async function uploadMedicalDocument({
  file,
  catId,
  recordId,
  kind,
}: UploadMedicalDocumentInput): Promise<MedicalDocumentReference> {
  const observation = kind === "observation";
  const allowedTypes = observation ? ALLOWED_OBSERVATION_TYPES : ALLOWED_MEDICAL_DOCUMENT_TYPES;
  const maxBytes = observation ? OBSERVATION_MEDIA_MAX_BYTES : MEDICAL_DOCUMENT_MAX_BYTES;
  if (!allowedTypes.has(file.type)) {
    throw uploadError(observation
      ? "관찰 자료는 JPG, PNG, WebP, MP4, WebM, MOV 형식만 저장할 수 있습니다."
      : "원본 자료는 JPG, PNG, WebP, PDF 형식만 저장할 수 있습니다.");
  }
  if (file.size > maxBytes) {
    throw uploadError(observation ? "관찰 사진·영상은 파일당 30MB 이하여야 합니다." : "원본 자료는 파일당 10MB 이하여야 합니다.");
  }

  const { client, household } = await getUploadContext();
  const fileName = safePathSegment(file.name, `medical-document.${file.type.split("/")[1] || "jpg"}`);
  const unique = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const storagePath = [
    household.id,
    safePathSegment(catId, "cat"),
    kind,
    safePathSegment(recordId, "record"),
    `${unique}-${fileName}`,
  ].join("/");

  const { error } = await client.storage
    .from(MEDICAL_DOCUMENT_BUCKET)
    .upload(storagePath, file, { cacheControl: "3600", contentType: file.type, upsert: false });
  if (error) throw uploadError(`원본 사진을 저장하지 못했습니다: ${error.message}`);

  return {
    storagePath,
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    uploadedAt: new Date().toISOString(),
  };
}

export async function uploadMedicalDocuments({
  files,
  catId,
  recordId,
  kind,
  onProgress,
}: Omit<UploadMedicalDocumentInput, "file"> & {
  files: File[];
  onProgress?: (completed: number, total: number) => void;
}): Promise<MedicalDocumentReference[]> {
  const documents: MedicalDocumentReference[] = [];
  try {
    for (const file of files) {
      documents.push(await uploadMedicalDocument({ file, catId, recordId, kind }));
      onProgress?.(documents.length, files.length);
    }
    return documents;
  } catch (caught) {
    if (documents.length) {
      try {
        await deleteMedicalDocuments(documents.map(document => document.storagePath));
      } catch (rollbackError) {
        console.error("Failed to roll back partially uploaded medical documents", rollbackError);
      }
    }
    throw caught;
  }
}

export function labReportDocuments(report: {
  originalDocuments?: MedicalDocumentReference[];
  originalDocument?: MedicalDocumentReference | null;
}): MedicalDocumentReference[] {
  return [
    ...(Array.isArray(report.originalDocuments) ? report.originalDocuments : []),
    ...(report.originalDocument?.storagePath ? [report.originalDocument] : []),
  ].filter((document, index, documents) => Boolean(document?.storagePath)
    && documents.findIndex(candidate => candidate.storagePath === document.storagePath) === index);
}

export function medicalDocumentDisplayName(fileName: string): string {
  const normalized = fileName.normalize("NFC");
  const extension = normalized.match(/\.[a-z0-9]+$/i)?.[0] ?? "";
  if (/혈액검사/i.test(normalized)) return `혈액검사${extension}`;
  const kind = normalized.match(/\((US|DX)\)/i)?.[1]?.toUpperCase();
  const timestamp = normalized.match(/\((20\d{12})\)/)?.[1];
  const sequence = normalized.match(/(\d{3})(?=\.[a-z0-9]+$)/i)?.[1];
  if (kind) return `${kind}${timestamp ? ` ${timestamp.slice(0, 8)}` : ""}${sequence ? ` #${sequence}` : ""}${extension}`;
  return `검사 원본${extension}`;
}

export async function createMedicalDocumentSignedUrl(storagePath: string): Promise<string> {
  const client = getCloudClient();
  if (!client) throw uploadError("클라우드 연결 설정이 필요합니다.");
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) throw uploadError("원본 사진을 보려면 먼저 로그인해 주세요.");

  const { data, error } = await client.storage
    .from(MEDICAL_DOCUMENT_BUCKET)
    .createSignedUrl(storagePath, 120);
  if (error || !data?.signedUrl) throw uploadError(`원본 사진을 열지 못했습니다: ${error?.message ?? "주소 생성 실패"}`);
  return data.signedUrl;
}

export async function deleteMedicalDocument(storagePath: string): Promise<void> {
  await deleteMedicalDocuments([storagePath]);
}

export async function deleteMedicalDocuments(storagePaths: string[]): Promise<void> {
  const uniquePaths = [...new Set(storagePaths.filter(Boolean))];
  if (!uniquePaths.length) return;
  const { client } = await getUploadContext();
  const { error } = await client.storage.from(MEDICAL_DOCUMENT_BUCKET).remove(uniquePaths);
  if (error) throw uploadError(`원본 사진을 삭제하지 못했습니다: ${error.message}`);
}
