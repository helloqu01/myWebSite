import type { CatProfile, DailyRecord, LabReport, LabResultFlag, LabResultItem, MeasurementConfidence } from "@/types/cat-care";

export type VeterinaryConcernLevel = "monitor" | "appointment" | "prompt" | "urgent";

export interface VeterinaryConcern {
  id: string;
  category: "kidney" | "diabetes" | "thyroid" | "anemia" | "hepatobiliary" | "pancreas" | "inflammation" | "electrolytes" | "platelets";
  title: string;
  level: VeterinaryConcernLevel;
  confidence: MeasurementConfidence;
  summary: string;
  evidence: string[];
  matchedSigns: string[];
  possibleSigns: string[];
  nextChecks: string[];
  caveat: string;
  sourceLabel: string;
  sourceUrl: string;
}

export interface VeterinaryAnalysis {
  labDate: string | null;
  reportCount: number;
  concerns: VeterinaryConcern[];
}

interface LocatedItem {
  item: LabResultItem;
  report: LabReport;
}

const levelRank: Record<VeterinaryConcernLevel, number> = {
  monitor: 0,
  appointment: 1,
  prompt: 2,
  urgent: 3,
};

const confidenceRank: Record<MeasurementConfidence, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

function dateOffset(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function markerText(located: LocatedItem): string {
  const { item, report } = located;
  const flag = { high: "높음", low: "낮음", normal: "기준 내", unknown: "판정 없음" }[item.flag];
  return `${report.date} ${item.code} ${item.value ?? "—"}${item.unit ? ` ${item.unit}` : ""} (${flag})`;
}

function latestItems(reports: LabReport[]): Map<string, LocatedItem> {
  const found = new Map<string, LocatedItem>();
  [...reports]
    .sort((a, b) => a.date.localeCompare(b.date) || a.updatedAt.localeCompare(b.updatedAt))
    .forEach(report => report.items.forEach(item => found.set(item.code.toUpperCase(), { item, report })));
  return found;
}

function abnormal(located: Map<string, LocatedItem>, code: string, flag: Exclude<LabResultFlag, "normal" | "unknown">): LocatedItem | null {
  const value = located.get(code);
  return value?.item.flag === flag ? value : null;
}

function abnormalMany(located: Map<string, LocatedItem>, codes: string[], flag: "high" | "low"): LocatedItem[] {
  return codes.map(code => abnormal(located, code, flag)).filter((value): value is LocatedItem => value != null);
}

function hasRepeatedFlag(reports: LabReport[], codes: string[], flag: "high" | "low"): boolean {
  const dates = new Set(reports.filter(report => report.items.some(item => codes.includes(item.code.toUpperCase()) && item.flag === flag)).map(report => report.date));
  return dates.size >= 2;
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function dailyContext(records: DailyRecord[], labDate: string): {
  matched: Set<string>;
  urgent: boolean;
} {
  const start = dateOffset(labDate, -7);
  const end = dateOffset(labDate, 7);
  const windowRecords = records.filter(record => record.date >= start && record.date <= end);
  const earlier = records.filter(record => record.date < start).slice(-14);
  const matched = new Set<string>();

  if (windowRecords.some(record => record.appetite === "low" || record.appetite === "none")) matched.add("식욕 저하");
  if (windowRecords.some(record => record.vomitCount > 0)) matched.add("구토");
  if (windowRecords.filter(record => record.activity === "low").length >= 2) matched.add("활동성 감소·무기력");
  if (windowRecords.some(record => record.breathingDifficulty || (record.restingRespiratoryRate != null && record.restingRespiratoryRate > 35))) matched.add("호흡 이상");
  if (windowRecords.some(record => record.collapseOrSeizure)) matched.add("쓰러짐·경련");
  if (windowRecords.some(record => record.timedEvents.some(event => event.type === "vocalization"))) matched.add("울음 증가");
  if (windowRecords.some(record => record.timedEvents.some(event => event.type === "hiding"))) matched.add("숨기 증가");

  const recentWeights = windowRecords.map(record => record.weightKg).filter((value): value is number => value != null);
  const baselineWeight = median(earlier.map(record => record.weightKg).filter((value): value is number => value != null));
  if (recentWeights.length && baselineWeight && recentWeights.at(-1)! <= baselineWeight * 0.95) matched.add("체중 감소");

  const compareCount = (selector: (record: DailyRecord) => number | null, label: string) => {
    const recent = median(windowRecords.map(selector).filter((value): value is number => value != null));
    const baseline = median(earlier.map(selector).filter((value): value is number => value != null));
    if (recent != null && baseline != null && baseline > 0 && recent >= baseline * 1.5) matched.add(label);
  };
  compareCount(record => record.waterCount, "물 마시는 횟수 증가");
  compareCount(record => record.urineCount, "소변 횟수 증가");

  return {
    matched,
    urgent: matched.has("쓰러짐·경련") || windowRecords.some(record => record.breathingDifficulty),
  };
}

function signs(context: Set<string>, relevant: string[]): string[] {
  return relevant.filter(sign => context.has(sign));
}

function confidenceFrom(score: number): MeasurementConfidence {
  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}

export function analyzeVeterinaryConcerns(
  cat: CatProfile,
  allRecords: DailyRecord[],
  allReports: LabReport[],
  requestedDate?: string,
): VeterinaryAnalysis {
  const reports = allReports.filter(report =>
    report.catId === cat.id
    && (report.items.length > 0 || report.findings.trim().length > 0 || report.interpretation.trim().length > 0),
  );
  const requestedDateExists = requestedDate && reports.some(report => report.date === requestedDate);
  const labDate = requestedDateExists
    ? requestedDate
    : reports.reduce<string | null>((latest, report) => !latest || report.date > latest ? report.date : latest, null);
  if (!labDate) return { labDate: null, reportCount: 0, concerns: [] };

  const dayReports = reports.filter(report => report.date === labDate);
  const historicalReports = reports.filter(report => report.date <= labDate).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 16);
  const located = latestItems(dayReports);
  const context = dailyContext(allRecords.filter(record => record.catId === cat.id), labDate);
  const concerns: VeterinaryConcern[] = [];

  const kidneyHigh = abnormalMany(located, ["CREA", "SDMA", "BUN"], "high");
  const kidneySupport = [abnormal(located, "USG", "low"), abnormal(located, "UPC", "high"), abnormal(located, "PHOS", "high")].filter((value): value is LocatedItem => value != null);
  if (kidneyHigh.length || kidneySupport.length) {
    const matchedSigns = signs(context.matched, ["물 마시는 횟수 증가", "소변 횟수 증가", "체중 감소", "식욕 저하", "구토", "활동성 감소·무기력"]);
    const repeated = hasRepeatedFlag(historicalReports, ["CREA", "SDMA", "BUN", "USG", "UPC"], kidneyHigh.length ? "high" : "low");
    const score = kidneyHigh.length + kidneySupport.length + matchedSigns.length + (repeated ? 2 : 0);
    concerns.push({
      id: "kidney",
      category: "kidney",
      title: "신장 기능 저하·질소혈증 확인 필요",
      level: score >= 4 ? "prompt" : "appointment",
      confidence: confidenceFrom(score),
      summary: "신장 관련 수치 또는 소변 농축·단백뇨 지표가 검사표 기준범위를 벗어났습니다. 탈수, 급성 변화, 요로 폐색 같은 다른 원인도 함께 구분해야 합니다.",
      evidence: [...kidneyHigh, ...kidneySupport].map(markerText),
      matchedSigns,
      possibleSigns: ["물·소변 증가", "체중 감소", "식욕 저하", "구토", "무기력"],
      nextChecks: ["수분 상태가 안정된 조건에서 CREA·SDMA·BUN 재검", "요검사(요비중·침사·배양)와 UPC", "혈압 측정", "필요 시 신장·요로 영상검사"],
      caveat: "IRIS 병기는 CKD가 먼저 진단되고 안정성이 확인된 뒤 적용합니다. 이 앱은 CKD 진단이나 병기를 자동 확정하지 않습니다.",
      sourceLabel: "IRIS CKD staging system",
      sourceUrl: "https://www.iris-kidney.com/iris-staging-system",
    });
  }

  const glucose = abnormal(located, "GLU", "high");
  const diabetesSupport = [abnormal(located, "UGLU", "high"), abnormal(located, "FRUCT", "high"), abnormal(located, "KET", "high")].filter((value): value is LocatedItem => value != null);
  if (glucose) {
    const matchedSigns = signs(context.matched, ["물 마시는 횟수 증가", "소변 횟수 증가", "체중 감소", "식욕 저하", "구토", "활동성 감소·무기력"]);
    const score = 1 + diabetesSupport.length * 2 + matchedSigns.length;
    const ketones = diabetesSupport.some(value => value.item.code === "KET");
    const urgent = ketones && (matchedSigns.includes("식욕 저하") || matchedSigns.includes("구토") || matchedSigns.includes("활동성 감소·무기력"));
    concerns.push({
      id: "diabetes",
      category: "diabetes",
      title: urgent ? "고혈당·케톤과 아픈 증상 동반" : "지속성 고혈당·당뇨 확인 필요",
      level: urgent ? "urgent" : score >= 4 ? "prompt" : "appointment",
      confidence: confidenceFrom(score),
      summary: diabetesSupport.length ? "혈당 상승과 소변당·프럭토사민·케톤 중 보조 지표가 함께 확인됐습니다." : "혈당이 높지만 고양이는 병원 스트레스로 일시적인 고혈당이 생길 수 있습니다.",
      evidence: [glucose, ...diabetesSupport].map(markerText),
      matchedSigns,
      possibleSigns: ["물·소변 증가", "잘 먹는데 체중 감소", "탈수", "뒷다리 보행 변화"],
      nextChecks: urgent ? ["지금 동물병원에 연락해 케톤산증 가능성 평가"] : ["공복 또는 안정된 환경에서 혈당 재검", "요당·요케톤 검사", "프럭토사민과 임상 증상 확인"],
      caveat: "단일 혈당 수치만으로 당뇨를 진단하지 않습니다. 지속적 고혈당과 요당, 증상 또는 프럭토사민을 함께 확인해야 합니다.",
      sourceLabel: "Cornell Feline Diabetes",
      sourceUrl: "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-diabetes",
    });
  }

  const t4 = abnormal(located, "T4", "high");
  if (t4) {
    const matchedSigns = signs(context.matched, ["체중 감소", "물 마시는 횟수 증가", "소변 횟수 증가", "구토", "울음 증가", "활동성 감소·무기력"]);
    const score = 2 + matchedSigns.length + (hasRepeatedFlag(historicalReports, ["T4"], "high") ? 2 : 0);
    concerns.push({
      id: "thyroid",
      category: "thyroid",
      title: "갑상선기능항진증 확인 필요",
      level: matchedSigns.length ? "prompt" : "appointment",
      confidence: confidenceFrom(score),
      summary: "총 T4가 검사표 상한보다 높습니다. 노묘에서 체중 감소, 식욕·활동 변화, 물·소변 증가가 함께 나타날 수 있습니다.",
      evidence: [markerText(t4)],
      matchedSigns,
      possibleSigns: ["잘 먹는데 체중 감소", "과활동·울음 증가", "물·소변 증가", "구토·설사", "거친 털"],
      nextChecks: ["수의사의 신체검사와 갑상선 촉진", "심박수·혈압 측정", "신장 수치와 요검사 병행", "결과와 증상이 맞지 않으면 T4 재검 또는 추가 갑상선 검사"],
      caveat: "T4 결과는 임상 증상과 다른 질환의 영향을 함께 고려해 수의사가 확진합니다.",
      sourceLabel: "Cornell Hyperthyroidism in Cats",
      sourceUrl: "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/hyperthyroidism-cats",
    });
  }

  const anemiaMarkers = abnormalMany(located, ["HCT", "HGB", "RBC"], "low");
  if (anemiaMarkers.length) {
    const matchedSigns = signs(context.matched, ["활동성 감소·무기력", "호흡 이상", "쓰러짐·경련", "식욕 저하"]);
    const score = anemiaMarkers.length + matchedSigns.length + (hasRepeatedFlag(historicalReports, ["HCT", "HGB", "RBC"], "low") ? 2 : 0);
    const urgent = context.urgent && anemiaMarkers.length >= 2;
    concerns.push({
      id: "anemia",
      category: "anemia",
      title: urgent ? "빈혈 지표와 호흡·쓰러짐 신호 동반" : "빈혈 가능성 확인 필요",
      level: urgent ? "urgent" : anemiaMarkers.length >= 2 ? "prompt" : "appointment",
      confidence: confidenceFrom(score),
      summary: "적혈구·헤마토크릿·혈색소 중 하나 이상이 낮습니다. 출혈, 적혈구 파괴, 만성질환 또는 생성 저하를 구분해야 합니다.",
      evidence: anemiaMarkers.map(markerText),
      matchedSigns,
      possibleSigns: ["잇몸이 창백하거나 노랗게 보임", "무기력·수면 증가", "호흡·심박 증가", "식욕 저하", "검은 변 또는 변색된 소변"],
      nextChecks: urgent ? ["지금 동물병원에 연락해 산소 공급·수혈 필요성 포함 응급 평가"] : ["망상적혈구와 혈액도말", "혈소판·빌리루빈과 출혈 여부", "신장·감염·염증 등 기저 원인 평가"],
      caveat: "빈혈의 원인과 중증도는 수치의 절대값, 변화 속도, 망상적혈구와 신체검사를 함께 봐야 합니다.",
      sourceLabel: "Cornell Anemia",
      sourceUrl: "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/anemia",
    });
  }

  const liverMarkers = abnormalMany(located, ["ALT", "AST", "ALP", "GGT", "TBIL"], "high");
  if (liverMarkers.length) {
    const matchedSigns = signs(context.matched, ["식욕 저하", "구토", "체중 감소", "활동성 감소·무기력"]);
    const bilirubinHigh = liverMarkers.some(value => value.item.code === "TBIL");
    const score = liverMarkers.length + matchedSigns.length + (bilirubinHigh ? 2 : 0);
    concerns.push({
      id: "hepatobiliary",
      category: "hepatobiliary",
      title: "간세포·담도 이상 확인 필요",
      level: bilirubinHigh || matchedSigns.length ? "prompt" : "appointment",
      confidence: confidenceFrom(score),
      summary: "간·담도 관련 효소 또는 빌리루빈이 높습니다. 효소 상승은 손상 신호일 수 있지만 원인 질환이나 간 기능 자체를 단독으로 확정하지는 못합니다.",
      evidence: liverMarkers.map(markerText),
      matchedSigns,
      possibleSigns: ["식욕 저하", "구토", "무기력", "체중 감소", "잇몸·눈 흰자·피부가 노래짐"],
      nextChecks: ["약·보조제와 식사 중단 기간 확인", "빌리루빈·단백·혈당 등 화학검사 종합 검토", "복부 초음파", "필요 시 담즙산·응고검사 또는 추가 간담도 검사"],
      caveat: "ALT·ALP 같은 효소는 원인이 다양하고 간 기능 검사와 동일하지 않습니다. 영상과 증상을 함께 해석해야 합니다.",
      sourceLabel: "Merck Veterinary Manual clinical biochemistry",
      sourceUrl: "https://www.merckvetmanual.com/clinical-pathology-and-procedures/diagnostic-procedures-for-the-private-practice-laboratory/clinical-biochemistry",
    });
  }

  const fpl = abnormal(located, "FPL", "high");
  const pancreaticImaging = dayReports.find(report => /췌장|pancrea/i.test(`${report.findings} ${report.interpretation}`) && /염증|비대|주위|fluid|inflamm/i.test(`${report.findings} ${report.interpretation}`));
  if (fpl || pancreaticImaging) {
    const matchedSigns = signs(context.matched, ["식욕 저하", "구토", "체중 감소", "활동성 감소·무기력"]);
    const score = (fpl ? 2 : 0) + (pancreaticImaging ? 2 : 0) + matchedSigns.length;
    concerns.push({
      id: "pancreas",
      category: "pancreas",
      title: "췌장염 가능성 확인 필요",
      level: matchedSigns.length >= 2 ? "prompt" : "appointment",
      confidence: confidenceFrom(score),
      summary: "췌장 특이 검사 또는 수의사가 입력한 영상 판독에서 췌장 관련 이상이 확인됐습니다. 고양이 췌장염은 한 가지 검사만으로 확진하기 어렵습니다.",
      evidence: [fpl ? markerText(fpl) : null, pancreaticImaging ? `${pancreaticImaging.date} 영상 판독에 췌장 관련 소견 기록` : null].filter((value): value is string => value != null),
      matchedSigns,
      possibleSigns: ["식욕 저하", "무기력", "탈수", "구토", "체중 감소"],
      nextChecks: ["신체검사와 수분·통증·영양 상태 평가", "fPLI 결과와 다른 혈액검사 종합", "숙련된 수의사의 복부 초음파 판독", "장·간담도 동반 질환 확인"],
      caveat: "fPLI와 초음파도 단독 확진 검사가 아니며, 증상·여러 검사·영상 결과를 통합해 판단합니다.",
      sourceLabel: "Cornell Feline Pancreatitis",
      sourceUrl: "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-pancreatitis",
    });
  }

  const immuneMarkers = [...abnormalMany(located, ["WBC", "NEU"], "high"), ...abnormalMany(located, ["WBC", "NEU"], "low")];
  if (immuneMarkers.length) {
    const matchedSigns = signs(context.matched, ["식욕 저하", "구토", "활동성 감소·무기력"]);
    const score = immuneMarkers.length + matchedSigns.length;
    concerns.push({
      id: "inflammation",
      category: "inflammation",
      title: "염증·감염·스트레스 반응 감별 필요",
      level: matchedSigns.length ? "prompt" : "appointment",
      confidence: confidenceFrom(score),
      summary: "백혈구 또는 호중구가 기준범위를 벗어났습니다. 염증·감염뿐 아니라 스트레스, 약물, 심한 소모 등 여러 원인이 가능합니다.",
      evidence: immuneMarkers.map(markerText),
      matchedSigns,
      possibleSigns: ["발열 또는 체온 저하", "무기력", "식욕 저하", "구토·설사", "특정 부위 통증·부종"],
      nextChecks: ["백혈구 감별계수와 혈액도말", "체온·신체검사로 염증 위치 확인", "증상에 따른 소변배양·영상·감염성 질환 검사"],
      caveat: "백혈구 수치만으로 감염 여부나 원인 부위를 확정할 수 없습니다.",
      sourceLabel: "Merck Veterinary Manual white blood cell disorders",
      sourceUrl: "https://www.merckvetmanual.com/cat-owners/blood-disorders-of-cats/white-blood-cell-disorders-leukemia-and-lymphoma-of-cats",
    });
  }

  const electrolytes = ["NA", "K", "CA"].flatMap(code => [abnormal(located, code, "high"), abnormal(located, code, "low")]).filter((value): value is LocatedItem => value != null);
  if (electrolytes.length) {
    const matchedSigns = signs(context.matched, ["식욕 저하", "구토", "활동성 감소·무기력", "쓰러짐·경련"]);
    concerns.push({
      id: "electrolytes",
      category: "electrolytes",
      title: "전해질 이상 재확인 필요",
      level: matchedSigns.includes("쓰러짐·경련") ? "urgent" : matchedSigns.length ? "prompt" : "appointment",
      confidence: confidenceFrom(electrolytes.length + matchedSigns.length),
      summary: "나트륨·칼륨·칼슘 중 하나 이상이 검사표 기준범위를 벗어났습니다. 수분 상태, 신장·내분비 질환, 검체 오류 등을 구분해야 합니다.",
      evidence: electrolytes.map(markerText),
      matchedSigns,
      possibleSigns: ["근력 저하", "무기력", "식욕 저하", "구토", "심한 경우 쓰러짐·경련"],
      nextChecks: ["검체 상태를 확인하고 전해질 재검", "수분 상태와 신장 수치 평가", "심한 칼륨 이상이 의심되면 심전도 포함 즉시 평가"],
      caveat: "전해질 이상은 절대 수치와 변화 속도가 중요합니다. 앱은 검사실별 임계 응급값을 대신 판단하지 않습니다.",
      sourceLabel: "Merck Veterinary Manual clinical biochemistry",
      sourceUrl: "https://www.merckvetmanual.com/clinical-pathology-and-procedures/diagnostic-procedures-for-the-private-practice-laboratory/clinical-biochemistry",
    });
  }

  const platelets = abnormal(located, "PLT", "low");
  if (platelets) {
    concerns.push({
      id: "platelets",
      category: "platelets",
      title: "혈소판 감소 또는 검체 응집 확인 필요",
      level: "appointment",
      confidence: "low",
      summary: "혈소판이 낮게 측정됐습니다. 고양이는 채혈 검체에서 혈소판 응집이 흔해 자동 측정값이 실제보다 낮을 수 있습니다.",
      evidence: [markerText(platelets)],
      matchedSigns: [],
      possibleSigns: ["멍·점상출혈", "코피·잇몸 출혈", "혈뇨·혈변"],
      nextChecks: ["혈액도말에서 혈소판 응집과 실제 수 확인", "출혈 징후가 있으면 빠른 진료"],
      caveat: "자동 혈구검사 결과만으로 혈소판 감소증을 확정하지 않습니다.",
      sourceLabel: "Cornell Clinical Pathology reference guidance",
      sourceUrl: "https://www.vet.cornell.edu/animal-health-diagnostic-center/laboratories/clinical-pathology/reference-intervals",
    });
  }

  return {
    labDate,
    reportCount: dayReports.length,
    concerns: concerns.sort((a, b) => levelRank[b.level] - levelRank[a.level] || confidenceRank[b.confidence] - confidenceRank[a.confidence]),
  };
}
