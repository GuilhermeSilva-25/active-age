package br.com.activeage.pagamento.model.dto;

import br.com.activeage.pagamento.model.enums.MetodoPagamento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Payload de entrada para intenção de pagamento de consulta geriátrica pelo paciente.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagamentoConsultaRequest {

    @NotBlank(message = "ID do agendamento (appointmentId) é obrigatório")
    private String appointmentId;

    @NotBlank(message = "ID do paciente é obrigatório")
    private String patientId;

    @NotBlank(message = "Nome do paciente é obrigatório")
    private String patientNome;

    @NotBlank(message = "CPF do paciente é obrigatório")
    private String patientCpf;

    @NotBlank(message = "ID do médico responsável é obrigatório")
    private String doctorId;

    @NotBlank(message = "Nome do médico responsável é obrigatório")
    private String doctorNome;

    private String doctorPixKey;

    @NotNull(message = "Valor da consulta é obrigatório")
    @Positive(message = "Valor da consulta deve ser estritamente positivo")
    private BigDecimal valor;

    @NotNull(message = "Método de pagamento é obrigatório (PIX ou CARTAO_CREDITO)")
    private MetodoPagamento metodo;
}
