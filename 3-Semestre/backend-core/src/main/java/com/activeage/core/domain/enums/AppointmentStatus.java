package com.activeage.core.domain.enums;

/**
 * Representa a situação de uma consulta médica (UC09).
 */
public enum AppointmentStatus {
    AGENDADA,                   // Confirmada e aguardando a data/horário do atendimento
    REALIZADA,                  // Teleconsulta concluída com sucesso
    CANCELADA_PELO_PACIENTE,    // Cancelada pelo paciente com antecedência de 24h (RN002)
    CANCELADA_PELO_MEDICO       // Cancelada por imprevisto do médico geriatra
}
