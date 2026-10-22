package com.activeage.core.controllers;

import com.activeage.core.domain.enums.DocumentType;
import com.activeage.core.domain.models.DoctorDocumentInfo;
import com.activeage.core.domain.models.DoctorFinancialInfo;
import com.activeage.core.dtos.requests.DoctorFinancialInfoRequest;
import com.activeage.core.dtos.responses.DoctorDossierStatusResponse;
import com.activeage.core.services.DoctorCredentialingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Controller RESTful para submissão e gestão do Dossiê de Credenciamento pelo Médico.
 * Todas as rotas são restritas a usuários com perfil ROLE_MEDICO.
 */
@RestController
@RequestMapping("/api/doctor")
@PreAuthorize("hasAuthority('ROLE_MEDICO')")
public class DoctorCredentialingController {

    private final DoctorCredentialingService credentialingService;

    public DoctorCredentialingController(DoctorCredentialingService credentialingService) {
        this.credentialingService = credentialingService;
    }

    /**
     * Consulta o status atual do credenciamento, checklist e eventuais pareceres do auditor.
     */
    @GetMapping("/dossier/status")
    public ResponseEntity<DoctorDossierStatusResponse> getStatus(@AuthenticationPrincipal String doctorEmail) {
        return ResponseEntity.ok(credentialingService.getStatus(doctorEmail));
    }

    /**
     * Upload de um documento do dossiê médico nos 4 pilares.
     */
    @PostMapping(value = "/documents/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DoctorDocumentInfo> uploadDocument(
            @AuthenticationPrincipal String doctorEmail,
            @RequestParam("documentType") DocumentType documentType,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request
    ) {
        String clientIp = extractClientIp(request);
        DoctorDocumentInfo docInfo = credentialingService.uploadDocument(doctorEmail, documentType, file, clientIp);
        return ResponseEntity.ok(docInfo);
    }

    /**
     * Cadastro e atualização dos dados bancários para Split Direto.
     */
    @PostMapping("/financial-info")
    public ResponseEntity<DoctorFinancialInfo> updateFinancialInfo(
            @AuthenticationPrincipal String doctorEmail,
            @Valid @RequestBody DoctorFinancialInfoRequest financialRequest,
            HttpServletRequest request
    ) {
        String clientIp = extractClientIp(request);
        DoctorFinancialInfo fin = credentialingService.updateFinancialInfo(doctorEmail, financialRequest, clientIp);
        return ResponseEntity.ok(fin);
    }

    /**
     * Submissão formal de todos os documentos obrigatórios para auditoria.
     */
    @PostMapping("/dossier/submit")
    public ResponseEntity<DoctorDossierStatusResponse> submitDossier(
            @AuthenticationPrincipal String doctorEmail,
            HttpServletRequest request
    ) {
        String clientIp = extractClientIp(request);
        DoctorDossierStatusResponse response = credentialingService.submitDossier(doctorEmail, clientIp);
        return ResponseEntity.ok(response);
    }

    /**
     * Download / Stream seguro do próprio documento para conferência visual pelo médico.
     */
    @GetMapping("/documents/{docType}")
    public ResponseEntity<Resource> getOwnDocument(
            @AuthenticationPrincipal String doctorEmail,
            @PathVariable("docType") DocumentType docType
    ) {
        Resource resource = credentialingService.getDoctorOwnDocument(doctorEmail, docType);
        DoctorDocumentInfo info = credentialingService.getDoctorDocumentInfo(doctorEmail, docType);

        String contentType = info.getContentType() != null ? info.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + info.getOriginalFileName() + "\"")
                .body(resource);
    }

    private String extractClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
