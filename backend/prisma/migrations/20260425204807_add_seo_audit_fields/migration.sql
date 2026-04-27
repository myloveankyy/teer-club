/*
  Warnings:

  - You are about to drop the `AICostLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LiveDetectionLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LiveResultJob` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScrapeJob` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScrapeLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Source` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AICostLog" DROP CONSTRAINT "AICostLog_jobId_fkey";

-- DropForeignKey
ALTER TABLE "LiveDetectionLog" DROP CONSTRAINT "LiveDetectionLog_jobId_fkey";

-- DropForeignKey
ALTER TABLE "LiveResultJob" DROP CONSTRAINT "LiveResultJob_gameId_fkey";

-- DropForeignKey
ALTER TABLE "ScrapeJob" DROP CONSTRAINT "ScrapeJob_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "ScrapeLog" DROP CONSTRAINT "ScrapeLog_jobId_fkey";

-- DropForeignKey
ALTER TABLE "Source" DROP CONSTRAINT "Source_gameId_fkey";

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "historySourceUrl" TEXT,
ADD COLUMN     "isLiveScrapingEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastLiveScrapeAt" TIMESTAMP(3),
ADD COLUMN     "lastLiveScrapeStatus" TEXT,
ADD COLUMN     "liveSourceUrl" TEXT;

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "audit_results" JSONB,
ADD COLUMN     "content_length" INTEGER,
ADD COLUMN     "h1_count" INTEGER,
ADD COLUMN     "h2_count" INTEGER,
ADD COLUMN     "index_status" TEXT NOT NULL DEFAULT 'DISCOVERED',
ADD COLUMN     "internal_links" INTEGER,
ADD COLUMN     "last_audit_at" TIMESTAMP(3),
ADD COLUMN     "performance_score" INTEGER,
ADD COLUMN     "seo_score" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "AICostLog";

-- DropTable
DROP TABLE "LiveDetectionLog";

-- DropTable
DROP TABLE "LiveResultJob";

-- DropTable
DROP TABLE "ScrapeJob";

-- DropTable
DROP TABLE "ScrapeLog";

-- DropTable
DROP TABLE "Source";

-- CreateTable
CREATE TABLE "CronLog" (
    "id" TEXT NOT NULL,
    "game" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "round1" TEXT,
    "round2" TEXT,
    "resultDate" TEXT,
    "duration" INTEGER NOT NULL,
    "error" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CronLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CronLog_game_idx" ON "CronLog"("game");

-- CreateIndex
CREATE INDEX "CronLog_status_idx" ON "CronLog"("status");

-- CreateIndex
CREATE INDEX "CronLog_createdAt_idx" ON "CronLog"("createdAt");

-- CreateIndex
CREATE INDEX "Page_seo_score_idx" ON "Page"("seo_score");

-- CreateIndex
CREATE INDEX "Page_index_status_idx" ON "Page"("index_status");
