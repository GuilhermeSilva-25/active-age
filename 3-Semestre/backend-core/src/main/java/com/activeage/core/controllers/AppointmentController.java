package com.activeage.core.controllers;

import com.activeage.core.dtos.requests.CreateAppointmentRequest;
import com.activeage.core.dtos.responses.AppointmentResponse;
import com.activeage.core.services.AppointmentService;
import com.activeage.core.services.DoctorScheduleService;
import com.activeage.core.dtos.responses.DoctorDashboardStatsResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller RESTful para Gestão e Agendamento Concorrente de Teleconsultas (UC09 / RF006, RF007).
 */
@RestController
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final DoctorScheduleService doctorScheduleService;

    /**
     * Agenda uma nova teleconsulta reservando atomicamente o slot livre (RN001).
     */
    @PostMapping("/api/patient/appointments")
    @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<AppointmentResponse> createAppointment(@Valid @RequestBody CreateAppointmentRequest request) {
        String email = getAuthenticatedEmail();
        AppointmentResponse response = appointmentService.createAppointment(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Lista todas as consultas do paciente autenticado (próximas e histórico).
     */
    @GetMapping("/api/patient/appointments")
    @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<List<AppointmentResponse>> listPatientAppointments() {
        String email = getAuthenticatedEmail();
        List<AppointmentResponse> list = appointmentService.listPatientAppointments(email);
        return ResponseEntity.ok(list);
    }

    /**
     * Retorna a próxima consulta agendada mais iminente do paciente.
     */
    @GetMapping("/api/patient/appointments/next")
    @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<AppointmentResponse> getNextPatientAppointment() {
        String email = getAuthenticatedEmail();
        return appointmentService.getNextPatientAppointment(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    /**
     * Cancela uma consulta agendada pelo paciente com antecedência de 24h (RN002).
     */
    @PatchMapping("/api/patient/appointments/{id}/cancel")
    @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<AppointmentResponse> cancelAppointment(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String email = getAuthenticatedEmail();
        String reason = (body != null) ? body.get("reason") : null;
        AppointmentResponse response = appointmentService.cancelAppointment(email, id, reason);
        return ResponseEntity.ok(response);
    }

    /**
     * Lista as consultas agendadas do dia de hoje para o médico autenticado.
     */
    /**
     * Retorna métricas consolidadas do médico (SPEC-11J).
     */
    @GetMapping("/api/doctor/stats")
    @PreAuthorize("hasRole('MEDICO')")
    public ResponseEntity<DoctorDashboardStatsResponse> getDoctorStats() {
        String email = getAuthenticatedEmail();
        DoctorDashboardStatsResponse stats = doctorScheduleService.getDoctorDashboardStats(email);
        return ResponseEntity.ok(stats);
    }

    /**
     * Lista todos os atendimentos e histórico de consultas do médico autenticado (SPEC-14).
     */
    @GetMapping("/api/doctor/appointments")
    @PreAuthorize("hasRole('MEDICO')")
    public ResponseEntity<List<AppointmentResponse>> listDoctorAppointments() {
        String email = getAuthenticatedEmail();
        List<AppointmentResponse> list = appointmentService.listDoctorAppointments(email);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/api/doctor/appointments/today")
    @PreAuthorize("hasRole('MEDICO')")
    public ResponseEntity<List<AppointmentResponse>> listDoctorTodayAppointments() {
        String email = getAuthenticatedEmail();
        List<AppointmentResponse> list = appointmentService.listDoctorTodayAppointments(email);
        return ResponseEntity.ok(list);
    }

    /**
     * Recupera os detalhes de uma teleconsulta para acesso à sala virtual.
     */
    @GetMapping("/api/appointments/{id}")
    public ResponseEntity<AppointmentResponse> getAppointmentById(@PathVariable String id) {
        String email = getAuthenticatedEmail();
        AppointmentResponse response = appointmentService.getAppointmentById(email, id);
        return ResponseEntity.ok(response);
    }

    private String getAuthenticatedEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    @PostMapping("/api/doctor/subscription/activate")
    @PreAuthorize("hasRole('MEDICO')")
    public ResponseEntity<Map<String, Object>> activateSubscription() {
        String email = getAuthenticatedEmail();
        doctorScheduleService.activateDoctorSubscription(email);
        return ResponseEntity.ok(Map.of(
                "status", "ASSINATURA_ATIVA",
                "message", "Assinatura ativada com sucesso."
        ));
    }

}
