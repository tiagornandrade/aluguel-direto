<!-- markdownlint-disable -->
# Neon (PostgreSQL) – dev e produção

O backend usa **Neon** como banco PostgreSQL. Você pode ter um banco de **desenvolvimento** e outro de **produção** e o código escolhe automaticamente pelo `NODE_ENV`.

---

## Passo a passo: criar os dois bancos e configurar o backend

### Passo 1 – Acessar o Neon

1. Abra **[console.neon.tech](https://console.neon.tech)** e faça login (ou crie uma conta).
2. Você pode usar o **Neon MCP** no Cursor (já instalado) e pedir ao Composer para criar projetos, ou fazer tudo pelo console abaixo.

### Passo 2 – Banco de desenvolvimento

1. No console Neon, clique em **Create a project** (ou **New Project**).
2. Nome sugerido: **aluguel-direto-dev**.
3. Região: escolha a mais próxima (ex.: São Paulo se disponível).
4. Clique em **Create project**.
5. Na tela do projeto, em **Connection string**, copie a URL (formato **URI** ou **Connection string**).
   - Deve ser algo como: `postgresql://usuario:senha@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`
6. Guarde essa URL; ela será o **DATABASE_URL_DEV**.

### Passo 3 – Banco de produção

1. Crie **outro projeto** (ou outro branch no mesmo projeto, se preferir).
2. Nome sugerido: **aluguel-direto-prod**.
3. Copie a **Connection string** desse projeto.
4. Guarde essa URL; ela será o **DATABASE_URL_PROD**.

### Passo 4 – Colar no `.env` do backend

1. Abra o arquivo **`backend/.env`**.
2. Adicione ou substitua as linhas de banco (pode apagar `DATABASE_URL` antiga se usava SQLite):

```env
# Neon: dev e prod (o app escolhe por NODE_ENV)
DATABASE_URL_DEV="COLE_AQUI_A_URL_DO_PROJETO_DEV"
DATABASE_URL_PROD="COLE_AQUI_A_URL_DO_PROJETO_PROD"
```

3. Substitua `COLE_AQUI_A_URL_DO_PROJETO_DEV` e `COLE_AQUI_A_URL_DO_PROJETO_PROD` pelas URLs que você copiou (entre aspas).
4. Salve o arquivo (o `.env` não vai para o Git; está no `.gitignore`).

### Passo 5 – Rodar as migrações

No terminal, na pasta do backend:

```bash
cd backend
npm run db:migrate
```

Isso aplica o schema no banco de **desenvolvimento** (porque `NODE_ENV` não é `production`). Quando for fazer deploy, use o mesmo comando no ambiente de produção com `DATABASE_URL_PROD` (ou `DATABASE_URL`) definido e `NODE_ENV=production`.

### Passo 6 – Testar o backend

```bash
npm run dev
```

Se tudo estiver certo, o backend sobe e as requisições usam o Neon **dev**.

---

## 1. Configurar o Neon MCP no Cursor

Para criar e gerenciar os bancos pelo Cursor (via MCP):

1. **Instalar o servidor MCP da Neon** (uma vez):
   ```bash
   npx add-mcp https://mcp.neon.tech/mcp
   ```
   Ou com chave de API:
   ```bash
   npx add-mcp https://mcp.neon.tech/mcp --header "Authorization: Bearer $NEON_API_KEY"
   ```
   Chave em: [Neon Console → API Keys](https://console.neon.tech/app/settings/api-keys).

2. **Criar os projetos/branches no Neon** (via Cursor + MCP ou pelo console):
   - **Desenvolvimento:** um projeto ou branch (ex.: `aluguel-direto-dev`) e copiar a connection string.
   - **Produção:** outro projeto ou branch (ex.: `aluguel-direto-prod`) e copiar a connection string.

3. **Connection string** no formato:
   ```text
   postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
   ```

## 2. Variáveis de ambiente no backend

No `.env` do backend (ou nas variáveis do host em produção):

**Opção A – Uma URL por ambiente (recomendado em produção)**  
- Em desenvolvimento: defina só `DATABASE_URL` no `.env` com a URL do Neon **dev**.  
- Em produção: defina só `DATABASE_URL` no ambiente do host com a URL do Neon **prod**.

**Opção B – Duas URLs no mesmo .env**  
- Defina `DATABASE_URL_DEV` e `DATABASE_URL_PROD` no `.env`.  
- O backend e o Prisma CLI usam:
  - `DATABASE_URL_DEV` quando `NODE_ENV !== "production"`
  - `DATABASE_URL_PROD` quando `NODE_ENV === "production"`

Exemplo `.env` (Opção B):

```env
DATABASE_URL_DEV="postgresql://..."
DATABASE_URL_PROD="postgresql://..."
```

## 3. Migrações

- **Dev:** `NODE_ENV=development` (ou não definir) e rodar `npm run db:migrate` → usa `DATABASE_URL_DEV` (ou `DATABASE_URL`).
- **Prod:** aplicar migrações no deploy com `NODE_ENV=production` e `DATABASE_URL` ou `DATABASE_URL_PROD` definidos, por exemplo:
  ```bash
  NODE_ENV=production npm run db:migrate
  ```
  Ou em CI: definir `DATABASE_URL_PROD` e rodar `prisma migrate deploy`.

## Referências

- [Neon MCP Server](https://neon.tech/docs/ai/neon-mcp-server)
- [Cursor + Neon MCP](https://neon.tech/guides/cursor-mcp-neon)
