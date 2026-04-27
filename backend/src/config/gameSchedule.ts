/**
 * Game Schedule Configuration
 * 
 * Config-driven schedule for each game with expected result times,
 * monitoring windows, and retry intervals.
 * 
 * All times are in IST (UTC+5:30).
 */

export interface GameScheduleConfig {
    game: string;              // matches Game.name in DB
    displayName: string;
    frResultTime: string;      // "HH:MM" IST — First Round expected
    srResultTime: string;      // "HH:MM" IST — Second Round expected
    trResultTime?: string;     // "HH:MM" IST — Third Round (Laitlyngkot only)
    hasRound3: boolean;        // Config-driven: does this game have a 3rd round?
    monitorStartOffset: number; // minutes before frResultTime to start monitoring
    retryInterval: number;      // base poll interval in ms
    fastRetryInterval: number;  // near result time poll interval in ms
    maxRetries: number;
    timeoutMinutes: number;     // max monitoring window after SR time
    isEnabled: boolean;
    delayNote?: string;         // Optional delay warning for frontend
}

export const GAME_SCHEDULES: GameScheduleConfig[] = [
    {
        game: 'shillong',
        displayName: 'Shillong Teer',
        frResultTime: '15:30',
        srResultTime: '16:30',
        hasRound3: false,
        monitorStartOffset: 15,
        retryInterval: 2 * 60 * 1000,
        fastRetryInterval: 30 * 1000,
        maxRetries: 30,
        timeoutMinutes: 120,
        isEnabled: true,
    },
    {
        game: 'khanapara',
        displayName: 'Khanapara Teer',
        frResultTime: '16:15',
        srResultTime: '17:00',
        hasRound3: false,
        monitorStartOffset: 15,
        retryInterval: 2 * 60 * 1000,
        fastRetryInterval: 30 * 1000,
        maxRetries: 30,
        timeoutMinutes: 120,
        isEnabled: true,
    },
    {
        game: 'juwai',
        displayName: 'Juwai Teer',
        frResultTime: '13:30',
        srResultTime: '14:30',
        hasRound3: false,
        monitorStartOffset: 15,
        retryInterval: 2 * 60 * 1000,
        fastRetryInterval: 30 * 1000,
        maxRetries: 30,
        timeoutMinutes: 120,
        isEnabled: true,
    },
    {
        game: 'jowai-ladrymbai',
        displayName: 'Jowai Ladrymbai Teer',
        frResultTime: '14:30',
        srResultTime: '15:30',
        hasRound3: false,
        monitorStartOffset: 15,
        retryInterval: 2 * 60 * 1000,
        fastRetryInterval: 30 * 1000,
        maxRetries: 30,
        timeoutMinutes: 120,
        isEnabled: true,
    },
    {
        game: 'laitlyngkot',
        displayName: 'Laitlyngkot Teer',
        frResultTime: '14:00',
        srResultTime: '15:00',
        trResultTime: '16:00',
        hasRound3: true,
        monitorStartOffset: 15,
        retryInterval: 2 * 60 * 1000,
        fastRetryInterval: 30 * 1000,
        maxRetries: 30,
        timeoutMinutes: 120,
        isEnabled: true,
    },
    {
        game: 'bhutan-day',
        displayName: 'Bhutan Day Teer',
        frResultTime: '12:00',
        srResultTime: '13:00',
        hasRound3: false,
        monitorStartOffset: 15,
        retryInterval: 2 * 60 * 1000,
        fastRetryInterval: 30 * 1000,
        maxRetries: 30,
        timeoutMinutes: 120,
        isEnabled: true,
    },
    {
        game: 'arunachal',
        displayName: 'Arunachal Teer',
        frResultTime: '18:30',
        srResultTime: '19:30',
        hasRound3: false,
        monitorStartOffset: 15,
        retryInterval: 2 * 60 * 1000,
        fastRetryInterval: 30 * 1000,
        maxRetries: 30,
        timeoutMinutes: 120,
        isEnabled: true,
        delayNote: 'Results may be slightly delayed depending on official declaration.',
    },
    {
        game: 'manipur',
        displayName: 'Manipur Teer',
        frResultTime: '15:00',
        srResultTime: '16:00',
        hasRound3: false,
        monitorStartOffset: 15,
        retryInterval: 2 * 60 * 1000,
        fastRetryInterval: 30 * 1000,
        maxRetries: 30,
        timeoutMinutes: 120,
        isEnabled: true,
    },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getScheduleByGame(gameName: string): GameScheduleConfig | undefined {
    return GAME_SCHEDULES.find(s => s.game === gameName);
}

export function getEnabledSchedules(): GameScheduleConfig[] {
    return GAME_SCHEDULES.filter(s => s.isEnabled);
}

/**
 * Get the IST time right now as { hours, minutes, totalMinutes }
 */
export function getISTNow(): { hours: number; minutes: number; totalMinutes: number; dateStr: string } {
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(Date.now() + istOffset);
    const hours = istTime.getUTCHours();
    const minutes = istTime.getUTCMinutes();
    return {
        hours,
        minutes,
        totalMinutes: hours * 60 + minutes,
        dateStr: istTime.toISOString().split('T')[0],
    };
}

/**
 * Parse "HH:MM" string to total minutes from midnight
 */
export function parseTime(timeStr: string): number {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

/**
 * Get today's IST date as a Date object (midnight UTC representation)
 */
export function getTodayIST(): Date {
    const { dateStr } = getISTNow();
    return new Date(dateStr + 'T00:00:00Z');
}
