FROM node:20-alpine AS builder

WORKDIR /app

# Copia os arquivos de dependência
COPY package.json package-lock.json ./

# Instala as dependências (usando npm ci para ser exato com o lockfile)
RUN npm ci

# Copia o restante do código fonte
COPY . .

# Faz a build otimizada da aplicação Next.js
RUN npm run build

# --- Estágio de Produção ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copia do estágio builder apenas o necessário para rodar
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

# Executa a aplicação
CMD ["npm", "start"]
