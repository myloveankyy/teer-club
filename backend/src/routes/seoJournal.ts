import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { adminAuth } from "../middleware/adminAuth";

const prisma = new PrismaClient();
export const seoJournalRouter = Router();

// GET all profiles
seoJournalRouter.get("/profiles", adminAuth, async (req, res) => {
    try {
        const profiles = await prisma.seoProfile.findMany({
            orderBy: { createdAt: "desc" }
        });
        res.json({ success: true, data: profiles });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch SEO profiles" });
    }
});

// CREATE profile
seoJournalRouter.post("/profiles", adminAuth, async (req, res) => {
    try {
        const { name, role, avatar } = req.body;
        if (!name) return res.status(400).json({ success: false, error: "Name is required" });

        const profile = await prisma.seoProfile.create({
            data: { name, role: role || "SEO Expert", avatar }
        });
        res.json({ success: true, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to create SEO profile" });
    }
});

// GET notes
seoJournalRouter.get("/notes", adminAuth, async (req, res) => {
    try {
        const { profileId, page = "1", limit = "20" } = req.query as any;
        if (!profileId) return res.status(400).json({ success: false, error: "profileId is required" });

        const skip = (Number(page) - 1) * Number(limit);
        const notes = await prisma.seoNote.findMany({
            where: { profileId: String(profileId) },
            orderBy: { createdAt: "desc" },
            skip,
            take: Number(limit)
        });
        const total = await prisma.seoNote.count({ where: { profileId: String(profileId) } });

        res.json({ success: true, data: { notes, total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch SEO notes" });
    }
});

// CREATE note
seoJournalRouter.post("/notes", adminAuth, async (req, res) => {
    try {
        const { profileId, title, content } = req.body;
        if (!profileId || !title || !content) {
            return res.status(400).json({ success: false, error: "profileId, title, and content are required" });
        }

        const note = await prisma.seoNote.create({
            data: { profileId, title, content }
        });
        res.json({ success: true, data: note });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to create SEO note" });
    }
});

// UPDATE note
seoJournalRouter.put("/notes/:id", adminAuth, async (req, res) => {
    try {
        const { title, content } = req.body;
        const note = await prisma.seoNote.update({
            where: { id: req.params.id },
            data: { title, content }
        });
        res.json({ success: true, data: note });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to update SEO note" });
    }
});

// DELETE note
seoJournalRouter.delete("/notes/:id", adminAuth, async (req, res) => {
    try {
        await prisma.seoNote.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: "SEO note deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to delete SEO note" });
    }
});
