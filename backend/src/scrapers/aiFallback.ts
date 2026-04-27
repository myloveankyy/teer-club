export interface AIFallbackResult {
  date: string;
  round1: string | null;
  round2: string | null;
  confidence: string;
}

export async function extractWithAI(
  html: string,
  context: { sourceUrl: string; gameName: string }
): Promise<AIFallbackResult[]> {
  console.log(`[AI Fallback] Processing ${context.sourceUrl} for ${context.gameName}`);
  return [];
}
