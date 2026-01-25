<!-- markdownlint-disable -->
# TODO: Screens from docs/initial-context/png

Reference: all PNGs in `docs/initial-context/png/` (excluding `logo.png`).

## Legend

- ✅ Implemented and aligned with image
- 🟡 Implemented, needs alignment with image
- ❌ Not implemented

---

## Auth & Marketing

| PNG | Route/Page | Status | Notes |
|-----|-------------|--------|-------|
| `landing_page_do_saas.png` | `(auth)/` (/) | ✅ | CTA "Falar com consultor" in banner; Suporte in footer |
| `tela_de_login_do_usuário.png` | `(auth)/login` | ✅ | Left 2 features, "OU ENTRE COM" + Google/LinkedIn, password visibility toggle |
| `criar_conta_na_plataforma.png` | `(auth)/criar-conta` | ✅ | Header nav, left 3 features, Passo 1 de 2 + 50%, CPF "Dados Criptografados" + info, password strength |
| `termos_de_uso_e_políticas_de_privacidade.png` | `(auth)/termos` | ✅ | Sidebar Documentação Legal, sections 1–5, Resumo Rápido, Precisa de ajuda?, Download/print/share |

---

## Onboarding

| PNG | Route/Page | Status | Notes |
|-----|-------------|--------|-------|
| `onboarding_do_proprietário.png` | `(app)/onboarding-proprietario` | ✅ | Welcome + 3 steps, Cadastrar Primeiro Imóvel → /imoveis/novo, Central de Ajuda (vídeo placeholder + 3 guias) |
| `onboarding_do_inquilino.png` | `(app)/onboarding-inquilino` | ✅ | Ações Prioritárias, Progresso da Locação (4 steps), Resumo 1º Pagamento, Segurança, Imóvel Reservado |

---

## Dashboards

| PNG | Route/Page | Status | Notes |
|-----|-------------|--------|-------|
| `dashboard_do_proprietário.png` | `(app)/dashboard-proprietario` | ✅ | Nav (AppHeader role-based), Search, bell/gear/avatar; metric icons; Meus Imóveis table; Ações Prioritárias (3 cards) |
| `dashboard_do_inquilino.png` | `(app)/dashboard-inquilino` | ✅ | Nav (AppHeader); Próximo Aluguel; Resumo do Imóvel; Solicitações Recentes; Central de Ajuda; Tempo de Contrato |
| `dashboard_de_gestão_de_portfólio_(10+_imóveis).png` | — | ❌ | Portfolio view for 10+ properties |
| `dashboard_de_co-proprietários_e_gestão_compartilhada.png` | — | ❌ | Co-owners and shared management |
| `dashboard_admin:_visão_de_inadimplência.png` | — | ❌ | Admin: default view |
| `dashboard_administrativo_da_plataforma.png` | — | ❌ | Admin: platform overview |

---

## Properties

| PNG | Route/Page | Status | Notes |
|-----|-------------|--------|-------|
| `cadastro_de_novo_imóvel.png` | `(app)/imoveis/novo` | ✅ | Passo 1–4, tabs, checklist, map placeholder, Salvar Rascunho, Próximo Passo, "Todos os dados são salvos automaticamente"; steps 2–4 placeholder |
| `edição_de_perfil_do_imóvel.png` | — | ❌ | Edit property profile |
| `gestão_de_documentos_do_imóvel.png` | — | ❌ | Property documents |

---

## Contracts & Signing

| PNG | Route/Page | Status | Notes |
|-----|-------------|--------|-------|
| `geração_de_contrato_de_locação.png` | — | ❌ | Contract generation |
| `assinatura_eletrônica_do_contrato.png` | — | ❌ | E-signature flow |
| `detalhes_do_contrato_assinado.png` | — | ❌ | Contract details after signing |
| `criação_de_aditivo_contratual.png` | — | ❌ | Contract addendum |
| `histórico_de_reajustes_do_contrato.png` | — | ❌ | Contract adjustment history |
| `logs_de_auditoria_do_contrato.png` | — | ❌ | Contract audit logs |
| `encerramento_de_contrato_e_vistoria_de_saída.png` | — | ❌ | Contract closure and exit inspection |

---

## Inspections

| PNG | Route/Page | Status | Notes |
|-----|-------------|--------|-------|
| `laudo_de_vistoria_digital.png` | — | ❌ | Digital inspection report |
| `comparativo_de_vistorias_(entrada_vs._saída).png` | — | ❌ | Entry vs exit comparison |

---

## Payments & Finance

| PNG | Route/Page | Status | Notes |
|-----|-------------|--------|-------|
| `detalhes_e_pagamento_do_aluguel.png` | — | ❌ | Rent details and payment |
| `histórico_de_pagamentos_e_recibos.png` | — | ❌ | Payment history and receipts |
| `relatórios_financeiros_detalhados.png` | — | ❌ | Financial reports |
| `exportação_de_dados_contábeis_em_lote.png` | — | ❌ | Batch accounting export |

---

## Tenant & Documents

| PNG | Route/Page | Status | Notes |
|-----|-------------|--------|-------|
| `análise_de_perfil_do_inquilino.png` | — | ❌ | Tenant profile analysis |
| `envio_de_documentos_do_inquilino.png` | — | ❌ | Tenant document upload |

---

## Co-ownership & Settings

| PNG | Route/Page | Status | Notes |
|-----|-------------|--------|-------|
| `convidar_co-proprietário_e_definir_permissões.png` | — | ❌ | Invite co-owner and permissions |
| `configurações_de_notificações.png` | — | ❌ | Notification settings |
| `configurações_de_perfil_e_privacidade_(lgpd).png` | — | ❌ | Profile and privacy (LGPD) |

---

## Support & Knowledge

| PNG | Route/Page | Status | Notes |
|-----|-------------|--------|-------|
| `base_de_conhecimento_e_autoatendimento.png` | — | ❌ | Knowledge base and self-service |
| `central_de_notificações_e_alertas.png` | — | ❌ | Notifications and alerts |
| `solicitações_de_reparos_e_mensagens.png` | — | ❌ | Repair requests and messages |
| `suporte_e_mediação_de_disputas.png` | — | ❌ | Support and dispute mediation |

---

## Implementation order (suggested)

1. **TODO.md** (this file) — done  
2. **Landing** — add "Falar com consultor", Suporte  
3. **Login** — left features, social login (Google/LinkedIn), password toggle  
4. **Criar conta** — header nav, left panel, step indicator, CPF info, password strength  
5. **Termos** — sidebar, sections, Resumo Rápido, PDF/print/share  
6. **Dashboard Proprietário** — nav, search, icons, Meus Imóveis table, Ações Prioritárias  
7. **Dashboard Inquilino** — nav, Próximo Aluguel, Resumo, Solicitações, Central de Ajuda, Tempo de Contrato  
8. **Cadastro imóvel** — 4-step wizard, tabs, checklist, map, Salvar Rascunho, Próximo Passo  
9. **Onboarding** — proprietário e inquilino (feito: `/onboarding-proprietario`, `/onboarding-inquilino`)  
10. **Demais telas** — conforme prioridade do produto (contratos, pagamentos, detalhes, admin, etc.)
