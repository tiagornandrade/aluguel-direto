-- CreateTable
CREATE TABLE "tenant_documents" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE_ANALISE',
    "rejectedReason" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_documents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tenant_documents" ADD CONSTRAINT "tenant_documents_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
