FROM openjdk:21-jdk-slim
WORKDIR /app
# 빌드 시 생성되는 jar 파일의 위치를 고려하여 복사합니다.
COPY build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]