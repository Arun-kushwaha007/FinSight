import { Router } from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();
const upload = multer({ dest: "uploads/" });


router.get("/", authMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  const txs = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });
  res.json(txs);
});

router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const userId = (req as any).userId;
  const results: any[] = [];

  const filePath = req.file.path; // TypeScript knows that req.file is defined here

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        const parsed = results
          .map((r) => ({
            userId,
            date: new Date(r.date || r.Date || r.transaction_date),
            amount: parseFloat(r.amount || r.Amount),
            currency: r.currency || "INR",
            description: r.description || r.Details || "",
            category: r.category || "Uncategorized",
            type:
              parseFloat(r.amount || r.Amount) >= 0 ? "income" : "expense",
          }))
          .filter((tx) => !isNaN(tx.amount));

        await prisma.transaction.createMany({ data: parsed });
        
        // Mark insight as stale
        const { markLatestInsightAsStaleIfTransactionsChanged } = await import("../services/insightsService");
        await markLatestInsightAsStaleIfTransactionsChanged(userId);

        fs.unlinkSync(filePath); // cleanup
        res.json({ count: parsed.length, success: true });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to parse CSV" });
      }
    });
});


export default router;
