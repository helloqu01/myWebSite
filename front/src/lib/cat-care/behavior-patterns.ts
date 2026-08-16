import type { BehaviorEventType, DailyRecord, TimedCareEvent, TimedCareEventType } from "@/types/cat-care";
import { BEHAVIOR_EVENT_TYPES, TIMED_EVENT_LABELS } from "./events";

export type DayPeriod = "dawn" | "morning" | "afternoon" | "evening";
export type BehaviorPatternStatus = "learning" | "steady" | "changed";

export interface BehaviorChange {
  type: BehaviorEventType;
  direction: "up" | "down";
  percent: number;
  message: string;
  attention: boolean;
}

export interface BehaviorPatternResult {
  status: BehaviorPatternStatus;
  coverageDays: number;
  totalDays: number;
  totalEvents: number;
  behaviorEvents: number;
  dominantPeriod: DayPeriod | null;
  periodCounts: Record<DayPeriod, number>;
  topBehavior: BehaviorEventType | null;
  behaviorCounts: Record<BehaviorEventType, number>;
  routineSummaries: string[];
  changes: BehaviorChange[];
}

export const DAY_PERIOD_LABELS: Record<DayPeriod, string> = {
  dawn: "새벽 0–5시",
  morning: "오전 6–11시",
  afternoon: "오후 12–17시",
  evening: "저녁·밤 18–23시",
};

const patternEventTypes = new Set<TimedCareEventType>([
  "water",
  "meal",
  "urine",
  "stool",
  ...BEHAVIOR_EVENT_TYPES,
]);

function dateKeyOffset(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function periodForTime(time: string): DayPeriod | null {
  const hour = Number(time.slice(0, 2));
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return null;
  if (hour < 6) return "dawn";
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

function eventCount(records: DailyRecord[], type: BehaviorEventType): number {
  return records.reduce(
    (sum, record) => sum + record.timedEvents.filter(event => event.type === type).length,
    0,
  );
}

function averagePerDay(records: DailyRecord[], type: BehaviorEventType): number {
  if (!records.length) return 0;
  return eventCount(records, type) / records.length;
}

function percentChange(current: number, baseline: number): number {
  if (baseline === 0) return current > 0 ? 100 : 0;
  return ((current - baseline) / baseline) * 100;
}

function buildChanges(recent: DailyRecord[], baseline: DailyRecord[]): BehaviorChange[] {
  if (recent.length < 2 || baseline.length < 3) return [];
  return BEHAVIOR_EVENT_TYPES.flatMap(type => {
    const current = averagePerDay(recent, type);
    const usual = averagePerDay(baseline, type);
    if (current === 0 && usual === 0) return [];
    const change = percentChange(current, usual);
    const direction: BehaviorChange["direction"] = change >= 0 ? "up" : "down";
    const magnitude = Math.abs(Math.round(change));
    if (magnitude < 50) return [];
    const attention = (type === "hiding" || type === "vocalization")
      ? direction === "up" && current >= 0.5
      : (type === "play" || type === "interaction" || type === "grooming")
        ? direction === "down" && usual >= 0.5
        : false;
    return [{
      type,
      direction,
      percent: Math.round(change),
      message: `${TIMED_EVENT_LABELS[type]} 기록이 평소보다 ${magnitude}% ${direction === "up" ? "늘었어요" : "줄었어요"}.`,
      attention,
    }];
  }).sort((a, b) => Number(b.attention) - Number(a.attention) || Math.abs(b.percent) - Math.abs(a.percent));
}

function behaviorSummary(type: BehaviorEventType, events: TimedCareEvent[]): string | null {
  const matching = events.filter(event => event.type === type);
  if (!matching.length) return null;
  const periods = matching.reduce<Record<DayPeriod, number>>(
    (counts, event) => {
      const period = periodForTime(event.time);
      if (period) counts[period] += 1;
      return counts;
    },
    { dawn: 0, morning: 0, afternoon: 0, evening: 0 },
  );
  const dominant = (Object.entries(periods) as Array<[DayPeriod, number]>).sort((a, b) => b[1] - a[1])[0];
  const duration = matching.reduce((sum, event) => sum + (event.durationMinutes ?? 0), 0);
  const durationText = duration > 0 ? ` · 총 ${duration}분` : "";
  return `${TIMED_EVENT_LABELS[type]} ${matching.length}회 · ${DAY_PERIOD_LABELS[dominant[0]]} 중심${durationText}`;
}

export function analyzeCatBehavior(
  records: DailyRecord[],
  catId: string,
  endDate: string,
  days = 14,
): BehaviorPatternResult {
  const startDate = dateKeyOffset(endDate, -(days - 1));
  const selected = records
    .filter(record => record.catId === catId && record.date >= startDate && record.date <= endDate)
    .sort((a, b) => a.date.localeCompare(b.date));
  const events = selected.flatMap(record => record.timedEvents).filter(event => patternEventTypes.has(event.type));
  const behaviorEvents = events.filter(event => BEHAVIOR_EVENT_TYPES.includes(event.type as BehaviorEventType));
  const periodCounts = events.reduce<Record<DayPeriod, number>>(
    (counts, event) => {
      const period = periodForTime(event.time);
      if (period) counts[period] += 1;
      return counts;
    },
    { dawn: 0, morning: 0, afternoon: 0, evening: 0 },
  );
  const dominantPeriodEntry = (Object.entries(periodCounts) as Array<[DayPeriod, number]>)
    .sort((a, b) => b[1] - a[1])[0];
  const behaviorCounts = Object.fromEntries(BEHAVIOR_EVENT_TYPES.map(type => [
    type,
    behaviorEvents.filter(event => event.type === type).length,
  ])) as Record<BehaviorEventType, number>;
  const topBehaviorEntry = (Object.entries(behaviorCounts) as Array<[BehaviorEventType, number]>)
    .sort((a, b) => b[1] - a[1])[0];
  const recent = selected.slice(-3);
  const baseline = selected.slice(0, -3).slice(-7);
  const changes = buildChanges(recent, baseline);
  const routineSummaries = (Object.entries(behaviorCounts) as Array<[BehaviorEventType, number]>)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => behaviorSummary(type, behaviorEvents))
    .filter((summary): summary is string => Boolean(summary));
  const enoughData = selected.length >= 5 && behaviorEvents.length >= 5;

  return {
    status: !enoughData ? "learning" : changes.some(change => change.attention) ? "changed" : "steady",
    coverageDays: selected.filter(record => record.timedEvents.some(event => patternEventTypes.has(event.type))).length,
    totalDays: selected.length,
    totalEvents: events.length,
    behaviorEvents: behaviorEvents.length,
    dominantPeriod: dominantPeriodEntry[1] > 0 ? dominantPeriodEntry[0] : null,
    periodCounts,
    topBehavior: topBehaviorEntry[1] > 0 ? topBehaviorEntry[0] : null,
    behaviorCounts,
    routineSummaries,
    changes,
  };
}
