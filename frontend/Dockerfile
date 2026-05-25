# 1단계: 빌드
FROM node:20-alpine AS build-stage
WORKDIR /app

COPY package*.json ./
# peer dependency 충돌 무시 (React 19 + 구버전 라이브러리 호환성 문제)
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# 2단계: Nginx 서빙
FROM nginx:stable-alpine
COPY --from=build-stage /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]