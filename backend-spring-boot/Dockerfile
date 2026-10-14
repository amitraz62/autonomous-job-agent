# syntax=docker/dockerfile:1
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/backend-spring-boot-1.0.0-PROD.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
