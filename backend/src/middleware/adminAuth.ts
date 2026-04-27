import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

/**
 * Admin API Key Authentication Middleware
 *
 * Validates the X-Admin-Key header against the ADMIN_API_KEY env variable.
 * In development mode (NODE_ENV !== 'production'), requests are allowed through
 * without a key for ease of local development.
 */
export function adminAuth(req: Request, res: Response, next: NextFunction) {
    // Allow unauthenticated access in development
    if (process.env.NODE_ENV !== "production") {
        return next();
    }

    const adminKey = process.env.ADMIN_API_KEY;
    if (!adminKey) {
        logger.error("[Auth] ADMIN_API_KEY is not set in production! Rejecting request.");
        return res.status(500).json({ success: false, error: "Server misconfigured" });
    }

    const providedKey = req.headers["x-admin-key"] as string;
    if (!providedKey || providedKey !== adminKey) {
        logger.warn("[Auth] Unauthorized admin access attempt", {
            ip: req.ip,
            path: req.path,
        });
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    next();
}
