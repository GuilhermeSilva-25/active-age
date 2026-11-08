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
 * 1. O médico de teste sempre possua horários livres para agendamento (hoje e amanhã),
 *    cobrindo do turno matutino ao noturno (08:00 às 22:00).
 * 2. O médico de teste e o paciente de teste sempre tenham consultas ativas agendadas
 *    para o DIA ATUAL (HOJE) e para o DIA SEGUINTE (AMANHÃ), viabilizando o teste imediato
 *    da sala virtual de teleconsulta.
 * 3. O paciente de teste possua exames prévios no cofre digital GridFS para consulta médica.
 */
@Service
public class DoctorScheduleAutomationService {

    private static final Logger logger = LoggerFactory.getLogger(DoctorScheduleAutomationService.class);

    public static final String TEST_DOCTOR_EMAIL = "medico@teste.com";
    public static final String TEST_PATIENT_EMAIL = "paciente@teste.com";
    public static final String TEST_PATIENT_AVATAR_URL = "https://upload.wikimedia.org/wikipedia/commons/8/81/Smiling_senior_woman_with_curly_hair_portrait.jpg";

    // Grade ampla matutina, vespertina e noturna para testes a qualquer hora do dia
    private static final int[] APPOINTMENT_HOURS = {8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22};
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
     * o dia atual e o seguinte sempre contenham horários livres e consultas agendadas para testes.
     */
    @Scheduled(cron = "0 0 * * * *")
    public void runContinuousScheduleSync() {
        logger.info(">>> [AUTOMAÇÃO] Sincronizando grade e consultas de hoje e amanhã para o médico de teste...");
        ensureTestDoctorSchedule();
    }

    /**
     * Garante a existência de slots livres e consultas ativas agendadas para hoje e amanhã.
     */
    public void ensureTestDoctorSchedule() {
        Optional<User> doctorOpt = userRepository.findByEmail(TEST_DOCTOR_EMAIL);
        if (doctorOpt.isEmpty()) {
            logger.warn(">>> [AUTOMAÇÃO] Médico de teste ({}) não encontrado para geração de grade.", TEST_DOCTOR_EMAIL);
            return;
        }

        User doctor = doctorOpt.get();
        if (doctor.getFullName() != null && doctor.getFullName().contains("(Médico Teste)")) {
            doctor.setFullName("Dr. Marcos Silveira");
            doctor = userRepository.save(doctor);
            logger.info(">>> [AUTOMAÇÃO] Nome do médico de teste atualizado para 'Dr. Marcos Silveira'.");
        }
        String doctorId = doctor.getId();

        // 1. Garante a existência do paciente de teste
        User testPatient = ensureTestPatient();

        // 2. Garante exames prévios no cofre de saúde do paciente de teste
        ensureTestPatientExams(testPatient);

        // 3. Gera slots livres para o dia atual (offset 0) e próximo dia (offset 1)
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

        // 4. Garante consulta ativa AGENDADA para o DIA DE HOJE
        ensureTodayActiveAppointment(doctor, testPatient);

        // 5. Garante consulta ativa AGENDADA para o DIA SEGUINTE (AMANHÃ)
        ensureTomorrowActiveAppointment(doctor, testPatient);

        // 6. Higieniza horários livres que já ficaram no passado anterior ao início do dia atual
        purgeExpiredFreeSlots(doctorId);

        logger.info(">>> [AUTOMAÇÃO] Grade e teleconsultas do médico de teste atualizadas. {} novos slots livres criados.", createdCount);
    }

