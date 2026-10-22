package com.activeage.core.domain.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Informações financeiras e bancárias do médico para configuração do Split Direto de Pagamento.
 * Em conformidade com a vedação da dicotomia (RN009), os honorários liquidam diretamente
 * nesta conta/chave PIX de titularidade do profissional ou de sua PJ médica.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorFinancialInfo {
    private String bankName;
    private String agency;
    private String accountNumber;
    private String accountType; // CORRENTE, POUPANCA
    private String pixKey;
    private String pixKeyType; // CPF, CNPJ, EMAIL, TELEFONE, ALEATORIA
    private String cnpj; // Opcional se PJ
    private String corporateName; // Razão Social (se PJ)
    private LocalDateTime updatedAt;
}
