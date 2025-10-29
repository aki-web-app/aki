# 1) Abhängigkeiten
FROM node:20-alpine AS deps

# Build-Arg damit DATABASE_URL während des Builds verfügbar ist (für prisma generate)
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Paket-Metadaten kopieren und installieren
COPY package.json package-lock.json* ./

# Prisma-Artefakte kopieren, damit prisma generate die schema-Datei findet
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci

# Prisma-Client generieren, falls DATABASE_URL gesetzt ist (robust) und Schema vorhanden ist
RUN if [ -n "$DATABASE_URL" ] && [ -f "./prisma/schema.prisma" ]; then \
      npx prisma generate --schema=prisma/schema.prisma; \
    else \
      echo "Skipping prisma generate (no DATABASE_URL or prisma/schema.prisma missing)"; \
    fi

# 2) Build
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# node_modules vom deps-stage übernehmen (inkl. @prisma/client, falls generiert)
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3) Runtime (klein & sicher)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Standalone-Output von Next.js
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
