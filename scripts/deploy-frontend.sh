#!/usr/bin/env bash
# Deploy do frontend no Cloud Run. Execute da raiz do repo: ./scripts/deploy-frontend.sh
# Configure as variáveis no Cloud Run (--set-env-vars ou --env-vars-file) antes de rodar.

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(cd "$SCRIPT_DIR/../frontend" && pwd)"
cd "$FRONTEND_DIR"

REGION="${REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-aluguel-direto}"

echo "Deploying $SERVICE_NAME from $FRONTEND_DIR (region: $REGION)"
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated
