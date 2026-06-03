-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userPrompt" TEXT NOT NULL,
    "scenarioKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "merchant" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "fees" JSONB NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "agentReasoning" TEXT NOT NULL,
    "verdict" TEXT NOT NULL,
    "verdictReasoning" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Drift" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "intentReconstruction" TEXT NOT NULL,
    "driftCandidates" JSONB NOT NULL,
    "questions" JSONB NOT NULL,
    "agentResponses" JSONB NOT NULL,
    "scores" JSONB NOT NULL,
    "rawVerdict" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Drift_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Drift_transactionId_key" ON "Drift"("transactionId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Drift" ADD CONSTRAINT "Drift_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
