<!-- markdownlint-disable -->
# Documentação — Estrutura

Este diretório segue o padrão de [dataplatform-argocd-gke-deployments/docs](https://github.com/loft-data/dataplatform-argocd-gke-deployments/tree/main/docs).

## Estrutura

```
docs/
├── README.md                 # Este arquivo
├── BUILD_SPEC.md             # Especificação de build (React, Next.js, DDD)
├── initial-context/          # Protótipos HTML (code.html) e screens (screen.png) de referência
├── guides/
│   ├── deployment/
│   ├── processes/
│   └── CONTEXT_TEMPLATE.md   # Modelo de CONTEXT.md para pastas do source
├── decisions/
│   ├── adrs/                 # Architecture Decision Records (0001-...)
│   └── trade-offs/
├── communications/
└── registros/
```

## Categorias

| Pasta | Uso |
|-------|-----|
| **guides/** | Como fazer: deploy, processos, troubleshooting. Nome: `VERB_NOUN.md`. |
| **decisions/adrs/** | Decisões já tomadas (contexto, decisão, consequências). Nome: `NNNN-descricao.md`. |
| **decisions/trade-offs/** | Análise de alternativas antes da decisão. Nome: `TOPIC_TRADE_OFF.md`. |
| **communications/** | Respostas a stakeholders, notas. |
| **registros/** | Auditoria, validação, histórico de implementação. |
| **initial-context/** | Protótipos HTML (`code.html`) e imagens (`screen.png`) como **referência de design**; a aplicação em `aluguel-direto/` **não os carrega** em runtime. |

## Índice

- [BUILD_SPEC](BUILD_SPEC.md) — Spec de build (aluguel-direto: backend, frontend, DDD, docs, CONTEXT.md, specs).
- [initial-context](initial-context/README.md) — Protótipos HTML e `screen.png` de referência.
- [CONTEXT_TEMPLATE](guides/CONTEXT_TEMPLATE.md) — Modelo de `CONTEXT.md` para pastas do source em `aluguel-direto/`.
