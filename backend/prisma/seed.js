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
      email: "locatario@alugueldireto.local",
      fullName: "Maria Silva (Locatária)",
      cpf: "01421927594",
      rg: "0845236466",
      nacionalidade: "Brasileira",
      estadoCivil: "Casado(a)",
      profissao: "Médica",
      endereco: "Rua das Rosas, 45 – Jardim Paulista, São Paulo/SP",
      passwordHash,
      role: "INQUILINO",
      profileCompleted: true,
    },
    update: {
      email: "locatario@alugueldireto.local",
      fullName: "Maria Silva (Locatária)",
      cpf: "01421927594",
      rg: "0845236466",
      nacionalidade: "Brasileira",
      estadoCivil: "Casado(a)",
      profissao: "Médica",
      endereco: "Rua das Rosas, 45 – Jardim Paulista, São Paulo/SP",
      role: "INQUILINO",
      passwordHash,
    },
  });

  await prisma.user.upsert({
    where: { id: "dev-2" },
    create: {
      id: "dev-2",
      email: "locador@alugueldireto.local",
      fullName: "Carlos Alberto (Locador)",
      cpf: "12345678909",
      rg: "123456789",
      nacionalidade: "Brasileira",
      estadoCivil: "Divorciado(a)",
      profissao: "Engenheiro civil",
      endereco: "Av. Brigadeiro Faria Lima, 1200 – Itaim Bibi, São Paulo/SP",
      passwordHash,
      role: "PROPRIETARIO",
      profileCompleted: true,
    },
    update: {
      email: "locador@alugueldireto.local",
      fullName: "Carlos Alberto (Locador)",
      cpf: "12345678909",
      rg: "123456789",
      nacionalidade: "Brasileira",
      estadoCivil: "Divorciado(a)",
      profissao: "Engenheiro civil",
      endereco: "Av. Brigadeiro Faria Lima, 1200 – Itaim Bibi, São Paulo/SP",
      passwordHash,
    },
  });

  await prisma.contract.deleteMany({ where: { id: "dev-contract-1" } });
  await prisma.property.deleteMany({ where: { id: "dev-prop-1" } });

  console.log("Seed: locatário (Maria) e locador (Carlos) criados. Sem imóvel/contrato. Senha: dev");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
