/**
 * Teer Club Holiday Configuration
 * 
 * Define special days where games are not held across all markets.
 * Sundays are handled automatically by the system logic.
 */

export const TEER_HOLIDAYS = [
    "2026-01-01", // New Year's Day
    "2026-01-26", // Republic Day
    "2026-08-15", // Independence Day
    "2026-10-02", // Gandhi Jayanti
    "2026-12-25", // Christmas Day
];

/**
 * Check if a given date string (YYYY-MM-DD) is a declared holiday or Sunday.
 */
export function isNonWorkingDay(dateStr: string): boolean {
    const date = new Date(dateStr + "T00:00:00Z");

    // Check Sunday (Day 0)
    if (date.getUTCDay() === 0) return true;

    // Check holiday list
    if (TEER_HOLIDAYS.includes(dateStr)) return true;

    return false;
}
