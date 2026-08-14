export const MAX_CATS = 4;

export type CatSex = "female" | "male" | "unknown";
export type MeasurementConfidence = "high" | "medium" | "low";
export type SizeLevel = "small" | "normal" | "large";
export type AppetiteLevel = "good" | "normal" | "low" | "none";
export type ActivityLevel = "normal" | "low";
export type AlertLevel = "info" | "watch" | "consult" | "urgent";
export type CareScheduleType = "medication" | "weight" | "vet" | "care";
export type CareScheduleRepeat = "none" | "daily" | "weekly" | "monthly";
export type LabResultFlag = "low" | "normal" | "high" | "unknown";
export type ObservationLevel = "usual" | "changed" | "concerning";
export type LitterRecordType = "urine" | "stool" | "both";
export type CloudMemberRole = "owner" | "editor" | "viewer";

export interface Medication {
  id: string;
  name: string;
  scheduleNote: string;
  stockCount: number | null;
  refillThreshold: number | null;
  stockUnit: string;
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

export interface CareSchedule {
  id: string;
  catId: string;
  title: string;
  type: CareScheduleType;
  repeat: CareScheduleRepeat;
  startDate: string;
  time: string;
  notes: string;
  completedDates: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LabResultItem {
  id: string;
  code: string;
  name: string;
  value: number | null;
  unit: string;
  referenceLow: number | null;
  referenceHigh: number | null;
  flag: LabResultFlag;
  explanation: string;
}

export interface LabReport {
  id: string;
  catId: string;
  date: string;
  hospital: string;
  sourceFileName: string;
  rawText: string;
  items: LabResultItem[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyWellnessCheck {
  id: string;
  catId: string;
  date: string;
  mobility: ObservationLevel;
  grooming: ObservationLevel;
  sleep: ObservationLevel;
  interaction: ObservationLevel;
  litterBoxUse: ObservationLevel;
  painResponse: ObservationLevel;
  bodyConditionScore: number | null;
  muscleConditionScore: number | null;
  systolicBloodPressure: number | null;
  diastolicBloodPressure: number | null;
  notes: string;
  updatedAt: string;
}

export interface HouseholdLitterRecord {
  id: string;
  catId: string | null;
  date: string;
  time: string;
  type: LitterRecordType;
  urineAmount: SizeLevel | null;
  stoolAmount: SizeLevel | null;
  confidence: MeasurementConfidence;
  notes: string;
  updatedAt: string;
}

export interface EmergencyInfo {
  catId: string;
  primaryVetName: string;
  primaryVetPhone: string;
  emergencyVetName: string;
  emergencyVetPhone: string;
  allergies: string;
  caregiverContacts: string;
  emergencyNotes: string;
  updatedAt: string;
}

export interface NotificationSettings {
  browserEnabled: boolean;
  scheduleAlerts: boolean;
  missingRecordAlerts: boolean;
  refillAlerts: boolean;
  missingRecordHour: number;
  reminderLeadMinutes: number;
  lastNotifiedKeys: string[];
}

export interface CareState {
  version: 4;
  cats: CatProfile[];
  records: DailyRecord[];
  schedules: CareSchedule[];
  labReports: LabReport[];
  weeklyChecks: WeeklyWellnessCheck[];
  householdLitterRecords: HouseholdLitterRecord[];
  emergencyInfo: EmergencyInfo[];
  notificationSettings: NotificationSettings;
}

export interface CloudHousehold {
  id: string;
  name: string;
  inviteCode: string;
  role: CloudMemberRole;
  updatedAt: string;
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
