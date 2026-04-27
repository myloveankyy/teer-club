-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "startTime" TEXT,
    "frTime" TEXT,
    "srTime" TEXT,
    "trTime" TEXT,
    "closeTime" TEXT,
    "hasRound3" BOOLEAN NOT NULL DEFAULT false,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'AUTO',
    "renderType" TEXT NOT NULL DEFAULT 'STATIC',
    "selectors" JSONB,
    "name" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "useAI" BOOLEAN NOT NULL DEFAULT true,
    "aiThreshold" INTEGER NOT NULL DEFAULT 10,
    "lastScrapedAt" TIMESTAMP(3),
    "lastParseMethod" TEXT,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "avgResponseTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "round1" TEXT,
    "round2" TEXT,
    "round3" TEXT,
    "confidence" TEXT NOT NULL DEFAULT 'LOW',
    "sourceCount" INTEGER NOT NULL DEFAULT 1,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "detectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapeJob" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "parseMethod" TEXT NOT NULL DEFAULT 'DOM',
    "recordsFound" INTEGER NOT NULL DEFAULT 0,
    "recordsSaved" INTEGER NOT NULL DEFAULT 0,
    "aiTokensUsed" INTEGER,
    "aiCostUsd" DOUBLE PRECISION,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScrapeJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapeLog" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'info',
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScrapeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AICostLog" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "costUsd" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AICostLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveResultJob" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "retries" INTEGER NOT NULL DEFAULT 0,
    "resultFound" BOOLEAN NOT NULL DEFAULT false,
    "sourceUsed" TEXT,
    "lastCheckedAt" TIMESTAMP(3),
    "lastSuccessAt" TIMESTAMP(3),
    "resultId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveResultJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveDetectionLog" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'info',
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveDetectionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'STATIC',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "source" TEXT NOT NULL DEFAULT 'AUTO',
    "meta_title" TEXT,
    "meta_description" TEXT,
    "indexed" BOOLEAN NOT NULL DEFAULT true,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prediction" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "commonNumbers" TEXT[],
    "house" TEXT NOT NULL,
    "ending" TEXT NOT NULL,
    "directNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'GENERATED',
    "actualResult" TEXT,
    "houseMatch" BOOLEAN NOT NULL DEFAULT false,
    "endingMatch" BOOLEAN NOT NULL DEFAULT false,
    "directMatch" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "youtubeUrl" TEXT,
    "youtubeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "whatsappUrl" TEXT,
    "whatsappEnabled" BOOLEAN NOT NULL DEFAULT true,
    "telegramUrl" TEXT,
    "telegramEnabled" BOOLEAN NOT NULL DEFAULT true,
    "bannerText" TEXT,
    "bannerVisible" BOOLEAN NOT NULL DEFAULT false,
    "bannerColor" TEXT DEFAULT '#2563eb',
    "resultAwaitedText" TEXT DEFAULT 'Result Awaited',
    "sundayOffText" TEXT DEFAULT 'Sunday Off',
    "primaryColor" TEXT DEFAULT '#2563eb',
    "accentColor" TEXT DEFAULT '#22c55e',
    "backgroundColor" TEXT DEFAULT '#ffffff',
    "textColor" TEXT DEFAULT '#111827',
    "cardStyle" TEXT DEFAULT 'soft',
    "borderRadius" TEXT DEFAULT 'lg',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_name_key" ON "Game"("name");

-- CreateIndex
CREATE INDEX "Source_gameId_idx" ON "Source"("gameId");

-- CreateIndex
CREATE INDEX "Source_isActive_idx" ON "Source"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Source_gameId_key" ON "Source"("gameId");

-- CreateIndex
CREATE INDEX "Result_gameId_idx" ON "Result"("gameId");

-- CreateIndex
CREATE INDEX "Result_date_idx" ON "Result"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Result_gameId_date_key" ON "Result"("gameId", "date");

-- CreateIndex
CREATE INDEX "ScrapeJob_sourceId_idx" ON "ScrapeJob"("sourceId");

-- CreateIndex
CREATE INDEX "ScrapeJob_status_idx" ON "ScrapeJob"("status");

-- CreateIndex
CREATE INDEX "ScrapeJob_parseMethod_idx" ON "ScrapeJob"("parseMethod");

-- CreateIndex
CREATE INDEX "ScrapeJob_startedAt_idx" ON "ScrapeJob"("startedAt");

-- CreateIndex
CREATE INDEX "ScrapeLog_jobId_idx" ON "ScrapeLog"("jobId");

-- CreateIndex
CREATE INDEX "ScrapeLog_level_idx" ON "ScrapeLog"("level");

-- CreateIndex
CREATE INDEX "AICostLog_jobId_idx" ON "AICostLog"("jobId");

-- CreateIndex
CREATE INDEX "AICostLog_createdAt_idx" ON "AICostLog"("createdAt");

-- CreateIndex
CREATE INDEX "LiveResultJob_gameId_idx" ON "LiveResultJob"("gameId");

-- CreateIndex
CREATE INDEX "LiveResultJob_status_idx" ON "LiveResultJob"("status");

-- CreateIndex
CREATE INDEX "LiveResultJob_date_idx" ON "LiveResultJob"("date");

-- CreateIndex
CREATE UNIQUE INDEX "LiveResultJob_gameId_date_key" ON "LiveResultJob"("gameId", "date");

-- CreateIndex
CREATE INDEX "LiveDetectionLog_jobId_idx" ON "LiveDetectionLog"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Page_url_key" ON "Page"("url");

-- CreateIndex
CREATE INDEX "Page_url_idx" ON "Page"("url");

-- CreateIndex
CREATE INDEX "Page_type_idx" ON "Page"("type");

-- CreateIndex
CREATE INDEX "Page_status_idx" ON "Page"("status");

-- CreateIndex
CREATE INDEX "Prediction_date_idx" ON "Prediction"("date");

-- CreateIndex
CREATE INDEX "Prediction_gameId_idx" ON "Prediction"("gameId");

-- CreateIndex
CREATE INDEX "Prediction_status_idx" ON "Prediction"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Prediction_gameId_date_key" ON "Prediction"("gameId", "date");

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScrapeJob" ADD CONSTRAINT "ScrapeJob_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScrapeLog" ADD CONSTRAINT "ScrapeLog_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ScrapeJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AICostLog" ADD CONSTRAINT "AICostLog_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ScrapeJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveResultJob" ADD CONSTRAINT "LiveResultJob_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveDetectionLog" ADD CONSTRAINT "LiveDetectionLog_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "LiveResultJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
