package com.activeage.core.domain.enums;

/**
 * Representa a situação de uma consulta médica (UC09 / SPEC-17).
 */
public enum AppointmentStatus {
    AGUARDANDO_PAGAMENTO,       // Intenção criada, aguardando liquidação Pix/Cartão no gateway
    AGENDADA,                   // Confirmada e aguardando a data/horário do atendimento
    REALIZADA,                  // Teleconsulta concluída com sucesso
    CANCELADA_PELO_PACIENTE,    // Cancelada pelo paciente com antecedência de 24h (RN002)
    CANCELADA_PELO_MEDICO,      // Cancelada por imprevisto do médico geriatra
    CANCELADA_FALTA_PAGAMENTO   // Cancelada automaticamente por expiração do prazo de pagamento (15 min)
}
