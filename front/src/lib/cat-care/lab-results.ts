import type { LabResultFlag, LabResultItem } from "@/types/cat-care";
import { createId } from "./storage";

interface MarkerDefinition {
  name: string;
  aliases?: string[];
  explanation: string;
}

const MARKERS: Record<string, MarkerDefinition> = {
  BUN: { name: "혈중요소질소", explanation: "단백질 대사 노폐물과 관련된 항목입니다. 크레아티닌, SDMA, 소변 농축도와 수분 상태를 함께 봅니다." },
  CREA: { name: "크레아티닌", aliases: ["CREAT"], explanation: "신장 여과와 관련된 항목입니다. 근육량과 수분 상태의 영향도 있어 한 번의 수치만으로 판단하지 않습니다." },
  SDMA: { name: "SDMA", explanation: "신장 여과 기능을 살펴보는 표지자입니다. 단독 상승만으로 만성 신장질환을 확정하지 않고 반복 검사와 다른 소견을 함께 평가합니다." },
  PHOS: { name: "인", aliases: ["P"], explanation: "체내 인 균형을 보는 항목으로 신장 상태, 식이, 다른 전해질 결과와 함께 해석합니다." },
  ALT: { name: "ALT", explanation: "간세포 손상과 연관될 수 있는 효소입니다. 상승 원인은 다양해 다른 간 수치와 임상 증상을 함께 봅니다." },
  AST: { name: "AST", explanation: "간과 근육 등에 존재하는 효소입니다. ALT, CK와 다른 검사 결과를 함께 해석합니다." },
  ALP: { name: "ALP", aliases: ["ALKP"], explanation: "간·담도계와 관련된 효소입니다. 단독 수치보다 다른 간 수치와 영상검사, 증상을 함께 봅니다." },
  GGT: { name: "GGT", explanation: "담도계 평가에 쓰이는 효소입니다. 빌리루빈과 다른 간 수치의 흐름을 함께 확인합니다." },
  TBIL: { name: "총 빌리루빈", aliases: ["BIL", "BIL-T"], explanation: "적혈구 분해와 간·담도 처리 과정에 관련된 항목입니다." },
  GLU: { name: "혈당", aliases: ["GLUCOSE"], explanation: "혈중 포도당 수치입니다. 고양이는 스트레스로 일시 상승할 수 있어 증상과 재검 결과를 함께 봅니다." },
  UGLU: { name: "요당", aliases: ["GLU-U", "URINE GLUCOSE"], explanation: "소변에서 검출된 포도당입니다. 지속적인 고혈당, 임상 증상, 프럭토사민과 함께 당뇨 여부를 평가합니다." },
  FRUCT: { name: "프럭토사민", aliases: ["FRUCTOSAMINE"], explanation: "최근 약 1~2주간의 평균 혈당 상태를 반영해 고양이의 스트레스성 고혈당과 지속성 고혈당을 구분할 때 활용합니다." },
  KET: { name: "케톤", aliases: ["KETONE", "KETONES", "URINE KETONES"], explanation: "혈액이나 소변의 케톤입니다. 고혈당과 함께 아픈 증상이 있으면 케톤산증 가능성을 신속히 평가해야 합니다." },
  HCT: { name: "헤마토크릿", aliases: ["PCV"], explanation: "혈액에서 적혈구가 차지하는 비율입니다. 빈혈이나 탈수 평가에 활용하며 다른 적혈구 지표와 함께 봅니다." },
  HGB: { name: "혈색소", aliases: ["HB"], explanation: "산소를 운반하는 혈색소 수치로 적혈구 수와 헤마토크릿을 함께 확인합니다." },
  RBC: { name: "적혈구", explanation: "산소 운반을 담당하는 적혈구 수입니다. HCT, HGB, 망상적혈구와 함께 빈혈 여부와 유형을 평가합니다." },
  WBC: { name: "백혈구", explanation: "면역 반응과 관련된 세포 수입니다. 백혈구 감별계수와 도말검사, 증상을 함께 해석합니다." },
  NEU: { name: "호중구", aliases: ["NEUT"], explanation: "백혈구의 한 종류입니다. 염증, 감염, 스트레스 등 여러 상황에서 변할 수 있습니다." },
  LYM: { name: "림프구", aliases: ["LYMPH"], explanation: "면역 반응에 관여하는 백혈구입니다. 전체 백혈구 수와 다른 감별계수를 함께 봅니다." },
  PLT: { name: "혈소판", explanation: "혈액 응고에 관여합니다. 고양이는 검체에서 혈소판 응집이 생겨 자동 측정값이 낮게 나올 수 있어 도말 확인이 중요합니다." },
  TP: { name: "총단백", aliases: ["T-PRO"], explanation: "알부민과 글로불린을 포함한 혈중 단백질의 합입니다. 수분 상태, 간, 신장, 염증 상태와 함께 봅니다." },
  ALB: { name: "알부민", explanation: "간에서 만들어지는 주요 혈중 단백질입니다. 영양, 간 합성, 신장·장 손실 등을 함께 평가합니다." },
  GLOB: { name: "글로불린", explanation: "항체를 포함하는 단백질군입니다. 염증과 면역 상태 등 다양한 요인에 따라 변할 수 있습니다." },
  T4: { name: "총 T4", aliases: ["TT4"], explanation: "갑상선 호르몬 수치입니다. 노묘의 갑상선 기능 평가에 활용하며 증상과 추가 검사를 함께 봅니다." },
  USG: { name: "요비중", aliases: ["SG"], explanation: "소변이 얼마나 농축되었는지를 나타냅니다. 수분 상태와 신장 기능 평가에서 혈액검사와 함께 봅니다." },
  UPC: { name: "요단백/크레아티닌 비", aliases: ["UPCR"], explanation: "소변 단백질 손실 정도를 평가하는 비율입니다. 요침사와 혈압, 반복 결과를 함께 확인합니다." },
  NA: { name: "나트륨", aliases: ["SODIUM"], explanation: "체액과 전해질 균형을 보는 지표입니다. 수분 상태와 다른 전해질을 함께 확인합니다." },
  K: { name: "칼륨", aliases: ["POTASSIUM"], explanation: "신장, 근육, 심장 기능과 관련된 전해질입니다. 낮거나 높은 경우 다른 수치와 증상을 함께 평가합니다." },
  CL: { name: "염소", aliases: ["CHLORIDE"], explanation: "산·염기와 체액 균형을 보는 전해질로 나트륨, 칼륨과 함께 확인합니다." },
  CA: { name: "칼슘", aliases: ["CALCIUM"], explanation: "뼈, 신장, 내분비 상태와 관련된 지표입니다. 필요하면 이온화 칼슘을 추가로 확인합니다." },
  MG: { name: "마그네슘", aliases: ["MAGNESIUM"], explanation: "근육과 신경, 전해질 균형과 관련된 수치입니다." },
  CHOL: { name: "콜레스테롤", aliases: ["CHOLESTEROL"], explanation: "지질 대사와 간·담도, 내분비 상태 등을 함께 평가할 때 활용합니다." },
  TG: { name: "중성지방", aliases: ["TRIGLYCERIDE"], explanation: "혈중 지방 수치로 식이, 대사 및 내분비 상태와 함께 해석합니다." },
  AMYL: { name: "아밀라아제", aliases: ["AMYLASE"], explanation: "소화효소 관련 지표이며 고양이에서는 단독으로 췌장 질환을 확정하지 않습니다." },
  LIPA: { name: "리파아제", aliases: ["LIPASE"], explanation: "췌장과 관련될 수 있는 효소입니다. 증상과 고양이 췌장 특이 검사, 영상검사를 함께 봅니다." },
  CK: { name: "크레아틴키나아제", aliases: ["CPK"], explanation: "근육 손상이나 주사, 보정 과정의 영향을 받을 수 있는 효소입니다." },
  RETIC: { name: "망상적혈구", aliases: ["RETICULOCYTE"], explanation: "빈혈에 대한 골수의 적혈구 생성 반응을 평가할 때 사용합니다." },
  MCV: { name: "평균 적혈구 용적", explanation: "적혈구 크기를 나타내며 빈혈 유형을 평가할 때 다른 적혈구 지표와 함께 봅니다." },
  MCHC: { name: "평균 적혈구 혈색소 농도", explanation: "적혈구 내 혈색소 농도 지표로 HCT, HGB와 함께 해석합니다." },
  FPL: { name: "고양이 췌장 특이 리파아제", aliases: ["FPLI", "SPEC FPL"], explanation: "고양이 췌장염 평가에 활용하며 증상과 초음파 등 다른 검사 결과를 함께 봅니다." },
};

