import type { FoodNutrientAnalysis } from "@/types/cat-care";

export const EMPTY_FOOD_NUTRIENTS: FoodNutrientAnalysis = {
  proteinMinPercent: null,
  fatMinPercent: null,
  fiberMaxPercent: null,
  ashMaxPercent: null,
  moistureMaxPercent: null,
  calciumMinPercent: null,
  phosphorusMinPercent: null,
  omega6Percent: null,
  omega3Percent: null,
  magnesiumPercent: null,
  sodiumPercent: null,
  energyKcalPerKg: null,
};

export interface ParsedFoodLabel {
  nutrients: FoodNutrientAnalysis;
  ingredients: string;
  vitaminsMinerals: string;
  additives: string;
  detectedFieldCount: number;
}

function toNumber(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function valueAfter(text: string, label: RegExp, unit: "percent" | "energy" = "percent"): number | null {
  const suffix = unit === "energy"
    ? String.raw`[^\d]{0,24}([\d,]+(?:\.\d+)?)\s*(?:kcal\s*\/\s*kg|kcal|칼로리)?`
    : String.raw`[^\d]{0,18}(\d+(?:\.\d+)?)\s*%?`;
  return toNumber(text.match(new RegExp(`${label.source}${suffix}`, "i"))?.[1]);
}

function cleanSection(value: string | undefined): string {
  return (value ?? "")
    .replace(/^\s*[:：·-]?\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseFoodLabelText(rawText: string): ParsedFoodLabel {
  const text = rawText
    .replace(/\r/g, "\n")
    .replace(/([가-힣])\s+(?=[가-힣])/g, "$1");
  const nutrients: FoodNutrientAnalysis = {
    proteinMinPercent: valueAfter(text, /조\s*단백(?:질)?/),
    fatMinPercent: valueAfter(text, /조\s*지방/),
    fiberMaxPercent: valueAfter(text, /조\s*섬유/),
    ashMaxPercent: valueAfter(text, /조\s*회분/),
    moistureMaxPercent: valueAfter(text, /수\s*분/),
    calciumMinPercent: valueAfter(text, /칼\s*슘/),
    phosphorusMinPercent: valueAfter(text, /(?:^|\s)인(?=\s|[:：]|\d)/m),
    omega6Percent: valueAfter(text, /오메가\s*[-–]?\s*6/),
    omega3Percent: valueAfter(text, /오메가\s*[-–]?\s*3/),
    magnesiumPercent: valueAfter(text, /마그네슘/),
    sodiumPercent: valueAfter(text, /나트륨/),
    energyKcalPerKg: valueAfter(text, /대사\s*에너지/, "energy"),
  };
  const cellOrder: Array<keyof FoodNutrientAnalysis> = [
    "proteinMinPercent",
    "fatMinPercent",
    "fiberMaxPercent",
    "ashMaxPercent",
    "moistureMaxPercent",
    "calciumMinPercent",
    "phosphorusMinPercent",
    "omega6Percent",
    "omega3Percent",
    "magnesiumPercent",
    "sodiumPercent",
  ];
  for (const match of text.matchAll(/\[라벨사진\s*\d+\s*·\s*성분표셀\s*(\d+)\]([\s\S]*?)(?=\[라벨사진|$)/gi)) {
    const cellIndex = Number(match[1]) - 1;
    const key = cellOrder[cellIndex];
    const normalizedCellText = match[2].replace(/(\d)\s*\.\s*(\d)/g, "$1.$2");
    const numericMatches = [...normalizedCellText.matchAll(/(\d+(?:\.\d+)?)\s*%?/g)];
    // Omega labels contain a number (for example, "오메가-6"), so the first
    // number is often part of the label. The measured percentage is the last
    // number in each detected table cell.
    const value = toNumber(numericMatches.at(-1)?.[1]);
    if (key && nutrients[key] == null && value != null) nutrients[key] = value;
  }

  let ingredients = cleanSection(
    text.match(/사용\s*재료\s*([\s\S]*?)(?=비타민\s*(?:및|&)\s*미네랄|기술\s*첨가제|$)/i)?.[1],
  );
  if (!ingredients) {
    const vitaminIndex = text.search(/비타민\s*(?:및|&)\s*미네랄/i);
    const markerIndex = vitaminIndex >= 0 ? text.lastIndexOf("[라벨사진", vitaminIndex) : -1;
    const markerEnd = markerIndex >= 0 ? text.indexOf("]", markerIndex) + 1 : -1;
    if (markerEnd > 0 && vitaminIndex > markerEnd) ingredients = cleanSection(text.slice(markerEnd, vitaminIndex));
  }
  const vitaminsMinerals = cleanSection(
    text.match(/비타민\s*(?:및|&)\s*미네랄(?:\s*\/\s*kg)?\s*([\s\S]*?)(?=기술\s*첨가제|$)/i)?.[1],
  );
  const additives = cleanSection(
    text.match(/기술\s*첨가제\s*([\s\S]*?)$/i)?.[1],
  );
  const detectedFieldCount = Object.values(nutrients).filter(value => value != null).length
    + [ingredients, vitaminsMinerals, additives].filter(Boolean).length;

  return { nutrients, ingredients, vitaminsMinerals, additives, detectedFieldCount };
}
