package com.activeage.core.services;

import com.activeage.core.domain.enums.ExamCategory;
import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.models.PatientExam;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.responses.PatientExamResponse;
import com.activeage.core.repositories.PatientExamRepository;
import com.activeage.core.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Serviço responsável pela gestão de exames prévios e laudos do paciente (UC11 / RF008).
 * Garante o isolamento estrito de acesso conforme LGPD e persistência em nuvem via GridFS.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PatientExamService {

    private final PatientExamRepository patientExamRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    /**
     * Realiza o upload e o registro de um novo exame no cofre de saúde do paciente.
     */
    public PatientExamResponse uploadExam(
            String patientEmail,
            MultipartFile file,
            String title,
            ExamCategory category,
            LocalDate examDate,
            String notes
    ) {
        User patient = getAuthenticatedPatient(patientEmail);

        if (title == null || title.trim().length() < 3 || title.trim().length() > 100) {
            throw new IllegalArgumentException("O título do exame deve conter entre 3 e 100 caracteres.");
        }

        if (category == null) {
            throw new IllegalArgumentException("A categoria clínica do exame é obrigatória.");
        }

        if (examDate == null) {
            throw new IllegalArgumentException("A data de realização do exame é obrigatória.");
        }

        if (examDate.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("A data de realização do exame não pode ser uma data futura.");
        }

        // Salva arquivo no MongoDB GridFS
        String storedFileName = fileStorageService.storePatientExam(patient.getId(), file);

        PatientExam exam = PatientExam.builder()
                .patientId(patient.getId())
                .title(title.trim())
                .category(category)
                .examDate(examDate)
                .notes(notes != null && !notes.isBlank() ? notes.trim() : null)
                .storedFileName(storedFileName)
                .originalFileName(file.getOriginalFilename() != null ? file.getOriginalFilename() : "exame")
                .contentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                .sizeBytes(file.getSize())
                .uploadedAt(LocalDateTime.now())
                .build();

        PatientExam savedExam = patientExamRepository.save(exam);
        log.info("Exame cadastrado com sucesso para o paciente {}: id={}, titulo='{}'",
                patient.getEmail(), savedExam.getId(), savedExam.getTitle());

        return mapToResponse(savedExam);
    }

    /**
     * Retorna a lista de exames do paciente autenticado com filtro opcional por categoria clínica.
     */
    public List<PatientExamResponse> getPatientExams(String patientEmail, ExamCategory category) {
        User patient = getAuthenticatedPatient(patientEmail);

        List<PatientExam> exams;
        if (category == null) {
            exams = patientExamRepository.findByPatientIdOrderByExamDateDesc(patient.getId());
        } else {
            exams = patientExamRepository.findByPatientIdAndCategoryOrderByExamDateDesc(patient.getId(), category);
        }

        return exams.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Recupera o arquivo binário do exame para visualização ou download seguro.
     */
    public ExamDownloadData getExamForDownload(String patientEmail, String examId) {
        User patient = getAuthenticatedPatient(patientEmail);

        PatientExam exam = patientExamRepository.findByIdAndPatientId(examId, patient.getId())
                .orElseThrow(() -> new IllegalArgumentException("Exame não encontrado ou acesso não autorizado."));

        Resource resource = fileStorageService.loadPatientExamResource(exam.getStoredFileName());

        return new ExamDownloadData(resource, exam);
    }

    /**
     * Remove um exame do cofre de saúde do paciente e apaga o binário do GridFS.
     */
    public void deleteExam(String patientEmail, String examId) {
        User patient = getAuthenticatedPatient(patientEmail);

        PatientExam exam = patientExamRepository.findByIdAndPatientId(examId, patient.getId())
                .orElseThrow(() -> new IllegalArgumentException("Exame não encontrado ou acesso não autorizado."));

        fileStorageService.deletePatientExam(exam.getStoredFileName());
        patientExamRepository.delete(exam);

        log.info("Exame {} removido com sucesso pelo paciente {}", examId, patient.getEmail());
    }

    private User getAuthenticatedPatient(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + email));

        if (user.getRole() != Role.ROLE_PACIENTE) {
            throw new IllegalArgumentException("Apenas pacientes podem gerenciar seus próprios exames.");
        }

        return user;
    }

    private PatientExamResponse mapToResponse(PatientExam exam) {
        return PatientExamResponse.builder()
                .id(exam.getId())
                .patientId(exam.getPatientId())
                .title(exam.getTitle())
                .category(exam.getCategory())
                .categoryDescription(exam.getCategory() != null ? exam.getCategory().getDescription() : "")
                .examDate(exam.getExamDate())
                .notes(exam.getNotes())
                .originalFileName(exam.getOriginalFileName())
                .contentType(exam.getContentType())
                .sizeBytes(exam.getSizeBytes())
                .formattedSize(PatientExamResponse.formatFileSize(exam.getSizeBytes()))
                .uploadedAt(exam.getUploadedAt())
                .build();
    }

    /**
     * Encapsula o binário e os metadados para envio na resposta HTTP de download/streaming.
     */
    public record ExamDownloadData(Resource resource, PatientExam exam) {}
}
