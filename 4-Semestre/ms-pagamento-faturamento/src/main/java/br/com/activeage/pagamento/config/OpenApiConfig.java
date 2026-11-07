package br.com.activeage.pagamento.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Configuração da documentação viva OpenAPI 3 / Swagger UI do microsserviço de pagamento.
 * Acessível em /swagger-ui/index.html.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Active Age — Microsserviço de Pagamento & Assinaturas SaaS")
                        .version("v1.0.0")
                        .description("API RESTful para processamento de pagamentos de teleconsultas geriátricas com Split Direto " +
                                "(Res. CFM nº 2.314/2022) e cobrança de assinaturas mensais SaaS de consultório virtual.")
                        .contact(new Contact()
                                .name("Active Age Health Tech")
                                .email("contato@activeage.com.br")
                                .url("https://active-age.vercel.app"))
                        .license(new License()
                                .name("Proprietária / Fatec Diadema")
                                .url("https://fatecdiadema.cps.sp.gov.br")))
                .servers(List.of(
                        new Server().url("http://localhost:8082").description("Ambiente Local"),
                        new Server().url("https://active-age-pagamento.onrender.com").description("Ambiente de Produção (Render)")
                ));
    }
}
