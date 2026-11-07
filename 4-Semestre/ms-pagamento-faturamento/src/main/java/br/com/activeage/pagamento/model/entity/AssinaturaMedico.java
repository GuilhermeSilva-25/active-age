package br.com.activeage.pagamento.model.entity;

import br.com.activeage.pagamento.model.enums.StatusAssinatura;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidade JPA que representa a assinatura recorrente de consultório virtual do médico.
 * Mapeada para a tabela tb_assinaturas no banco relacional dedicado.
 */
@Entity
@Table(name = "tb_assinaturas")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssinaturaMedico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "doctor_id", nullable = false, unique = true, length = 100)
    private String doctorId;

    @Column(name = "doctor_email", nullable = false, length = 150)
    private String doctorEmail;

    @Column(name = "doctor_nome", nullable = false, length = 150)
    private String doctorNome;

    @Column(name = "plano_nome", nullable = false, length = 100)
    private String planoNome;

    @Column(name = "valor_mensal", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorMensal;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private StatusAssinatura status;

    @Column(name = "mp_preapproval_id", length = 100)
    private String mpPreapprovalId;

    @Column(name = "inicio_ciclo")
    private LocalDateTime inicioCiclo;

    @Column(name = "fim_ciclo")
    private LocalDateTime fimCiclo;

    @Column(name = "data_proxima_cobranca")
    private LocalDateTime dataProximaCobranca;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
