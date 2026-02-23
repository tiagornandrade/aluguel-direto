<!-- markdownlint-disable -->
# Analisador de documentos com IA

Visão da solução de IA para ler os arquivos enviados pelo locatário e validar os pontos do checklist, facilitando a decisão do locador (aprovar/rejeitar).

## Objetivo

- **Entrada:** documento (imagem ou PDF) enviado pelo locatário (RG, CPF, comprovante de renda, comprovante de endereço).
- **Saída:** análise estruturada (resumo + respostas ao checklist) exibida para o locador, que continua tendo a decisão final (aprovar/rejeitar).

## Fluxo

1. Locador abre a tela de **Análise de documentação** e vê os documentos pendentes.
2. Para um documento, o locador clica em **Analisar com IA** (opcional).
3. Backend envia o arquivo (ou texto extraído do PDF) para um modelo de IA, com um prompt que pede:
   - se o documento está legível;
   - se os dados conferem com o tipo esperado (RG, CPF, etc.);
   - respostas objetivas ao checklist (ex.: "Renda compatível com aluguel? Sim/Não/Indefinido").
4. O resultado é salvo no documento (`analysisResult`, `analyzedAt`) e exibido na mesma tela.
5. O locador usa a análise como apoio e decide **Aprovar** ou **Rejeitar**.

## Opções de implementação

| Abordagem | Prós | Contras |
|-----------|------|---------|
| **OpenAI GPT-4 Vision** | Bom para imagens; uma API. | Custo por uso; PDF precisa ser convertido em imagem ou texto. |
| **OpenAI GPT + texto de PDF** | Funciona com PDF (extrair texto com `pdf-parse`); mesmo modelo para texto. | Não “vê” layout/foto do documento. |
| **Google Document AI** | Focado em documentos estruturados. | Integração e custo. |
| **Serviço especializado (BR)** | Pode validar CPF/CNPJ, RG, etc. | Depende de fornecedor. |

## Implementação atual (MVP)

- **Imagens (JPEG, PNG, WebP):** enviadas para **OpenAI GPT-4 Vision** (base64); o prompt pede um JSON com resumo e respostas ao checklist.
- **PDF:** texto extraído com **pdf-parse** e enviado para **OpenAI GPT-4** (chat); mesmo formato de resposta JSON.
- **Variável de ambiente:** `OPENAI_API_KEY`. Se não estiver definida, o endpoint retorna que a análise por IA não está configurada (ou usa resposta mock em desenvolvimento).
- **Armazenamento:** campos opcionais em `TenantDocument`: `analysisResult` (JSON), `analyzedAt` (datetime).

## Formato do resultado (analysisResult)

```json
{
  "summary": "Resumo em 1-2 frases sobre o documento.",
  "legivel": true,
  "checklist": {
    "documento_legivel": true,
    "dados_conferem_tipo": true,
    "observacoes": "Opcional: qualquer ressalva."
  },
  "model": "gpt-4o",
  "analyzedAt": "2025-02-18T12:00:00.000Z"
}
```

O front exibe **resumo** e os itens do **checklist** (e, se quiser, um badge “Analisado por IA”) para o locador decidir.

## Evoluções futuras

- Comparar dados extraídos (nome, CPF) com o perfil do locatário no sistema.
- Cache ou reprocessamento apenas quando o arquivo muda.
- Suporte a mais provedores (Claude, Gemini, Document AI).
- Auditoria: quem disparou a análise e quando.
