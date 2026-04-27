import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { AIServiceResponse, TeerResult } from "../types/scraper";
import { validateAndCleanResult, deduplicateResults } from "./validator";

// ─── Gemini Configuration ────────────────────────────────────────────────────
const GEMINI_MODEL = "gemini-2.0-flash";
const MAX_OUTPUT_TOKENS = 65536;
const TEMPERATURE = 0.05; // Near-deterministic for data extraction

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

function getModel(): GenerativeModel {
  if (!model) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY not configured");
    genAI = new GoogleGenerativeAI(key);
    model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        temperature: TEMPERATURE,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        topP: 0.8,
        topK: 40,
      },
    });
  }
  return model;
}

// ─── Extraction Prompt ───────────────────────────────────────────────────────
const EXTRACTION_PROMPT = `You are an elite data-extraction engine. Your ONLY job is to find the MAIN/DAY Teer lottery results in the provided text.

CRITICAL RULES:
1. 🚨 STRICT EXCLUSION: COMPLETELY IGNORE ANY RESULTS LABELED AS "NIGHT", "EVENING", "NIGHT TEER", OR "SECOND SESSION". YOU MUST ONLY EXTRACT THE MAIN (DAY) TEER RESULTS. NEVER MIX DAY AND NIGHT SESSIONS.
2. The text may contain results for MULTIPLE games (e.g., Shillong, Khanapara). Extract ONLY the results for the game mentioned in the TARGET GAME CONTEXT.
3. Extract exactly FR (First Round) and SR (Second Round). For Laitlyngkot, also extract TR (Third Round). All values must be 2-digit numbers (00-99).
4. If a round is pending/awaited/missing, output "XX". Do NOT output null.
5. Do NOT hallucinate. Only extract values exactly as they appear in the text.
6. If the same date has multiple values but one is explicitly Night, ONLY USE THE DAY RESULT. If there are duplicates, output the most complete/recent DAY run.
7. Pay special attention to Laitlyngkot tables where Day results are condensed into a single column like "51-90-88". You MUST split this string into FR=51, SR=90, TR=88.

TARGET GAME CONTEXT: {GAME_CONTEXT}

OUTPUT FORMAT — Return ONLY a valid JSON array, no explanation, no markdown fences:
[
  {"date": "YYYY-MM-DD", "round1": "45", "round2": "67", "round3": "89"},
  {"date": "YYYY-MM-DD", "round1": "23", "round2": "XX", "round3": "XX"}
]

If there are no valid Day results for {GAME_CONTEXT} at all, return: []

TEXT TO EXTRACT FROM:
`;

// ─── Chunking ────────────────────────────────────────────────────────────────
export function chunkText(text: string, chunkSize: number = 15000): string[] {
  if (text.length <= chunkSize) return [text];

  const chunks: string[] = [];
  let start = 0;
  const overlap = 2000; // Overlap to avoid splitting a result across chunks

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
    if (start >= text.length) break;
  }

  return chunks;
}

// ─── Core AI Parsing ─────────────────────────────────────────────────────────
function parseAIResponse(text: string): TeerResult[] {
  const results: TeerResult[] = [];

  let jsonStr = text.trim();

  // Strip markdown code fences if AI wraps in them
  jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  // Find the JSON array
  const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error("[AI Parser] No JSON array found in response");
    console.log("[AI Parser] Raw AI Output block:", jsonStr.substring(0, 1000));
    return results;
  }
  jsonStr = jsonMatch[0];

  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) {
      console.error("[AI Parser] Response is not an array");
      return results;
    }

    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;

      const result: TeerResult = {
        date: item.date || "",
        round1: item.round1 ?? item.round_1 ?? item.first_round ?? item.fr ?? item.FR ?? null,
        round2: item.round2 ?? item.round_2 ?? item.second_round ?? item.sr ?? item.SR ?? null,
        round3: item.round3 ?? item.round_3 ?? item.third_round ?? item.tr ?? item.TR ?? null,
      };

      // Keep XX passed down to validator
      if (result.round1 === "null") result.round1 = null;
      if (result.round2 === "null") result.round2 = null;
      if (result.round3 === "null") result.round3 = null;

      const cleaned = validateAndCleanResult(result);
      if (cleaned) {
        results.push(cleaned);
      }
    }
  } catch (err) {
    console.error("[AI Parser] JSON parse error:", err);
    console.log("[AI Parser] Raw response (first 500 chars):", jsonStr.substring(0, 500));
  }

  return results;
}

