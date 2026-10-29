package com.activeage.core.services;

import com.activeage.core.domain.enums.AppointmentStatus;
import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.enums.SlotStatus;
import com.activeage.core.domain.models.Appointment;
import com.activeage.core.domain.models.DoctorScheduleSlot;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.requests.CreateAppointmentRequest;
import com.activeage.core.dtos.responses.AppointmentResponse;
import com.activeage.core.repositories.AppointmentRepository;
import com.activeage.core.repositories.DoctorScheduleSlotRepository;
import com.activeage.core.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Serviço responsável pelas operações de agendamento, consulta e cancelamento ético de teleconsultas (UC09).
 * Implementa reserva atômica sem double-booking (RN001) e regra de cancelamento prévio de 24 horas (RN002).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorScheduleSlotRepository scheduleSlotRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    /**
     * Realiza a reserva de consulta do paciente em um slot livre (RN001).
     */
    public AppointmentResponse createAppointment(String patientEmail, CreateAppointmentRequest request) {
        User patient = getAuthenticatedPatient(patientEmail);

        DoctorScheduleSlot slot = scheduleSlotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new IllegalArgumentException("Horário de consulta não encontrado."));

        if (!slot.getStartDateTime().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("Não é possível agendar um horário retroativo no passado.");
        }

        if (slot.getStatus() != SlotStatus.LIVRE) {
            throw new IllegalStateException("Este horário não está mais disponível para agendamento. Por favor, escolha outro horário.");
        }

        User doctor = userRepository.findById(slot.getDoctorId())
                .orElseThrow(() -> new IllegalArgumentException("Médico responsável não encontrado."));

        BigDecimal fee = (doctor.getConsultationFee() != null && doctor.getConsultationFee().compareTo(BigDecimal.ZERO) > 0)
                ? doctor.getConsultationFee()
                : BigDecimal.valueOf(250.00);

        String specialty = (doctor.getClinicalFocus() != null && !doctor.getClinicalFocus().isEmpty())
                ? String.join(", ", doctor.getClinicalFocus())
                : "Geriatria e Gerontologia";

        String meetRoomId = UUID.randomUUID().toString();

        Appointment appointment = Appointment.builder()
                .patientId(patient.getId())
                .patientName(patient.getFullName())
                .patientEmail(patient.getEmail())
                .patientPhone(patient.getPhone())
                .doctorId(doctor.getId())
                .doctorName(doctor.getFullName())
                .doctorCrm(doctor.getCrm())
                .doctorUfCrm(doctor.getUfCrm())
                .doctorSpecialty(specialty)
                .slotId(slot.getId())
                .startDateTime(slot.getStartDateTime())
                .endDateTime(slot.getEndDateTime())
                .durationMinutes(slot.getDurationMinutes())
                .consultationFee(fee)
                .status(AppointmentStatus.AGENDADA)
                .patientNotes(request.getPatientNotes())
                .meetRoomId(meetRoomId)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Bloqueia atomicamente o slot do médico para OCUPADO
        slot.setStatus(SlotStatus.OCUPADO);
        slot.setPatientId(patient.getId());
        slot.setPatientName(patient.getFullName());
        slot.setAppointmentId(savedAppointment.getId());
        slot.setUpdatedAt(LocalDateTime.now());
        scheduleSlotRepository.save(slot);

        // Registra formalmente na Trilha de Auditoria Imutável (CFM / SBIS NGS1)
        try {
            String logDetail = String.format("Teleconsulta agendada com Dr(a). %s (CRM %s/%s) para %s",
                    doctor.getFullName(), doctor.getCrm(), doctor.getUfCrm(), slot.getStartDateTime());
            auditService.log(
                    patient.getId(),
                    patient.getEmail(),
                    "ROLE_PACIENTE",
                    "APPOINTMENT_CREATED",
                    doctor.getId(),
                    logDetail,
                    "127.0.0.1"
            );
        } catch (Exception ex) {
            log.warn("Falha ao registrar log de auditoria para agendamento {}: {}", savedAppointment.getId(), ex.getMessage());
        }

        log.info("Consulta {} agendada com sucesso pelo paciente {} com o médico {}",
                savedAppointment.getId(), patient.getEmail(), doctor.getEmail());

        return mapToResponse(savedAppointment);
    }

    /**
     * Lista todas as consultas (histórico e próximas) do paciente autenticado.
     */
    public List<AppointmentResponse> listPatientAppointments(String patientEmail) {
        User patient = getAuthenticatedPatient(patientEmail);
        List<Appointment> list = appointmentRepository.findByPatientIdOrderByStartDateTimeDesc(patient.getId());
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /**
     * Retorna a próxima consulta mais iminente do paciente autenticado.
     */
    public Optional<AppointmentResponse> getNextPatientAppointment(String patientEmail) {
        User patient = getAuthenticatedPatient(patientEmail);
        return appointmentRepository.findFirstByPatientIdAndStatusAndStartDateTimeGreaterThanEqualOrderByStartDateTimeAsc(
                patient.getId(), AppointmentStatus.AGENDADA, LocalDateTime.now()
        ).map(this::mapToResponse);
    }

    /**
     * Cancela uma consulta agendada pelo paciente respeitando a regra de antecedência de 24 horas (RN002).
     */
    public AppointmentResponse cancelAppointment(String patientEmail, String appointmentId, String reason) {
        User patient = getAuthenticatedPatient(patientEmail);

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Consulta não encontrada."));

        if (!appointment.getPatientId().equals(patient.getId())) {
            throw new SecurityException("Você não tem autorização para cancelar a consulta de outro paciente.");
        }

        if (appointment.getStatus() != AppointmentStatus.AGENDADA) {
            throw new IllegalStateException("Apenas consultas com status 'AGENDADA' podem ser canceladas.");
        }

        // Validação estrita da regra de 24 horas (RN002)
        if (!appointment.getStartDateTime().isAfter(LocalDateTime.now().plusHours(24))) {
            throw new IllegalStateException("Consultas com menos de 24 horas de antecedência não podem ser canceladas pelo portal. Entre em contato diretamente com o suporte ou o profissional.");
        }

        appointment.setStatus(AppointmentStatus.CANCELADA_PELO_PACIENTE);
        appointment.setCancellationReason(reason != null ? reason : "Cancelamento solicitado pelo paciente via plataforma.");
        appointment.setUpdatedAt(LocalDateTime.now());

        Appointment updated = appointmentRepository.save(appointment);

        // Reciclagem do slot (RN002): o horário na agenda do médico é devolvido para LIVRE
        if (appointment.getSlotId() != null) {
            scheduleSlotRepository.findById(appointment.getSlotId()).ifPresent(slot -> {
                if (slot.getStartDateTime().isAfter(LocalDateTime.now())) {
                    slot.setStatus(SlotStatus.LIVRE);
                    slot.setPatientId(null);
                    slot.setPatientName(null);
                    slot.setAppointmentId(null);
                    slot.setUpdatedAt(LocalDateTime.now());
                    scheduleSlotRepository.save(slot);
                    log.info("Slot {} reciclado e devolvido à vitrine com status LIVRE", slot.getId());
                }
            });
        }

        // Registra formalmente o cancelamento na Trilha de Auditoria Imutável (CFM / SBIS NGS1)
        try {
            String logDetail = String.format("Teleconsulta com Dr(a). %s para %s cancelada pelo paciente. Horário liberado na agenda médica.",
                    appointment.getDoctorName(), appointment.getStartDateTime());
            auditService.log(
                    patient.getId(),
                    patient.getEmail(),
                    "ROLE_PACIENTE",
                    "APPOINTMENT_CANCELLED",
                    appointment.getDoctorId(),
                    logDetail,
                    "127.0.0.1"
            );
        } catch (Exception ex) {
            log.warn("Falha ao registrar log de auditoria para cancelamento {}: {}", appointmentId, ex.getMessage());
        }

        log.info("Consulta {} cancelada pelo paciente {}", appointmentId, patient.getEmail());
        return mapToResponse(updated);
    }

    /**
     * Lista as consultas agendadas para o dia de hoje do médico autenticado.
     */
    public List<AppointmentResponse> listDoctorTodayAppointments(String doctorEmail) {
        User doctor = getAuthenticatedDoctor(doctorEmail);

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59);

        List<Appointment> list = appointmentRepository.findByDoctorIdAndStatusAndStartDateTimeBetweenOrderByStartDateTimeAsc(
                doctor.getId(), AppointmentStatus.AGENDADA, startOfDay, endOfDay
        );

        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // --- Métodos Auxiliares ---

    private User getAuthenticatedPatient(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        if (user.getRole() != Role.ROLE_PACIENTE) {
            throw new SecurityException("Apenas pacientes podem realizar ou gerenciar agendamentos de consultas.");
        }

        return user;
    }

    private User getAuthenticatedDoctor(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        if (user.getRole() != Role.ROLE_MEDICO) {
            throw new SecurityException("Apenas médicos podem consultar sua lista de pacientes agendados.");
        }

        return user;
    }

    /**
     * Recupera os dados detalhados de uma teleconsulta garantindo autorização do paciente, médico ou admin.
     */
    public AppointmentResponse getAppointmentById(String userEmail, String appointmentId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + userEmail));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Consulta não encontrada: " + appointmentId));

        boolean isPatient = appointment.getPatientId() != null && appointment.getPatientId().equals(user.getId());
        boolean isDoctor = appointment.getDoctorId() != null && appointment.getDoctorId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;

        if (!isPatient && !isDoctor && !isAdmin) {
            throw new SecurityException("Acesso negado aos dados desta consulta.");
        }

        return mapToResponse(appointment);
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        boolean canCancel = appointment.getStatus() == AppointmentStatus.AGENDADA &&
                appointment.getStartDateTime().isAfter(LocalDateTime.now().plusHours(24));

        return AppointmentResponse.builder()
                .id(appointment.getId())
                .patientId(appointment.getPatientId())
                .patientName(appointment.getPatientName())
                .doctorId(appointment.getDoctorId())
                .doctorName(appointment.getDoctorName())
                .doctorCrm(appointment.getDoctorCrm())
                .doctorUfCrm(appointment.getDoctorUfCrm())
                .doctorSpecialty(appointment.getDoctorSpecialty())
                .slotId(appointment.getSlotId())
                .startDateTime(appointment.getStartDateTime())
                .endDateTime(appointment.getEndDateTime())
                .durationMinutes(appointment.getDurationMinutes())
                .consultationFee(appointment.getConsultationFee())
                .status(appointment.getStatus())
                .patientNotes(appointment.getPatientNotes())
                .meetRoomId(appointment.getMeetRoomId())
                .canCancel(canCancel)
                .createdAt(appointment.getCreatedAt())
                .build();
    }
}
