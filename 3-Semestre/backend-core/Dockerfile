# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app

# Cache de dependências
COPY pom.xml ./
RUN mvn dependency:go-offline -B || true

# Compilação do pacote executável
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime leve e seguro
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copia o artefato compilado
COPY --from=builder /app/target/*.jar app.jar

# Variável de ambiente padrão para porta (compatível com Railway $PORT)
ENV PORT=8080
EXPOSE 8080

# Execução da aplicação
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
