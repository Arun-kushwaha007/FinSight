-- CreateTable
CREATE TABLE "InsightHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inputsHash" TEXT NOT NULL,
    "summary" JSONB NOT NULL,
    "anomalies" JSONB,
    "recommendations" JSONB,
    "modelUsed" TEXT NOT NULL,
    "costMetadata" JSONB,
    "isStale" BOOLEAN NOT NULL DEFAULT false,
    "transactionsCount" INTEGER NOT NULL,

    CONSTRAINT "InsightHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIRequestLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestPayload" JSONB NOT NULL,
    "responsePayload" JSONB,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "errorDetails" JSONB,

    CONSTRAINT "AIRequestLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InsightHistory_userId_inputsHash_idx" ON "InsightHistory"("userId", "inputsHash");
