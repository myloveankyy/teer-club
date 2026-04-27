import { TeerResult } from "../types/scraper";

// ─── Date Validation ─────────────────────────────────────────────────────────
export function isValidDate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== "string") return false;

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;

  const date = new Date(dateStr + "T00:00:00Z");
  if (isNaN(date.getTime())) return false;

  // Sanity: date should be between 2000 and 2030
  const year = date.getUTCFullYear();
  return year >= 2000 && year <= 2030;
}

// ─── Teer Number Validation ──────────────────────────────────────────────────
export function isValidTeerNumber(value: string | null): boolean {
  if (value === null || value === undefined) return true; // Pending results
  if (typeof value !== "string") return false;

  const trimmed = value.trim();
  if (trimmed.toLowerCase() === "xx" || trimmed === "--" || trimmed === "") return true;

  const num = parseInt(trimmed, 10);
  return /^\d{2}$/.test(trimmed) && num >= 0 && num <= 99;
}

// ─── Result Validation ───────────────────────────────────────────────────────
export function validateResult(result: TeerResult): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!isValidDate(result.date)) {
    errors.push(`Invalid date format: ${result.date}`);
  }

  if (!isValidTeerNumber(result.round1)) {
    errors.push(`Invalid round1 value: ${result.round1}`);
  }

  if (!isValidTeerNumber(result.round2)) {
    errors.push(`Invalid round2 value: ${result.round2}`);
  }

  if (result.round3 !== undefined && !isValidTeerNumber(result.round3)) {
    errors.push(`Invalid round3 value: ${result.round3}`);
  }

  return { valid: errors.length === 0, errors };
}

// ─── Clean & Validate Result ─────────────────────────────────────────────────
export function validateAndCleanResult(result: TeerResult): TeerResult | null {
  const normDate = normalizeDate(result.date);
  if (!normDate || !isValidDate(normDate)) return null;

  const cleaned: TeerResult = {
    date: normDate,
    round1: "XX",
    round2: "XX",
    round3: "XX",
    game: result.game,
  };

  // IST Date Context
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(Date.now() + istOffset);
  const todayIST = istNow.toISOString().split("T")[0]; // "YYYY-MM-DD"

  // Compare strings to avoid timezone shift in new Date()
  if (normDate > todayIST) {
    return null; // Future record
  }

  const isToday = normDate === todayIST;
  const isBeforePublicRelease = istNow.getUTCHours() < 9; // ~2:30 PM IST

  if (isToday && isBeforePublicRelease) {
    cleaned.round1 = "XX";
    cleaned.round2 = "XX";
    cleaned.round3 = "XX";
    return cleaned;
  }

  // Helper to normalize individual rounds
  const processRound = (val: string | null | undefined) => {
    if (val === undefined) return "XX";
    const v = val?.trim().toLowerCase();
    if (!v || v === "xx" || v === "--" || v === "x" || v === "off" || v === "holiday" || v === "sunday" || v === "closed") {
      return "XX";
    }
    return normalizeRoundValue(val) || "XX";
  };

  cleaned.round1 = processRound(result.round1);
  cleaned.round2 = processRound(result.round2);
  cleaned.round3 = processRound(result.round3);

  return cleaned;
}

// ─── Deduplication ───────────────────────────────────────────────────────────
export function deduplicateResults(results: TeerResult[]): TeerResult[] {
  const seen = new Map<string, TeerResult>();

  for (const result of results) {
    if (!result.date) continue;

    const existing = seen.get(result.date);
    if (!existing) {
      seen.set(result.date, result);
    } else {
      // Merge: keep real numbers, don't let XX overwrite existing numbers
      const mergeVal = (newV: string | null, oldV: string | null) => {
        if (newV && newV !== "XX" && newV !== "—" && newV !== "--") return newV;
        return oldV;
      };

      seen.set(result.date, {
        date: result.date,
        round1: mergeVal(result.round1, existing.round1),
        round2: mergeVal(result.round2, existing.round2),
        round3: mergeVal(result.round3, existing.round3),
        game: result.game || existing.game,
      });
    }
  }

  return Array.from(seen.values()).sort((a, b) => b.date.localeCompare(a.date));
}