const aliasToCode = new Map<string, string>();
Object.entries(MARKERS).forEach(([code, marker]) => {
  aliasToCode.set(code, code);
  marker.aliases?.forEach(alias => aliasToCode.set(alias, code));
});

function toNumber(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function flagFrom(value: number | null, low: number | null, high: number | null, text: string): LabResultFlag {
  const explicit = text.toUpperCase();
  if (/(^|\s)(H|HIGH|▲)(\s|$)/.test(explicit)) return "high";
  if (/(^|\s)(L|LOW|▼)(\s|$)/.test(explicit)) return "low";
  if (value != null && low != null && value < low) return "low";
  if (value != null && high != null && value > high) return "high";
  if (value != null && (low != null || high != null)) return "normal";
  return "unknown";
}

function extractUnit(text: string): string {
  const match = text.match(/(?:mg\/dL|mmol\/L|µmol\/L|umol\/L|g\/dL|g\/L|U\/L|IU\/L|mEq\/L|10\^?[369]\/µL|K\/µL|M\/µL|fL|pg|ng\/mL|ng\/dL|µg\/dL|ug\/dL|mmHg|%)/i);
  return match?.[0] ?? "";
}

export function labMarkerOptions(): Array<{ code: string; name: string; explanation: string }> {
  return Object.entries(MARKERS).map(([code, marker]) => ({ code, name: marker.name, explanation: marker.explanation }));
}

export function markerDetails(inputCode: string): { code: string; name: string; explanation: string } {
  const normalized = inputCode.trim().toUpperCase();
  const code = aliasToCode.get(normalized) ?? normalized;
  const marker = MARKERS[code];
  return {
    code,
    name: marker?.name ?? (code || "검사 항목"),
    explanation: marker?.explanation ?? "검사표의 기준범위와 주치의 설명을 기준으로 확인해 주세요.",
  };
}

export function parseLabText(rawText: string): LabResultItem[] {
  const found = new Map<string, LabResultItem>();
  const aliases = [...aliasToCode.keys()].sort((a, b) => b.length - a.length);
  const ignoredGenericCodes = new Set(["DATE", "TIME", "PAGE", "AGE", "ID", "TEL", "PHONE"]);

  rawText.split(/\r?\n/).forEach(rawLine => {
    const line = rawLine.replaceAll("|", " ").replace(/\s+/g, " ").trim();
    if (!line) return;
    const upper = line.toUpperCase();
    const alias = aliases.find(candidate => new RegExp(`(^|[^A-Z0-9])${candidate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^A-Z0-9]|$)`).test(upper));
    const generic = alias ? null : line.match(/^([A-Za-z][A-Za-z0-9%.-]{1,12})\s+[<>]?\s*(\d+(?:[.,]\d+)?)/);
    if (!alias && !generic) return;

    const code = alias ? aliasToCode.get(alias)! : generic![1].toUpperCase();
    if (ignoredGenericCodes.has(code)) return;
    if (found.has(code)) return;
    const markerIndex = alias ? upper.indexOf(alias) : 0;
    const markerLength = alias?.length ?? generic![1].length;
    const afterMarker = line.slice(markerIndex + markerLength);
    // 이 화면에서 다루는 기본 혈액·소변 지표는 음수가 아니므로 범위 구분용 '-'를 숫자 부호로 읽지 않습니다.
    const numberMatches = [...afterMarker.matchAll(/\d+(?:[.,]\d+)?/g)].map(match => match[0]);
    const value = toNumber(numberMatches[0]);
    if (value == null) return;
    const referenceLow = toNumber(numberMatches[1]);
    const referenceHigh = toNumber(numberMatches[2]);
    const details = markerDetails(code);
    found.set(code, {
      id: createId("lab-item"),
      ...details,
      value,
      unit: extractUnit(afterMarker),
      referenceLow,
      referenceHigh,
      flag: flagFrom(value, referenceLow, referenceHigh, afterMarker),
    });
  });

  return [...found.values()];
}

export function updateLabFlag(item: LabResultItem): LabResultItem {
  return {
    ...item,
    flag: flagFrom(item.value, item.referenceLow, item.referenceHigh, ""),
  };
}
