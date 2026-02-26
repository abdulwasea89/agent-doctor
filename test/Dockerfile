FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-slim
WORKDIR /app

# Non-root user for security
RUN addgroup --system agentgroup && adduser --system --ingroup agentgroup agentuser

COPY --from=builder /app/node_modules ./node_modules
COPY . .

RUN chown -R agentuser:agentgroup /app
USER agentuser

# Health check endpoint via HTTP (served by health-server.ts)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

EXPOSE 3001
CMD ["node", "-r", "ts-node/register", "agent.ts"]
