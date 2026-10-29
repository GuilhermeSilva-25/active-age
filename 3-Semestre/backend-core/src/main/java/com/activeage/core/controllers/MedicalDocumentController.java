package com.activeage.core.controllers;

import com.activeage.core.dtos.CreateMedicalDocumentRequest;
import com.activeage.core.dtos.DocumentValidationResponse;
import com.activeage.core.dtos.MedicalDocumentResponse;
import com.activeage.core.services.MedicalDocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller RESTful para Emissão e Validação de Documentos Médicos Digitais (UC15 / UC16).
 */
@Slf4j
@RestController
@RequestMapping("/api/medical-documents")
@Tag(name = "Medical Documents", description = "Endpoints para emissão de receitas, pedidos de exames, atestados e validação pública ICP-Brasil")
public class MedicalDocumentController {

    private final MedicalDocumentService medicalDocumentService;

    public MedicalDocumentController(MedicalDocumentService medicalDocumentService) {
        this.medicalDocumentService = medicalDocumentService;
    }

    /**
     * Emite um novo documento médico oficial (Receita, Pedido de Exame ou Atestado).
     */
    @PostMapping
    @Operation(summary = "Emite um documento clínico digital com código de validação")
    public ResponseEntity<MedicalDocumentResponse> createDocument(@Valid @RequestBody CreateMedicalDocumentRequest request) {
        String email = getAuthenticatedEmail();
        MedicalDocumentResponse doc = medicalDocumentService.createDocument(email, request);
        return ResponseEntity.ok(doc);
    }

    /**
     * Retorna todos os documentos clínicos emitidos em uma determinada teleconsulta.
     */
    @GetMapping("/appointment/{appointmentId}")
    @Operation(summary = "Lista documentos emitidos em uma teleconsulta específica")
    public ResponseEntity<List<MedicalDocumentResponse>> getDocumentsByAppointment(@PathVariable String appointmentId) {
        String email = getAuthenticatedEmail();
        List<MedicalDocumentResponse> docs = medicalDocumentService.getDocumentsByAppointment(email, appointmentId);
        return ResponseEntity.ok(docs);
    }

    /**
     * Retorna a lista de todas as receitas e documentos emitidos para o paciente logado.
     */
    @GetMapping("/my-documents")
    @Operation(summary = "Lista documentos clínicos emitidos para o paciente logado")
    public ResponseEntity<List<MedicalDocumentResponse>> getMyDocuments() {
        String email = getAuthenticatedEmail();
        List<MedicalDocumentResponse> docs = medicalDocumentService.getPatientDocuments(email);
        return ResponseEntity.ok(docs);
    }

    /**
     * Endpoint público para conferência de autenticidade documental por farmácias e pacientes.
     */
    @GetMapping("/validate/{code}")
    @Operation(summary = "Valida publicamente a autenticidade de um documento médico digital")
    public ResponseEntity<DocumentValidationResponse> validateDocument(@PathVariable String code) {
        DocumentValidationResponse response = medicalDocumentService.validateDocument(code);
        return ResponseEntity.ok(response);
    }

    private String getAuthenticatedEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new IllegalArgumentException("Usuário não autenticado.");
        }
        return auth.getName();
    }
}
