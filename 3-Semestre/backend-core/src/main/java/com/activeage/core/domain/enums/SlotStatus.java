package com.activeage.core.domain.enums;

/**
 * Representa a situação de um slot de horário na agenda do médico.
 * 
 * - LIVRE: Disponível para agendamento por qualquer paciente na vitrine.
 * - OCUPADO: Reservado para teleconsulta por um paciente (UC09).
 * - BLOQUEADO: Indisponível temporariamente por decisão do médico (pausa, reunião, folga).
 */
public enum SlotStatus {
    LIVRE,
    OCUPADO,
    BLOQUEADO
}
