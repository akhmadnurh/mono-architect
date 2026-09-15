# 1. Base image
FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable

# 2. Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

# Ignore build scripts selama install agar pnpm v10+ tidak error
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN npx prisma generate

# 3. Builder stage
FROM base AS builder
RUN apk add --no-cache libc6-compat openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# 4. Runner stage (Production)
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat openssl
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set output standalone from Next.js
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]