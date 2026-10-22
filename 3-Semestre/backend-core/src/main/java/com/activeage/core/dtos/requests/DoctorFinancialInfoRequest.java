package com.activeage.core.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para submissão dos dados bancários do médico para configuração do Split Direto de Pagamento.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorFinancialInfoRequest {

    @NotBlank(message = "O nome do banco é obrigatório.")
    private String bankName;

    @NotBlank(message = "A agência bancária é obrigatória.")
    private String agency;

    @NotBlank(message = "O número da conta é obrigatório.")
    private String accountNumber;

    @NotBlank(message = "O tipo de conta é obrigatório (ex: CORRENTE ou POUPANCA).")
    private String accountType;

    @NotBlank(message = "A chave PIX é obrigatória para liquidação de honorários.")
    private String pixKey;

    @NotBlank(message = "O tipo da chave PIX é obrigatório (CPF, CNPJ, EMAIL, TELEFONE, ALEATORIA).")
    private String pixKeyType;

    private String cnpj;

    private String corporateName;
}
