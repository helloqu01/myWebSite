export const MAX_CATS = 4;

export type CatSex = "female" | "male" | "unknown";
export type MeasurementConfidence = "high" | "medium" | "low";
export type SizeLevel = "small" | "normal" | "large";
export type AppetiteLevel = "good" | "normal" | "low" | "none";
export type ActivityLevel = "normal" | "low";
export type AlertLevel = "info" | "watch" | "consult" | "urgent";

export interface Medication {
  id: string;
  name: string;
  scheduleNote: string;
}

export interface CatProfile {
  id: string;
  name: string;
  birthDate: string;
  sex: CatSex;
  neutered: boolean;
  isSenior: boolean;
  focusCare: boolean;
  currentWeightKg: number | null;
  targetWeightKg: number | null;
  conditions: string[];
  medications: Medication[];
  vetTargets: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyRecord {
  id: string;
  catId: string;
  date: string;
  waterMl: number | null;
  urineCount: number | null;
  urineSize: SizeLevel | null;
  stoolCount: number | null;
  stoolAmount: SizeLevel | null;
  stoolScore: number | null;
  appetite: AppetiteLevel;
  weightKg: number | null;
  vomitCount: number;
  activity: ActivityLevel;
  measurementConfidence: MeasurementConfidence;
  medicationChecks: Record<string, boolean>;
  urinationStraining: boolean;
  urineNotProduced: boolean;
  bloodInUrine: boolean;
  breathingDifficulty: boolean;
  collapseOrSeizure: boolean;
  notes: string;
  updatedAt: string;
}

export interface CareState {
  version: 1;
  cats: CatProfile[];
  records: DailyRecord[];
}

export interface HealthAlert {
  id: string;
  catId: string;
  level: AlertLevel;
  title: string;
  detail: string;
  evidence: string;
  confidence: MeasurementConfidence;
}

