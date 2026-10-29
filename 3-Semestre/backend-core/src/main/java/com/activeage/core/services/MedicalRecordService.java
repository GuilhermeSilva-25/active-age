package com.activeage.core.services;

import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.models.Appointment;
import com.activeage.core.domain.models.MedicalRecord;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.MedicalRecordRequest;
import com.activeage.core.dtos.MedicalRecordResponse;
import com.activeage.core.repositories.AppointmentRepository;
import com.activeage.core.repositories.MedicalRecordRepository;
import com.activeage.core.repositories.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;

/**
 * Serviço de Prontuário Ético Eletrônico Geriátrico (UC14 / RN003).
 * Garante a integridade, confidencialidade e imutabilidade dos dados clínicos.
 */
@Slf4j
@Service
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public MedicalRecordService(MedicalRecordRepository medicalRecordRepository,
                                AppointmentRepository appointmentRepository,
                                UserRepository userRepository,
                                AuditService auditService) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    /**
     * Recupera o prontuário da teleconsulta ou inicializa um rascunho base se o médico estiver abrindo pela primeira vez.
     */
    public MedicalRecordResponse getOrInitRecord(String userEmail, String appointmentId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + userEmail));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Consulta não encontrada: " + appointmentId));

        boolean isDoctor = appointment.getDoctorId() != null && appointment.getDoctorId().equals(user.getId());
        boolean isPatient = appointment.getPatientId() != null && appointment.getPatientId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;

        if (!isDoctor && !isPatient && !isAdmin) {
            throw new IllegalArgumentException("Acesso não autorizado ao prontuário desta consulta.");
        }

        MedicalRecord record = medicalRecordRepository.findByAppointmentId(appointmentId)
                .orElseGet(() -> {
                    // Inicializa rascunho apenas se for o médico ou admin abrindo a sessão
                    if (isDoctor || isAdmin) {
                        MedicalRecord draft = MedicalRecord.builder()
                                .appointmentId(appointment.getId())
                                .doctorId(appointment.getDoctorId())
                                .doctorName(appointment.getDoctorName())
                                .doctorCrm(appointment.getDoctorCrm())
                                .doctorUfCrm(appointment.getDoctorUfCrm())
                                .patientId(appointment.getPatientId())
                                .patientName(appointment.getPatientName())
                                .status("DRAFT")
                                .createdAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .build();
                        return medicalRecordRepository.save(draft);
                    }
                    return null;
                });

        return record != null ? mapToResponse(record) : null;
    }

    /**
     * Salva ou atualiza os dados clínicos do prontuário em modo rascunho (DRAFT).
     */
    public MedicalRecordResponse saveDraft(String doctorEmail, MedicalRecordRequest request) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new IllegalArgumentException("Médico não encontrado: " + doctorEmail));

        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new IllegalArgumentException("Consulta não encontrada: " + request.getAppointmentId()));

        if (!doctor.getId().equals(appointment.getDoctorId()) && doctor.getRole() != Role.ROLE_ADMIN) {
            throw new IllegalArgumentException("Apenas o médico responsável por este atendimento pode editar o prontuário.");
        }

        MedicalRecord record = medicalRecordRepository.findByAppointmentId(request.getAppointmentId())
                .orElseGet(() -> MedicalRecord.builder()
                        .appointmentId(appointment.getId())
                        .doctorId(appointment.getDoctorId())
                        .doctorName(appointment.getDoctorName())
                        .doctorCrm(appointment.getDoctorCrm())
                        .doctorUfCrm(appointment.getDoctorUfCrm())
                        .patientId(appointment.getPatientId())
                        .patientName(appointment.getPatientName())
                        .status("DRAFT")
                        .createdAt(LocalDateTime.now())
                        .build());

        // Regra de Imutabilidade Ética (RN003): Prontuário finalizado não pode ser alterado
        if ("FINALIZED".equalsIgnoreCase(record.getStatus())) {
            throw new IllegalStateException("Este prontuário médico já foi finalizado e assinado, tornando-se imutável conforme as normas do CFM.");
        }

        record.setChiefComplaint(request.getChiefComplaint());
        record.setHistoryOfPresentIllness(request.getHistoryOfPresentIllness());
        record.setClinicalEvolution(request.getClinicalEvolution());

        record.setCognitiveStatus(request.getCognitiveStatus());
        record.setMobilityRisk(request.getMobilityRisk());
        record.setFunctionalIndependence(request.getFunctionalIndependence());
        record.setFamilySupport(request.getFamilySupport());

        record.setCid11Code(request.getCid11Code());
        record.setCid11Description(request.getCid11Description());
        record.setClinicalConduct(request.getClinicalConduct());

        record.setUpdatedAt(LocalDateTime.now());

        MedicalRecord saved = medicalRecordRepository.save(record);
        return mapToResponse(saved);
    }

    /**
     * Finaliza e assina digitalmente o prontuário médico, gerando hash SHA-256 e ativando a imutabilidade definitiva.
     */
    public MedicalRecordResponse finalizeRecord(String doctorEmail, String recordId) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new IllegalArgumentException("Médico não encontrado: " + doctorEmail));

        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("Prontuário médico não encontrado: " + recordId));

        if (!doctor.getId().equals(record.getDoctorId()) && doctor.getRole() != Role.ROLE_ADMIN) {
            throw new IllegalArgumentException("Apenas o médico emitente pode assinar e finalizar este prontuário.");
        }

        if ("FINALIZED".equalsIgnoreCase(record.getStatus())) {
            throw new IllegalStateException("Este prontuário já se encontra assinado e finalizado.");
        }

        LocalDateTime now = LocalDateTime.now();
        String payloadToHash = record.getId() + "|" +
                record.getAppointmentId() + "|" +
                record.getDoctorCrm() + "|" +
                record.getPatientId() + "|" +
                record.getCid11Code() + "|" +
                record.getClinicalConduct() + "|" +
                now.toString();

        String hash = generateSha256(payloadToHash);

        record.setStatus("FINALIZED");
        record.setFinalizedAt(now);
        record.setHashSignature(hash);
        record.setUpdatedAt(now);

        MedicalRecord finalized = medicalRecordRepository.save(record);

        // Registro indelével na trilha de auditoria para fins de compliance CFM e SBIS
        auditService.log(
                doctor.getId(),
                doctor.getEmail(),
                "MEDICO",
                "MEDICAL_RECORD_FINALIZED",
                record.getPatientId(),
                "Prontuário da consulta " + record.getAppointmentId() + " assinado e finalizado com hash SHA-256: " + hash,
                "0.0.0.0"
        );

        log.info("Prontuário {} finalizado e assinado pelo Dr(a). {} (Hash: {})", finalized.getId(), doctor.getFullName(), hash);

        return mapToResponse(finalized);
    }

    private String generateSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : encodedHash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString().toUpperCase();
        } catch (Exception e) {
            log.error("Erro ao calcular hash SHA-256 do prontuário", e);
            return "SHA256-" + System.currentTimeMillis();
        }
    }

    private MedicalRecordResponse mapToResponse(MedicalRecord record) {
        return MedicalRecordResponse.builder()
                .id(record.getId())
                .appointmentId(record.getAppointmentId())
                .doctorId(record.getDoctorId())
                .doctorName(record.getDoctorName())
                .doctorCrm(record.getDoctorCrm())
                .doctorUfCrm(record.getDoctorUfCrm())
                .patientId(record.getPatientId())
                .patientName(record.getPatientName())
                .chiefComplaint(record.getChiefComplaint())
                .historyOfPresentIllness(record.getHistoryOfPresentIllness())
                .clinicalEvolution(record.getClinicalEvolution())
                .cognitiveStatus(record.getCognitiveStatus())
                .mobilityRisk(record.getMobilityRisk())
                .functionalIndependence(record.getFunctionalIndependence())
                .familySupport(record.getFamilySupport())
                .cid11Code(record.getCid11Code())
                .cid11Description(record.getCid11Description())
                .clinicalConduct(record.getClinicalConduct())
                .status(record.getStatus())
                .finalizedAt(record.getFinalizedAt())
                .hashSignature(record.getHashSignature())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }
}
