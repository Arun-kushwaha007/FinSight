// apps/api/src/routes/insights.ts
import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getLatestInsight,
  getInsightHistory,
  regenerateInsight,
  markInsightAsStale,
} from "../controllers/insightsController";

const router = Router();

// Apply auth middleware to all insight routes
router.use(authMiddleware);

// GET /insights/latest — return latest InsightHistory for current user (most recent).
router.get("/latest", getLatestInsight);

// GET /insights/history?page=&limit= — paginated history.
router.get("/history", getInsightHistory);

// POST /insights/regenerate — forces regeneration
router.post("/regenerate", regenerateInsight);

// POST /insights/mark-stale — internal; mark latest insight isStale=true for user
router.post("/mark-stale", markInsightAsStale);

export default router;
