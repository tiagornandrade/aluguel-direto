#!/usr/bin/env bash
# Deploy do backend no Cloud Run. Execute da raiz do repo: ./scripts/deploy-backend.sh
# Configure as variáveis no Cloud Run (--set-env-vars ou --env-vars-file) antes de rodar.

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/../backend" && pwd)"
cd "$BACKEND_DIR"

REGION="${REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-aluguel-direto-api}"

echo "Deploying $SERVICE_NAME from $BACKEND_DIR (region: $REGION)"
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated
