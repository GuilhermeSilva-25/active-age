package com.activeage.core.controllers;

import com.activeage.core.domain.enums.ExamCategory;
import com.activeage.core.dtos.responses.PatientExamResponse;
import com.activeage.core.services.PatientExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Controller RESTful para submissão, consulta e download de exames prévios do paciente (UC11 / RF008).
 * Acesso estritamente restrito a pacientes autenticados (ROLE_PACIENTE).
 */
@RestController
@RequestMapping("/api/patient/exams")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PACIENTE')")
public class PatientExamController {

    private final PatientExamService patientExamService;

    /**
     * Envia um novo exame ou laudo médico para o cofre de saúde persistente no GridFS.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PatientExamResponse> uploadExam(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("category") ExamCategory category,
            @RequestParam("examDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate examDate,
            @RequestParam(value = "notes", required = false) String notes
    ) {
        String email = getAuthenticatedEmail();
        PatientExamResponse response = patientExamService.uploadExam(email, file, title, category, examDate, notes);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Lista todos os exames do paciente autenticado com filtro opcional por categoria.
     */
    @GetMapping
    public ResponseEntity<List<PatientExamResponse>> getExams(
            @RequestParam(required = false) ExamCategory category
    ) {
        String email = getAuthenticatedEmail();
        List<PatientExamResponse> exams = patientExamService.getPatientExams(email, category);
        return ResponseEntity.ok(exams);
    }

    /**
     * Realiza o download ou visualização (inline) segura do laudo em PDF ou imagem.
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadExam(@PathVariable String id) {
        String email = getAuthenticatedEmail();
        PatientExamService.ExamDownloadData downloadData = patientExamService.getExamForDownload(email, id);

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

    /**
     * Exclui um exame previamente anexado e apaga seu binário no GridFS.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteExam(@PathVariable String id) {
        String email = getAuthenticatedEmail();
        patientExamService.deleteExam(email, id);
        return ResponseEntity.ok(Map.of("message", "Exame removido com sucesso do seu cofre de saúde."));
    }

    private String getAuthenticatedEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new IllegalArgumentException("Usuário não autenticado.");
        }
        return auth.getName();
    }
}
