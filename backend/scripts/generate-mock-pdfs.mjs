/**
 * Gera 4 PDFs mockados para validar o fluxo de envio de documentos do inquilino.
 * Não usa dependências externas — gera PDF mínimo válido em JS puro.
 *
 * Uso: node scripts/generate-mock-pdfs.mjs (na pasta backend)
 * Arquivos gerados em: backend/mock-documentos/
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "mock-documentos");

/**
 * Gera um PDF mínimo válido (uma página) com um título de texto.
 * Estrutura: header + objetos (Catalog, Pages, Page, Font, Contents) + xref + trailer.
 */
function createMinimalPdf(title) {
  const lines = [];
  const add = (s) => {
    lines.push(s);
  };

  // Obj 1: Catalog
  add("1 0 obj");
  add("<< /Type /Catalog /Pages 2 0 R >>");
  add("endobj");

  // Obj 2: Pages
  add("2 0 obj");
  add("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  add("endobj");

  // Obj 3: Page
  add("3 0 obj");
  add("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 4 0 R >> >> >>");
  add("endobj");

  // Obj 4: Font
  add("4 0 obj");
  add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  add("endobj");

  // Obj 5: Content stream (texto na página)
  const streamBody = `BT /F1 14 Tf 50 750 Td (${title}) Tj ET`;
  add("5 0 obj");
  add("<< /Length " + streamBody.length + " >>");
  add("stream");
  add(streamBody);
  add("endstream");
  add("endobj");

  const body = lines.join("\n");
  const bodyBytes = Buffer.from(body, "utf8");

  // Calcular offsets dos objetos (a partir do início do arquivo)
  const header = "%PDF-1.4\n";
  let offset = header.length;
  const offsets = [0]; // obj 0 (free)
  let idx = bodyBytes.indexOf(Buffer.from("1 0 obj", "utf8"));
  if (idx !== -1) offsets.push(offset + idx);
  idx = bodyBytes.indexOf(Buffer.from("2 0 obj", "utf8"));
  if (idx !== -1) offsets.push(offset + idx);
  idx = bodyBytes.indexOf(Buffer.from("3 0 obj", "utf8"));
  if (idx !== -1) offsets.push(offset + idx);
  idx = bodyBytes.indexOf(Buffer.from("4 0 obj", "utf8"));
  if (idx !== -1) offsets.push(offset + idx);
  idx = bodyBytes.indexOf(Buffer.from("5 0 obj", "utf8"));
  if (idx !== -1) offsets.push(offset + idx);

  // Recalcular offsets manualmente (ordem no body)
  const o1 = body.indexOf("1 0 obj");
  const o2 = body.indexOf("2 0 obj");
  const o3 = body.indexOf("3 0 obj");
  const o4 = body.indexOf("4 0 obj");
  const o5 = body.indexOf("5 0 obj");
  offset = header.length;
  const xrefEntries = [
    "0000000000 65535 f ",
    String(offset + o1).padStart(10, "0") + " 00000 n ",
    String(offset + o2).padStart(10, "0") + " 00000 n ",
    String(offset + o3).padStart(10, "0") + " 00000 n ",
    String(offset + o4).padStart(10, "0") + " 00000 n ",
    String(offset + o5).padStart(10, "0") + " 00000 n ",
  ];

  const xrefTable = ["xref", "0 6", ...xrefEntries];
  const xrefStr = xrefTable.join("\n");
  const sep = "\n";
  const startxrefVal = header.length + bodyBytes.length + sep.length; // aponta para o início de "xref"
  const trailer = [
    "trailer",
    "<< /Size 6 /Root 1 0 R >>",
    "startxref",
    String(startxrefVal),
    "%%EOF",
  ].join("\n");

  return Buffer.concat([
    Buffer.from(header, "utf8"),
    bodyBytes,
    Buffer.from("\n" + xrefStr + "\n" + trailer, "utf8"),
  ]);
}

const DOCS = [
  { file: "mock-rg.pdf", title: "RG - Documento de identidade (MOCK)" },
  { file: "mock-cpf.pdf", title: "CPF - MOCK" },
  { file: "mock-comprovante-renda.pdf", title: "Comprovante de renda (MOCK)" },
  { file: "mock-comprovante-endereco.pdf", title: "Comprovante de endereco (MOCK)" },
];

function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  for (const item of DOCS) {
    const pdf = createMinimalPdf(item.title);
    const outPath = path.join(OUT_DIR, item.file);
    fs.writeFileSync(outPath, pdf);
    console.log("Gerado:", outPath);
  }

  console.log("\n4 PDFs mockados gerados em:", OUT_DIR);
  console.log("Use esses arquivos na tela Documentos (inquilino) para validar o upload.");
}

main();
