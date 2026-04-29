import prisma from "../prisma";
import { logger } from "../utils/logger";
import { getISTNow, getScheduleByGame, parseTime } from "../config/gameSchedule";
import { isNonWorkingDay } from "../config/holidays";
import { scrapeLiveResult } from "../scrapers/liveScraper";
import { smartUpsertResults } from "./smartUpsert";
import { writeCronLog } from "../cron/cronLogger";

let isDebugging = false;

export async function runAutoDebug() {
    if (isDebugging) {
        throw new Error("A debug process is already running. Please Wait.");
    }

    isDebugging = true;
    const startTime = Date.now();
    const { dateStr: todayStr, totalMinutes: nowMinutes } = getISTNow();

    // Calculate Yesterday
    const yesterdayDate = new Date(todayStr + "T00:00:00Z");
    yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    const report: any[] = [];

    try {
        const games = await prisma.game.findMany({ where: { isEnabled: true } });

        for (const game of games) {
            const gameReport: any = {
                game: game.displayName,
                name: game.name,
                status: "OK",
                issues: [],
                actions: []
            };

            const schedule = getScheduleByGame(game.name);
            // Default window logic: if no schedule, assume 4 PM (960 mins)
            const frTime = schedule ? parseTime(schedule.frResultTime) : 960;

            // 1. Check Yesterday
            if (!isNonWorkingDay(yesterdayStr)) {
                const result = await prisma.result.findUnique({
                    where: { gameId_date: { gameId: game.id, date: new Date(yesterdayStr + "T00:00:00Z") } }
                });

                const isMissing = !result || (!result.round1 && !result.round2);
                const isPartial = result && (!result.round1 || !result.round2);

                if (isMissing || isPartial) {
                    gameReport.status = "ERROR";
                    gameReport.issues.push(`${isMissing ? 'Missing' : 'Partial'} Previous Day Result (${yesterdayStr})`);

                    // Auto Recovery for Yesterday
                    const recovery = await recoverResult(game, yesterdayStr);
                    if (recovery.success) {
                        gameReport.actions.push(`Recovered Yesterday: SUCCESS`);
                        // Reset status if this was the only issue
                        if (gameReport.issues.length === 1) gameReport.status = "OK";
                    } else {
                        gameReport.actions.push(`Recovered Yesterday: FAILED (${recovery.error})`);
                    }
                }
            }

            // 2. Check Today (if past result time)
            if (!isNonWorkingDay(todayStr) && nowMinutes > frTime) {
                const result = await prisma.result.findUnique({
                    where: { gameId_date: { gameId: game.id, date: new Date(todayStr + "T00:00:00Z") } }
                });

                const isMissing = !result || !result.round1;

                if (isMissing) {
                    gameReport.status = "ERROR";
                    gameReport.issues.push(`Missing Today's Result (${todayStr})`);

                    // Auto Recovery for Today
                    const recovery = await recoverResult(game, todayStr);
                    if (recovery.success) {
                        gameReport.actions.push(`Recovered Today: SUCCESS`);
                        // Only change to OK if it wasn't already set to ERROR by a previous check that failed recovery
                        const hasFailedAction = gameReport.actions.some((a: string) => a.includes("FAILED"));
                        if (!hasFailedAction) gameReport.status = "OK";
                    } else {
                        gameReport.actions.push(`Recovered Today: FAILED (${recovery.error})`);
                    }
                }
            }

            // Final Status Resolution: If any action failed, status is ERROR
            if (gameReport.actions.some((a: string) => a.includes("FAILED"))) {
                gameReport.status = "ERROR";
            }

            report.push(gameReport);
        }

        // Log the debug completion
        await writeCronLog({
            game: "SYSTEM_DEBUG",
            status: "SUCCESS",
            duration: Date.now() - startTime,
            details: { report }
        });

    } catch (err: any) {
        logger.error("[AutoDebug] System Failure", err);
        throw err;
    } finally {
        isDebugging = false;
    }

    return report;
}

async function recoverResult(game: any, dateStr: string) {
    try {
        // Use the updated scrapeLiveResult with targetDate
        const result = await scrapeLiveResult(game, dateStr);

        if (result.success && result.date === dateStr && (result.round1 || result.round2)) {
            await smartUpsertResults(game.id, [{
                date: result.date,
                round1: result.round1,
                round2: result.round2,
                round3: result.round3,
                sourceMethod: "DEBUG_RECOVERY"
            }]);
            return { success: true };
        }

        return {
            success: false,
            error: result.status === "STALE_DATA"
                ? `Found ${result.date} instead of ${dateStr}`
                : result.error || "No data found on source"
        };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
