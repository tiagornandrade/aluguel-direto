const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

async function main() {
  const prisma = new PrismaClient();
  const passwordHash = await bcrypt.hash("dev", 10);

  await prisma.user.upsert({
    where: { id: "dev-1" },
    create: {
      id: "dev-1",
      email: "dev@alugueldireto.local",
      fullName: "Dev (Proprietário)",
      passwordHash,
      role: "PROPRIETARIO",
      profileCompleted: true,
    },
    update: { passwordHash },
  });

  const dev2 = await prisma.user.upsert({
    where: { id: "dev-2" },
    create: {
      id: "dev-2",
      email: "dev-proprietario@alugueldireto.local",
      fullName: "Carlos Alberto (Proprietário)",
      passwordHash,
      role: "PROPRIETARIO",
      profileCompleted: true,
    },
    update: { passwordHash },
  });

  const prop = await prisma.property.upsert({
    where: { id: "dev-prop-1" },
    create: {
      id: "dev-prop-1",
      ownerId: dev2.id,
      title: "Apartamento reformado próximo ao metrô",
      addressLine: "Rua das Flores, 123 - Bela Vista, São Paulo/SP",
      type: "APARTAMENTO",
      areaM2: 75,
      rooms: 2,
      rentAmount: 2500,
      chargesAmount: 300,
      status: "ALUGADO",
    },
    update: { status: "ALUGADO" },
  });

  const startDate = new Date("2023-01-15");
  const endDate = new Date("2025-07-15");

  await prisma.contract.upsert({
    where: { id: "dev-contract-1" },
    create: {
      id: "dev-contract-1",
      propertyId: prop.id,
      tenantId: "dev-1",
      ownerId: dev2.id,
      startDate,
      endDate,
      rentAmount: 2500,
      chargesAmount: 300,
      dueDay: 5,
      status: "ATIVO",
    },
    update: { status: "ATIVO" },
  });

  console.log("Seed: dev users (dev-1, dev-2), property, contract ready.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
