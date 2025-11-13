import { Request, Response } from "express";
import * as insightsService from "../services/insightsService";

import { prisma } from "../lib/prisma";

export async function getLatestInsight(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const insight = await insightsService.getLatestInsight(userId, prisma);
    res.json(insight);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getInsightHistory(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const history = await insightsService.getInsightHistory(userId, page, limit, prisma);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function regenerateInsight(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const result = await insightsService.regenerateInsight(userId, prisma);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function markInsightAsStale(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    await insightsService.markInsightAsStale(userId, prisma);
    res.json({ message: "Insight marked as stale" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
