package com.activeage.core.controllers;

import com.activeage.core.dtos.MedicalRecordRequest;
import com.activeage.core.dtos.MedicalRecordResponse;
import com.activeage.core.services.MedicalRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * Controller RESTful para Gestão de Prontuário Ético Eletrônico Geriátrico (UC14 / RN003).
 */
@Slf4j
@RestController
@RequestMapping("/api/medical-records")
@Tag(name = "Medical Records", description = "Endpoints para registro, consulta e assinatura de Prontuários Eletrônicos com imutabilidade ética")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    public MedicalRecordController(MedicalRecordService medicalRecordService) {
        this.medicalRecordService = medicalRecordService;
    }

    /**
     * Recupera o prontuário de uma consulta específica ou inicializa o rascunho de atendimento.
     */
    @GetMapping("/appointment/{appointmentId}")
    @Operation(summary = "Recupera o prontuário da teleconsulta")
    public ResponseEntity<MedicalRecordResponse> getRecord(@PathVariable String appointmentId) {
        String email = getAuthenticatedEmail();
        MedicalRecordResponse record = medicalRecordService.getOrInitRecord(email, appointmentId);
        if (record == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(record);
    }

    /**
     * Salva as anotações do prontuário em modo rascunho.
     */
    @PostMapping
    @Operation(summary = "Salva alterações no prontuário em modo rascunho")
    public ResponseEntity<MedicalRecordResponse> saveDraft(@Valid @RequestBody MedicalRecordRequest request) {
        String email = getAuthenticatedEmail();
        MedicalRecordResponse record = medicalRecordService.saveDraft(email, request);
        return ResponseEntity.ok(record);
    }

    /**
     * Finaliza e assina digitalmente o prontuário com trava definitiva de imutabilidade.
     */
    @PostMapping("/{id}/finalize")
    @Operation(summary = "Finaliza e assina digitalmente o prontuário médico (gera hash SHA-256 e trava alterações)")
    public ResponseEntity<MedicalRecordResponse> finalizeRecord(@PathVariable String id) {
        String email = getAuthenticatedEmail();
        MedicalRecordResponse record = medicalRecordService.finalizeRecord(email, id);
        return ResponseEntity.ok(record);
    }

    private String getAuthenticatedEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new IllegalArgumentException("Usuário não autenticado.");
        }
        return auth.getName();
    }
}
