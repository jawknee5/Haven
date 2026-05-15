# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --ignore-scripts
COPY . .
RUN npx prisma generate
RUN npm run build
RUN npx prisma migrate deploy || true

# Stage 2: Production Runner
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --omit=dev --ignore-scripts
RUN npx prisma generate
COPY --from=builder /app/dist ./dist
EXPOSE 4000
CMD ["npm", "start"]
