package br.com.activeage.pagamento;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

/**
 * Ponto de entrada do Microsserviço de Gateway de Pagamento, Split Direto BACEN e Gestão de Assinaturas SaaS.
 * Plataforma Active Age — Faculdade de Tecnologia de Diadema (Fatec).
 */
@SpringBootApplication
@EnableCaching
public class ActiveAgePagamentoApplication {

    public static void main(String[] args) {
        SpringApplication.run(ActiveAgePagamentoApplication.class, args);
    }
}
