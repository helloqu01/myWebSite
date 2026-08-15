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
export type ExaminationType =
  | "blood"
  | "urine"
  | "stool"
  | "xray"
  | "ultrasound"
  | "cardiac"
  | "blood_pressure"
  | "thyroid"
  | "pathology"
  | "dental"
  | "other";
export type ObservationLevel = "usual" | "changed" | "concerning";
export type LitterRecordType = "urine" | "stool" | "both";
export type CloudMemberRole = "owner" | "editor" | "viewer";
export type HealthCheckupType = "routine" | "follow_up" | "symptom" | "emergency" | "vaccination" | "other";
export type TimedCareEventType = "water" | "meal" | "urine" | "stool" | "seizure";
export type SeizureSeverity = "mild" | "moderate" | "severe";
export type FoodCategory = "dry" | "wet" | "prescription" | "treat" | "other";
export type MedicationAdministrationStatus = "given" | "missed" | "failed" | "vomited";
export type ObservationMediaCategory = "mobility" | "behavior" | "vomit" | "stool" | "urine" | "skin" | "wound" | "other";

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

export interface TimedCareEvent {
  id: string;
  type: TimedCareEventType;
  time: string;
  amountMl: number | null;
  amountGrams: number | null;
  durationSeconds: number | null;
  severity: SeizureSeverity | null;
  foodItemId: string | null;
  notes: string;
}

export interface FoodNutrientAnalysis {
  proteinMinPercent: number | null;
  fatMinPercent: number | null;
  fiberMaxPercent: number | null;
  ashMaxPercent: number | null;
  moistureMaxPercent: number | null;
  calciumMinPercent: number | null;
  phosphorusMinPercent: number | null;
  omega6Percent: number | null;
  omega3Percent: number | null;
  magnesiumPercent: number | null;
  sodiumPercent: number | null;
  energyKcalPerKg: number | null;
}

export interface FoodItem {
  id: string;
  catId: string;
  category: FoodCategory;
  brand: string;
  productName: string;
  startDate: string;
  endDate: string;
  openedDate: string;
  expiresDate: string;
  packageSizeGrams: number | null;
  remainingGrams: number | null;
  dailyTargetGrams: number | null;
  caloriesPer100g: number | null;
  nutrients: FoodNutrientAnalysis;
  ingredients: string;
  vitaminsMinerals: string;
  additives: string;
  labelRawText: string;
  labelDocuments: MedicalDocumentReference[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationAdministration {
  id: string;
  catId: string;
  medicationId: string;
  date: string;
  scheduledTime: string;
  actualTime: string;
  dose: number | null;
  doseUnit: string;
  status: MedicationAdministrationStatus;
  administeredBy: string;
  sideEffects: string;
  notes: string;
  linkedScheduleId: string | null;
  stockDeducted: boolean;
  scheduleCompletedByLog: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QualityOfLifeCheck {
  id: string;
  catId: string;
  date: string;
  appetite: number;
  painComfort: number;
  hygiene: number;
  mobility: number;
  interaction: number;
  sleep: number;
  notes: string;
  updatedAt: string;
}

export interface ObservationMediaRecord {
  id: string;
  catId: string;
  date: string;
  time: string;
  category: ObservationMediaCategory;
  title: string;
  notes: string;
  document: MedicalDocumentReference;
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
  timedEvents: TimedCareEvent[];
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

export interface MedicalDocumentReference {
  storagePath: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface LabReport {
  id: string;
  catId: string;
  date: string;
  type: ExaminationType;
  title: string;
  hospital: string;
  sourceFileName: string;
  rawText: string;
  originalDocument: MedicalDocumentReference | null;
  items: LabResultItem[];
  findings: string;
  interpretation: string;
  recommendations: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthCheckup {
  id: string;
  catId: string;
  date: string;
  type: HealthCheckupType;
  hospital: string;
  veterinarian: string;
  reason: string;
  summary: string;
  diagnoses: string[];
  testsAndProcedures: string;
  treatments: string;
  prescriptions: string;
  recommendations: string;
  nextVisitDate: string;
  weightKg: number | null;
  temperatureC: number | null;
  systolicBloodPressure: number | null;
  diastolicBloodPressure: number | null;
  costWon: number | null;
  relatedLabReportIds: string[];
  sourceFileName: string;
  chartRawText: string;
  chartDetectedFields: string[];
  originalDocument: MedicalDocumentReference | null;
  documentNotes: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyWellnessCheck {
  id: string;
  catId: string;
  date: string;
  weightKg: number | null;
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
  jumpingDifficulty: boolean;
  stairDifficulty: boolean;
  limping: boolean;
  disorientation: boolean;
  nightVocalizationCount: number | null;
  hidingHours: number | null;
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
  version: 11;
  cats: CatProfile[];
  records: DailyRecord[];
  foodItems: FoodItem[];
  medicationAdministrations: MedicationAdministration[];
  qualityOfLifeChecks: QualityOfLifeCheck[];
  observationMedia: ObservationMediaRecord[];
  schedules: CareSchedule[];
  labReports: LabReport[];
  healthCheckups: HealthCheckup[];
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
