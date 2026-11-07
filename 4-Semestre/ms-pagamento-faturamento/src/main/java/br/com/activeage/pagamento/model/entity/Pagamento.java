package br.com.activeage.pagamento.model.entity;

import br.com.activeage.pagamento.model.enums.MetodoPagamento;
import br.com.activeage.pagamento.model.enums.StatusPagamento;
import br.com.activeage.pagamento.model.enums.TipoPagamento;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidade JPA que representa uma transação/fatura financeira individual.
 * Mapeada para a tabela tb_pagamentos no banco relacional dedicado.
 */
@Entity
@Table(name = "tb_pagamentos")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Pagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 30)
    private TipoPagamento tipo;

    @Column(name = "referencia_id", nullable = false, length = 100)
    private String referenciaId; // appointmentId ou doctorId

    @Column(name = "pagador_id", nullable = false, length = 100)
    private String pagadorId;

    @Column(name = "pagador_nome", nullable = false, length = 150)
    private String pagadorNome;

    @Column(name = "pagador_cpf_cnpj", nullable = false, length = 20)
    private String pagadorCpfCnpj;

    @Column(name = "beneficiario_id", nullable = false, length = 100)
    private String beneficiarioId; // doctorId ou "ACTIVE_AGE_PLATAFORMA"

    @Column(name = "valor_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTotal;

    @Column(name = "valor_beneficiario", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorBeneficiario;

    @Column(name = "taxa_plataforma", nullable = false, precision = 10, scale = 2)
    private BigDecimal taxaPlataforma;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo", nullable = false, length = 30)
    private MetodoPagamento metodo;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private StatusPagamento status;

    @Column(name = "mp_payment_id", length = 100)
    private String mpPaymentId;

    @Column(name = "mp_preference_id", length = 100)
    private String mpPreferenceId;

    @Column(name = "qr_code_pix", columnDefinition = "TEXT")
    private String qrCodePix;

    @Column(name = "qr_code_base64", columnDefinition = "TEXT")
    private String qrCodeBase64;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "data_vencimento")
    private LocalDateTime dataVencimento;

    @Column(name = "data_confirmacao")
    private LocalDateTime dataConfirmacao;
}
