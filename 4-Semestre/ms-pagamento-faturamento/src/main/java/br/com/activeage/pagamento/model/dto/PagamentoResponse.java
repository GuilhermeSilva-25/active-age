package br.com.activeage.pagamento.model.dto;

import br.com.activeage.pagamento.model.enums.MetodoPagamento;
import br.com.activeage.pagamento.model.enums.StatusPagamento;
import br.com.activeage.pagamento.model.enums.TipoPagamento;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Payload de retorno com os dados consolidados da cobrança (QR Code Pix, status e datas).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PagamentoResponse {

    private Long id;
    private TipoPagamento tipo;
    private String referenciaId;
    private String pagadorNome;
    private String beneficiarioId;
    private BigDecimal valorTotal;
    private BigDecimal valorBeneficiario;
    private BigDecimal taxaPlataforma;
    private MetodoPagamento metodo;
    private StatusPagamento status;
    private String mpPaymentId;
    private String mpPreferenceId;
    private String qrCodePix;
    private String qrCodeBase64;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataVencimento;
    private LocalDateTime dataConfirmacao;
}
