package com.activeage.core.services;

import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.models.Appointment;
import com.activeage.core.domain.models.PatientExam;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.responses.PatientExamResponse;
import com.activeage.core.repositories.AppointmentRepository;
import com.activeage.core.repositories.PatientExamRepository;
import com.activeage.core.repositories.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Serviço de apoio à Consulta Médica em tempo real (UC13).
 * Permite ao médico visualizar e baixar os exames prévios anexados pelo paciente.
 */
@Slf4j
@Service
public class DoctorConsultationService {

    private final AppointmentRepository appointmentRepository;
    private final PatientExamRepository patientExamRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public DoctorConsultationService(AppointmentRepository appointmentRepository,
                                     PatientExamRepository patientExamRepository,
                                     UserRepository userRepository,
                                     FileStorageService fileStorageService) {
        this.appointmentRepository = appointmentRepository;
        this.patientExamRepository = patientExamRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    /**
     * Retorna a lista de exames prévios do paciente vinculado à teleconsulta informada.
     */
    public List<PatientExamResponse> getPatientExamsForAppointment(String doctorEmail, String appointmentId) {
        Appointment appointment = validateDoctorAccessToAppointment(doctorEmail, appointmentId);

        String patientId = appointment.getPatientId();
        List<PatientExam> exams = patientExamRepository.findByPatientIdOrderByExamDateDesc(patientId);

        return exams.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Recupera o binário do exame prévio para visualização direta pelo médico durante a consulta.
     */
    public PatientExamService.ExamDownloadData getPatientExamFileForAppointment(String doctorEmail, String appointmentId, String examId) {
        Appointment appointment = validateDoctorAccessToAppointment(doctorEmail, appointmentId);

        PatientExam exam = patientExamRepository.findByIdAndPatientId(examId, appointment.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("Exame não encontrado para este paciente."));

        Resource resource = fileStorageService.loadPatientExamResource(exam.getStoredFileName());
        return new PatientExamService.ExamDownloadData(resource, exam);
    }

    private Appointment validateDoctorAccessToAppointment(String doctorEmail, String appointmentId) {
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + doctorEmail));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Consulta não encontrada: " + appointmentId));

        boolean isAssignedDoctor = doctor.getId().equals(appointment.getDoctorId());
        boolean isAdmin = doctor.getRole() == Role.ROLE_ADMIN;

        if (!isAssignedDoctor && !isAdmin) {
            throw new IllegalArgumentException("Acesso negado: apenas o médico assistente pode acessar os exames desta consulta.");
        }

        return appointment;
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
}