// ─── Date Normalization (Handles every format) ───────────────────────────────
const MONTH_MAP: Record<string, string> = {
  jan: "01", january: "01",
  feb: "02", february: "02",
  mar: "03", march: "03",
  apr: "04", april: "04",
  may: "05",
  jun: "06", june: "06",
  jul: "07", july: "07",
  aug: "08", august: "08",
  sep: "09", sept: "09", september: "09",
  oct: "10", october: "10",
  nov: "11", november: "11",
  dec: "12", december: "12",
};

export function normalizeDate(dateStr: string): string | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();

  // 1. Try to find a date pattern in the string (DD-MM-YYYY, DD/MM/YYYY, DD.MM.YYYY)
  const ddmmyyyyMatch = trimmed.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (ddmmyyyyMatch) {
    const day = ddmmyyyyMatch[1].padStart(2, "0");
    const month = ddmmyyyyMatch[2].padStart(2, "0");
    const year = ddmmyyyyMatch[3];
    if (parseInt(month) <= 12 && parseInt(day) <= 31) {
      return `${year}-${month}-${day}`;
    }
  }

  // 2. Try YYYY-MM-DD
  const yyyymmddMatch = trimmed.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (yyyymmddMatch) {
    const month = yyyymmddMatch[2].padStart(2, "0");
    const day = yyyymmddMatch[3].padStart(2, "0");
    return `${yyyymmddMatch[1]}-${month}-${day}`;
  }

  // 3. Try named months: "14 Jan 2025", "January 14, 2025", etc.
  const namedMonthMatch = trimmed.match(/(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\s+(\d{4})/i);
  if (namedMonthMatch) {
    const day = namedMonthMatch[1].padStart(2, "0");
    const month = MONTH_MAP[namedMonthMatch[2].toLowerCase().substring(0, 3)];
    if (month && parseInt(day) <= 31) {
      return `${namedMonthMatch[3]}-${month}-${day}`;
    }
  }

  const reversedNamedMonthMatch = trimmed.match(/([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i);
  if (reversedNamedMonthMatch) {
    const month = MONTH_MAP[reversedNamedMonthMatch[1].toLowerCase().substring(0, 3)];
    const day = reversedNamedMonthMatch[2].padStart(2, "0");
    if (month && parseInt(day) <= 31) {
      return `${reversedNamedMonthMatch[3]}-${month}-${day}`;
    }
  }

  // 4. Try DD-MM-YY (2 digit year)
  const shortYearMatch = trimmed.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{2})\b/);
  if (shortYearMatch) {
    const day = shortYearMatch[1].padStart(2, "0");
    const month = shortYearMatch[2].padStart(2, "0");
    const shortYear = parseInt(shortYearMatch[3]);
    const year = shortYear > 50 ? `19${shortYearMatch[3]}` : `20${shortYearMatch[3]}`;
    if (parseInt(month) <= 12 && parseInt(day) <= 31) {
      return `${year}-${month}-${day}`;
    }
  }

  return null;
}

// ─── Round Value Normalization ───────────────────────────────────────────────
export function normalizeRoundValue(value: string | null): string | null {
  if (value === null || value === undefined) return "XX";

  const trimmed = value.trim().toLowerCase();
  if (!trimmed || trimmed === "xx" || trimmed === "x" || trimmed === "--" || trimmed === "-" || trimmed === "off" || trimmed === "holiday") {
    return "XX";
  }

  // INDUSTRY GRADE: Reject numbers that look like years or are too long
  if (trimmed.length > 3) return "XX";

  // Extract digits
  const numMatch = trimmed.match(/(\d{1,2})/);
  if (!numMatch) return "XX";

  let numStr = numMatch[1];

  // Rule: pad single digits
  const result = numStr.padStart(2, "0");

  // Prevent common false positives from dates (like today being 14 and picking 14)
  // This is hard without context, but we can at least avoid 3+ digit accidental matches
  return result;
}

// ─── Parse Result Validation ─────────────────────────────────────────────────
export function validateParseResult(
  results: TeerResult[],
  minValidCount: number = 1
): { valid: boolean; reason?: string } {
  if (results.length === 0) {
    return { valid: false, reason: "No results found" };
  }

  const validResults = results.filter(r => validateResult(r).valid);

  if (validResults.length === 0) {
    return { valid: false, reason: "All results failed validation" };
  }

  if (validResults.length < minValidCount) {
    return {
      valid: true,
      reason: `Low result count: ${validResults.length} < ${minValidCount}`,
    };
  }

  return { valid: true };
}
