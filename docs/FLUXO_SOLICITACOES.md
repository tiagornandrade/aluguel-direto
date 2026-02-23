<!-- markdownlint-disable -->
# Fluxo de Solicitações

## Visão geral

**Solicitações** é a área em que o **inquilino** acompanha tudo que **ele enviou** ao locador:
1. **Pedidos de interesse** em imóveis (antes do contrato) — "Entrar em contato" em Buscar imóveis.
2. **Pedidos ao locador** (durante o contrato): reparo/manutenção, troca de algo, pedido de rescisão do contrato.

O **proprietário** vê as solicitações **recebidas** em **Notificações** (CONTACT_REQUEST e os novos tipos: PEDIDO_REPARO, PEDIDO_TROCA, PEDIDO_RESCISAO).

## Tipos de solicitação

| Tipo              | Quem envia | Descrição |
|-------------------|------------|-----------|
| CONTACT_REQUEST   | Interessado/inquilino | Interesse em um imóvel (Buscar imóveis → Entrar em contato). |
| PEDIDO_REPARO     | Inquilino  | Informar que o imóvel precisa de reparo/manutenção. |
| PEDIDO_TROCA      | Inquilino  | Solicitar troca de algo (chave, equipamento, etc.). |
| PEDIDO_RESCISAO   | Inquilino  | Solicitar rescisão do contrato. |
| SOLICITACAO_LOCADOR_TROCA | Proprietário | Locador envia solicitação de troca ao locatário (ex.: troca de titularidade). |

## Papéis

| Papel           | Onde vê solicitações | O que vê |
|-----------------|----------------------|----------|
| **Inquilino**   | "Solicitações" e "Notificações" | **Solicitações:** lista do que enviou (interesse + pedidos ao locador). **Notificações:** solicitações recebidas do locador (ex.: solicitação de troca), com link para contrato e mensagens. |
| **Proprietário**| Menu "Notificações"  | Pedidos de interesse e pedidos do inquilino (reparo, troca, rescisão), com ações para responder ou ver contrato. Pode enviar solicitação ao locatário pelo dashboard (Solicitar ao locatário) ou pela página dedicada. |

## Fluxo do inquilino

1. **Enviar interesse (imóvel)**
   - Buscar imóveis → Entrar em contato → (opcional) mensagem → Enviar.
   - Cria notificação `CONTACT_REQUEST`.

2. **Enviar pedido ao locador (contrato ativo)**
   - Solicitacoes → **Nova solicitação** (ou a partir do contrato) → escolhe contrato, tipo (Reparo / Troca / Rescisão), mensagem → Enviar.
   - Cria notificação `PEDIDO_REPARO`, `PEDIDO_TROCA` ou `PEDIDO_RESCISAO` com `contractId` e `propertyId`.

3. **Acompanhar solicitações**
   - Solicitacoes lista todas (interesse + pedidos ao locador).
   - Por item: tipo, imóvel/contrato, destinatário (proprietário), data, mensagem; links para Ver imóvel / Enviar mensagem (e, se tiver contrato, Ver contrato).

## Fluxo do proprietário

- **Notificações** exibem CONTACT_REQUEST (como hoje) e os novos tipos (PEDIDO_REPARO, PEDIDO_TROCA, PEDIDO_RESCISAO) com rótulo e link para o contrato quando houver.
- **Enviar solicitação ao locatário:** Dashboard → Meus Imóveis → "Solicitar ao locatário" (para contrato ativo) → mensagem opcional → Enviar. Cria notificação `SOLICITACAO_LOCADOR_TROCA` com o locatário como destinatário; ele vê em **Notificações**.

## Dados e API

- **Listar todas as solicitações enviadas (inquilino):** `GET /api/v1/notifications/sent-requests`
  - Retorna notificações com `senderId = userId` e `type` em CONTACT_REQUEST, PEDIDO_REPARO, PEDIDO_TROCA, PEDIDO_RESCISAO.
  - Cada item: id, type, propertyId, contractId (quando aplicável), recipientName, propertyTitle, message, createdAt.

- **Criar pedido de interesse (já existe):** `POST /api/v1/notifications/contact-request` com `propertyId` e opcional `message`.

- **Criar pedido ao locador:** `POST /api/v1/notifications/tenant-request` com `contractId`, `type` (PEDIDO_REPARO | PEDIDO_TROCA | PEDIDO_RESCISAO), opcional `message`. Apenas o inquilino do contrato pode enviar.
- **Criar solicitação ao locatário:** `POST /api/v1/notifications/owner-to-tenant-request` com `contractId`, opcional `message`. Apenas o proprietário do contrato pode enviar. Cria notificação tipo `SOLICITACAO_LOCADOR_TROCA` para o locatário.

## Regras

- Apenas **inquilino** acessa a página Solicitações (lista de enviados + Nova solicitação).
- Proprietário vê tudo em **Notificações**; tipos novos têm rótulo e link para contrato quando existir `contractId`.
