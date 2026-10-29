package com.activeage.core.services;

import com.activeage.core.domain.enums.AppointmentStatus;
import com.activeage.core.domain.enums.ExamCategory;
import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.enums.SlotStatus;
import com.activeage.core.domain.models.Appointment;
import com.activeage.core.domain.models.DoctorScheduleSlot;
import com.activeage.core.domain.models.PatientExam;
import com.activeage.core.domain.models.User;
import com.activeage.core.repositories.AppointmentRepository;
import com.activeage.core.repositories.DoctorScheduleSlotRepository;
import com.activeage.core.repositories.PatientExamRepository;
import com.activeage.core.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Serviço de automação para manutenção contínua da grade de horários e teleconsultas
 * do médico de teste (medico@teste.com) e do paciente de teste (paciente@teste.com).
 * 
 * Garante que:
 * 1. O médico de teste sempre possua horários livres para agendamento (hoje e amanhã).
 * 2. O médico de teste e o paciente de teste sempre tenham pelo menos uma consulta ativa agendada
 *    para o DIA ATUAL (HOJE), viabilizando o teste imediato da sala virtual de teleconsulta.
 * 3. O paciente de teste possua exames prévios no cofre digital GridFS para consulta médica.
 */
@Service
public class DoctorScheduleAutomationService {

    private static final Logger logger = LoggerFactory.getLogger(DoctorScheduleAutomationService.class);

    public static final String TEST_DOCTOR_EMAIL = "medico@teste.com";
    public static final String TEST_PATIENT_EMAIL = "paciente@teste.com";

    private static final int[] APPOINTMENT_HOURS = {9, 10, 11, 14, 15, 16, 17};
    private static final int DURATION_MINUTES = 50;

    private final UserRepository userRepository;
    private final DoctorScheduleSlotRepository doctorScheduleSlotRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientExamRepository patientExamRepository;
    private final GridFsTemplate gridFsTemplate;
    private final PasswordEncoder passwordEncoder;

