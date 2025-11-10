import express from "express";
import authRoutes from "./routes/auth";
import { json } from "body-parser";
const app = express();
app.use(json());
app.use("/auth", authRoutes);
app.get("/health", (_, res) => res.json({ ok: true }));
const port = process.env.PORT || 4000;
app.listen(port, () => console.log("API on", port));
