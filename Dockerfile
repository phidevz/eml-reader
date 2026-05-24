# Stage 1: Install production dependencies only
FROM oven/bun:1 AS prod-deps
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

# Stage 2: Build the application
FROM prod-deps AS builder

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

# Stage 3: Production image
FROM oven/bun:1-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=prod-deps --chown=bun:bun /app/node_modules ./node_modules
COPY --from=builder --chown=bun:bun /app/.output ./.output
COPY --from=builder --chown=bun:bun /app/package.json ./package.json

USER bun

EXPOSE 3000

CMD ["bun", "run", ".output/server/index.mjs"]