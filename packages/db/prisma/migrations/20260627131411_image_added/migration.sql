-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "metadata" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "AvailableActions" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "AvailableTriggers" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "Trigger" ADD COLUMN     "metadata" JSONB NOT NULL DEFAULT '{}';
