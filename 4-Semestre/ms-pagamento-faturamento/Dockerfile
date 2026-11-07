# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app

# Cache de dependências Maven
COPY pom.xml ./
RUN mvn dependency:go-offline -B || true

# Compilação do pacote executável
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime leve e seguro
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Usuário não-root para DevSecOps
RUN groupadd -r activeage && useradd -r -g activeage activeage

# Copia o artefato compilado
COPY --from=builder /app/target/*.jar app.jar
RUN chown -R activeage:activeage /app

USER activeage

ENV PORT=8082
EXPOSE 8082

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
