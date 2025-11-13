import { prisma } from "../lib/prisma";
import { hashTransactions } from "../lib/hash";
import { redisClient } from "../lib/redis";
import axios from "axios";

const AI_PRIMARY_MODEL = process.env.AI_PRIMARY_MODEL || "meta-llama/llama-4-maverick";
const AI_FALLBACK_MODEL = process.env.AI_FALLBACK_MODEL || "meta-llama/llama-4-scout";
const INSIGHT_CACHE_TTL_DAYS = parseInt(process.env.INSIGHT_CACHE_TTL_DAYS || "30");

async function callAIService(transactions: any[], model: string, retryCount: number = 0, prismaClient: any = prisma): Promise<any> {
  const aiUrl = process.env.AI_SERVICE_URL || "http://localhost:8001/generate-summary";
  const serviceKey = process.env.SERVICE_API_KEY || "";

  const payload = { transactions, model };

  const requestLog = await prismaClient.aIRequestLog.create({
    data: {
      requestPayload: payload,
      retryCount,
    },
  });

  try {
    const aiResp = await axios.post(aiUrl, payload, {
      headers: { "Content-Type": "application/json", "x-api-key": serviceKey },
      timeout: 30000,
    });

    await prismaClient.aIRequestLog.update({
      where: { id: requestLog.id },
      data: {
        responsePayload: aiResp.data,
        success: true,
      },
    });

    return aiResp.data;
  } catch (error: any) {
    await prismaClient.aIRequestLog.update({
      where: { id: requestLog.id },
      data: {
        errorDetails: {
          message: error.message,
          stack: error.stack,
          response: error.response?.data,
        },
      },
    });

    if (retryCount < 2) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
      return callAIService(transactions, model, retryCount + 1);
    }

    if (model === AI_PRIMARY_MODEL) {
      return callAIService(transactions, AI_FALLBACK_MODEL);
    }

    throw error;
  }
}

export async function getTransactionsAndHash(userId: string, prismaClient: any = prisma) {
  const transactions = await prismaClient.transaction.findMany({
    where: { userId },
  });

  if (transactions.length === 0) {
    return { transactions: [], inputsHash: "" };
  }

  const inputsHash = hashTransactions(transactions);
  return { transactions, inputsHash };
}

export async function getInsightFromCacheOrAI(userId: string, transactions: any[], inputsHash: string, prismaClient: any = prisma) {
  const cacheKey = `insight:${userId}:${inputsHash}`;

  const cachedInsight = await redisClient.get(cacheKey);
  if (cachedInsight) {
    return JSON.parse(cachedInsight);
  }

  const aiResult = await callAIService(transactions, AI_PRIMARY_MODEL, 0, prismaClient);

  const newInsight = await prismaClient.insightHistory.create({
    data: {
      userId,
      inputsHash,
      summary: aiResult.summary,
      anomalies: aiResult.anomalies,
      recommendations: aiResult.recommendations,
      modelUsed: aiResult.model_used,
      costMetadata: aiResult.cost_metadata,
      transactionsCount: transactions.length,
    },
  });

  await redisClient.set(cacheKey, JSON.stringify(newInsight), {
    EX: INSIGHT_CACHE_TTL_DAYS * 24 * 60 * 60,
  });

  return newInsight;
}

export async function getLatestInsight(userId: string, prismaClient: any = prisma) {
  return prismaClient.insightHistory.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInsightHistory(userId: string, page: number, limit: number, prismaClient: any = prisma) {
  const skip = (page - 1) * limit;
  return prismaClient.insightHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });
}

export async function regenerateInsight(userId: string, prismaClient: any = prisma) {
  const { transactions, inputsHash } = await getTransactionsAndHash(userId, prismaClient);
  if (transactions.length === 0) {
    return { message: "No transactions found" };
  }
  return getInsightFromCacheOrAI(userId, transactions, inputsHash, prismaClient);
}

export async function markInsightAsStale(userId: string, prismaClient: any = prisma) {
  const latestInsight = await prismaClient.insightHistory.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (latestInsight) {
    await prismaClient.insightHistory.update({
      where: { id: latestInsight.id },
      data: { isStale: true },
    });
  }
}

export async function markLatestInsightAsStaleIfTransactionsChanged(userId: string, prismaClient: any = prisma) {
  const latestInsight = await prismaClient.insightHistory.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (latestInsight) {
    const { inputsHash } = await getTransactionsAndHash(userId, prismaClient);
    if (latestInsight.inputsHash !== inputsHash) {
      await markInsightAsStale(userId, prismaClient);
    }
  }
}
