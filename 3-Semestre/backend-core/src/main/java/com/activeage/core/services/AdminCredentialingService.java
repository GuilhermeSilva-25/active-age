package com.activeage.core.services;

import com.activeage.core.domain.enums.DoctorDossierStatus;
import com.activeage.core.domain.enums.DocumentStatus;
import com.activeage.core.domain.enums.DocumentType;
import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.models.DoctorDocumentInfo;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.requests.DoctorReviewRequest;
import com.activeage.core.dtos.responses.AdminDoctorItemResponse;
import com.activeage.core.dtos.responses.DoctorDossierStatusResponse;
import com.activeage.core.repositories.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Serviço de negócio para auditoria e moderação de credenciamento médico pelo Administrador.
 * Implementa as regras RF003, RN007 e RN008 da Resolução CFM nº 2.314/2022.
 */
@Service
public class AdminCredentialingService {

    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final AuditService auditService;
    private final DoctorCredentialingService doctorCredentialingService;

    public AdminCredentialingService(UserRepository userRepository,
                                     FileStorageService fileStorageService,
                                     AuditService auditService,
                                     DoctorCredentialingService doctorCredentialingService) {
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.auditService = auditService;
        this.doctorCredentialingService = doctorCredentialingService;
    }

    /**
     * Retorna a lista de médicos cadastrados com suporte a filtro por status do Dossiê.
     */
    public List<AdminDoctorItemResponse> getDoctorsQueue(DoctorDossierStatus statusFilter) {
        List<User> doctors;

        if (statusFilter != null) {
            doctors = userRepository.findByRoleAndDossierStatus(Role.ROLE_MEDICO, statusFilter);
        } else {
            doctors = userRepository.findByRole(Role.ROLE_MEDICO);
        }

        return doctors.stream().map(d -> {
            int docsCount = d.getDocuments() != null ? d.getDocuments().size() : 0;
            boolean hasFin = d.getFinancialInfo() != null && d.getFinancialInfo().getPixKey() != null;

            return AdminDoctorItemResponse.builder()
                    .id(d.getId())
                    .fullName(d.getFullName())
                    .email(d.getEmail())
                    .phone(d.getPhone())
                    .crm(d.getCrm())
                    .ufCrm(d.getUfCrm())
                    .dossierStatus(d.getDossierStatus() != null ? d.getDossierStatus() : DoctorDossierStatus.PENDING_DOCS)
                    .uploadedDocsCount(docsCount)
                    .hasFinancialInfo(hasFin)
                    .createdAt(d.getCreatedAt())
                    .submittedAt(d.getSubmittedAt())
                    .approvedAt(d.getApprovedAt())
                    .trialExpiresAt(d.getTrialExpiresAt())
                    .build();
        }).collect(Collectors.toList());
    }

    /**
     * Retorna os detalhes completos do Dossiê do médico para conferência visual pelo Auditor.
     */
    public DoctorDossierStatusResponse getDoctorDossier(String doctorId, String adminEmail, String ipAddress) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Médico não encontrado com ID: " + doctorId));

        User admin = userRepository.findByEmail(adminEmail).orElse(null);

        auditService.log(
                admin != null ? admin.getId() : "ADMIN",
                adminEmail,
                "ROLE_ADMIN",
                "VIEW_DOSSIER",
                doctor.getId(),
                "Visualizou dossiê completo do médico " + doctor.getFullName() + " (CRM: " + doctor.getCrm() + "/" + doctor.getUfCrm() + ")",
                ipAddress
        );

        return doctorCredentialingService.buildDossierResponse(doctor);
    }

    /**
     * Carrega o arquivo binário do documento médico para inspeção visual do auditor,
     * gravando compulsoriamente a operação na Trilha de Auditoria (RN007).
     */
    public Resource getDoctorDocumentResource(String doctorId, DocumentType documentType, String adminEmail, String ipAddress) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Médico não encontrado com ID: " + doctorId));

        if (doctor.getDocuments() == null || !doctor.getDocuments().containsKey(documentType.name())) {
            throw new IllegalArgumentException("Documento não encontrado para este médico.");
        }

        DoctorDocumentInfo docInfo = doctor.getDocuments().get(documentType.name());
        User admin = userRepository.findByEmail(adminEmail).orElse(null);

        auditService.log(
                admin != null ? admin.getId() : "ADMIN",
                adminEmail,
                "ROLE_ADMIN",
                "VIEW_DOCUMENT",
                doctor.getId(),
                "Inspecionou o documento " + documentType.name() + " (" + docInfo.getOriginalFileName() + ")",
                ipAddress
        );

        return fileStorageService.loadDocumentAsResource(doctor.getId(), docInfo.getStoredFileName());
    }

    public DoctorDocumentInfo getDoctorDocumentInfo(String doctorId, DocumentType documentType) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Médico não encontrado com ID: " + doctorId));
        if (doctor.getDocuments() == null || !doctor.getDocuments().containsKey(documentType.name())) {
            throw new IllegalArgumentException("Documento não encontrado.");
        }
        return doctor.getDocuments().get(documentType.name());
    }

    /**
     * Registra o parecer de auditoria do Administrador (Aprovação ou Reprovação com Justificativa).
     */
    public DoctorDossierStatusResponse reviewDoctor(String doctorId, DoctorReviewRequest request, String adminEmail, String ipAddress) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Médico não encontrado com ID: " + doctorId));

        User admin = userRepository.findByEmail(adminEmail).orElse(null);
        String action = request.getAction().toUpperCase();

        if ("APPROVE".equals(action)) {
            doctor.setDossierStatus(DoctorDossierStatus.APPROVED);
            doctor.setApprovedAt(LocalDateTime.now());
            doctor.setTrialExpiresAt(LocalDateTime.now().plusDays(15));
            doctor.setRejectionReason(null);

            if (doctor.getDocuments() != null) {
                doctor.getDocuments().values().forEach(d -> d.setStatus(DocumentStatus.APPROVED));
            }

            userRepository.save(doctor);

            auditService.log(
                    admin != null ? admin.getId() : "ADMIN",
                    adminEmail,
                    "ROLE_ADMIN",
                    "REVIEW_DOSSIER_APPROVE",
                    doctor.getId(),
                    "Homologou e aprovou credenciamento do médico. Período promocional de 15 dias iniciado.",
                    ipAddress
            );

        } else if ("REJECT".equals(action)) {
            if (request.getRejectionReason() == null || request.getRejectionReason().trim().length() < 10) {
                throw new IllegalArgumentException("A justificativa técnica de reprovação é obrigatória e deve ter no mínimo 10 caracteres.");
            }

            doctor.setDossierStatus(DoctorDossierStatus.DOCS_REJECTED);
            doctor.setRejectionReason(request.getRejectionReason().trim());

            userRepository.save(doctor);

            auditService.log(
                    admin != null ? admin.getId() : "ADMIN",
                    adminEmail,
                    "ROLE_ADMIN",
                    "REVIEW_DOSSIER_REJECT",
                    doctor.getId(),
                    "Reprovou dossiê de credenciamento. Motivo: " + request.getRejectionReason().trim(),
                    ipAddress
            );

        } else {
            throw new IllegalArgumentException("Ação inválida. Utilize 'APPROVE' ou 'REJECT'.");
        }

        return doctorCredentialingService.buildDossierResponse(doctor);
    }
}
