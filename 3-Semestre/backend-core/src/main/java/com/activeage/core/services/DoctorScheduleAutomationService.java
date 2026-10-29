package com.activeage.core.services;

import com.activeage.core.domain.enums.SlotStatus;
import com.activeage.core.domain.models.DoctorScheduleSlot;
import com.activeage.core.domain.models.User;
import com.activeage.core.repositories.DoctorScheduleSlotRepository;
import com.activeage.core.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;

/**
 * Serviço de automação para manutenção contínua da grade de horários do médico de teste.
 * 
 * Garante que o médico de teste (medico@teste.com) possua horários de atendimento
 * livres para o dia atual e para o próximo dia, sem criar agendamentos infinitos
 * no banco de dados.
 */
@Service
public class DoctorScheduleAutomationService {

    private static final Logger logger = LoggerFactory.getLogger(DoctorScheduleAutomationService.class);

    public static final String TEST_DOCTOR_EMAIL = "medico@teste.com";
    private static final int[] APPOINTMENT_HOURS = {9, 10, 11, 14, 15, 16, 17};
    private static final int DURATION_MINUTES = 50;

    private final UserRepository userRepository;
    private final DoctorScheduleSlotRepository doctorScheduleSlotRepository;

    public DoctorScheduleAutomationService(
            UserRepository userRepository,
            DoctorScheduleSlotRepository doctorScheduleSlotRepository
    ) {
        this.userRepository = userRepository;
        this.doctorScheduleSlotRepository = doctorScheduleSlotRepository;
    }

    /**
     * Executa a cada 2 dias à 01:00 da manhã para atualizar a grade do dia atual e do próximo dia.
     */
    @Scheduled(cron = "0 0 1 */2 * *")
    public void runBiDailyScheduleSync() {
        logger.info(">>> [AUTOMAÇÃO] Iniciando sincronização bi-diária da agenda do médico de teste...");
        ensureTestDoctorSchedule();
    }

    /**
     * Garante a existência de horários livres para o dia atual e o próximo dia para o médico de teste.
     * Pode ser invocado tanto na inicialização da aplicação quanto na tarefa agendada.
     */
    public void ensureTestDoctorSchedule() {
        Optional<User> doctorOpt = userRepository.findByEmail(TEST_DOCTOR_EMAIL);
        if (doctorOpt.isEmpty()) {
            logger.warn(">>> [AUTOMAÇÃO] Médico de teste ({}) não encontrado para geração de grade.", TEST_DOCTOR_EMAIL);
            return;
        }

        User doctor = doctorOpt.get();
        String doctorId = doctor.getId();
        int createdCount = 0;

        // Gera para o dia atual (offset 0) e próximo dia (offset 1)
        for (int dayOffset = 0; dayOffset <= 1; dayOffset++) {
            LocalDate targetDate = LocalDate.now().plusDays(dayOffset);

            for (int hour : APPOINTMENT_HOURS) {
                LocalDateTime startDateTime = LocalDateTime.of(targetDate, LocalTime.of(hour, 0));
                LocalDateTime endDateTime = startDateTime.plusMinutes(DURATION_MINUTES);

                // Evita duplicação respeitando o índice único (doctorId + startDateTime)
                if (!doctorScheduleSlotRepository.existsByDoctorIdAndStartDateTime(doctorId, startDateTime)) {
                    DoctorScheduleSlot slot = DoctorScheduleSlot.builder()
                            .doctorId(doctorId)
                            .startDateTime(startDateTime)
                            .endDateTime(endDateTime)
                            .durationMinutes(DURATION_MINUTES)
                            .status(SlotStatus.LIVRE)
                            .notes("Atendimento Clínico Geriátrico")
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();

                    doctorScheduleSlotRepository.save(slot);
                    createdCount++;
                }
            }
        }

        // Higieniza horários livres que já ficaram no passado para não acumular registros mortos
        purgeExpiredFreeSlots(doctorId);

        logger.info(">>> [AUTOMAÇÃO] Grade do médico de teste atualizada com sucesso. {} novos horários livres inseridos.", createdCount);
    }

    /**
     * Remove slots com status LIVRE cuja data seja anterior ao início do dia atual.
     * Preserva slots OCUPADOS ou com histórico de consultas.
     */
    public void purgeExpiredFreeSlots(String doctorId) {
        try {
            LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
            doctorScheduleSlotRepository.deleteByDoctorIdAndStatusAndStartDateTimeBefore(
                    doctorId, SlotStatus.LIVRE, startOfToday
            );
            logger.info(">>> [AUTOMAÇÃO] Higienização de horários livres anteriores a {} concluída.", startOfToday);
        } catch (Exception ex) {
            logger.error(">>> [AUTOMAÇÃO] Erro ao higienizar slots livres expirados: {}", ex.getMessage());
        }
    }
}
