-- AlterTable
ALTER TABLE "tenant_documents" ADD COLUMN IF NOT EXISTS "analysisResult" JSONB;
ALTER TABLE "tenant_documents" ADD COLUMN IF NOT EXISTS "analyzedAt" TIMESTAMP(3);
