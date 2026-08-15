import type {
  AlertLevel,
  CatProfile,
  DailyRecord,
  HealthAlert,
  MeasurementConfidence,
} from "@/types/cat-care";
import { toLocalDateKey } from "./storage";

const levelRank: Record<AlertLevel, number> = {
  info: 0,
  watch: 1,
  consult: 2,
  urgent: 3,
};

const confidenceRank: Record<MeasurementConfidence, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function minimumConfidence(records: DailyRecord[]): MeasurementConfidence {
  return records.reduce<MeasurementConfidence>((lowest, record) => {
    return confidenceRank[record.measurementConfidence] < confidenceRank[lowest]
      ? record.measurementConfidence
      : lowest;
  }, "high");
}

function percentChange(current: number, baseline: number): number {
  if (!baseline) return 0;
  return ((current - baseline) / baseline) * 100;
}

function signedPercent(value: number): string {
  return `${value > 0 ? "+" : ""}${Math.round(value)}%`;
}

function addAlert(
  alerts: HealthAlert[],
  catId: string,
  level: AlertLevel,
  title: string,
  detail: string,
  evidence: string,
  confidence: MeasurementConfidence,
): void {
  alerts.push({
    id: `${catId}-${title}-${alerts.length}`,
    catId,
    level,
    title,
    detail,
    evidence,
    confidence,
  });
}

export function getCatAge(birthDate: string): number | null {
  if (!birthDate) return null;
  const birth = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return Math.max(0, age);
}

