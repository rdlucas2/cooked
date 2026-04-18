# syntax=docker/dockerfile:1

# =============================================================================
# Stage 1: base
# Installs all dependencies.
# =============================================================================
FROM node:20-alpine AS base

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# =============================================================================
# Stage 2: test
# Runs lint. Extend with jest/vitest when unit tests are added.
# =============================================================================
FROM base AS test

RUN npm ci

ENTRYPOINT ["npm", "run", "lint"]

# =============================================================================
# Stage 3: artifact
# Builds the Next.js app and runs it as a non-root user.
# =============================================================================
FROM node:20-alpine AS artifact

RUN addgroup --system nonroot && \
    adduser --system --ingroup nonroot nonroot

WORKDIR /home/nonroot/app

COPY --from=base /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=base /app .

RUN npm run build

RUN chown -R nonroot:nonroot /home/nonroot
USER nonroot

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

ENTRYPOINT ["npm", "start"]
