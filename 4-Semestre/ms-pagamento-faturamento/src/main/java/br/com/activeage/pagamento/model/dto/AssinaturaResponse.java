package br.com.activeage.pagamento.model.dto;

import br.com.activeage.pagamento.model.enums.StatusAssinatura;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Payload de retorno para o status da assinatura SaaS do médico.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AssinaturaResponse {

    private Long id;
    private String doctorId;
    private String doctorEmail;
    private String doctorNome;
    private String planoNome;
    private BigDecimal valorMensal;
    private StatusAssinatura status;
    private String mpPreapprovalId;
    private LocalDateTime inicioCiclo;
    private LocalDateTime fimCiclo;
    private LocalDateTime dataProximaCobranca;
}
