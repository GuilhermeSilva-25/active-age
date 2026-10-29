package com.activeage.core.controllers;

import com.activeage.core.dtos.requests.CreateBatchSlotsRequest;
import com.activeage.core.dtos.requests.CreateSlotRequest;
import com.activeage.core.dtos.responses.DoctorScheduleSlotResponse;
import com.activeage.core.dtos.responses.DoctorScheduleSummaryResponse;
import com.activeage.core.services.DoctorScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Controller RESTful para Gestão da Agenda e Grade de Horários do Médico (UC10 / RF006, RF007).
 * Permite ao profissional credenciado definir seus turnos, slots avulsos e controlar bloqueios.
 */
@RestController
@RequestMapping("/api/doctor/schedule")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MEDICO')")
public class DoctorScheduleController {

    private final DoctorScheduleService doctorScheduleService;

    /**
     * Lista os slots de horário do médico autenticado, com filtro opcional por período.
     */
    @GetMapping
    public ResponseEntity<List<DoctorScheduleSlotResponse>> listSlots(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        String email = getAuthenticatedEmail();
        List<DoctorScheduleSlotResponse> slots = doctorScheduleService.listDoctorSlots(email, startDate, endDate);
        return ResponseEntity.ok(slots);
    }

    /**
     * Cadastra um slot de horário avulso na agenda.
     */
    @PostMapping("/slot")
    public ResponseEntity<DoctorScheduleSlotResponse> createSlot(@Valid @RequestBody CreateSlotRequest request) {
        String email = getAuthenticatedEmail();
        DoctorScheduleSlotResponse response = doctorScheduleService.createSlot(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Gera em lote múltiplos slots de atendimento para um turno (manhã, tarde ou integral).
     */
    @PostMapping("/batch")
    public ResponseEntity<List<DoctorScheduleSlotResponse>> createBatchSlots(@Valid @RequestBody CreateBatchSlotsRequest request) {
        String email = getAuthenticatedEmail();
        List<DoctorScheduleSlotResponse> response = doctorScheduleService.createBatchSlots(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Remove um horário da agenda (apenas se status for LIVRE ou BLOQUEADO).
     */
    @DeleteMapping("/slot/{id}")
    public ResponseEntity<Map<String, String>> deleteSlot(@PathVariable String id) {
        String email = getAuthenticatedEmail();
        doctorScheduleService.deleteSlot(email, id);
        return ResponseEntity.ok(Map.of("message", "Horário removido com sucesso da sua agenda."));
    }

    /**
     * Alterna o status do horário entre LIVRE e BLOQUEADO.
     */
    @PatchMapping("/slot/{id}/toggle-block")
    public ResponseEntity<DoctorScheduleSlotResponse> toggleBlockSlot(@PathVariable String id) {
        String email = getAuthenticatedEmail();
        DoctorScheduleSlotResponse response = doctorScheduleService.toggleBlockSlot(email, id);
        return ResponseEntity.ok(response);
    }

    /**
     * Retorna métricas resumidas da agenda do médico (livres, ocupados, taxa de ocupação).
     */
    @GetMapping("/summary")
    public ResponseEntity<DoctorScheduleSummaryResponse> getSummary() {
        String email = getAuthenticatedEmail();
        DoctorScheduleSummaryResponse summary = doctorScheduleService.getDoctorScheduleSummary(email);
        return ResponseEntity.ok(summary);
    }

    private String getAuthenticatedEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }
}