    /**
     * Assegura que haja uma consulta confirmada (Appointment) no DIA ATUAL entre o médico e o paciente de teste.
     * Se a consulta existente já tiver ficado no passado em relação à hora atual,
     * readequamos o horário para um momento futuro no dia de hoje,
     * garantindo que continue visível em "Próxima Consulta" no Dashboard do Paciente e do Médico.
     */
    private void ensureTodayActiveAppointment(User doctor, User patient) {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().atTime(23, 59, 59);

        // SPEC-13: Se já existe consulta REALIZADA hoje com o paciente de teste, respeita o término do atendimento
        boolean hasCompletedToday = appointmentRepository.findByDoctorIdAndStatusAndStartDateTimeBetweenOrderByStartDateTimeAsc(
                doctor.getId(), AppointmentStatus.REALIZADA, startOfToday, endOfToday
        ).stream().anyMatch(a -> a.getPatientId() != null && a.getPatientId().equals(patient.getId()));

        if (hasCompletedToday) {
            logger.info(">>> [AUTOMAÇÃO] Consulta de hoje com paciente {} já foi REALIZADA e finalizada. Nenhuma consulta adicional será gerada hoje.", patient.getFullName());
            return;
        }

        List<Appointment> todayAppointments = appointmentRepository.findByDoctorIdAndStatusAndStartDateTimeBetweenOrderByStartDateTimeAsc(
                doctor.getId(), AppointmentStatus.AGENDADA, startOfToday, endOfToday
        );

        // Define um horário estratégico para hoje: sempre futuro se possível
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime targetTime;
        LocalTime nowTime = now.toLocalTime();
        if (nowTime.isBefore(LocalTime.of(14, 0))) {
            targetTime = LocalDateTime.of(now.toLocalDate(), LocalTime.of(14, 0));
        } else if (nowTime.getHour() < 23) {
            targetTime = LocalDateTime.of(now.toLocalDate(), LocalTime.of(nowTime.getHour() + 1, 0));
        } else {
            // Se já são 23h, agenda para alguns minutos no futuro para manter a consulta válida no dia atual
            int targetMinute = Math.min(nowTime.getMinute() + 5, 59);
            targetTime = LocalDateTime.of(now.toLocalDate(), LocalTime.of(23, targetMinute));
            if (!targetTime.isAfter(now)) {
                targetTime = now.plusMinutes(2).withSecond(0).withNano(0);
            }
        }

        if (todayAppointments.isEmpty()) {
            logger.info(">>> [AUTOMAÇÃO] Nenhuma consulta encontrada para o médico de teste no dia atual. Criando atendimento para testes...");
            createAppointmentForSlot(doctor, patient, targetTime, "Teleconsulta Geriátrica do Dia (Hoje)");
        } else {
            // Se já existe consulta hoje, verifica se ela ficou no passado
            Appointment existing = todayAppointments.get(0);
            boolean updated = false;

            // SPEC-11I: Limpa sintomas pré-informados para que a queixa seja relatada apenas na teleconsulta
            if (existing.getPatientNotes() != null) {
                existing.setPatientNotes(null);
                updated = true;
            }

            if (existing.getStartDateTime().isBefore(LocalDateTime.now())) {
                logger.info(">>> [AUTOMAÇÃO] Consulta de hoje ({}) já estava no passado. Readequando para {} para testes imediatos...",
                        existing.getStartDateTime(), targetTime);

                existing.setStartDateTime(targetTime);
                existing.setEndDateTime(targetTime.plusMinutes(DURATION_MINUTES));
                updated = true;

                // Sincroniza o slot correspondente
                final LocalDateTime scheduledTime = targetTime;
                if (existing.getSlotId() != null) {
                    doctorScheduleSlotRepository.findById(existing.getSlotId()).ifPresent(slot -> {
                        slot.setStartDateTime(scheduledTime);
                        slot.setEndDateTime(scheduledTime.plusMinutes(DURATION_MINUTES));
                        slot.setStatus(SlotStatus.OCUPADO);
                        slot.setUpdatedAt(LocalDateTime.now());
                        doctorScheduleSlotRepository.save(slot);
                    });
                }
            } else {
                logger.info(">>> [AUTOMAÇÃO] Médico de teste já possui {} consulta(s) agendada(s) válida(s) para o dia atual.", todayAppointments.size());
            }

            if (updated) {
                existing.setUpdatedAt(LocalDateTime.now());
                appointmentRepository.save(existing);
            }
        }
    }

    /**
     * Assegura que haja uma consulta confirmada (Appointment) para o DIA SEGUINTE (AMANHÃ)
     * entre o médico e o paciente de teste.
     */
    private void ensureTomorrowActiveAppointment(User doctor, User patient) {
        LocalDate tomorrowDate = LocalDate.now().plusDays(1);
        LocalDateTime startOfTomorrow = tomorrowDate.atStartOfDay();
        LocalDateTime endOfTomorrow = tomorrowDate.atTime(23, 59, 59);

        List<Appointment> tomorrowAppointments = appointmentRepository.findByDoctorIdAndStatusAndStartDateTimeBetweenOrderByStartDateTimeAsc(
                doctor.getId(), AppointmentStatus.AGENDADA, startOfTomorrow, endOfTomorrow
        );

        if (tomorrowAppointments.isEmpty()) {
            logger.info(">>> [AUTOMAÇÃO] Nenhuma consulta encontrada para o médico de teste para o dia seguinte. Criando atendimento para testes...");
            LocalDateTime targetTime = LocalDateTime.of(tomorrowDate, LocalTime.of(14, 0));
            createAppointmentForSlot(doctor, patient, targetTime, "Teleconsulta Geriátrica do Dia Seguinte (Amanhã)");
        } else {
            // SPEC-11I: Limpa sintomas pré-informados se existirem
            Appointment existing = tomorrowAppointments.get(0);
            if (existing.getPatientNotes() != null) {
                existing.setPatientNotes(null);
                existing.setUpdatedAt(LocalDateTime.now());
                appointmentRepository.save(existing);
            }
            logger.info(">>> [AUTOMAÇÃO] Médico de teste já possui {} consulta(s) agendada(s) para o dia seguinte.", tomorrowAppointments.size());
        }
    }

