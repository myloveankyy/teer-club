import { TeerResult } from "../types/scraper";

export interface ParsedResult {
  date: string;
  round1: string | null;
  round2: string | null;
  confidence: string;
}

export interface AggregatedResult {
  date: Date;
  round1: string | null;
  round2: string | null;
  confidence: string;
  sourceCount: number;
}

export function aggregateResults(resultsBySource: ParsedResult[][]): AggregatedResult[] {
  const dateMap = new Map<string, { r1Votes: Map<string, number>; r2Votes: Map<string, number> }>();

  for (const sourceResults of resultsBySource) {
    for (const result of sourceResults) {
      const dateKey = result.date;
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { r1Votes: new Map(), r2Votes: new Map() });
      }
      const entry = dateMap.get(dateKey)!;

      if (result.round1) {
        const count = entry.r1Votes.get(result.round1) || 0;
        entry.r1Votes.set(result.round1, count + 1);
      }
      if (result.round2) {
        const count = entry.r2Votes.get(result.round2) || 0;
        entry.r2Votes.set(result.round2, count + 1);
      }
    }
  }

  const aggregated: AggregatedResult[] = [];

  for (const [dateKey, votes] of dateMap) {
    const r1Winner = getMostVoted(votes.r1Votes);
    const r2Winner = getMostVoted(votes.r2Votes);
    const totalVotes = Math.max(
      Array.from(votes.r1Votes.values()).reduce((a, b) => a + b, 0),
      Array.from(votes.r2Votes.values()).reduce((a, b) => a + b, 0)
    );

    aggregated.push({
      date: new Date(dateKey),
      round1: r1Winner.value,
      round2: r2Winner.value,
      confidence: getConfidenceLevel(totalVotes, votes.r1Votes.size + votes.r2Votes.size),
      sourceCount: totalVotes,
    });
  }

  return aggregated;
}

function getMostVoted(votes: Map<string, number>): { value: string | null; count: number } {
  let winner = { value: null as string | null, count: 0 };
  for (const [value, count] of votes) {
    if (count > winner.count) {
      winner = { value, count };
    }
  }
  return winner;
}

function getConfidenceLevel(totalVotes: number, sourceCount: number): string {
  if (totalVotes >= sourceCount * 2) return "HIGH";
  if (totalVotes >= sourceCount) return "MEDIUM";
  return "LOW";
}
