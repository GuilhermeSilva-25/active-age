package com.activeage.core.controllers;

import com.activeage.core.dtos.responses.PatientExamResponse;
import com.activeage.core.services.DoctorConsultationService;
import com.activeage.core.services.PatientExamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller para operações médicas durante a teleconsulta (Cockpit Clínico - UC13).
 */
@Slf4j
@RestController
@RequestMapping("/api/doctor/appointments")
@Tag(name = "Doctor Consultation Cockpit", description = "Endpoints de apoio à teleconsulta médica e visualização de exames do idoso")
public class DoctorConsultationController {

    private final DoctorConsultationService doctorConsultationService;

    public DoctorConsultationController(DoctorConsultationService doctorConsultationService) {
        this.doctorConsultationService = doctorConsultationService;
    }

    /**
     * Retorna a lista de exames prévios anexados pelo paciente da consulta.
     */
    @GetMapping("/{appointmentId}/patient-exams")
    @Operation(summary = "Lista exames prévios do paciente para o médico durante a teleconsulta")
    public ResponseEntity<List<PatientExamResponse>> getPatientExams(@PathVariable String appointmentId) {
        String email = getAuthenticatedEmail();
        List<PatientExamResponse> exams = doctorConsultationService.getPatientExamsForAppointment(email, appointmentId);
        return ResponseEntity.ok(exams);
    }

    /**
     * Retorna o arquivo binário do exame prévio para visualização ou download pelo médico na sala virtual.
     */
    @GetMapping("/{appointmentId}/patient-exams/{examId}/file")
    @Operation(summary = "Visualiza ou baixa o arquivo do exame do paciente durante a teleconsulta")
    public ResponseEntity<Resource> getPatientExamFile(@PathVariable String appointmentId,
                                                      @PathVariable String examId) {
        String email = getAuthenticatedEmail();
        PatientExamService.ExamDownloadData downloadData =
                doctorConsultationService.getPatientExamFileForAppointment(email, appointmentId, examId);

        String contentType = downloadData.exam().getContentType();
        if (contentType == null || contentType.isBlank()) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + downloadData.exam().getOriginalFileName() + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                .body(downloadData.resource());
    }

    private String getAuthenticatedEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new IllegalArgumentException("Usuário não autenticado.");
        }
        return auth.getName();
    }
}
