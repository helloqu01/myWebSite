import type { BehaviorEventType, TimedCareEventType } from "@/types/cat-care";

export const TIMED_EVENT_LABELS: Record<TimedCareEventType, string> = {
  water: "물 마심",
  meal: "식사",
  urine: "소변",
  stool: "대변",
  seizure: "발작",
  sleep: "잠·휴식",
  play: "놀이·활동",
  grooming: "그루밍",
  interaction: "사람·고양이 교류",
  hiding: "숨기",
  vocalization: "울음·야간울음",
};

export const BEHAVIOR_EVENT_TYPES: BehaviorEventType[] = [
  "sleep",
  "play",
  "grooming",
  "interaction",
  "hiding",
  "vocalization",
];

const behaviorEventTypeSet = new Set<TimedCareEventType>(BEHAVIOR_EVENT_TYPES);

export function isBehaviorEventType(type: TimedCareEventType): type is BehaviorEventType {
  return behaviorEventTypeSet.has(type);
}
