import "dotenv/config";
import express from "express";
import authRoutes from "./routes/auth";
import { json } from "body-parser";
import { prisma } from "./lib/prisma";
import cors from "cors";
import transactionRoutes from "./routes/transactions";
import insightsRoutes from "./routes/insights";

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(json());

app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);
app.use("/insights", insightsRoutes);

app.get("/health", async (_, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: "connected" });
  } catch (err) {
    res.json({ ok: false, db: "error", message: (err as any).message });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log("API on", port));
