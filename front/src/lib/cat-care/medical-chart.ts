export interface MedicalChartDetection {
  date: string;
  hospital: string;
  reason: string;
  summary: string;
  diagnoses: string[];
  weightKg: number | null;
  temperatureC: number | null;
  systolicBloodPressure: number | null;
  diastolicBloodPressure: number | null;
  detectedFields: string[];
}

function boundedNumber(match: RegExpMatchArray | null, min: number, max: number): number | null {
  if (!match?.[1]) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) && value >= min && value <= max ? value : null;
}

function boundedValue(raw: string | undefined, min: number, max: number): number | null {
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= min && value <= max ? value : null;
}

function capturedLine(lines: string[], labels: RegExp): string {
  const line = lines.find(candidate => labels.test(candidate));
  if (!line) return "";
  const value = line.replace(labels, "").replace(/^\s*[:：\-]\s*/, "").trim();
  return value.length <= 300 ? value : value.slice(0, 300);
}

function normalizedDate(text: string): string {
  const match = text.match(/\b(20\d{2})\s*[.\/-]\s*(0?[1-9]|1[0-2])\s*[.\/-]\s*(0?[1-9]|[12]\d|3[01])\b/);
  if (!match) return "";
  return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
}

export function parseMedicalChartText(rawText: string): MedicalChartDetection {
  const text = rawText.replace(/\r/g, "");
  const lines = text.split("\n").map(line => line.replace(/\s+/g, " ").trim()).filter(Boolean);
  const hospitalLine = lines.find(line => /(동물병원|동물의료센터|animal\s+(hospital|clinic)|veterinary\s+(hospital|clinic))/i.test(line)) ?? "";
  const weightKg = boundedNumber(text.match(/(?:체중|weight|\bbw\b)\s*[:：]?\s*(\d{1,2}(?:\.\d{1,2})?)\s*(?:kg)?/i), 0.3, 30);
  const temperatureC = boundedNumber(text.match(/(?:체온|temperature|\btemp\b|\bbt\b)\s*[:：]?\s*(\d{2}(?:\.\d)?)\s*(?:°?c)?/i), 30, 43);
  const bloodPressure = text.match(/(?:혈압|blood\s*pressure|\bbp\b)\s*[:：]?\s*(\d{2,3})\s*[/\\]\s*(\d{2,3})/i);
  const systolic = boundedValue(bloodPressure?.[1], 40, 300);
  const diastolic = boundedValue(bloodPressure?.[2], 20, 220);
  const reason = capturedLine(lines, /^(?:주호소|내원\s*사유|chief\s*complaint|\bcc\b)/i);
  const summary = capturedLine(lines, /^(?:종합\s*소견|소견|판독|assessment|impression|findings?)/i);
  const diagnosisText = capturedLine(lines, /^(?:진단|진단명|diagnosis|\bdx\b)/i);
  const diagnoses = diagnosisText.split(/[,;/]/).map(value => value.trim()).filter(Boolean);
  const date = normalizedDate(text);
  const detectedFields = [
    date && "검진일",
    hospitalLine && "병원명",
    reason && "내원 사유",
    summary && "소견",
    diagnoses.length > 0 && "진단",
    weightKg != null && "체중",
    temperatureC != null && "체온",
    systolic != null && "혈압",
  ].filter((value): value is string => Boolean(value));

  return {
    date,
    hospital: hospitalLine.slice(0, 120),
    reason,
    summary,
    diagnoses,
    weightKg,
    temperatureC,
    systolicBloodPressure: systolic,
    diastolicBloodPressure: diastolic,
    detectedFields,
  };
}
