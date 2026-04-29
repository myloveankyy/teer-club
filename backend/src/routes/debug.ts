import { Router } from "express";
import { adminAuth } from "../middleware/adminAuth";
import { runAutoDebug } from "../services/debugService";

export const debugRouter = Router();

// Endpoint: POST /api/admin/debug/results
debugRouter.post("/results", adminAuth, async (req, res) => {
    try {
        const report = await runAutoDebug();
        res.json({ success: true, data: report });
    } catch (err: any) {
        // Return 500 cleanly with the inner message logic if execution fails
        res.status(500).json({ success: false, error: err.message });
    }
});
