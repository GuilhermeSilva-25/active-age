package com.activeage.core.controllers;

import com.activeage.core.domain.enums.AppointmentStatus;
import com.activeage.core.domain.enums.DoctorDossierStatus;
import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.enums.SlotStatus;
import com.activeage.core.dtos.responses.AdminStatsResponse;
import com.activeage.core.repositories.AppointmentRepository;
import com.activeage.core.repositories.DoctorScheduleSlotRepository;
import com.activeage.core.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller RESTful para indicadores operacionais e métricas de governança
 * da plataforma, restrito exclusivamente a Administradores (ROLE_ADMIN).
 */
@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorScheduleSlotRepository doctorScheduleSlotRepository;

    /**
     * Retorna indicadores operacionais agregados para o dashboard administrativo.
     */
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getPlatformStats() {
        long totalPatients = userRepository.countByRole(Role.ROLE_PACIENTE);
        long totalApprovedDoctors = userRepository.countByRoleAndDossierStatus(Role.ROLE_MEDICO, DoctorDossierStatus.APPROVED);
        long pendingDoctorsQueue = userRepository.countByRoleAndDossierStatus(Role.ROLE_MEDICO, DoctorDossierStatus.UNDER_REVIEW);

        long totalAppointments = appointmentRepository.count();
        long scheduledAppointments = appointmentRepository.countByStatus(AppointmentStatus.AGENDADA);
        long completedAppointments = appointmentRepository.countByStatus(AppointmentStatus.REALIZADA);
        long cancelledAppointments = appointmentRepository.countByStatusIn(
                List.of(AppointmentStatus.CANCELADA_PELO_PACIENTE, AppointmentStatus.CANCELADA_PELO_MEDICO)
        );

        long availableScheduleSlots = doctorScheduleSlotRepository.countByStatus(SlotStatus.LIVRE);

        AdminStatsResponse response = AdminStatsResponse.builder()
                .totalPatients(totalPatients)
                .totalApprovedDoctors(totalApprovedDoctors)
                .pendingDoctorsQueue(pendingDoctorsQueue)
                .totalAppointments(totalAppointments)
                .scheduledAppointments(scheduledAppointments)
                .completedAppointments(completedAppointments)
                .cancelledAppointments(cancelledAppointments)
                .availableScheduleSlots(availableScheduleSlots)
                .build();

        log.debug("Métricas de governança administrativa consultadas: {}", response);
        return ResponseEntity.ok(response);
    }
}
