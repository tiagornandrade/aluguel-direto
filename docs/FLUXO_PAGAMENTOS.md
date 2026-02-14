<!-- markdownlint-disable -->
# Fluxo de pagamento – AluguelDireto

Este documento descreve o **fluxo de pagamento** previsto para a plataforma: quem faz o quê, em que momento e o que falta implementar.

---

## 1. Visão geral

- **Inquilino:** paga o aluguel + condomínio (e eventualmente outros itens) até o **dia do vencimento** (ex.: dia 5 de cada mês), conforme o contrato.
- **Locador:** recebe o valor (após taxa da plataforma, se houver gateway).
- **Plataforma:** pode atuar como **infraestrutura** (cobrança, lembretes, histórico) e, opcionalmente, como **processadora** (PIX/boleto via parceiro), com repasse ao locador.

O contrato já define: `rentAmount`, `chargesAmount`, `dueDay`, `paymentMethod` (PIX, Transferência, Boleto, etc.).

---

## 2. Fluxo passo a passo (proposto)

### 2.1 Antes do pagamento (configuração)

1. **Contrato ativo** com valor, vencimento e forma de pagamento.
2. **Locador** (opcional): cadastra chave PIX ou dados bancários para receber (quando houver processamento pela plataforma).
3. **Inquilino** (opcional): vincula forma de pagamento (PIX, boleto) se a cobrança for gerada pela plataforma.

### 2.2 Todo mês (cobrança)

1. **Sistema** gera a **parcela do mês** (valor = aluguel + condomínio, vencimento = dueDay).
2. **Inquilino** recebe **lembrete** (e-mail/notificação) com vencimento e valor.
3. **Inquilino** acessa **Pagamentos** e vê:
   - Próxima parcela (valor, vencimento);
   - Botão **Copiar PIX** ou **Gerar boleto** (conforme contrato e integração).
4. **Inquilino** paga fora da plataforma (PIX para chave do locador, boleto do locador) **ou** paga via gateway (PIX/boleto gerado pela plataforma).
5. **Locador** confirma o recebimento (fluxo manual) **ou** o gateway notifica a plataforma (fluxo automatizado).
6. Sistema marca a parcela como **Paga** e pode gerar **recibo** para o inquilino.

### 2.3 Locador (gestão)

1. **Pagamentos** do locador: lista de contratos e, por contrato, **parcelas** (mês, valor, status: pendente / pago / atrasado).
2. Opção de **enviar cobrança** (reenvio de PIX/boleto ou lembrete).
3. **Histórico e recibos** para uso contábil e do inquilino.

### 2.4 Inadimplência

1. Após o vencimento: parcela **atrasada**; aplicação de **multa/juros** conforme contrato (já temos `lateFeePercent`, `interestPercent` no contrato).
2. Notificações de atraso para o inquilino e alertas para o locador.
3. (Futuro) Histórico de crédito / relatórios de inadimplência.

---

## 3. O que já existe no produto

| Item | Onde |
|------|------|
| Valor e vencimento no contrato | `Contract`: `rentAmount`, `chargesAmount`, `dueDay`, `paymentMethod` |
| Exibição “Próximo aluguel” (inquilino) | Dashboard inquilino: valor, vencimento, link “Ver Detalhes” → `/pagamentos` |
| Botão “Copiar PIX/Boleto” | Dashboard inquilino (ainda sem ação real) |
| Página Pagamentos | `/pagamentos` – placeholder “Histórico em construção” |
| Termos | Texto sobre “infraestrutura bancária parceira” e cobrança |

---

## 4. O que falta implementar (resumo)

### 4.1 Modelo de dados

- **Parcela (Payment / RentInstallment):** contrato, mês/ano de referência, valor, data de vencimento, status (pendente, pago, atrasado), data de pagamento, comprovante/ID externo (gateway), recibo gerado.

### 4.2 Backend

- CRUD de parcelas (geração mensal automática ou sob demanda).
- Endpoints: listar parcelas por contrato, marcar como paga, gerar recibo.
- (Se houver gateway) Webhook para confirmação de pagamento; integração com API do parceiro (PIX/boleto).

### 4.3 Frontend

- **Inquilino – Pagamentos:** próxima parcela, valor, vencimento, “Copiar PIX” / “Gerar boleto” (conforme integração), histórico de parcelas e recibos.
- **Locador – Pagamentos:** por contrato, lista de parcelas, status, “Marcar como pago” (fluxo manual) ou visualização do status vindo do gateway.
- **Detalhe da parcela** (`/pagamentos/[id]`): valor, vencimento, status, recibo (download/visualização).

### 4.4 Integração com gateway (futuro)

- Escolher parceiro (ex.: Stripe, Pagar.me, Asaas, outro).
- Cadastro de “conta para receber” do locador e “forma de pagamento” do inquilino.
- Geração de cobrança (PIX/boleto) e repasse ao locador após taxa.
- Notificações de pagamento (webhook) para atualizar status da parcela e disparar recibo.

---

## 5. Fluxo resumido (diagrama em texto)

```
[Contrato ativo]
       │
       ▼
[Todo mês] Sistema gera parcela (valor, vencimento)
       │
       ▼
Inquilino recebe lembrete → Abre "Pagamentos" → Vê parcela
       │
       ├── Copiar PIX / Boleto (dados do locador ou link do gateway)
       │
       ▼
Inquilino paga (fora ou via plataforma)
       │
       ▼
Locador confirma OU gateway notifica
       │
       ▼
Parcela → status "Pago" | Recibo disponível
```

---

## 6. Decisão de produto

- **Fluxo manual (MVP):** sem gateway; locador informa chave PIX/dados no perfil ou no contrato; inquilino paga e locador marca “Recebido” na plataforma; sistema gera parcelas e recibos.
- **Fluxo com gateway:** integração com um parceiro de pagamento para gerar PIX/boleto e, opcionalmente, repasse automático ao locador (com taxa).

O que já está nos **Termos** (“infraestrutura bancária parceira”, “ferramentas de cobrança e histórico”) é compatível com os dois cenários; a implementação pode começar pelo MVP manual e evoluir para gateway depois.
