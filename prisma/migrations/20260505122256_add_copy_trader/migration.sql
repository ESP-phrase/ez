-- CreateTable
CREATE TABLE "CopySourceWallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "walletAddress" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "winRate" REAL NOT NULL DEFAULT 0,
    "roi30d" REAL NOT NULL DEFAULT 0,
    "pnl30d" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CopySubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sourceWalletId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "autoCopyEnabled" BOOLEAN NOT NULL DEFAULT false,
    "maxStakePerTrade" REAL NOT NULL DEFAULT 25,
    "maxSlippagePct" REAL NOT NULL DEFAULT 1.5,
    "maxOpenExposure" REAL NOT NULL DEFAULT 250,
    "sizeMultiplier" REAL NOT NULL DEFAULT 1,
    "allowedMarketsJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CopySubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CopySubscription_sourceWalletId_fkey" FOREIGN KEY ("sourceWalletId") REFERENCES "CopySourceWallet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CopySignal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceWalletId" TEXT NOT NULL,
    "externalSignalId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "odds" REAL NOT NULL,
    "stake" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CopySignal_sourceWalletId_fkey" FOREIGN KEY ("sourceWalletId") REFERENCES "CopySourceWallet" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CopySignal_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CopyExecution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "signalId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "mirroredStake" REAL NOT NULL,
    "slippagePct" REAL NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "externalOrderId" TEXT,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CopyExecution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CopyExecution_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "CopySubscription" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CopyExecution_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "CopySignal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CopySetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "killSwitchEnabled" BOOLEAN NOT NULL DEFAULT false,
    "dailyLossLimit" REAL NOT NULL DEFAULT 200,
    "maxFailedExecs" INTEGER NOT NULL DEFAULT 5,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CopySetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CopySourceWallet_walletAddress_key" ON "CopySourceWallet"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "CopySubscription_userId_sourceWalletId_key" ON "CopySubscription"("userId", "sourceWalletId");

-- CreateIndex
CREATE UNIQUE INDEX "CopySignal_externalSignalId_key" ON "CopySignal"("externalSignalId");

-- CreateIndex
CREATE UNIQUE INDEX "CopyExecution_idempotencyKey_key" ON "CopyExecution"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "CopySetting_userId_key" ON "CopySetting"("userId");
