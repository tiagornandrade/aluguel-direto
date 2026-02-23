<!-- markdownlint-disable -->
# Deploy no Google Cloud Run

Backend e frontend são duas aplicações separadas no Cloud Run. O Cloud Run define `PORT=8080` automaticamente.

## Pré-requisitos

- [Google Cloud SDK (gcloud)](https://cloud.google.com/sdk/docs/install)
- Projeto GCP criado e billing ativo
- API Cloud Run e Artifact Registry (ou Container Registry) habilitadas

```bash
gcloud config set project SEU_PROJETO_ID
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

## 1. Deploy do Backend

Na primeira vez, crie o repositório no Artifact Registry (ajuste a região se quiser):

```bash
gcloud artifacts repositories create aluguel-direto --repository-format=docker --location=us-central1
```

Deploy pelo **Makefile** (na raiz do repo):

```bash
# 1) Copie o exemplo e preencha os valores (não commitar env.cloud.yaml):
cp backend/env.cloud.yaml.example backend/env.cloud.yaml
# Edite backend/env.cloud.yaml com DATABASE_URL_PROD, CORS_ORIGINS, INTERNAL_API_KEY

# 2) Deploy (usa backend/env.cloud.yaml automaticamente se existir):
make deploy-backend
```

Se `backend/env.cloud.yaml` não existir, o deploy segue sem env vars (configure-as no console do Cloud Run). Variáveis opcionais do Make: `GCP_REGION`, `BACKEND_SERVICE`, `BACKEND_ENV_FILE`. Ex.: `make deploy-backend GCP_REGION=southamerica-east1`.

**Alternativa — gcloud direto** (com env vars na linha):

```bash
cd backend
gcloud run deploy aluguel-direto-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL_PROD=postgresql://user:pass@host/db?sslmode=require" \
  --set-env-vars "CORS_ORIGINS=https://SEU-FRONTEND-URL.run.app" \
  --set-env-vars "INTERNAL_API_KEY=SEU_INTERNAL_API_KEY"
```

**Variáveis obrigatórias do backend:**

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` ou `DATABASE_URL_PROD` | URL do PostgreSQL (ex.: Neon) |
| `CORS_ORIGINS` | URL do frontend no Cloud Run (ex.: `https://aluguel-direto-xxx.run.app`) |
| `INTERNAL_API_KEY` | Chave compartilhada com o frontend (ex.: `openssl rand -base64 32`) |

Opcional: `OPENAI_API_KEY` para análise de documentos com IA.

Após o deploy, anote a URL do serviço (ex.: `https://aluguel-direto-api-xxx.run.app`).

---

## 2. Deploy do Frontend

O frontend precisa da URL do backend e da própria URL (NextAuth).

Deploy pelo **Makefile** (na raiz do repo):

```bash
# 1) Copie o exemplo e preencha os valores (não commitar env.cloud.yaml):
cp frontend/env.cloud.yaml.example frontend/env.cloud.yaml
# Edite frontend/env.cloud.yaml com NEXT_PUBLIC_API_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, INTERNAL_API_KEY

# 2) Deploy (usa frontend/env.cloud.yaml automaticamente se existir):
make deploy-frontend
```

Se `frontend/env.cloud.yaml` não existir, o deploy segue sem env vars. Variáveis opcionais do Make: `GCP_REGION`, `FRONTEND_SERVICE`, `FRONTEND_ENV_FILE`.

**Alternativa — gcloud direto:**

```bash
cd frontend
gcloud run deploy aluguel-direto \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_API_URL=https://aluguel-direto-api-XXX.run.app" \
  --set-env-vars "NEXTAUTH_URL=https://aluguel-direto-XXX.run.app" \
  --set-env-vars "NEXTAUTH_SECRET=SEU_NEXTAUTH_SECRET" \
  --set-env-vars "INTERNAL_API_KEY=MESMO_INTERNAL_API_KEY_DO_BACKEND"
```

**Variáveis obrigatórias do frontend:**

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_API_URL` | URL do backend no Cloud Run (sem barra no final) |
| `NEXTAUTH_URL` | URL do próprio frontend no Cloud Run |
| `NEXTAUTH_SECRET` | Segredo do NextAuth (ex.: `openssl rand -base64 32`) |
| `INTERNAL_API_KEY` | Mesmo valor configurado no backend |

**Ordem recomendada:** fazer o deploy do backend primeiro, copiar a URL do backend, depois fazer o deploy do frontend com `NEXT_PUBLIC_API_URL` e `NEXTAUTH_URL` (esta última você pode atualizar após o primeiro deploy com a URL que o Cloud Run mostrar).

---

## 3. Deploy dos dois (backend + frontend)

```bash
make deploy
```

O Make usa por padrão `backend/env.cloud.yaml` e `frontend/env.cloud.yaml` se existirem. Para outro arquivo: `make deploy BACKEND_ENV_FILE=backend/outro.yaml FRONTEND_ENV_FILE=frontend/outro.yaml`.

---

## 4. Atualizar CORS após o deploy do frontend

Quando tiver a URL final do frontend, atualize o backend para permitir essa origem:

```bash
gcloud run services update aluguel-direto-api \
  --region us-central1 \
  --update-env-vars "CORS_ORIGINS=https://aluguel-direto-XXX.run.app"
```

---

## 5. Build local com Docker (opcional)

Para testar as imagens localmente:

```bash
# Backend
cd backend && docker build -t aluguel-direto-api . && docker run -p 8080:8080 --env-file .env aluguel-direto-api

# Frontend
cd frontend && docker build -t aluguel-direto . && docker run -p 8080:8080 --env-file .env.local aluguel-direto
```

---

## CI/CD com GitHub Actions

Há dois workflows em `.github/workflows/`:

- **CI (`ci.yml`):** em todo push e pull request para `main` — instala dependências, gera o Prisma client, faz build do backend, lint e build do frontend.
- **CD (`deploy.yml`):** em todo push para `main` — faz deploy do backend e do frontend no Cloud Run (nesta ordem).

### Secrets obrigatórios no GitHub

Em **Settings → Secrets and variables → Actions** crie:

| Secret | Descrição |
|--------|-----------|
| `GCP_SA_KEY` | JSON da chave da service account usada para deploy (veja abaixo) |

O workflow usa por padrão o projeto **intendra-deployments** e a service account **github-actions-sa@intendra-deployments.iam.gserviceaccount.com**. Para outro projeto, adicione o secret `GCP_PROJECT_ID`.

### Service account no GCP

O deploy está configurado para usar o projeto **intendra-deployments** e a service account **github-actions-sa@intendra-deployments.iam.gserviceaccount.com** para autenticar o pipeline (secret **GCP_SA_KEY** = chave JSON dessa SA).

1. No projeto **intendra-deployments**, a service account `github-actions-sa` deve ter as roles: **Cloud Run Admin**, **Service Account User** e **Artifact Registry Writer** (ou **Storage Admin** se usar Container Registry).
2. Crie uma chave JSON para essa service account e coloque o conteúdo no secret **GCP_SA_KEY** no GitHub.

As **variáveis de ambiente** do backend e do frontend (DATABASE_URL, CORS_ORIGINS, NEXTAUTH_URL, etc.) não são definidas pelo workflow: configure-as uma vez no console do Cloud Run (ou no primeiro deploy manual). O CD apenas atualiza a imagem do serviço e mantém as env já configuradas.

Para usar **Workload Identity Federation** (sem chave JSON), veja a [documentação do Google](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-google-cloud-platform) e altere o passo "Authenticate to Google Cloud" no `deploy.yml` para usar `workload_identity_provider` e `service_account`.

---

## Makefile (recomendado)

Na raiz do repositório:

| Comando | Descrição |
|---------|-----------|
| `make deploy-backend` | Deploy só do backend |
| `make deploy-frontend` | Deploy só do frontend |
| `make deploy` | Deploy dos dois (backend depois frontend) |

**Env vars (YAML):** o Make usa por padrão `backend/env.cloud.yaml` e `frontend/env.cloud.yaml` se existirem. Copie os exemplos e preencha: `cp backend/env.cloud.yaml.example backend/env.cloud.yaml` e `cp frontend/env.cloud.yaml.example frontend/env.cloud.yaml`. Formato YAML (uma linha por variável): `KEY: "value"`. Esses arquivos estão no `.gitignore` — não commitar.

Variáveis opcionais do Make: `GCP_REGION`, `BACKEND_SERVICE`, `FRONTEND_SERVICE`, `BACKEND_ENV_FILE`, `FRONTEND_ENV_FILE`.

**Scripts em `scripts/`** — alternativa: `./scripts/deploy-backend.sh` e `./scripts/deploy-frontend.sh` (variáveis `REGION`, `SERVICE_NAME`).

---

## Resumo rápido

1. Habilitar APIs e criar repositório Artifact Registry.
2. Deploy do **backend** com `DATABASE_URL_PROD`, `CORS_ORIGINS` (placeholder ou URL temporária), `INTERNAL_API_KEY`.
3. Deploy do **frontend** com `NEXT_PUBLIC_API_URL` = URL do backend, `NEXTAUTH_URL` = URL do frontend (atualizar depois), `NEXTAUTH_SECRET`, `INTERNAL_API_KEY`.
4. Ajustar `CORS_ORIGINS` no backend para a URL real do frontend.
