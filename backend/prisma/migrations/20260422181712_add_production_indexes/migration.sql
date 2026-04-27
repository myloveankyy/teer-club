-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "playLiveEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "playLiveUrl" TEXT;

-- CreateIndex
CREATE INDEX "Prediction_gameId_date_idx" ON "Prediction"("gameId", "date");

-- CreateIndex
CREATE INDEX "Result_gameId_date_idx" ON "Result"("gameId", "date");

-- CreateIndex
CREATE INDEX "Result_verified_idx" ON "Result"("verified");