export function recordsForCat(records: DailyRecord[], catId: string): DailyRecord[] {
  return records
    .filter(record => record.catId === catId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function buildCatAlerts(cat: CatProfile, allRecords: DailyRecord[]): HealthAlert[] {
  const records = recordsForCat(allRecords, cat.id);
  const alerts: HealthAlert[] = [];
  const today = toLocalDateKey(new Date());
  const latest = records.at(-1);

  if (!latest) {
    addAlert(
      alerts,
      cat.id,
      "info",
      "기준선 준비 중",
      "첫 기록을 남기면 고양이별 변화 추적을 시작합니다.",
      "아직 저장된 기록이 없습니다.",
      "low",
    );
    return alerts;
  }

  if (latest.date !== today) {
    addAlert(
      alerts,
      cat.id,
      "watch",
      "오늘 기록이 필요해요",
      "오늘 상태를 입력하면 투약 누락과 최근 변화를 확인할 수 있습니다.",
      `마지막 기록일 ${latest.date}`,
      "low",
    );
  }

  const todayRecord = records.find(record => record.date === today);
  if (todayRecord) {
    if (todayRecord.urineNotProduced || todayRecord.breathingDifficulty || todayRecord.collapseOrSeizure) {
      const signs = [
        todayRecord.urineNotProduced && "배뇨 시도 중 소변이 나오지 않음",
        todayRecord.breathingDifficulty && "호흡 곤란",
        todayRecord.collapseOrSeizure && "쓰러짐 또는 경련",
      ].filter(Boolean);
      addAlert(
        alerts,
        cat.id,
        "urgent",
        "즉시 진료가 필요한 증상",
        "앱의 추세 분석을 기다리지 말고 가까운 동물병원 또는 응급병원에 연락하세요.",
        signs.join(", "),
        "high",
      );
    } else if (todayRecord.urinationStraining || todayRecord.bloodInUrine) {
      addAlert(
        alerts,
        cat.id,
        "consult",
        "배뇨 이상 징후",
        "배뇨 상태를 주의 깊게 확인하고 가능한 한 빨리 동물병원에 상담하세요.",
        [todayRecord.urinationStraining && "배뇨 시 힘주기", todayRecord.bloodInUrine && "혈뇨"]
          .filter(Boolean)
          .join(", "),
        "high",
      );
    }

    const unchecked = cat.medications.filter(medication => !todayRecord.medicationChecks[medication.id]);
    if (unchecked.length) {
      addAlert(
        alerts,
        cat.id,
        "watch",
        "오늘 투약 확인 필요",
        "처방 지시를 확인하고 투약 여부를 기록해 주세요.",
        `${unchecked.map(item => item.name).join(", ")} 미체크`,
        "high",
      );
    }

    if (todayRecord.appetite === "none") {
      addAlert(
        alerts,
        cat.id,
        "consult",
        "식사하지 않음",
        "노묘가 먹지 않는 상태가 지속되면 빠르게 동물병원에 상담하세요.",
        `${todayRecord.date} 식욕 없음으로 기록`,
        todayRecord.measurementConfidence,
      );
    }

    if (todayRecord.vomitCount >= 2) {
      addAlert(
        alerts,
        cat.id,
        "consult",
        "반복 구토 기록",
        "다른 증상과 함께 나타나거나 구토가 계속되면 동물병원에 상담하세요.",
        `오늘 구토 ${todayRecord.vomitCount}회`,
        todayRecord.measurementConfidence,
      );
    }

    if (todayRecord.restingRespiratoryRate != null && todayRecord.restingRespiratoryRate > 35 && !todayRecord.breathingDifficulty) {
      addAlert(
        alerts,
        cat.id,
        "consult",
        "안정 시 호흡수 증가",
        "편안히 자는 동안 다시 측정해도 높은 상태가 이어지면 동물병원에 상담하세요.",
        `${todayRecord.date} 분당 ${todayRecord.restingRespiratoryRate}회`,
        todayRecord.measurementConfidence,
      );
    }
  }

  const recent = records.slice(-3);
  const baselineRecords = records.slice(0, Math.max(0, records.length - 3)).slice(-14);
  if (recent.length >= 2 && baselineRecords.length >= 5) {
    const compareMetric = (
      title: string,
      unit: string,
      selector: (record: DailyRecord) => number | null,
      increaseThreshold: number,
      decreaseThreshold: number,
    ) => {
      const recentValues = recent.map(selector).filter((value): value is number => value != null);
      const baselineValues = baselineRecords.map(selector).filter((value): value is number => value != null);
      if (recentValues.length < 2 || baselineValues.length < 4) return;

      const recentAverage = average(recentValues);
      const baseline = median(baselineValues);
      const change = percentChange(recentAverage, baseline);
      const confidence = minimumConfidence(recent);
      if (change >= increaseThreshold) {
        addAlert(
          alerts,
          cat.id,
          "consult",
          `${title} 증가 추세`,
          "개인 기준선과 다른 흐름이 이어지고 있습니다. 다른 증상도 확인하고 지속되면 동물병원에 상담하세요.",
          `기준 ${baseline.toFixed(1)}${unit} → 최근 ${recentAverage.toFixed(1)}${unit} (${signedPercent(change)})`,
          confidence,
        );
      } else if (change <= -decreaseThreshold) {
        addAlert(
          alerts,
          cat.id,
          "watch",
          `${title} 감소 추세`,
          "측정 환경이 같은지 확인하고 다음 기록에서도 변화가 이어지는지 관찰하세요.",
          `기준 ${baseline.toFixed(1)}${unit} → 최근 ${recentAverage.toFixed(1)}${unit} (${signedPercent(change)})`,
          confidence,
        );
      }
    };

    compareMetric("물 마신 횟수", "회", record => record.waterCount, 50, 50);
    compareMetric("소변 횟수", "회", record => record.urineCount, 50, 50);

    const recentWeights = recent.map(record => record.weightKg).filter((value): value is number => value != null);
    const baselineWeights = baselineRecords
      .map(record => record.weightKg)
      .filter((value): value is number => value != null);
    if (recentWeights.length && baselineWeights.length >= 3) {
      const currentWeight = recentWeights.at(-1)!;
      const baselineWeight = median(baselineWeights);
      const change = percentChange(currentWeight, baselineWeight);
      if (change <= -5) {
        addAlert(
          alerts,
          cat.id,
          "consult",
          "체중 감소 추세",
          "같은 저울과 조건에서 다시 측정하고, 감소가 확인되면 동물병원에 상담하세요.",
          `기준 ${baselineWeight.toFixed(2)}kg → 최근 ${currentWeight.toFixed(2)}kg (${signedPercent(change)})`,
          minimumConfidence(recent),
        );
      }
    }
  } else if (records.length < 8) {
    addAlert(
      alerts,
      cat.id,
      "info",
      "개인 기준선 학습 중",
      "5일 이상의 기준 기록과 최근 기록이 모이면 자동 변화 감지가 시작됩니다.",
      `현재 ${records.length}일 기록됨`,
      "low",
    );
  }

  const lastTwo = records.slice(-2);
  if (
    lastTwo.length === 2 &&
    lastTwo.every(record => record.appetite === "low" || record.appetite === "none")
  ) {
    addAlert(
      alerts,
      cat.id,
      "consult",
      "식욕 저하 지속",
      "식욕 저하가 연속으로 기록되었습니다. 동물병원에 상담해 주세요.",
      `${lastTwo[0].date}부터 2회 연속 식욕 저하`,
      minimumConfidence(lastTwo),
    );
  }

  if (lastTwo.length === 2 && lastTwo.every(record => record.stoolCount === 0)) {
    addAlert(
      alerts,
      cat.id,
      "consult",
      "배변 없음 지속",
      "배변 시 힘주기, 통증, 구토 또는 식욕 저하가 있는지 확인하고 동물병원에 상담하세요.",
      `${lastTwo[0].date}부터 2회 연속 배변 0회`,
      minimumConfidence(lastTwo),
    );
  }

  if (lastTwo.length === 2 && lastTwo.every(record => record.activity === "low")) {
    addAlert(
      alerts,
      cat.id,
      "watch",
      "활동성 감소 지속",
      "통증, 식욕, 호흡과 배변 상태를 함께 확인하고 변화가 이어지면 동물병원에 상담하세요.",
      `${lastTwo[0].date}부터 2회 연속 활동성 감소`,
      minimumConfidence(lastTwo),
    );
  }

  return alerts.sort((a, b) => levelRank[b.level] - levelRank[a.level]);
}

export function getHighestAlertLevel(alerts: HealthAlert[]): AlertLevel | "stable" {
  if (!alerts.length) return "stable";
  return alerts.reduce<AlertLevel>((highest, alert) => {
    return levelRank[alert.level] > levelRank[highest] ? alert.level : highest;
  }, "info");
}

export function getRecordsInRange(
  records: DailyRecord[],
  catId: string,
  days: number,
): DailyRecord[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  const startKey = toLocalDateKey(start);
  return recordsForCat(records, catId).filter(record => record.date >= startKey);
}
