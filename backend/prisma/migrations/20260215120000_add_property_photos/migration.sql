-- AlterTable
ALTER TABLE "properties" ADD COLUMN "photos" TEXT[] DEFAULT ARRAY[]::TEXT[];
