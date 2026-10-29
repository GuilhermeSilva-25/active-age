package com.activeage.core.dtos.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que consolida métricas operacionais agregadas da plataforma
 * para visualização exclusiva do Administrador do Sistema.
 * 
 * Atende às diretrizes da LGPD (Art. 11) fornecendo indicadores estatísticos
 * quantitativos sem expor dados clínicos protegidos por sigilo médico.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {

    private long totalPatients;
    private long totalApprovedDoctors;
    private long pendingDoctorsQueue;

    private long totalAppointments;
    private long scheduledAppointments;
    private long completedAppointments;
    private long cancelledAppointments;

    private long availableScheduleSlots;
}
