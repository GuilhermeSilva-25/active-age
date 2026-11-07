package br.com.activeage.pagamento.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Endpoint de monitoramento e verificação de saúde operacional do microsserviço.
 */
@RestController
@Tag(name = "Health Check", description = "Monitoramento de disponibilidade do serviço")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Verifica integridade do serviço de pagamento", description = "Retorna status UP e timestamp atual")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "ms-pagamento-faturamento",
                "version", "v1.0.0",
                "timestamp", LocalDateTime.now()
        ));
    }
}
