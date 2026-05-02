import { Router, Request, Response } from "express";
import { adminAuth } from "../middleware/adminAuth";
import { recordHeartbeat, getRealtimeStats } from "../services/realtimeAnalytics";

const router = Router();

// Public: Receive heartbeat from frontend (lightweight, no auth)
router.post("/heartbeat", (req: Request, res: Response) => {
    try {
        const { sessionId, page, referrer, deviceType, browser, os } = req.body;
        if (!sessionId || !page) {
            return res.status(400).json({ success: false });
        }
        recordHeartbeat({ sessionId, page, referrer, deviceType, browser, os });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// Admin: Get real-time analytics snapshot
router.get("/realtime", adminAuth, (req: Request, res: Response) => {
    try {
        const stats = getRealtimeStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch realtime stats" });
    }
});

export default router;
