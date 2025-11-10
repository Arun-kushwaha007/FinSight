import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export async function signup(req: Request, res: Response) {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email & password required" });

  const existing = await prisma.user.findUnique({ where: { email }});
  if (existing) return res.status(409).json({ error: "User exists" });

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { name, email, password: hashed }});
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name }});
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email & password required" });

  const user = await prisma.user.findUnique({ where: { email }});
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name }});
}

export async function me(req: Request, res: Response) {
  // authMiddleware attached userId to req
  const userId = (req as any).userId;
  const user = await prisma.user.findUnique({ where: { id: userId }});
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ id: user.id, email: user.email, name: user.name, currency: user.currency });
}
