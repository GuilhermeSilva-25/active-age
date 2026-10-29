package com.activeage.core.services;

import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.models.Appointment;
import com.activeage.core.domain.models.MedicalDocument;
import com.activeage.core.domain.models.MedicalRecord;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.CreateMedicalDocumentRequest;
import com.activeage.core.dtos.DocumentValidationResponse;
import com.activeage.core.dtos.MedicalDocumentResponse;
import com.activeage.core.repositories.AppointmentRepository;
import com.activeage.core.repositories.MedicalDocumentRepository;
import com.activeage.core.repositories.MedicalRecordRepository;
import com.activeage.core.repositories.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Serviço de Emissão e Validação de Documentos Médicos Digitais (UC15 / UC16).
 * Suporta emissão de Receitas, Pedidos de Exames e Atestados com validação pública.
 */
@Slf4j
@Service
public class MedicalDocumentService {

    private final MedicalDocumentRepository medicalDocumentRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public MedicalDocumentService(MedicalDocumentRepository medicalDocumentRepository,
                                  AppointmentRepository appointmentRepository,
                                  MedicalRecordRepository medicalRecordRepository,
                                  UserRepository userRepository,
                                  AuditService auditService) {
        this.medicalDocumentRepository = medicalDocumentRepository;
        this.appointmentRepository = appointmentRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    /**
     * Emite um novo documento médico (Receita, Pedido de Exame ou Atestado) vinculado à consulta.
     */
    public MedicalDocumentResponse createDocument(String doctorEmail, CreateMedicalDocumentRequest request) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new IllegalArgumentException("Médico não encontrado: " + doctorEmail));

        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new IllegalArgumentException("Consulta não encontrada: " + request.getAppointmentId()));

        if (!doctor.getId().equals(appointment.getDoctorId()) && doctor.getRole() != Role.ROLE_ADMIN) {
            throw new IllegalArgumentException("Apenas o médico responsável por esta consulta pode emitir documentos.");
        }

        // Recupera dados do paciente para enriquecimento do cabeçalho
        User patient = userRepository.findById(appointment.getPatientId()).orElse(null);
        Optional<MedicalRecord> recordOpt = medicalRecordRepository.findByAppointmentId(appointment.getId());

        String validationCode = generateUniqueValidationCode();

        MedicalDocument document = MedicalDocument.builder()
                .appointmentId(appointment.getId())
                .medicalRecordId(recordOpt.map(MedicalRecord::getId).orElse(null))
                .doctorId(doctor.getId())
                .doctorName(doctor.getFullName())
                .doctorCrm(doctor.getCrm())
                .doctorUfCrm(doctor.getUfCrm())
                .doctorRqe(doctor.getRqe())
                .patientId(appointment.getPatientId())
                .patientName(appointment.getPatientName())
                .patientCpf(patient != null && patient.getCpf() != null ? patient.getCpf() : "Conforme Cadastro")
                .documentType(request.getDocumentType().toUpperCase(Locale.ROOT))
                .title(request.getTitle())
                .content(request.getContent())
                .recommendations(request.getRecommendations())
                .validationCode(validationCode)
                .issuedAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .build();

        MedicalDocument saved = medicalDocumentRepository.save(document);

        // Registro de emissão na trilha imutável de auditoria
        auditService.log(
                doctor.getId(),
                doctor.getEmail(),
                "MEDICO",
                "MEDICAL_DOCUMENT_ISSUED",
                appointment.getPatientId(),
                "Documento " + saved.getDocumentType() + " (" + saved.getTitle() + ") emitido com código " + validationCode,
                "0.0.0.0"
        );

        log.info("Documento {} ({}) emitido pelo Dr. {} para o paciente {} (Código: {})",
                saved.getId(), saved.getDocumentType(), doctor.getFullName(), appointment.getPatientName(), validationCode);

        return mapToResponse(saved);
    }

    /**
     * Retorna todos os documentos emitidos na sessão de uma consulta específica.
     */
    public List<MedicalDocumentResponse> getDocumentsByAppointment(String userEmail, String appointmentId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + userEmail));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Consulta não encontrada: " + appointmentId));

        boolean isDoctor = appointment.getDoctorId() != null && appointment.getDoctorId().equals(user.getId());
        boolean isPatient = appointment.getPatientId() != null && appointment.getPatientId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;

        if (!isDoctor && !isPatient && !isAdmin) {
            throw new IllegalArgumentException("Acesso não autorizado aos documentos desta teleconsulta.");
        }

        return medicalDocumentRepository.findByAppointmentId(appointmentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retorna todo o histórico de receitas e documentos do paciente autenticado (UC16).
     */
    public List<MedicalDocumentResponse> getPatientDocuments(String patientEmail) {
        User patient = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new IllegalArgumentException("Paciente não encontrado: " + patientEmail));

        return medicalDocumentRepository.findByPatientIdOrderByIssuedAtDesc(patient.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Valida publicamente a autenticidade de um documento médico por seu código verificador.
     */
    public DocumentValidationResponse validateDocument(String validationCode) {
        if (validationCode == null || validationCode.isBlank()) {
            return DocumentValidationResponse.builder()
                    .valid(false)
                    .message("Código de validação não fornecido.")
                    .build();
        }

        return medicalDocumentRepository.findByValidationCode(validationCode.trim().toUpperCase(Locale.ROOT))
                .map(doc -> DocumentValidationResponse.builder()
                        .valid(true)
                        .validationCode(doc.getValidationCode())
                        .documentType(doc.getDocumentType())
                        .title(doc.getTitle())
                        .doctorName(doc.getDoctorName())
                        .doctorCrm(doc.getDoctorCrm())
                        .doctorUfCrm(doc.getDoctorUfCrm())
                        .patientName(doc.getPatientName())
                        .issuedAt(doc.getIssuedAt())
                        .message("Documento digital autêntico emitido via plataforma Active Age em conformidade com as Resoluções CFM nº 2.314/2022 e 2.299/2021.")
                        .build())
                .orElseGet(() -> DocumentValidationResponse.builder()
                        .valid(false)
                        .validationCode(validationCode)
                        .message("Documento não localizado ou código de verificação inválido.")
                        .build());
    }

    private String generateUniqueValidationCode() {
        String code;
        int attempts = 0;
        do {
            String suffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase(Locale.ROOT);
            code = "AA-2026-" + suffix;
            attempts++;
        } while (medicalDocumentRepository.existsByValidationCode(code) && attempts < 10);
        return code;
    }

    private MedicalDocumentResponse mapToResponse(MedicalDocument doc) {
        return MedicalDocumentResponse.builder()
                .id(doc.getId())
                .appointmentId(doc.getAppointmentId())
                .medicalRecordId(doc.getMedicalRecordId())
                .doctorId(doc.getDoctorId())
                .doctorName(doc.getDoctorName())
                .doctorCrm(doc.getDoctorCrm())
                .doctorUfCrm(doc.getDoctorUfCrm())
                .doctorRqe(doc.getDoctorRqe())
                .patientId(doc.getPatientId())
                .patientName(doc.getPatientName())
                .patientCpf(doc.getPatientCpf())
                .documentType(doc.getDocumentType())
                .title(doc.getTitle())
                .content(doc.getContent())
                .recommendations(doc.getRecommendations())
                .validationCode(doc.getValidationCode())
                .issuedAt(doc.getIssuedAt())
                .createdAt(doc.getCreatedAt())
                .build();
    }
}
