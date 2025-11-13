// apps/api/src/routes/insights.ts
import { Router } from "express";
import axios from "axios";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

/**
 * Simple per-user rate limit map: stores last timestamp of insights generation.
 * This is an in-memory guard for prototype. Replace with Redis for distributed env.
 */
const userCooldown = new Map<string, number>();
// const COOLDOWN_MS = 1000 * 60 * 60 * 6; // 6 hours cooldown per user (adjustable)
const COOLDOWN_MS = 1000 ;
router.post("/", authMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  const { startDate, endDate } = req.body || {};

  // rate-limit guard
  const last = userCooldown.get(userId);
  const now = Date.now();
  if (last && now - last < COOLDOWN_MS) {
    const retryAfter = Math.ceil((COOLDOWN_MS - (now - last)) / 1000);
    return res.status(429).json({ error: `Rate limit. Try after ${retryAfter} seconds.` });
  }

  // fetch transactions for user in range
  const where: any = { userId };
  if (startDate || endDate) where.date = {};
  if (startDate) where.date.gte = new Date(startDate);
  if (endDate) where.date.lte = new Date(endDate);

  try {
    const txs = await prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      take: 1000, // safety cap
    });

    // If no transactions -> short-circuit
    if (!txs.length) return res.status(400).json({ error: "No transactions found for the period." });

    // Call AI service
    const aiUrl = process.env.AI_SERVICE_URL || "http://localhost:8001/generate-summary";
    const serviceKey = process.env.SERVICE_API_KEY || "";

    const payload = { transactions: txs };

    const aiResp = await axios.post(aiUrl, payload, {
      headers: { "Content-Type": "application/json", "x-api-key": serviceKey },
      timeout: 30000,
    });

    // successful -> update cooldown
    userCooldown.set(userId, Date.now());

    return res.json({
      ok: true,
      model_used: aiResp.data?.model_used || null,
      summary: aiResp.data?.summary || null,
      recommendations: aiResp.data?.recommendations || [],
      anomalies: aiResp.data?.anomalies || [],
      raw: aiResp.data?.raw || aiResp.data,
    });

  } catch (err: any) {
    console.error("INSIGHTS ERROR:", err.message || err);
    if (err.response) {
      // forward AI service error if present
      const status = err.response.status || 502;
      return res.status(status).json({ error: "AI service error", details: err.response.data || err.message });
    }
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

export default router;
