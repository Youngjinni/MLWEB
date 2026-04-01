# 1. 빌드 스테이지
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# 루트 폴더의 모든 설정 파일 복사
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
COPY common-module common-module

# ⭐ [핵심] 윈도우 줄바꿈 제거 및 실행 권한 부여
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew

# ⭐ [핵심 2] Gradle 캐시 디렉토리를 도커 내부 전용으로 강제 지정하여 권한 문제 회피
# --no-daemon과 함께 -Dgradle.user.home 설정을 추가합니다.
RUN ./gradlew :common-module:build -x test --no-daemon -Dgradle.user.home=/app/.gradle

# 2. 실행 스테이지
FROM eclipse-temurin:21-jre
WORKDIR /app

# JAR 파일 복사 (위 단계에서 생성된 경로 확인)
COPY --from=build /app/common-module/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]