export async function parseWithAI(
  content: string,
  context?: string,
): Promise<AIServiceResponse> {
  const startTime = Date.now();

  try {
    const geminiModel = getModel();
    const gameContext = context || "Unknown Teer game";
    const prompt = EXTRACTION_PROMPT.replace(/\{GAME_CONTEXT\}/g, gameContext) + content;

    console.log(`[AI Parser] Sending ${content.length} chars to Gemini (context: ${gameContext})`);

    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract token usage
    const usage = response.usageMetadata;
    const totalTokens = usage?.totalTokenCount || 0;
    const inputTokens = usage?.promptTokenCount || 0;
    const outputTokens = usage?.candidatesTokenCount || 0;

    // Gemini 2.0 Flash pricing: ~$0.10/1M input, ~$0.40/1M output
    const estimatedCost = (inputTokens * 0.10 + outputTokens * 0.40) / 1_000_000;

    const elapsed = Date.now() - startTime;
    console.log(`[AI Parser] Response: ${totalTokens} tokens, ~$${estimatedCost.toFixed(6)}, ${elapsed}ms`);

    const results = parseAIResponse(text);
    console.log(`[AI Parser] Extracted ${results.length} valid results`);

    return {
      success: results.length > 0,
      results,
      cost: estimatedCost,
      tokensUsed: totalTokens,
      error: results.length === 0 ? "No valid results extracted by AI" : undefined,
    };
  } catch (err: any) {
    const elapsed = Date.now() - startTime;
    console.error(`[AI Parser] Error after ${elapsed}ms:`, err.message);

    return {
      success: false,
      results: [],
      cost: 0,
      tokensUsed: 0,
      error: err.message,
    };
  }
}

// ─── Retry Wrapper ───────────────────────────────────────────────────────────
export async function parseWithAIWithRetry(
  content: string,
  context?: string,
  maxRetries: number = 3
): Promise<AIServiceResponse> {
  let lastError = "";
  let totalCost = 0;
  let totalTokens = 0;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`[AI Parser] Attempt ${attempt}/${maxRetries}`);

    const result = await parseWithAI(content, context);
    totalCost += result.cost;
    totalTokens += result.tokensUsed;

    if (result.success) {
      return { ...result, cost: totalCost, tokensUsed: totalTokens };
    }

    lastError = result.error || "Unknown error";
    console.log(`[AI Parser] Attempt ${attempt} failed: ${lastError}`);

    if (result.error && (result.error.includes("429") || result.error.includes("Resource exhausted"))) {
      const delay = Math.min(10000 * Math.pow(2, attempt - 1), 60000); // 10s, 20s, 40s...
      console.log(`[AI Parser] Rate limit hit (429). Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    } else if (attempt < maxRetries) {
      const delay = 3000 * attempt;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    results: [],
    cost: totalCost,
    tokensUsed: totalTokens,
    error: `All ${maxRetries} attempts failed. Last error: ${lastError}`,
  };
}

// ─── Multi-Chunk Processing ──────────────────────────────────────────────────
export async function processChunks(
  chunks: string[],
  context: string,
  onProgress?: (index: number, total: number) => void
): Promise<AIServiceResponse> {
  const allResults: TeerResult[] = [];
  let totalTokens = 0;
  let totalCost = 0;
  let failedChunks = 0;

  for (let i = 0; i < chunks.length; i++) {
    if (onProgress) onProgress(i + 1, chunks.length);

    const chunkResult = await parseWithAIWithRetry(
      chunks[i],
      `${context} (chunk ${i + 1}/${chunks.length})`
    );

    if (chunkResult.success) {
      allResults.push(...chunkResult.results);
      totalTokens += chunkResult.tokensUsed;
      totalCost += chunkResult.cost;
    } else {
      failedChunks++;
    }

    // Rate limit between chunks to avoid 429s (especially important in backfills)
    if (i < chunks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2500)); // Increased to 2.5s
    }
  }

  const mergedResults = mergeChunkResults(allResults);

  return {
    success: mergedResults.length > 0,
    results: mergedResults,
    cost: totalCost,
    tokensUsed: totalTokens,
    error: failedChunks === chunks.length ? "All chunks failed" :
      failedChunks > 0 ? `${failedChunks}/${chunks.length} chunks failed` : undefined,
  };
}

export function mergeChunkResults(results: TeerResult[]): TeerResult[] {
  // Keep the last occurrence per date (most recent data wins)
  const seen = new Map<string, TeerResult>();

  for (const result of results) {
    const key = result.date;
    const existing = seen.get(key);

    if (!existing) {
      seen.set(key, result);
    } else {
      // Prefer the result that has more rounds filled
      const newFilled = [result.round1, result.round2, result.round3].filter(v => v && v !== "XX").length;
      const existingFilled = [existing.round1, existing.round2, existing.round3].filter(v => v && v !== "XX").length;

      if (newFilled > existingFilled) {
        seen.set(key, result);
      } else if (newFilled === existingFilled) {
        // Merge partial data if both are partially filled
        seen.set(key, {
          date: result.date,
          round1: result.round1 ?? existing.round1,
          round2: result.round2 ?? existing.round2,
          round3: result.round3 ?? existing.round3,
        });
      }
    }
  }

  return deduplicateResults(Array.from(seen.values()));
}
