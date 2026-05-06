# 1단계: 빌드 단계 (Node.js 환경)
FROM node:20-alpine AS build-stage

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 파일 먼저 복사 (캐시 활용)
COPY package*.json ./
RUN npm install

# 전체 소스 코드 복사
COPY . .

# 빌드 실행 (결과물은 /app/dist 또는 /app/build에 생성됨)
# Vite를 쓰시면 npm run build 시 dist 폴더가 생깁니다.
RUN npm run build

# 2단계: 실행 단계 (Nginx 환경)
FROM nginx:stable-alpine

# 빌드 단계에서 생성된 정적 파일들을 Nginx의 기본 배포 경로로 복사
# 만약 React 기본(CRA)이면 build 폴더, Vite면 dist 폴더입니다.
COPY --from=build-stage /app/build /usr/share/nginx/html


COPY nginx.conf /etc/nginx/conf.d/default.conf

# 80번 포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]