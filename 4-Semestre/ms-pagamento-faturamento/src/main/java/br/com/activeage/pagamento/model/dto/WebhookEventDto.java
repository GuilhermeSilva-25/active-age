package br.com.activeage.pagamento.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Payload recebido nas notificações de Webhook enviadas pelo Mercado Pago.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class WebhookEventDto {

    private String id;
    private Boolean live_mode;
    private String type; // "payment" ou "subscription_preapproval"
    private String date_created;
    private Long user_id;
    private String api_version;
    private String action; // "payment.created", "payment.updated"
    private Map<String, Object> data; // { "id": "123456789" }
}
