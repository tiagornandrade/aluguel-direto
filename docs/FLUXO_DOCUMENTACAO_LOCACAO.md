<!-- markdownlint-disable -->
# Fluxo de Documentação para Locação

Este documento descreve o fluxo de **envio de documentos pelo locatário** e **análise de documentação pelo locador**, para habilitar o início do processo de locação (e eventual assinatura do contrato).

## Visão geral

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FLUXO DE DOCUMENTAÇÃO                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   LOCADOR (Proprietário)                    LOCATÁRIO (Inquilino)           │
│                                                                             │
│   1. Cria contrato (convida locatário)  →   Recebe contrato pendente        │
│                                                                             │
│   2. [Análise de documentação]          ←   3. Envia documentos             │
│      - Acessa "Documentos / Análise"         - RG                           │
│      - Vê documentos por contrato             - CPF                         │
│      - Aprova ou Rejeita (com motivo)        - Comprovante de renda         │
│      - Quando tudo OK, pode assinar           - Comprovante de endereço     │
│                                                                             │
│   4. Assina contrato (se quiser)       ←   5. Assina contrato               │
│      (fluxo já existente)                    (fluxo já existente)           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Papéis

### Locatário (inquilino)

- **Onde:** Página **Documentos** (ou "Meus documentos" / "Enviar documentação").
- **O que faz:**
  - Vê os contratos em que é locatário (status `PENDENTE_ASSINATURA` ou `ATIVO`).
  - Para cada contrato, vê a lista de **tipos de documento** esperados (RG, CPF, Comprovante de renda, Comprovante de endereço).
  - **Envia** arquivos (PDF ou imagem) para cada tipo.
  - Pode **substituir** um documento rejeitado (novo upload do mesmo tipo).
  - Vê o **status** de cada documento: Pendente de análise, Aprovado ou Rejeitado (com motivo).
- **Objetivo:** Completar a documentação para que o locador analise e libere o andamento (e a assinatura do contrato).

### Locador (proprietário)

- **Onde:** **Análise de documentação** (pode ser uma seção na página Documentos, ou em Contratos, ou no dashboard).
- **O que faz:**
  - Vê contratos (como proprietário) que possuem **documentos enviados pelo locatário**.
  - Para cada contrato, vê a lista de documentos com status **Pendente de análise**, **Aprovado** ou **Rejeitado**.
  - **Abre** cada documento (visualizar/baixar).
  - **Aprova** ou **Rejeita** cada documento (rejeição pode ter motivo opcional).
  - Quando a documentação estiver aprovada, o processo de locação segue (incluindo assinatura do contrato, fluxo já existente).
- **Objetivo:** Analisar a documentação do locatário e habilitar o início do processo de locação (e assinatura).

## Modelo de dados (resumo)

- **TenantDocument** (documento do locatário vinculado ao contrato):
  - `contractId`, `tenantId` (quem enviou)
  - `type`: RG | CPF | COMPROVANTE_RENDA | COMPROVANTE_ENDERECO
  - `fileName`, `contentType`, `data` (conteúdo binário ou referência)
  - `status`: PENDENTE_ANALISE | APROVADO | REJEITADO
  - `rejectedReason` (opcional), `reviewedAt`, `reviewedById` (locador que analisou)

## Tipos de documento

| Tipo                  | Descrição                     |
|-----------------------|-------------------------------|
| RG                    | Documento de identidade       |
| CPF                   | Cadastro de pessoa física     |
| COMPROVANTE_RENDA     | Comprovante de renda          |
| COMPROVANTE_ENDERECO | Comprovante de endereço        |

## Estados do documento

| Status            | Descrição                                      |
|-------------------|------------------------------------------------|
| PENDENTE_ANALISE  | Enviado pelo locatário, aguardando análise     |
| APROVADO          | Locador aprovou o documento                    |
| REJEITADO         | Locador rejeitou (pode haver motivo; reenvio)  |

## Integração com o fluxo atual

- A **criação e assinatura do contrato** permanecem como hoje (locador cria contrato, ambos assinam).
- A **análise de documentação** é uma etapa que pode ocorrer **antes ou em paralelo** à assinatura:
  - O locador pode exigir documentos aprovados antes de assinar (regra de negócio/UX).
  - A interface do locador pode mostrar um resumo: "Documentação OK" quando todos os documentos obrigatórios estiverem aprovados, e então liberar ou destacar a ação "Assinar contrato".

## Telas / Rotas

- **`/documentos`** (única rota, conteúdo por perfil):
  - **Locatário:** lista de contratos + envio de documentos por contrato (tipos, upload, status).
  - **Locador:** lista de contratos com documentos + análise (visualizar, aprovar, rejeitar).
- Opcional: no **dashboard do locador**, card "Pendências documentais" com link para análise (já existe placeholder no dashboard).
- Opcional: no **dashboard do locatário**, aviso "Envie seus documentos" quando houver contrato com documentos pendentes.
