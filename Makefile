# Deploy no Google Cloud Run. Uso: make deploy-backend, make deploy-frontend ou make deploy
# O deploy já inclui build: --source envia o código e o Cloud Build faz build + deploy em um passo.
# Variáveis de ambiente: YAML em backend/env.cloud.yaml e frontend/env.cloud.yaml (copie dos .example).
# Se o arquivo não existir, o deploy segue sem --env-vars-file (use o console do Cloud Run).

GCP_REGION        ?= us-central1
BACKEND_SERVICE   ?= aluguel-direto-api
FRONTEND_SERVICE  ?= aluguel-direto
BACKEND_ENV_FILE  ?= backend/env.cloud.yaml
FRONTEND_ENV_FILE ?= frontend/env.cloud.yaml

.PHONY: deploy deploy-backend deploy-frontend build-backend build-frontend

deploy: deploy-backend deploy-frontend

# Build local (opcional): testar a imagem antes do deploy. Deploy já faz build no Cloud Build.
build-backend:
	docker build -t $(BACKEND_SERVICE):local ./backend

build-frontend:
	docker build -t $(FRONTEND_SERVICE):local ./frontend

deploy-backend:
	gcloud run deploy $(BACKEND_SERVICE) \
		--source ./backend \
		--region $(GCP_REGION) \
		--allow-unauthenticated \
		$(if $(wildcard $(BACKEND_ENV_FILE)), --env-vars-file $(BACKEND_ENV_FILE),)

deploy-frontend:
	gcloud run deploy $(FRONTEND_SERVICE) \
		--source ./frontend \
		--region $(GCP_REGION) \
		--allow-unauthenticated \
		$(if $(wildcard $(FRONTEND_ENV_FILE)), --env-vars-file $(FRONTEND_ENV_FILE),)
