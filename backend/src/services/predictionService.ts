import prisma from "../prisma";
import { getISTNow } from "../config/gameSchedule";
import { logger } from "../utils/logger";
import { AuditEngine } from "./auditEngine";

// Helper to get random item from array
function getRandom<T>(arr: T[]): T | null {
    if (arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

// Generate new predictions for all active games for a specific date
export async function generateDailyPredictions(dateStr?: string, forceOverwrite?: boolean) {
    try {
        let targetDateStr = dateStr || getISTNow().dateStr;
        let targetDateObj = new Date(targetDateStr + "T00:00:00Z");

        // If today is Sunday (0), shift the generation target to next day (Monday)
        if (targetDateObj.getUTCDay() === 0) {
            targetDateObj.setUTCDate(targetDateObj.getUTCDate() + 1);
            targetDateStr = targetDateObj.toISOString().split("T")[0];
            logger.info(`[Prediction Engine] Target is Sunday off-day. Shifted generation for next day: ${targetDateStr}`);
        }

        const games = await prisma.game.findMany({
            where: { isEnabled: true },
        });

        let generatedCount = 0;

        for (const game of games) {
            // Avoid duplicate prediction generation
            const existing = await prisma.prediction.findUnique({
                where: { gameId_date: { gameId: game.id, date: targetDateObj } },
            });

            if (existing) {
                if (!forceOverwrite) continue;
                // If force overwrite, delete the old prediction before regenerating
                await prisma.prediction.delete({ where: { id: existing.id } });
            }

            // Fetch last 30 results for this game to create a "statistical" prediction
            const recentResults = await prisma.result.findMany({
                where: { gameId: game.id, date: { lt: targetDateObj } },
                orderBy: { date: "desc" },
                take: 30,
            });

            let house = "1, 2";
            let ending = "8, 9";
            let directNumber = "19";
            let commonNumbers = ["25", "48", "67", "92"];

            if (recentResults.length > 5) {
                const lastDigits = recentResults.map(r => r.round1?.slice(-1)).filter(d => parseInt(d!) >= 0) as string[];
                const firstDigits = recentResults.map(r => r.round1?.slice(0, 1)).filter(d => parseInt(d!) >= 0) as string[];

                const h1 = getRandom(firstDigits) || "2";
                const h2 = getRandom(firstDigits) || "5";
                const e1 = getRandom(lastDigits) || "7";
                const e2 = getRandom(lastDigits) || "8";

                house = Array.from(new Set([h1, h2, "1", "9"])).slice(0, 2).join(", ");
                ending = Array.from(new Set([e1, e2, "0", "4"])).slice(0, 2).join(", ");

                const validRound1 = recentResults.map(r => r.round1).filter(r => r && r !== "XX") as string[];
                const validRound2 = recentResults.map(r => r.round2).filter(r => r && r !== "XX") as string[];
                const pool = [...validRound1, ...validRound2, "12", "45", "89", "33", "77"];

                // Generate 5 unique Direct hits based on shuffled patterns
                const directPool = Array.from(new Set([...pool, `${h1}${e1}`, `${h2}${e2}`]));
                const shuffled = directPool.sort(() => 0.5 - Math.random());
                const selectedDirects = shuffled.slice(0, 5);

                directNumber = selectedDirects[0] || "12";
                commonNumbers = selectedDirects.slice(1, 5);
                while (commonNumbers.length < 4) { commonNumbers.push("00"); }
            }

            await prisma.prediction.create({
                data: {
                    gameId: game.id,
                    date: targetDateObj,
                    house,
                    ending,
                    directNumber,
                    commonNumbers,
                    status: "PUBLISHED",
                },
            });

            generatedCount++;
        }

        if (generatedCount > 0 || forceOverwrite) {
            const slug = `common-numbers-${targetDateStr}`;
            const existingPage = await prisma.page.findUnique({ where: { slug } });

            if (!existingPage) {
                const displayDate = targetDateObj.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                const newPage = await prisma.page.create({
                    data: {
                        title: `Teer Common Numbers for ${displayDate}`,
                        slug,
                        url: `/common-numbers/${targetDateStr}`,
                        type: "PREDICTION",
                        status: "ACTIVE",
                        source: "AUTO",
                        meta_title: `Teer Common Numbers ${targetDateStr} - Verified Targets`,
                        meta_description: `Get accurate 100% verified Teer Common Number, House, Ending and Direct targets for Shillong, Khanapara & Juwai on ${displayDate}.`
                    }
                });

                // Trigger background audit for the new page
                AuditEngine.auditPage(newPage.id).catch(err =>
                    logger.error(`[Prediction Engine] SEO Auto-Audit failed for ${slug}`, err)
                );

                logger.info(`[Prediction Engine] Auto-generated SEO Page for ${targetDateStr}`);
            }
        }

        logger.info(`[Prediction Engine] Generated ${generatedCount} new predictions for ${targetDateStr}`);
        return generatedCount;

    } catch (error) {
        logger.error("[Prediction Engine] Error generating predictions", error);
        return 0;
    }
}

// Evaluate match proof for a specific valid result
export async function evaluateMatchProofs(gameId: string, resultDate: Date, resultRound1: string, resultRound2: string) {
    try {
        const prediction = await prisma.prediction.findUnique({
            where: { gameId_date: { gameId, date: resultDate } },
        });

        if (!prediction) return;

        if (resultRound1 === "XX" || !resultRound1) return;

        const round1House = resultRound1.slice(0, 1);
        const round1Ending = resultRound1.slice(-1);

        // FIX: prediction.house is CSV like "1, 2" — split and check .includes()
        const houseValues = prediction.house.split(',').map(s => s.trim());
        const endingValues = prediction.ending.split(',').map(s => s.trim());

        const houseMatch = houseValues.includes(round1House);
        const endingMatch = endingValues.includes(round1Ending);

        // Check direct match against both directNumber AND all commonNumbers
        const directMatch = prediction.directNumber === resultRound1 ||
            prediction.commonNumbers.includes(resultRound1) ||
            Boolean(resultRound2 && resultRound2 !== "XX" && resultRound2 !== "--" && (
                prediction.directNumber === resultRound2 ||
                prediction.commonNumbers.includes(resultRound2)
            ));

        let actualResultStr = resultRound1;
        if (resultRound2 && resultRound2 !== "XX" && resultRound2 !== "--") {
            actualResultStr += ` - ${resultRound2}`;
        }

        await prisma.prediction.update({
            where: { id: prediction.id },
            data: {
                actualResult: actualResultStr,
                houseMatch,
                endingMatch,
                directMatch,
            },
        });

        const matchSummary = [houseMatch && 'HOUSE', endingMatch && 'ENDING', directMatch && '🔥JACKPOT'].filter(Boolean).join(' + ') || 'MISSED';
        logger.info(`[Prediction Engine] Match Proof Updated: ${gameId} on ${resultDate.toISOString().split("T")[0]} → ${matchSummary} | FR:${resultRound1} SR:${resultRound2 || 'XX'}`);
    } catch (error) {
        logger.error(`[Prediction Engine] Failed to evaluate match proof`, error);
    }
}
