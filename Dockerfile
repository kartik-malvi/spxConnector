FROM node:22-alpine AS base

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json vitest.config.ts ./
COPY src ./src
COPY tests ./tests
COPY README.md ./

CMD ["npm", "run", "dev"]