    /**
     * Cria atomicamente um slot com status OCUPADO e a consulta correspondente com status AGENDADA.
     */
    private Appointment createAppointmentForSlot(User doctor, User patient, LocalDateTime targetTime, String notes) {
        DoctorScheduleSlot slot = doctorScheduleSlotRepository.findByDoctorIdAndStartDateTime(doctor.getId(), targetTime)
                .orElseGet(() -> DoctorScheduleSlot.builder()
                        .doctorId(doctor.getId())
                        .startDateTime(targetTime)
                        .endDateTime(targetTime.plusMinutes(DURATION_MINUTES))
                        .durationMinutes(DURATION_MINUTES)
                        .status(SlotStatus.OCUPADO)
                        .notes(notes)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build()
                );

        slot.setStatus(SlotStatus.OCUPADO);
        slot.setPatientId(patient.getId());
        slot.setPatientName(patient.getFullName());
        slot.setUpdatedAt(LocalDateTime.now());
        DoctorScheduleSlot savedSlot = doctorScheduleSlotRepository.save(slot);
        String slotId = (savedSlot != null && savedSlot.getId() != null)
                ? savedSlot.getId()
                : (slot.getId() != null ? slot.getId() : "slot-" + UUID.randomUUID());

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
                .patientNotes(null) // SPEC-11I: Anamnese e sintomas pertencem exclusivamente à teleconsulta
                .meetRoomId("room-" + slotId)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Appointment savedAppt = appointmentRepository.save(appt);

        // Vincula o ID da consulta no slot
        slot.setAppointmentId(savedAppt.getId());
        doctorScheduleSlotRepository.save(slot);

        logger.info(">>> [AUTOMAÇÃO] Consulta agendada gerada com sucesso! ID: {} às {}", savedAppt.getId(), savedAppt.getStartDateTime());
        return savedAppt;
    }

    /**
     * Semeia o paciente de teste padrão se ainda não existir, ou atualiza a foto de perfil se estiver ausente.
     */
    private User ensureTestPatient() {
        Optional<User> patientOpt = userRepository.findByEmail(TEST_PATIENT_EMAIL);
        if (patientOpt.isPresent()) {
            User p = patientOpt.get();
            boolean updated = false;

            if (p.getFullName() != null && (p.getFullName().contains("Dona") || p.getFullName().contains("Paciente Teste"))) {
                p.setFullName("Maria de Lourdes Silva");
                updated = true;
            }

            if (p.getAvatarUrl() == null || p.getAvatarUrl().isBlank() || p.getAvatarUrl().contains("1581579438747")) {
                p.setAvatarUrl(TEST_PATIENT_AVATAR_URL);
                updated = true;
            }

            if (updated) {
                userRepository.save(p);
                logger.info(">>> [AUTOMAÇÃO] Paciente de teste atualizada com sucesso: {}", p.getFullName());
            }
            return p;
        }

        User p = new User();
        p.setFullName("Maria de Lourdes Silva");
        p.setEmail(TEST_PATIENT_EMAIL);
        p.setPassword(passwordEncoder.encode("123456"));
        p.setCpf("123.456.789-00");
        p.setPhone("(11) 98765-4321");
        p.setBirthDate("1948-03-12");
        p.setRole(Role.ROLE_PACIENTE);
        p.setTermsAccepted(true);
        p.setActive(true);
        p.setAvatarUrl(TEST_PATIENT_AVATAR_URL);
        p.setCreatedAt(LocalDateTime.now());

        User saved = userRepository.save(p);
        logger.info(">>> [AUTOMAÇÃO] Paciente de teste criado com sucesso com foto de perfil: {} (Senha: 123456)", TEST_PATIENT_EMAIL);
        return saved;
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
