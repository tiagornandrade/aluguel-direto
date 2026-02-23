# Backend Aluguel Direto - Cloud Run
FROM node:23-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Build
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0
EXPOSE 8080

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

# Prisma client is in node_modules; schema needed for migrate
RUN npx prisma generate

# Migrations at startup. Prisma CLI uses DATABASE_URL; app uses DATABASE_URL or DATABASE_URL_PROD.
RUN echo "#!/bin/sh" > /app/start.sh && \
    echo 'export DATABASE_URL="${DATABASE_URL:-$DATABASE_URL_PROD}"' >> /app/start.sh && \
    echo "npx prisma migrate deploy" >> /app/start.sh && \
    echo "exec node dist/api/server.js" >> /app/start.sh && \
    chmod +x /app/start.sh

CMD ["/app/start.sh"]
