package br.com.activeage.pagamento.controller;

import br.com.activeage.pagamento.model.dto.WebhookEventDto;
import br.com.activeage.pagamento.service.IPagamentoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Controlador de recepção de Webhooks assíncronos do Mercado Pago.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
@Tag(name = "Webhooks", description = "Recepção de notificações assíncronas do Mercado Pago")
public class WebhookController {

    private final IPagamentoService pagamentoService;

    @PostMapping("/mercadopago")
    @Operation(summary = "Recepção de notificações de eventos (payment, subscription) do Mercado Pago")
    public ResponseEntity<Map<String, String>> receberWebhook(@RequestBody WebhookEventDto event) {
        log.info("Webhook recebido do Mercado Pago: action={}, id={}", event.getAction(), event.getId());
        pagamentoService.processarWebhook(event);
        return ResponseEntity.ok(Map.of("status", "RECEIVED"));
    }
}
