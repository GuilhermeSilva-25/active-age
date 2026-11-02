package com.activeage.core.dtos.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para exibição de métricas operacionais consolidadas no dashboard do médico (SPEC-11J).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDashboardStatsResponse {

    private long todayAppointments;
    private long totalPatients;
    private long totalAppointments;
    private long freeSlots;
    private int trialDaysRemaining;
}
