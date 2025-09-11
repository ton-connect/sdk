FROM node:22-alpine AS builder

WORKDIR /monorep

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

COPY . .

RUN pnpm install --filter allure-test-runner-backend --frozen-lockfile
RUN pnpm --filter allure-test-runner-backend build
RUN pnpm deploy --filter allure-test-runner-backend --prod /out

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable

COPY --from=builder /out/ /app/
COPY --from=builder /monorep/apps/allure-test-runner-backend/dist ./dist

EXPOSE 4444

CMD ["node", "dist/main.js"]