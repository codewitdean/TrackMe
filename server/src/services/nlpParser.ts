import { addDays, startOfDay, subDays } from "date-fns";

export interface ParsedEntry {
  rawText: string;
  habitName?: string;
  action?: string;
  quantity?: number;
  unit?: string;
  date?: Date;
  category?: string;
  confidence: number;
  needsConfirmation: boolean;
  message: string;
}

interface HabitKeywordRule {
  habitName: string;
  category: string;
  action: string;
  keywords: RegExp[];
  defaultUnit?: string;
}

const habitRules: HabitKeywordRule[] = [
  {
    habitName: "Running",
    category: "Fitness",
    action: "ran",
    keywords: [/\bran\b/, /\brun(?:ning)?\b/, /\bjogg?ed\b/, /\bjogging\b/],
    defaultUnit: "miles"
  },
  {
    habitName: "Walking",
    category: "Fitness",
    action: "walked",
    keywords: [/\bwalk(?:ed|ing)?\b/],
    defaultUnit: "miles"
  },
  {
    habitName: "Water",
    category: "Health",
    action: "drank",
    keywords: [/\bdrank\b/, /\bdrink(?:ing)?\b/, /\bwater\b/, /\bhydrat(?:ed|ion|e)\b/],
    defaultUnit: "cups"
  },
  {
    habitName: "Studying",
    category: "Learning",
    action: "studied",
    keywords: [/\bstud(?:y|ied|ying)\b/, /\bjavascript\b/, /\bcoded?\b/, /\bcoding\b/],
    defaultUnit: "minutes"
  },
  {
    habitName: "Reading",
    category: "Learning",
    action: "read",
    keywords: [/\bread(?:ing)?\b/, /\bpages?\b/],
    defaultUnit: "minutes"
  },
  {
    habitName: "Sleep",
    category: "Recovery",
    action: "slept",
    keywords: [/\bslept\b/, /\bsleep(?:ing)?\b/, /\bnap(?:ped)?\b/],
    defaultUnit: "hours"
  },
  {
    habitName: "Meditation",
    category: "Mindfulness",
    action: "meditated",
    keywords: [/\bmeditat(?:ed|e|ing|ion)\b/, /\bmindful(?:ness)?\b/],
    defaultUnit: "minutes"
  },
  {
    habitName: "Workout",
    category: "Fitness",
    action: "worked out",
    keywords: [/\bgym\b/, /\bworkout\b/, /\bworked out\b/, /\bexercise(?:d)?\b/, /\bexercising\b/],
    defaultUnit: "minutes"
  }
];

const unitAliases: Record<string, string> = {
  mile: "miles",
  miles: "miles",
  mi: "miles",
  cup: "cups",
  cups: "cups",
  glass: "cups",
  glasses: "cups",
  minute: "minutes",
  minutes: "minutes",
  min: "minutes",
  mins: "minutes",
  hour: "hours",
  hours: "hours",
  hr: "hours",
  hrs: "hours",
  page: "pages",
  pages: "pages",
  rep: "reps",
  reps: "reps",
  set: "sets",
  sets: "sets"
};

const numberWords: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  half: 0.5
};

function normalize(text: string) {
  return text.toLowerCase().replace(/[^\w\s.]/g, " ").replace(/\s+/g, " ").trim();
}

function parseQuantityAndUnit(text: string, defaultUnit?: string) {
  const unitPattern = Object.keys(unitAliases).join("|");
  const quantityPattern = `\\d+(?:\\.\\d+)?|${Object.keys(numberWords).join("|")}`;
  const match = text.match(new RegExp(`\\b(${quantityPattern})\\s*(${unitPattern})\\b`, "i"));

  if (!match) {
    return { quantity: undefined, unit: defaultUnit };
  }

  const quantityToken = match[1].toLowerCase();
  const quantity = numberWords[quantityToken] ?? Number(quantityToken);
  const unit = unitAliases[match[2].toLowerCase()];

  return {
    quantity: Number.isFinite(quantity) ? quantity : undefined,
    unit
  };
}

function parseDate(text: string) {
  const today = startOfDay(new Date());

  if (/\byesterday\b|\blast night\b/.test(text)) {
    return subDays(today, 1);
  }

  if (/\btomorrow\b/.test(text)) {
    return addDays(today, 1);
  }

  // "today", "this morning", and "tonight" all resolve to the current day.
  return today;
}

function findHabitRule(text: string) {
  return habitRules.find((rule) => rule.keywords.some((keyword) => keyword.test(text)));
}

export function parseNaturalHabitEntry(rawText: string): ParsedEntry {
  const text = normalize(rawText);
  const rule = findHabitRule(text);
  const { quantity, unit } = parseQuantityAndUnit(text, rule?.defaultUnit);
  const date = parseDate(text);

  const missing: string[] = [];
  if (!rule) missing.push("habit");
  if (!quantity) missing.push("quantity");
  if (!unit) missing.push("unit");

  const confidence =
    (rule ? 0.4 : 0) + (quantity ? 0.25 : 0) + (unit ? 0.2 : 0) + (date ? 0.15 : 0);

  const needsConfirmation = missing.length > 0 || confidence < 0.75;
  const message = needsConfirmation
    ? `I parsed part of this entry, but please confirm or edit the ${missing.join(", ")}.`
    : "Entry parsed successfully. Please confirm before saving.";

  return {
    rawText,
    habitName: rule?.habitName,
    action: rule?.action,
    quantity,
    unit,
    date,
    category: rule?.category,
    confidence: Number(confidence.toFixed(2)),
    needsConfirmation,
    message
  };
}

export const sampleNlpEntries = [
  "I ran 2 miles today",
  "Drank 4 cups of water",
  "Studied JavaScript for 45 minutes",
  "Slept 7 hours last night",
  "Meditated for 10 minutes",
  "Read for 30 minutes",
  "Went to the gym for 1 hour",
  "Walked 3 miles this morning"
];
