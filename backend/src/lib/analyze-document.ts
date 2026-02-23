/**
 * Análise de documento com IA (OpenAI) para apoio à decisão do locador.
 * - Imagens: GPT-4 Vision
 * - PDF: extração de texto (pdf-parse) + GPT-4
 * Sem OPENAI_API_KEY: retorna análise mock para desenvolvimento.
 */

export interface DocumentAnalysisResult {
  summary: string;
  legivel: boolean;
  checklist: {
    documento_legivel: boolean;
    dados_conferem_tipo: boolean;
    observacoes?: string;
  };
  model: string;
  analyzedAt: string;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  RG: "RG (documento de identidade)",
  CPF: "CPF",
  COMPROVANTE_RENDA: "comprovante de renda",
  COMPROVANTE_ENDERECO: "comprovante de endereço",
};

function mockAnalysis(docType: string): DocumentAnalysisResult {
  const typeLabel = DOC_TYPE_LABELS[docType] ?? docType;
  return {
    summary: `[Mock] Documento enviado como ${typeLabel}. Configure OPENAI_API_KEY para análise real por IA.`,
    legivel: true,
    checklist: {
      documento_legivel: true,
      dados_conferem_tipo: true,
      observacoes: "Análise mock — defina OPENAI_API_KEY no .env para usar a IA.",
    },
    model: "mock",
    analyzedAt: new Date().toISOString(),
  };
}

function buildPrompt(docType: string, isImage: boolean): string {
  const typeLabel = DOC_TYPE_LABELS[docType] ?? docType;
  const context = isImage
    ? "Você está vendo uma imagem de um documento."
    : "Abaixo está o texto extraído de um documento (PDF).";
  return `${context}
O tipo esperado do documento é: ${typeLabel}.

Analise e responda em JSON válido, apenas este objeto (sem markdown, sem \`\`\`):
{
  "summary": "resumo em 1 ou 2 frases em português",
  "legivel": true ou false,
  "checklist": {
    "documento_legivel": true ou false,
    "dados_conferem_tipo": true ou false,
    "observacoes": "opcional: qualquer ressalva ou indefinição"
  }
}

Responda somente com o JSON.`;
}

export async function analyzeDocument(
  buffer: Buffer,
  contentType: string,
  docType: string
): Promise<DocumentAnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "") {
    return mockAnalysis(docType);
  }

  const isImage =
    contentType === "image/jpeg" ||
    contentType === "image/png" ||
    contentType === "image/webp" ||
    contentType === "image/gif";
  const isPdf = contentType === "application/pdf";

  if (isImage) {
    return analyzeWithVision(apiKey, buffer, contentType, docType);
  }
  if (isPdf) {
    return analyzePdfWithChat(apiKey, buffer, docType);
  }
  return mockAnalysis(docType);
}

async function analyzeWithVision(
  apiKey: string,
  buffer: Buffer,
  contentType: string,
  docType: string
): Promise<DocumentAnalysisResult> {
  const { OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey });
  const base64 = buffer.toString("base64");
  const mediaType = contentType === "image/jpg" ? "image/jpeg" : contentType;

  const prompt = buildPrompt(docType, true);
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mediaType};base64,${base64}`,
            },
          },
        ],
      },
    ],
  });

  const text = response.choices[0]?.message?.content?.trim() ?? "{}";
  return parseAnalysisResponse(text, docType, "gpt-4o");
}

const PDF_UNREADABLE_RESULT: DocumentAnalysisResult = {
  summary:
    "Não foi possível extrair texto do PDF (arquivo pode estar corrompido ou ser apenas imagem). Envie uma foto do documento para análise por IA.",
  legivel: false,
  checklist: {
    documento_legivel: false,
    dados_conferem_tipo: false,
    observacoes: "PDF não pôde ser lido (formato inválido ou sem texto).",
  },
  model: "gpt-4o",
  analyzedAt: new Date().toISOString(),
};

async function analyzePdfWithChat(
  apiKey: string,
  buffer: Buffer,
  docType: string
): Promise<DocumentAnalysisResult> {
  let text: string;
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    text = (data.text ?? "").trim().slice(0, 8000);
  } catch {
    return { ...PDF_UNREADABLE_RESULT, analyzedAt: new Date().toISOString() };
  }
  if (!text) return { ...PDF_UNREADABLE_RESULT, analyzedAt: new Date().toISOString() };

  const { OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey });
  const prompt = buildPrompt(docType, false) + "\n\nTexto do documento:\n" + text;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.choices[0]?.message?.content?.trim() ?? "{}";
  return parseAnalysisResponse(content, docType, "gpt-4o");
}

function parseAnalysisResponse(
  text: string,
  docType: string,
  model: string
): DocumentAnalysisResult {
  const cleaned = text.replace(/^```json?\s*|\s*```$/g, "").trim();
  try {
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    return {
      summary: typeof parsed.summary === "string" ? parsed.summary : "Análise concluída.",
      legivel: Boolean(parsed.legivel),
      checklist: {
        documento_legivel: Boolean((parsed.checklist as Record<string, unknown>)?.documento_legivel),
        dados_conferem_tipo: Boolean((parsed.checklist as Record<string, unknown>)?.dados_conferem_tipo),
        observacoes: typeof (parsed.checklist as Record<string, unknown>)?.observacoes === "string"
          ? ((parsed.checklist as Record<string, unknown>).observacoes as string)
          : undefined,
      },
      model,
      analyzedAt: new Date().toISOString(),
    };
  } catch {
    return {
      summary: "A IA retornou uma resposta que não pôde ser interpretada. Revise o documento manualmente.",
      legivel: true,
      checklist: {
        documento_legivel: true,
        dados_conferem_tipo: false,
        observacoes: "Resposta da IA inválida.",
      },
      model,
      analyzedAt: new Date().toISOString(),
    };
  }
}
