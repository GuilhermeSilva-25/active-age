package com.activeage.core.services;

import com.activeage.core.domain.enums.DoctorDossierStatus;
import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.enums.SlotStatus;
import com.activeage.core.domain.models.DoctorScheduleSlot;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.requests.CreateBatchSlotsRequest;
import com.activeage.core.dtos.requests.CreateSlotRequest;
import com.activeage.core.dtos.responses.DoctorScheduleSlotResponse;
import com.activeage.core.dtos.responses.DoctorScheduleSummaryResponse;
import com.activeage.core.repositories.DoctorScheduleSlotRepository;
import com.activeage.core.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Serviço responsável pela gestão de agenda e grade de horários dos médicos (UC10 / RF006, RF007).
 * Impõe conformidade com a Res. CFM nº 2.314/2022 (prevenção de double-booking e exigência de credenciamento).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DoctorScheduleService {

    private final DoctorScheduleSlotRepository scheduleSlotRepository;
    private final UserRepository userRepository;

    /**
     * Cria um slot avulso de horário para atendimento clínico.
     */
    public DoctorScheduleSlotResponse createSlot(String doctorEmail, CreateSlotRequest request) {
        User doctor = getAuthenticatedApprovedDoctor(doctorEmail);

        if (request.getStartDateTime() == null || !request.getStartDateTime().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("O horário deve ser agendado para uma data e hora futura.");
        }

        int duration = (request.getDurationMinutes() != null && request.getDurationMinutes() >= 15)
                ? request.getDurationMinutes()
                : 50;

        if (scheduleSlotRepository.existsByDoctorIdAndStartDateTime(doctor.getId(), request.getStartDateTime())) {
            throw new IllegalArgumentException("Você já possui um horário disponibilizado neste mesmo dia e horário.");
        }

        LocalDateTime endDateTime = request.getStartDateTime().plusMinutes(duration);

        DoctorScheduleSlot slot = DoctorScheduleSlot.builder()
                .doctorId(doctor.getId())
                .startDateTime(request.getStartDateTime())
                .endDateTime(endDateTime)
                .durationMinutes(duration)
                .status(SlotStatus.LIVRE)
                .notes(request.getNotes())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        DoctorScheduleSlot saved = scheduleSlotRepository.save(slot);
        log.info("Novo slot criado pelo médico {} para {}", doctor.getEmail(), saved.getStartDateTime());
        return mapToResponse(saved);
    }

    /**
     * Gera uma grade completa de slots em lote para um turno de atendimento.
     */
    public List<DoctorScheduleSlotResponse> createBatchSlots(String doctorEmail, CreateBatchSlotsRequest request) {
        User doctor = getAuthenticatedApprovedDoctor(doctorEmail);

        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
            throw new IllegalArgumentException("O horário de início do turno deve ser anterior ao horário de término.");
        }

        int duration = (request.getDurationMinutes() != null && request.getDurationMinutes() >= 15)
                ? request.getDurationMinutes()
                : 50;
        int pause = (request.getBreakMinutes() != null && request.getBreakMinutes() >= 0)
                ? request.getBreakMinutes()
                : 10;

        List<DoctorScheduleSlot> newSlots = new ArrayList<>();
        LocalDateTime currentStart = request.getDate().atTime(request.getStartTime());
        LocalDateTime shiftEnd = request.getDate().atTime(request.getEndTime());

        while (!currentStart.plusMinutes(duration).isAfter(shiftEnd)) {
            LocalDateTime currentEnd = currentStart.plusMinutes(duration);

            // Apenas adiciona slots no futuro e que não conflitem com slots existentes
            if (currentStart.isAfter(LocalDateTime.now()) &&
                    !scheduleSlotRepository.existsByDoctorIdAndStartDateTime(doctor.getId(), currentStart)) {

                DoctorScheduleSlot slot = DoctorScheduleSlot.builder()
                        .doctorId(doctor.getId())
                        .startDateTime(currentStart)
                        .endDateTime(currentEnd)
                        .durationMinutes(duration)
                        .status(SlotStatus.LIVRE)
                        .notes(request.getNotes())
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();

                newSlots.add(slot);
            }

            currentStart = currentEnd.plusMinutes(pause);
        }

        if (newSlots.isEmpty()) {
            throw new IllegalArgumentException("Nenhum novo horário válido pôde ser gerado para o período informado (verifique se os horários já existem ou estão no passado).");
        }

        List<DoctorScheduleSlot> savedList = scheduleSlotRepository.saveAll(newSlots);
        log.info("Turno gerado com sucesso para médico {}: {} novos slots criados para o dia {}",
                doctor.getEmail(), savedList.size(), request.getDate());

        return savedList.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /**
     * Lista os slots de horário do médico autenticado, filtrando opcionalmente por janela temporal.
     */
    public List<DoctorScheduleSlotResponse> listDoctorSlots(String doctorEmail, LocalDateTime start, LocalDateTime end) {
        User doctor = getAuthenticatedDoctor(doctorEmail);

        List<DoctorScheduleSlot> slots;
        if (start != null && end != null) {
            slots = scheduleSlotRepository.findByDoctorIdAndStartDateTimeBetweenOrderByStartDateTimeAsc(
                    doctor.getId(), start, end
            );
        } else {
            LocalDateTime from = (start != null) ? start : LocalDateTime.now().toLocalDate().atStartOfDay();
            slots = scheduleSlotRepository.findByDoctorIdAndStartDateTimeGreaterThanEqualOrderByStartDateTimeAsc(
                    doctor.getId(), from
            );
        }

        return slots.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /**
     * Remove um slot de horário da agenda do médico.
     * Regra de Negócio: Proibido excluir slots que já possuem status OCUPADO (consulta agendada).
     */
    public void deleteSlot(String doctorEmail, String slotId) {
        User doctor = getAuthenticatedDoctor(doctorEmail);

        DoctorScheduleSlot slot = scheduleSlotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Horário não encontrado."));

        if (!slot.getDoctorId().equals(doctor.getId())) {
            throw new SecurityException("Você não tem permissão para excluir um horário de outro médico.");
        }

        if (slot.getStatus() == SlotStatus.OCUPADO) {
            throw new IllegalStateException("Horários com consultas agendadas não podem ser excluídos diretamente. Utilize a opção de cancelamento de consulta.");
        }

        scheduleSlotRepository.delete(slot);
        log.info("Slot {} excluído pelo médico {}", slotId, doctor.getEmail());
    }

    /**
     * Alterna o status do slot entre LIVRE e BLOQUEADO.
     */
    public DoctorScheduleSlotResponse toggleBlockSlot(String doctorEmail, String slotId) {
        User doctor = getAuthenticatedDoctor(doctorEmail);

        DoctorScheduleSlot slot = scheduleSlotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Horário não encontrado."));

        if (!slot.getDoctorId().equals(doctor.getId())) {
            throw new SecurityException("Você não tem permissão para alterar o horário de outro médico.");
        }

        if (slot.getStatus() == SlotStatus.OCUPADO) {
            throw new IllegalStateException("Não é possível bloquear um horário que já possui consulta agendada.");
        }

        slot.setStatus(slot.getStatus() == SlotStatus.LIVRE ? SlotStatus.BLOQUEADO : SlotStatus.LIVRE);
        slot.setUpdatedAt(LocalDateTime.now());

        DoctorScheduleSlot updated = scheduleSlotRepository.save(slot);
        log.info("Status do slot {} alterado para {} pelo médico {}", slotId, updated.getStatus(), doctor.getEmail());
        return mapToResponse(updated);
    }

    /**
     * Retorna o resumo das métricas de agenda do médico.
     */
    public DoctorScheduleSummaryResponse getDoctorScheduleSummary(String doctorEmail) {
        User doctor = getAuthenticatedDoctor(doctorEmail);

        long total = scheduleSlotRepository.countByDoctorId(doctor.getId());
        long free = scheduleSlotRepository.countByDoctorIdAndStatus(doctor.getId(), SlotStatus.LIVRE);
        long booked = scheduleSlotRepository.countByDoctorIdAndStatus(doctor.getId(), SlotStatus.OCUPADO);
        long blocked = scheduleSlotRepository.countByDoctorIdAndStatus(doctor.getId(), SlotStatus.BLOQUEADO);

        double occupancyRate = (total > 0) ? ((double) booked / total) * 100.0 : 0.0;

        return DoctorScheduleSummaryResponse.builder()
                .totalSlots(total)
                .totalFreeSlots(free)
                .totalBookedSlots(booked)
                .totalBlockedSlots(blocked)
                .occupancyRatePercentage(Math.round(occupancyRate * 10.0) / 10.0)
                .build();
    }

    /**
     * Retorna a disponibilidade pública de um médico para exibição na vitrine do paciente (UC08 / UC09).
     */
    public List<DoctorScheduleSlotResponse> listPublicAvailability(String doctorId) {
        List<DoctorScheduleSlot> freeSlots = scheduleSlotRepository
                .findByDoctorIdAndStatusAndStartDateTimeGreaterThanEqualOrderByStartDateTimeAsc(
                        doctorId, SlotStatus.LIVRE, LocalDateTime.now()
                );

        return freeSlots.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // --- Métodos Auxiliares ---

    private User getAuthenticatedApprovedDoctor(String email) {
        User doctor = getAuthenticatedDoctor(email);

        if (doctor.getDossierStatus() != DoctorDossierStatus.APPROVED) {
            throw new SecurityException("Seu consultório virtual só pode ser ativado após a homologação do Dossiê pelo CFM.");
        }

        return doctor;
    }

    private User getAuthenticatedDoctor(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        if (user.getRole() != Role.ROLE_MEDICO) {
            throw new SecurityException("Apenas médicos podem gerenciar sua agenda de atendimentos.");
        }

        return user;
    }

    private DoctorScheduleSlotResponse mapToResponse(DoctorScheduleSlot slot) {
        return DoctorScheduleSlotResponse.builder()
                .id(slot.getId())
                .doctorId(slot.getDoctorId())
                .startDateTime(slot.getStartDateTime())
                .endDateTime(slot.getEndDateTime())
                .durationMinutes(slot.getDurationMinutes())
                .status(slot.getStatus())
                .appointmentId(slot.getAppointmentId())
                .patientId(slot.getPatientId())
                .patientName(slot.getPatientName())
                .notes(slot.getNotes())
                .build();
    }
}
