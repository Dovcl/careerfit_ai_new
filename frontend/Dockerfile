# frontend/Dockerfile — React/Vite 정적 빌드 + serve

FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite는 빌드 시점에 VITE_* 변수를 번들에 포함합니다.
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app

RUN npm install -g serve@14

COPY --from=build /app/dist ./dist

ENV PORT=3000
EXPOSE 3000

# Render는 PORT 환경변수를 주입합니다.
CMD ["sh", "-c", "serve -s dist -l ${PORT}"]
