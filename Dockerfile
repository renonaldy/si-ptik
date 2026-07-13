# ── Build ──
FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install
COPY . .
# API base is baked in at build time; override with --build-arg VITE_API_URL=...
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN bun run build

# ── Serve (static via nginx) ──
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
