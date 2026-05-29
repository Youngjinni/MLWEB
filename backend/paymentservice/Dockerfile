FROM gradle:8.5-jdk21-alpine AS build
WORKDIR /workspace

COPY settings.gradle .
COPY build.gradle .
COPY backend/commonmodule/src            ./backend/commonmodule/src
COPY backend/commonmodule/build.gradle   ./backend/commonmodule/build.gradle
COPY backend/paymentservice/src          ./backend/paymentservice/src
COPY backend/paymentservice/build.gradle ./backend/paymentservice/build.gradle

RUN gradle :backend:paymentservice:bootJar --no-daemon -x test

FROM amazoncorretto:21-alpine
WORKDIR /app
COPY --from=build /workspace/backend/paymentservice/build/libs/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
