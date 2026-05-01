# Stage 1: Downloading the dependencies
FROM eclipse-temurin:17-jdk-alpine AS builder

RUN apk add --no-cache maven

WORKDIR /build

COPY pom.xml .

RUN mvn dependency:go-offline

# Stage 2: Build the application

COPY src ./src

RUN mvn clean package -DskipTests

# Stage 3: Run the application

FROM eclipse-temurin:17-jre-alpine AS runtime

WORKDIR /app

COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]