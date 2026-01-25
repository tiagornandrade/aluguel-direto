
<!-- markdownlint-disable -->
# initial-context — Protótipos e referências visuais

## Propósito

Protótipos HTML estáticos (`code.html`) e capturas de tela (`screen.png`) como **referência de design** para a implementação. A aplicação em `aluguel-direto/` **não os carrega**; servem apenas para consulta (layout, copy, fluxos) durante o desenvolvimento.

## Conteúdo

Cada subpasta representa uma tela ou fluxo:

| Pasta | Conteúdo |
|-------|----------|
| `landing_page_do_saas` | Landing, hero, CTAs |
| `tela_de_login_do_usuário` | Login |
| `criar_conta_na_plataforma` | Cadastro de usuário |
| `dashboard_do_proprietário` | Dashboard do proprietário |
| `dashboard_do_inquilino` | Dashboard do inquilino |
| `cadastro_de_novo_imóvel` | Cadastro de imóvel |
| `edição_de_perfil_do_imóvel` | Edição de imóvel |
| `gestão_de_documentos_do_imóvel` | Documentos do imóvel |
| `geração_de_contrato_de_locação` | Geração de contrato |
| `assinatura_eletrônica_do_contrato` | Assinatura |
| `detalhes_do_contrato_assinado` | Detalhes do contrato |
| `laudo_de_vistoria_digital` | Laudo de vistoria |
| `comparativo_de_vistorias_(entrada_vs._saída)` | Comparativo |
| `encerramento_de_contrato_e_vistoria_de_saída` | Encerramento |
| `solicitações_de_reparos_e_mensagens` | Reparos e mensagens |
| `envio_de_documentos_do_inquilino` | Documentos do inquilino |
| `detalhes_e_pagamento_do_aluguel` | Detalhes e pagamento |
| `histórico_de_pagamentos_e_recibos` | Histórico e recibos |
| `histórico_de_reajustes_do_contrato` | Reajustes |
| `central_de_notificações_e_alertas` | Notificações |
| `configurações_de_notificações` | Config de notificações |
| `configurações_de_perfil_e_privacidade_(lgpd)` | Perfil e LGPD |
| `termos_de_uso_e_políticas_de_privacidade` | Termos e privacidade |
| `onboarding_do_proprietário` | Onboarding proprietário |
| `onboarding_do_inquilino` | Onboarding inquilino |
| `criação_de_aditivo_contratual` | Aditivo contratual |
| `logs_de_auditoria_do_contrato` | Logs de auditoria |
| `análise_de_perfil_do_inquilino` | Análise de perfil |
| `convidar_co-proprietário_e_definir_permissões` | Co-proprietários |
| `dashboard_de_co-proprietários_e_gestão_compartilhada` | Dashboard co-proprietários |
| `dashboard_de_gestão_de_portfólio_(10+_imóveis)` | Portfólio |
| `relatórios_financeiros_detalhados` | Relatórios financeiros |
| `exportação_de_dados_contábeis_em_lote` | Exportação contábil |
| `suporte_e_mediação_de_disputas` | Suporte e disputas |
| `base_de_conhecimento_e_autoatendimento` | Base de conhecimento |
| `dashboard_admin:_visão_de_inadimplência` | Admin inadimplência |
| `dashboard_administrativo_da_plataforma` | Dashboard administrativo |

## Uso

- **A aplicação (`aluguel-direto/`) não carrega estes arquivos em runtime.** São apenas **referência de design** (layout, copy, fluxos) para quem implementa. A implementação em `aluguel-direto/frontend` é independente; ver [BUILD_SPEC](../BUILD_SPEC.md) e [specs/frontend](../../specs/frontend/spec.md).

## Referências

- [BUILD_SPEC](../BUILD_SPEC.md) §4 (mapeamento de rotas)
- [PRD](../PRD.md)
- [specs/frontend](../../specs/frontend/spec.md)
