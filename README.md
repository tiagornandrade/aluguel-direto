<!-- markdownlint-disable -->
# AluguelDireto

SaaS de infraestrutura de locação residencial entre pessoas físicas, conforme PRD: contratos, vistorias, documentos, pagamentos e comunicação em uma única plataforma.

> **Especificação de build (React + Next.js + DDD):** [docs/BUILD_SPEC.md](docs/BUILD_SPEC.md)  
> **Specs (project, backend, frontend):** [specs/](specs/) · **Documentação (docs):** [docs/](docs/)

## Aplicação

A aplicação é composta por **backend** e **frontend** (monorepo com npm workspaces). **Não há dependência** de `index.html`, `js/app.js` ou de carregar `docs/initial-context/` em runtime.

### Como rodar

1. **Instalar dependências** (na raiz do projeto):

   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente** (em `backend/` e `frontend/`):

   - Copie `backend/.env.example` → `backend/.env`
   - Copie `frontend/.env.example` → `frontend/.env.local`

3. **Preparar o banco** (backend):

   ```bash
   npm run db:generate -w aluguel-direto-backend
   npm run db:push -w aluguel-direto-backend
   npm run db:seed -w aluguel-direto-backend   # obrigatório para modo dev criar imóveis
   ```

4. **Subir o backend** (porta 4000) e o **frontend** (porta 3000):


   ```bash
   npm run dev            # sobe backend + frontend
   # ou em terminais separados:
   npm run dev:backend    # backend: http://localhost:4000
   npm run dev:frontend   # frontend: http://localhost:3000
   ```

   Ou, para builds de produção:

   ```bash
   npm run build:backend
   npm run build:frontend
   ```

   **Se aparecer `ERR_CONNECTION_REFUSED` em `localhost:4000`** (ex.: ao registrar ou fazer login): o frontend está tentando falar com o backend na porta 4000 e nada está escutando. Suba o backend com `npm run dev` (backend + frontend) ou, em outro terminal, `npm run dev:backend`. Se quiser usar a API em produção com o frontend local, defina `NEXT_PUBLIC_API_URL` no `frontend/.env.local` com a URL do backend no Cloud Run.

5. **Modo desenvolvimento (opcional):** com o frontend rodando localmente (`npm run dev` ou `npm run dev:frontend`), o *dev mode* é ativado automaticamente quando `NODE_ENV=development` (o padrão de `npm run dev`). Você pode acessar o SaaS sem login real: na landing ou no login, use os botões **“Entrar como Proprietário”** ou **“Entrar como Inquilino”** do banner “Modo desenvolvimento”. Dentro do app, o header exibe um seletor **Dev: Proprietário | Inquilino** para trocar de persona. O backend não é chamado no login em dev. Com o seed executado (passo 3), o usuário dev pode criar imóveis normalmente.  
   - **Se os botões "Entrar como…" deixarem você na tela de login:** em `frontend/.env` ou `frontend/.env.local` defina `NEXTAUTH_SECRET` (ex.: `openssl rand -base64 32`) e `NEXTAUTH_URL=http://localhost:3000`. Se ainda falhar, adicione `DEV_MODE=true` e reinicie o frontend.

## Estrutura do repositório

| Pasta | Conteúdo |
|-------|----------|
| **backend/** | API (Node, Express, Prisma, DDD). |
| **frontend/** | App (Next.js 14, React 18). |
| **docs/** | BUILD_SPEC, guides, decisions, initial-context (referência de design). |
| **specs/** | project.md, backend/spec.md, frontend/spec.md. |

`docs/initial-context/` contém protótipos HTML e `screen.png` apenas como **referência de design** para implementação; a aplicação não os carrega.

## Marca e PRD

- Nome: **AluguelDireto**
- Cores: `primary` #1754cf (azul, “Aluguel” no logo), `accent` #059669 (verde, “Direto” no logo), `background-light` #f6f6f8, `background-dark` #111621, `ink` #111318 (texto), `muted` #636f88 (texto secundário), `border` #dcdfe5
- Fonte: Public Sans
- Escopo: cadastro e gestão de imóveis, usuários e documentos, geração e assinatura de contratos, vistorias, comunicação/solicitações, pagamentos e recibos, em linha com o [PRD](docs/PRD.md) e as diretrizes de marca.
