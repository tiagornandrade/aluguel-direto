<!-- markdownlint-disable -->
# PRD e Definição de Marca – Aluguel Direto

Prompt para geração de PRD e definição de marca. Use como documento base do projeto.

---

## Contexto geral do produto

Estamos projetando um SaaS que permite a locação de imóveis entre pessoas físicas, sem intermediação tradicional de imobiliárias ou corretores, mas assumindo todas as responsabilidades operacionais, documentais e contratuais que uma imobiliária normalmente executa.

O sistema conecta proprietários de imóveis e inquilinos, oferecendo um ambiente seguro, rastreável e juridicamente organizado para todo o ciclo de vida da locação, desde a intenção de alugar até o encerramento do contrato.

O produto deve ser pensado para o mercado brasileiro e seguir práticas compatíveis com contratos de locação residencial urbana.

---

# Parte 1. PRD – Product Requirements Document

## 1. Objetivo do produto

Criar uma plataforma que:

- Reduza a fricção e o custo do aluguel direto entre pessoas físicas
- Elimine a dependência de imobiliárias para processos operacionais
- Centralize contratos, documentos, vistorias, recibos e comunicações
- Traga previsibilidade jurídica e organização para ambas as partes

---

## 2. Perfis de usuários

### 2.1 Proprietário do imóvel

Responsável por:

- Cadastrar e gerenciar imóveis
- Definir termos do contrato
- Disponibilizar documentação do imóvel
- Emitir recibos de pagamento
- Receber notificações e solicitações do inquilino
- Encerrar contratos e conduzir vistorias de saída

### 2.2 Inquilino

Responsável por:

- Enviar documentação pessoal
- Participar da assinatura do contrato
- Registrar vistorias de entrada e saída
- Solicitar reparos ou melhorias
- Acompanhar recibos e histórico de pagamentos

---

## 3. Escopo funcional

### 3.1 Cadastro e gestão de imóveis

- **Cadastro de imóveis com:**
  - Endereço completo
  - Tipo do imóvel
  - Área, número de cômodos, vagas
  - Valor do aluguel
  - Valor de encargos, se aplicável
- **Upload de documentos do imóvel:**
  - Escritura ou matrícula
  - IPTU
  - Condomínio
  - Outros documentos relevantes
- **Status do imóvel:**
  - Disponível
  - Em negociação
  - Alugado
  - Encerrado

---

### 3.2 Gestão de usuários e documentos

- Cadastro de usuário com validação de identidade
- Upload e validação de documentos do inquilino:
  - Documento de identidade
  - Comprovante de renda
  - Comprovante de residência
- Histórico de versões de documentos
- Controle de acesso aos documentos por perfil

---

### 3.3 Geração e gestão de contrato de locação

- Geração automática de contrato de locação com:
  - Dados do imóvel
  - Dados do proprietário
  - Dados do inquilino
  - Valor, prazo, reajuste
  - Cláusulas padrão e personalizáveis
- Versionamento de contratos
- Visualização clara das cláusulas antes da assinatura
- Bloqueio de edição após assinatura

---

### 3.4 Assinatura eletrônica

- Integração com serviço de assinatura eletrônica
- Assinatura por ambas as partes
- Registro de:
  - Data e hora
  - IP
  - Identidade do signatário
- Armazenamento do contrato assinado
- Download do contrato a qualquer momento

---

### 3.5 Vistoria de entrada e saída

- **Criação de laudo de vistoria:**
  - Texto estruturado por ambiente
  - Upload de fotos e vídeos
  - Observações livres
- **Vistoria de entrada:**
  - Assinada por ambas as partes
- **Vistoria de saída:**
  - Comparação com vistoria de entrada
  - Registro de divergências
- Histórico completo de vistorias

---

### 3.6 Comunicação e solicitações

- Canal interno de comunicação entre proprietário e inquilino
- Solicitação de reparos ou melhorias
- Registro do status da solicitação:
  - Aberta
  - Em análise
  - Aprovada
  - Concluída
- Histórico auditável de mensagens

---

### 3.7 Pagamentos e recibos

- Registro de valores de aluguel
- Geração automática de recibo de quitação
- Histórico de pagamentos por contrato
- Download de recibos
- Notificações de vencimento

---

## 4. Requisitos não funcionais

### 4.1 Segurança

- Controle de acesso por perfil
- Criptografia de documentos sensíveis
- Logs de auditoria para ações críticas
- Isolamento de dados entre contratos

### 4.2 Confiabilidade e rastreabilidade

- Versionamento de documentos
- Histórico imutável de contratos e vistorias
- Registro de ações do usuário

### 4.3 Usabilidade

- Interface simples e orientada a fluxo
- Linguagem clara, sem juridiquês excessivo
- Foco em reduzir erros humanos

### 4.4 Escalabilidade

- Arquitetura preparada para múltiplos contratos por usuário
- Suporte a crescimento gradual de base de usuários
- Serviços desacoplados

### 4.5 Conformidade legal

- Adequação à LGPD
- Termos de uso e política de privacidade claros
- Armazenamento de consentimento do usuário

---

# Parte 2. Definição de marca e posicionamento

## 1. Problema que a marca resolve

- Alugar direto é burocrático, inseguro e desorganizado
- Imobiliárias são caras e pouco transparentes
- Falta controle, histórico e previsibilidade para ambas as partes

---

## 2. Proposta de valor

Permitir que duas pessoas façam um contrato de locação com o mesmo nível de organização, segurança e formalidade de uma imobiliária, sem depender de uma.

---

## 3. Posicionamento de mercado

- Não é um marketplace de anúncios
- Não é uma imobiliária digital
- É uma infraestrutura de locação entre pessoas

---

## 4. Personalidade da marca

- Séria
- Clara
- Confiável
- Discreta
- Orientada a responsabilidade

Evitar linguagem publicitária exagerada. A marca deve transmitir organização e previsibilidade.

---

## 5. Diretrizes para o front end

- Interface limpa e funcional
- Prioridade para leitura e conferência de informações
- Fluxos guiados passo a passo
- Destaque visual para:
  - Contratos
  - Assinaturas
  - Pendências
  - Ações obrigatórias
- Pouca cor, bom contraste, foco em conteúdo

---

## 6. Tom de comunicação no produto

- Direto
- Educado
- Informativo
- Sem promessas vagas
- Sem frases de efeito

**Exemplo:**

- "Contrato pronto para assinatura"
- "Documento enviado com sucesso"
- "Vistoria aguardando confirmação do proprietário"

---

## 7. Diferencial competitivo

- Centralização total do ciclo de locação
- Histórico completo e auditável
- Redução de conflitos por falta de registro
- Experiência próxima à de uma imobiliária, sem intermediação humana

---

## Próximos passos (sugestões)

- Ajustar esse PRD para MVP vs versão completa
- Criar wireframes textuais de cada tela
- Sugerir arquitetura técnica para backend e frontend
- Ajudar a definir nome do produto e identidade visual
