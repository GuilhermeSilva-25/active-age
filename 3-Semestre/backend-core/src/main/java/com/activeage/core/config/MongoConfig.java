package com.activeage.core.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;

/**
 * Classe de configuração explícita do MongoDB.
 * Sobrescreve a autoconfiguração padrão do Spring Boot para garantir que o Driver Java
 * utilize estritamente a URI de conexão (Atlas) fornecida via variáveis de ambiente,
 * evitando que o sistema tente se conectar acidentalmente ao localhost.
 */
@Configuration
public class MongoConfig {

    /**
     * URI de conexão extraída do arquivo application.properties ou da variável de ambiente MONGO_URI.
     */
    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    /**
     * Configura e expõe o cliente do MongoDB (MongoClient).
     * Utiliza o padrão Factory para criar a conexão com o MongoDB Atlas 
     * baseada unicamente na URI definida no ambiente.
     * 
     * @return Uma instância configurada e ativa de MongoClient.
     */
    @Bean
    public MongoClient mongoClient() {
        return MongoClients.create(mongoUri);
    }

    /**
     * Configura o MongoTemplate, que é o motor central utilizado pelo Spring Data MongoDB
     * para executar as operações e consultas no banco de dados.
     * 
     * @return Uma instância de MongoTemplate apontando explicitamente para o banco "active_age_db".
     */
    @Bean
    public MongoTemplate mongoTemplate() {
        return new MongoTemplate(mongoClient(), "active_age_db");
    }
}
