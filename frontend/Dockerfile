# Frontend Aluguel Direto (Next.js) - Cloud Run
FROM node:23-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Build (NEXT_PUBLIC_* must be set at build time - they are inlined into the client bundle)
FROM base AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# Fail fast if NEXT_PUBLIC_API_URL is not provided at build time
RUN test -n "$NEXT_PUBLIC_API_URL"
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Runner (standalone)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

CMD ["node", "server.js"]
