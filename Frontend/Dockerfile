# ---- Stage 1: Build ----
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency files first (layer cache)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ---- Stage 2: Serve with Nginx ----
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 1999
CMD ["nginx", "-g", "daemon off;"]
