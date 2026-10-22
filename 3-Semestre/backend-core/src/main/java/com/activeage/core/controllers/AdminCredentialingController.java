package com.activeage.core.controllers;

import com.activeage.core.domain.enums.DoctorDossierStatus;
import com.activeage.core.domain.enums.DocumentType;
import com.activeage.core.domain.models.DoctorDocumentInfo;
import com.activeage.core.dtos.requests.DoctorReviewRequest;
import com.activeage.core.dtos.responses.AdminDoctorItemResponse;
import com.activeage.core.dtos.responses.DoctorDossierStatusResponse;
import com.activeage.core.services.AdminCredentialingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller RESTful para a Fila de Credenciamento Médico e Auditoria pelo Administrador.
 * Todas as rotas são restritas a usuários com perfil ROLE_ADMIN.
 */
@RestController
@RequestMapping("/api/admin/doctors")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminCredentialingController {

    private final AdminCredentialingService adminCredentialingService;

    public AdminCredentialingController(AdminCredentialingService adminCredentialingService) {
        this.adminCredentialingService = adminCredentialingService;
    }

    /**
     * Retorna a fila de médicos cadastrados, com suporte a filtro por status do dossiê.
     */
    @GetMapping("/pending")
    public ResponseEntity<List<AdminDoctorItemResponse>> getQueue(
            @RequestParam(value = "status", required = false) DoctorDossierStatus status
    ) {
        return ResponseEntity.ok(adminCredentialingService.getDoctorsQueue(status));
    }

    /**
     * Retorna os detalhes completos do Dossiê do médico para auditoria.
     */
    @GetMapping("/{id}/dossier")
    public ResponseEntity<DoctorDossierStatusResponse> getDossier(
            @PathVariable("id") String doctorId,
            @AuthenticationPrincipal String adminEmail,
            HttpServletRequest request
    ) {
        String clientIp = extractClientIp(request);
        return ResponseEntity.ok(adminCredentialingService.getDoctorDossier(doctorId, adminEmail, clientIp));
    }

    /**
     * Transmite de forma segura o arquivo do documento para visualização pelo Auditor,
     * gravando compulsoriamente a operação na Trilha de Auditoria (RN007).
     */
    @GetMapping("/{id}/documents/{docType}")
    public ResponseEntity<Resource> getDocument(
            @PathVariable("id") String doctorId,
            @PathVariable("docType") DocumentType docType,
            @AuthenticationPrincipal String adminEmail,
            HttpServletRequest request
    ) {
        String clientIp = extractClientIp(request);
        Resource resource = adminCredentialingService.getDoctorDocumentResource(doctorId, docType, adminEmail, clientIp);
        DoctorDocumentInfo info = adminCredentialingService.getDoctorDocumentInfo(doctorId, docType);

        String contentType = info.getContentType() != null ? info.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + info.getOriginalFileName() + "\"")
                .body(resource);
    }

    /**
     * Registra o parecer de auditoria do Administrador (Aprovação ou Reprovação com Justificativa).
     */
    @PostMapping("/{id}/review")
    public ResponseEntity<DoctorDossierStatusResponse> reviewDoctor(
            @PathVariable("id") String doctorId,
            @Valid @RequestBody DoctorReviewRequest reviewRequest,
            @AuthenticationPrincipal String adminEmail,
            HttpServletRequest request
    ) {
        String clientIp = extractClientIp(request);
        DoctorDossierStatusResponse response = adminCredentialingService.reviewDoctor(doctorId, reviewRequest, adminEmail, clientIp);
        return ResponseEntity.ok(response);
    }

    private String extractClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
