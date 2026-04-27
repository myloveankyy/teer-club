import { TeerResult } from "../types/scraper";
import { normalizeDate, normalizeRoundValue, validateAndCleanResult, deduplicateResults } from "./validator";

/**
 * Regex-Based Text Extraction
 * Optimized for unstructured regional teer sites.
 */

const DATE_PATTERNS = [
  /(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/g,
  /(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/g,
  /(\d{1,2})(?:st|nd|rd|th)?\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{4})/gi,
  /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/gi,
];

export function regexExtract(text: string): TeerResult[] {
  const results: TeerResult[] = [];

  // Strategy 1: Multi-line Block Pattern
  for (const pattern of DATE_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const dateStr = normalizeDate(match[0]);
      if (!dateStr) continue;

      const datePos = match.index;
      // Capture a window around the date
      const window = text.substring(datePos, datePos + 300);

      // CRITICAL: We must ignore numbers that were part of the date match itself 
      // (e.g. if match[0] is "25 April 2026", we must ignore "25" and "2026")
      const nums = extractNumbersFromWindow(window, match[0]);

      if (nums.length >= 1) {
        const result = validateAndCleanResult({
          date: dateStr,
          round1: normalizeRoundValue(nums[0]),
          round2: nums.length > 1 ? normalizeRoundValue(nums[1]) : null,
          round3: nums.length > 2 ? normalizeRoundValue(nums[2]) : null,
          sourceMethod: "REGEX_WINDOW"
        });
        if (result) results.push(result);
      }
    }
  }

  // Strategy 2: Traditional Line Pattern (Fallback)
  const lines = text.split(/[\n\r]+/).map(l => l.trim()).filter(l => l.length > 0);
  for (const line of lines) {
    for (const pattern of DATE_PATTERNS) {
      pattern.lastIndex = 0;
      const m = pattern.exec(line);
      if (m) {
        const dateStr = normalizeDate(m[0]);
        if (dateStr) {
          const nums = extractNumbersFromWindow(line, m[0]);
          if (nums.length > 0) {
            const result = validateAndCleanResult({
              date: dateStr,
              round1: normalizeRoundValue(nums[0]),
              round2: nums.length > 1 ? normalizeRoundValue(nums[1]) : null,
              round3: null,
              sourceMethod: "REGEX_LINE"
            });
            if (result) results.push(result);
          }
        }
      }
    }
  }

  return deduplicateResults(results);
}

function extractNumbersFromWindow(text: string, dateMatchStr: string): string[] {
  const nums: string[] = [];
  const tempPattern = /\b(\d{2})\b/g;
  let match;

  while ((match = tempPattern.exec(text)) !== null) {
    const val = match[1];
    const pos = match.index;

    // Boundary check to avoid dates and times
    const before = text.substring(Math.max(0, pos - 1), pos);
    const after = text.substring(pos + 2, pos + 3);

    if (/[-/.:]/.test(before) || /[-/.:]/.test(after)) continue;

    // NEW: Strictly ignore if this number is part of the dateMatchStr 
    // Example: "25 April 2026" contains "25". 
    // Since our 'text' window starts AT the date match index in Strategy 1, 
    // we can check if the current 'match' position is within the dateMatchStr length.
    if (pos < dateMatchStr.length) {
      if (dateMatchStr.includes(val)) {
        // This is a component of the date (like 25, 04, 26)
        continue;
      }
    }

    // Ignore 4-digit numbers (handled by \b but just in case)
    const longMatch = text.substring(Math.max(0, pos - 1), pos + 3);
    if (/\d{3,}/.test(longMatch)) continue;

    nums.push(val);
  }
  return nums;
}
