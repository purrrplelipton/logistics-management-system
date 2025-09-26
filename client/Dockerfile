# syntax=docker/dockerfile:1

FROM node:20-slim AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY client/package.json client/package.json
RUN pnpm install --frozen-lockfile

COPY client ./client
RUN pnpm --filter client build
RUN pnpm prune --prod --filter client...

FROM node:20-slim AS runner
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/client/package.json ./client/package.json
COPY --from=builder /app/client/next.config.ts ./client/next.config.ts
COPY --from=builder /app/client/postcss.config.mjs ./client/postcss.config.mjs
COPY --from=builder /app/client/tsconfig.json ./client/tsconfig.json
COPY --from=builder /app/client/public ./client/public
COPY --from=builder /app/client/.next ./client/.next
COPY --from=builder /app/client/types ./client/types

EXPOSE 3000

CMD ["pnpm", "--filter", "client", "start"]
