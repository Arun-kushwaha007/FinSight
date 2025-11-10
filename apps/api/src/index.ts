import express from "express";
import authRoutes from "./routes/auth";
import { json } from "body-parser";
import { prisma } from "./lib/prisma";
import cors from "cors";

(async () => {
  console.log(await prisma.user.findMany());
})();

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(json());
app.use("/auth", authRoutes);

app.get("/health", (_, res) => res.json({ ok: true }));
const port = process.env.PORT || 4000;
app.listen(port, () => console.log("API on", port));
