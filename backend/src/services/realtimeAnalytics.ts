import { logger } from "../utils/logger";

export interface SessionData {
    sessionId: string;
    page: string;
    referrer: string;
    deviceType: string;
    browser: string;
    os: string;
    country?: string;
    lastSeen: number; // timestamp ms
}

// In-memory session store — no DB overhead
const activeSessions = new Map<string, SessionData>();

const SESSION_TTL_MS = 30_000; // 30 seconds — session considered dead after this

// Cleanup expired sessions every 10s
setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    for (const [id, session] of activeSessions) {
        if (now - session.lastSeen > SESSION_TTL_MS) {
            activeSessions.delete(id);
            cleaned++;
        }
    }
    if (cleaned > 0) {
        logger.debug(`[Realtime] Cleaned ${cleaned} expired sessions`);
    }
}, 10_000);

export function recordHeartbeat(data: {
    sessionId: string;
    page: string;
    referrer?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
}): void {
    activeSessions.set(data.sessionId, {
        sessionId: data.sessionId,
        page: data.page || "/",
        referrer: data.referrer || "direct",
        deviceType: data.deviceType || "Unknown",
        browser: data.browser || "Unknown",
        os: data.os || "Unknown",
        lastSeen: Date.now(),
    });
}

export function getActiveSessions(): SessionData[] {
    const now = Date.now();
    const result: SessionData[] = [];
    for (const [id, session] of activeSessions) {
        if (now - session.lastSeen <= SESSION_TTL_MS) {
            result.push(session);
        }
    }
    return result;
}

export function getRealtimeStats() {
    const sessions = getActiveSessions();
    const activeCount = sessions.length;

    // Top pages
    const pageCounts = new Map<string, number>();
    for (const s of sessions) {
        pageCounts.set(s.page, (pageCounts.get(s.page) || 0) + 1);
    }
    const topPages = [...pageCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([page, count]) => ({ page, count }));

    // Top referrers
    const refCounts = new Map<string, number>();
    for (const s of sessions) {
        refCounts.set(s.referrer, (refCounts.get(s.referrer) || 0) + 1);
    }
    const topReferrers = [...refCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([referrer, count]) => ({ referrer, count }));

    // Device breakdown
    const deviceCounts = new Map<string, number>();
    for (const s of sessions) {
        deviceCounts.set(s.deviceType, (deviceCounts.get(s.deviceType) || 0) + 1);
    }
    const devices = Object.fromEntries(deviceCounts);

    // Browser breakdown
    const browserCounts = new Map<string, number>();
    for (const s of sessions) {
        browserCounts.set(s.browser, (browserCounts.get(s.browser) || 0) + 1);
    }
    const browsers = Object.fromEntries(browserCounts);

    return {
        activeUsers: activeCount,
        topPages,
        topReferrers,
        devices,
        browsers,
        sessions: sessions.map(s => ({
            sessionId: s.sessionId.slice(0, 8),
            page: s.page,
            referrer: s.referrer,
            deviceType: s.deviceType,
            browser: s.browser,
            os: s.os,
        })),
    };
}
