FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci
RUN npx prisma generate
RUN npm prune --omit=dev

FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY prisma ./prisma
COPY src ./src

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 CMD node -e "const port=process.env.PORT||3000; fetch(`http://127.0.0.1:${port}/health`).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["npm", "start"]
