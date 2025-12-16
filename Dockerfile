# syntax=docker/dockerfile:1.7-labs

FROM node:22-bookworm-slim AS deps
WORKDIR /app
ENV NODE_ENV=development
COPY package.json package-lock.json* ./
RUN npm install --progress=false \
	&& npm install --progress=false @radix-ui/react-checkbox

FROM node:22-bookworm-slim AS dev
WORKDIR /app
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

FROM node:22-bookworm-slim AS builder
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json* ./
RUN npm install --progress=false --omit=dev \
	&& npm install --progress=false --omit=dev @radix-ui/react-checkbox
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/out ./out
RUN npm install --global serve@14.2.1 --progress=false && npm cache clean --force
RUN chown -R node:node /app
USER node
EXPOSE 5173
CMD ["serve", "-s", "out", "-l", "5173"]
