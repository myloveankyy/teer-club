import prisma from '../prisma';
import { TeerResult } from '../types/scraper';

export interface SmartUpsertResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export async function smartUpsertResults(
  gameId: string,
  results: TeerResult[],
  force: boolean = false
): Promise<SmartUpsertResult> {
  const stats = { created: 0, updated: 0, skipped: 0, errors: [] as string[] };

  try {
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) throw new Error("Game not found");

    for (const result of results) {
      try {
        const dateObj = new Date(result.date);
        if (isNaN(dateObj.getTime())) {
          stats.skipped++;
          continue;
        }

        // Production Rule: Number must be 00-99 or XX or --
        const isValid = (v: string | null) => !v || v.toUpperCase() === 'XX' || v === '--' || (/^\d{1,3}$/.test(v) && parseInt(v) >= 0 && parseInt(v) <= 99);

        let newRound1 = result.round1 && isValid(result.round1) ? result.round1.padStart(2, '0') : null;
        let newRound2 = result.round2 && isValid(result.round2) ? result.round2.padStart(2, '0') : null;
        let newRound3 = result.round3 && isValid(result.round3) ? result.round3.padStart(2, '0') : null;

        // Enforce Game Rules: If game doesn't have a round, it MUST be null.
        if (!game.hasRound3) newRound3 = null;

        const existing = await prisma.result.findUnique({
          where: {
            gameId_date: {
              gameId,
              date: dateObj,
            },
          },
        });

        if (!existing) {
          if (!newRound1 && !newRound2 && !newRound3) {
            stats.skipped++;
            continue;
          }
          await prisma.result.create({
            data: {
              gameId,
              date: dateObj,
              round1: newRound1,
              round2: newRound2,
              round3: newRound3,
              confidence: 'LOW',
              verified: false,
              detectedAt: new Date(),
            },
          });
          stats.created++;
          continue;
        }

        // Logic for Update:
        // 1. If 'force' is true, always update if data is different.
        // 2. Otherwise, only fill in empty cells or replace XX with numbers.
        // 3. IMPORTANT: If current round exists and matches new round, do nothing.
        // 4. FORCE NULL: If game says no round 3 but existing has round 3, we MUST clear it.

        const isDifferent =
          (newRound1 && existing.round1 !== newRound1) ||
          (newRound2 && existing.round2 !== newRound2) ||
          (newRound3 && existing.round3 !== newRound3);

        const needsUpdate = force ? isDifferent : (
          (newRound1 && (!existing.round1 || existing.round1 === 'XX') && existing.round1 !== newRound1) ||
          (newRound2 && (!existing.round2 || existing.round2 === 'XX') && existing.round2 !== newRound2) ||
          (newRound3 && (!existing.round3 || existing.round3 === 'XX') && existing.round3 !== newRound3) ||
          (!game.hasRound3 && existing.round3 !== null) // Specialized cleanup rule
        );

        if (!needsUpdate) {
          stats.skipped++;
          continue;
        }

        const updateData: any = {};
        if (force) {
          if (newRound1 !== existing.round1) updateData.round1 = newRound1;
          if (newRound2 !== existing.round2) updateData.round2 = newRound2;
          if (newRound3 !== existing.round3) updateData.round3 = newRound3;
        } else {
          if (newRound1 && (!existing.round1 || existing.round1 === 'XX')) updateData.round1 = newRound1;
          if (newRound2 && (!existing.round2 || existing.round2 === 'XX')) updateData.round2 = newRound2;
          if (newRound3 && (!existing.round3 || existing.round3 === 'XX')) updateData.round3 = newRound3;
        }

        // Final cleanup enforcement
        if (!game.hasRound3 && existing.round3 !== null) updateData.round3 = null;

        updateData.confidence = 'MEDIUM';

        await prisma.result.update({
          where: { id: existing.id },
          data: updateData,
        });

        stats.updated++;
      } catch (err: any) {
        stats.errors.push(`Failed for ${result.date}: ${err.message}`);
      }
    }
  } catch (globalErr: any) {
    stats.errors.push(`Global SmartUpsert Error: ${globalErr.message}`);
  }



  return stats;
}

export async function smartUpsertBatch(
  gameId: string,
  results: TeerResult[],
  batchSize: number = 50,
  force: boolean = false
): Promise<SmartUpsertResult> {
  const totalStats: SmartUpsertResult = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  for (let i = 0; i < results.length; i += batchSize) {
    const batch = results.slice(i, i + batchSize);
    const batchResult = await smartUpsertResults(gameId, batch, force);

    totalStats.created += batchResult.created;
    totalStats.updated += batchResult.updated;
    totalStats.skipped += batchResult.skipped;
    totalStats.errors.push(...batchResult.errors);
  }

  return totalStats;
}

export async function forceUpdateResult(
  gameId: string,
  date: Date,
  round1?: string,
  round2?: string,
  round3?: string,
  confidence: string = 'HIGH'
): Promise<void> {
  await prisma.result.upsert({
    where: {
      gameId_date: {
        gameId,
        date,
      },
    },
    update: {
      round1: round1 || null,
      round2: round2 || null,
      round3: round3 || null,
      confidence,
    },
    create: {
      gameId,
      date,
      round1: round1 || null,
      round2: round2 || null,
      round3: round3 || null,
      confidence,
    },
  });
}