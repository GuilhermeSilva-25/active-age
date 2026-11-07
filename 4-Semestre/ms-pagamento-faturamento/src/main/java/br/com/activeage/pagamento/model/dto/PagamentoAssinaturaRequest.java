package br.com.activeage.pagamento.model.dto;

import br.com.activeage.pagamento.model.enums.MetodoPagamento;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Payload de entrada para contratação da assinatura mensal SaaS pelo médico.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagamentoAssinaturaRequest {

    @NotBlank(message = "ID do médico é obrigatório")
    private String doctorId;

    @NotBlank(message = "Nome do médico é obrigatório")
    private String doctorNome;

    @NotBlank(message = "E-mail do médico é obrigatório")
    @Email(message = "E-mail do médico deve ser válido")
    private String doctorEmail;

    @NotBlank(message = "CPF ou CNPJ do médico é obrigatório")
    private String doctorCpfCnpj;

    @NotNull(message = "Valor da mensalidade é obrigatório")
    @Positive(message = "Valor da mensalidade deve ser positivo")
    private BigDecimal valor;

    @NotNull(message = "Método de pagamento é obrigatório")
    private MetodoPagamento metodo;
}
