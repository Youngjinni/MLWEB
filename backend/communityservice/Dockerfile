# 1단계: Gradle 빌드 (Docker 안에서 직접 빌드 - 로컬 빌드 불필요)
FROM gradle:8.5-jdk21-alpine AS build
WORKDIR /workspace

# 루트 설정 파일
COPY settings.gradle .
COPY build.gradle .

# commonmodule (모든 서비스가 의존)
COPY backend/commonmodule/src            ./backend/commonmodule/src
COPY backend/commonmodule/build.gradle   ./backend/commonmodule/build.gradle

# 대상 서비스
COPY backend/communityservice/src              ./backend/communityservice/src
COPY backend/communityservice/build.gradle     ./backend/communityservice/build.gradle

RUN gradle :backend:communityservice:bootJar --no-daemon -x test

# 2단계: 실행 이미지
FROM amazoncorretto:21-alpine
WORKDIR /app
COPY --from=build /workspace/backend/communityservice/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