    public DoctorScheduleAutomationService(
            UserRepository userRepository,
            DoctorScheduleSlotRepository doctorScheduleSlotRepository,
            AppointmentRepository appointmentRepository,
            PatientExamRepository patientExamRepository,
            GridFsTemplate gridFsTemplate,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.doctorScheduleSlotRepository = doctorScheduleSlotRepository;
        this.appointmentRepository = appointmentRepository;
        this.patientExamRepository = patientExamRepository;
        this.gridFsTemplate = gridFsTemplate;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Executa a cada hora para garantir que, independentemente da virada de dia ou fuso horário,
     * o dia atual sempre contenha horários livres e uma consulta agendada para testes.
     */
    @Scheduled(cron = "0 0 * * * *")
    public void runContinuousScheduleSync() {
        logger.info(">>> [AUTOMAÇÃO] Sincronizando grade e consultas do dia atual para o médico de teste...");
        ensureTestDoctorSchedule();
    }

    /**
     * Garante a existência de slots livres e de uma consulta ativa agendada para o dia atual.
     */
    public void ensureTestDoctorSchedule() {
        Optional<User> doctorOpt = userRepository.findByEmail(TEST_DOCTOR_EMAIL);
        if (doctorOpt.isEmpty()) {
            logger.warn(">>> [AUTOMAÇÃO] Médico de teste ({}) não encontrado para geração de grade.", TEST_DOCTOR_EMAIL);
            return;
        }

        User doctor = doctorOpt.get();
        String doctorId = doctor.getId();

        // 1. Garante a existência do paciente de teste
        User testPatient = ensureTestPatient();

        // 2. Garante exames prévios no cofre de saúde do paciente de teste
        ensureTestPatientExams(testPatient);

        // 3. Gera slots para o dia atual (offset 0) e próximo dia (offset 1)
        int createdCount = 0;
        for (int dayOffset = 0; dayOffset <= 1; dayOffset++) {
            LocalDate targetDate = LocalDate.now().plusDays(dayOffset);

            for (int hour : APPOINTMENT_HOURS) {
                LocalDateTime startDateTime = LocalDateTime.of(targetDate, LocalTime.of(hour, 0));
                LocalDateTime endDateTime = startDateTime.plusMinutes(DURATION_MINUTES);

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

        // 4. Garante que exista pelo menos uma consulta ativa AGENDADA para o DIA DE HOJE
        ensureTodayActiveAppointment(doctor, testPatient);

        // 5. Higieniza horários livres que já ficaram no passado
        purgeExpiredFreeSlots(doctorId);

        logger.info(">>> [AUTOMAÇÃO] Grade e teleconsultas do médico de teste atualizadas. {} novos slots livres criados.", createdCount);
    }

    /**
     * Assegura que haja uma consulta confirmada (Appointment) para o dia atual entre o médico e o paciente de teste.
     */
    private void ensureTodayActiveAppointment(User doctor, User patient) {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().atTime(23, 59, 59);

        List<Appointment> todayAppointments = appointmentRepository.findByDoctorIdAndStatusAndStartDateTimeBetweenOrderByStartDateTimeAsc(
                doctor.getId(), AppointmentStatus.AGENDADA, startOfToday, endOfToday
        );

        if (todayAppointments.isEmpty()) {
            logger.info(">>> [AUTOMAÇÃO] Nenhuma consulta encontrada para o médico de teste no dia atual. Criando atendimento para testes...");

            // Seleciona um horário para hoje (preferencialmente 14:00 ou o primeiro slot livre de hoje)
            LocalDateTime targetTime = LocalDateTime.of(LocalDate.now(), LocalTime.of(14, 0));

            DoctorScheduleSlot slot = doctorScheduleSlotRepository.findByDoctorIdAndStartDateTime(doctor.getId(), targetTime)
                    .orElseGet(() -> DoctorScheduleSlot.builder()
                            .doctorId(doctor.getId())
                            .startDateTime(targetTime)
                            .endDateTime(targetTime.plusMinutes(DURATION_MINUTES))
                            .durationMinutes(DURATION_MINUTES)
                            .status(SlotStatus.OCUPADO)
                            .notes("Teleconsulta Geriátrica do Dia")
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build()
                    );

            slot.setStatus(SlotStatus.OCUPADO);
            slot.setUpdatedAt(LocalDateTime.now());
            DoctorScheduleSlot savedSlot = doctorScheduleSlotRepository.save(slot);
            String slotId = (savedSlot != null && savedSlot.getId() != null) ? savedSlot.getId() : (slot.getId() != null ? slot.getId() : "slot-" + UUID.randomUUID());

            Appointment appt = Appointment.builder()
                    .doctorId(doctor.getId())
                    .doctorName(doctor.getFullName())
                    .doctorCrm(doctor.getCrm())
                    .doctorUfCrm(doctor.getUfCrm())
                    .doctorSpecialty("Geriatria e Gerontologia")
                    .patientId(patient.getId())
                    .patientName(patient.getFullName())
                    .patientEmail(patient.getEmail())
                    .patientPhone(patient.getPhone())
                    .slotId(slotId)
                    .startDateTime(slot.getStartDateTime())
                    .endDateTime(slot.getEndDateTime())
                    .durationMinutes(DURATION_MINUTES)
                    .consultationFee(BigDecimal.valueOf(250.00))
                    .status(AppointmentStatus.AGENDADA)
                    .patientNotes("Paciente relata tonturas matinais e perda de apetite leve nas últimas duas semanas. Acompanhada pelo filho cuidador.")
                    .meetRoomId("room-" + slotId)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            appointmentRepository.save(appt);
            logger.info(">>> [AUTOMAÇÃO] Consulta para o dia atual gerada com sucesso! ID: {} às {}", appt.getId(), appt.getStartDateTime());
        } else {
            logger.info(">>> [AUTOMAÇÃO] Médico de teste já possui {} consulta(s) agendada(s) para o dia atual.", todayAppointments.size());
        }
    }

    /**
     * Semeia o paciente de teste padrão se ainda não existir.
     */
    private User ensureTestPatient() {
        return userRepository.findByEmail(TEST_PATIENT_EMAIL).orElseGet(() -> {
            User p = new User();
            p.setFullName("Dona Maria de Lourdes Silva (Paciente Teste)");
            p.setEmail(TEST_PATIENT_EMAIL);
            p.setPassword(passwordEncoder.encode("123456"));
            p.setCpf("123.456.789-00");
            p.setPhone("(11) 98765-4321");
            p.setBirthDate("1948-03-12");
            p.setRole(Role.ROLE_PACIENTE);
            p.setTermsAccepted(true);
            p.setActive(true);
            p.setCreatedAt(LocalDateTime.now());

            User saved = userRepository.save(p);
            logger.info(">>> [AUTOMAÇÃO] Paciente de teste criado com sucesso: {} (Senha: 123456)", TEST_PATIENT_EMAIL);
            return saved;
        });
    }

    /**
     * Semeia exames prévios para o paciente de teste poder ser avaliado na sala virtual.
     */
    private void ensureTestPatientExams(User patient) {
        if (patientExamRepository.countByPatientId(patient.getId()) == 0) {
            try {
                // 1. Exame Laboratorial
                String fileName1 = "exam_hemograma_" + UUID.randomUUID() + ".pdf";
                byte[] content1 = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000056 00000 n \n0000000113 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n185\n%%EOF".getBytes(StandardCharsets.UTF_8);
                gridFsTemplate.store(new ByteArrayInputStream(content1), fileName1, "application/pdf");

                PatientExam exam1 = PatientExam.builder()
                        .patientId(patient.getId())
                        .title("Hemograma Completo e Perfil Lipídico")
                        .category(ExamCategory.LABORATORIAL)
                        .examDate(LocalDate.now().minusDays(5))
                        .notes("Exame de rotina realizado em jejum de 12 horas. Glicemia e colesterol controlados.")
                        .storedFileName(fileName1)
                        .originalFileName("hemograma_completo_maria_silva.pdf")
                        .contentType("application/pdf")
                        .sizeBytes(content1.length)
                        .uploadedAt(LocalDateTime.now().minusDays(5))
                        .build();

                patientExamRepository.save(exam1);

                // 2. Exame Cardiológico
                String fileName2 = "exam_ecg_" + UUID.randomUUID() + ".pdf";
                byte[] content2 = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000056 00000 n \n0000000113 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n185\n%%EOF".getBytes(StandardCharsets.UTF_8);
                gridFsTemplate.store(new ByteArrayInputStream(content2), fileName2, "application/pdf");

                PatientExam exam2 = PatientExam.builder()
                        .patientId(patient.getId())
                        .title("Eletrocardiograma de Repouso (ECG)")
                        .category(ExamCategory.CARDIOLOGICO)
                        .examDate(LocalDate.now().minusDays(12))
                        .notes("Ritmo sinusal regular, sem alterações isquêmicas agudas.")
                        .storedFileName(fileName2)
                        .originalFileName("ecg_repouso_maria_silva.pdf")
                        .contentType("application/pdf")
                        .sizeBytes(content2.length)
                        .uploadedAt(LocalDateTime.now().minusDays(12))
                        .build();

                patientExamRepository.save(exam2);

                logger.info(">>> [AUTOMAÇÃO] 2 exames prévios semeados com sucesso no cofre de saúde do paciente de teste.");
            } catch (Exception ex) {
                logger.warn(">>> [AUTOMAÇÃO] Não foi possível semear exames de teste no GridFS: {}", ex.getMessage());
            }
        }
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
