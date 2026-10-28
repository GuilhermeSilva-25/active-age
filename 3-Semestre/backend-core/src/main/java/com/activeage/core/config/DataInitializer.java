package com.activeage.core.config;

import com.activeage.core.domain.enums.DoctorDossierStatus;
import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.models.DoctorFinancialInfo;
import com.activeage.core.domain.models.User;
import com.activeage.core.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;

/**
 * Inicializador de dados essenciais para o sistema Active Age.
 * Garante que exista ao menos uma conta administrativa inicial (ROLE_ADMIN)
 * e semeia médicos geriatras homologados homenageando os pioneiros da tecnologia
 * para viabilizar testes integrados e a vitrine de teleconsultas.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedAdminUser();
        seedPioneerDoctors();
    }

    /**
     * Semeia o usuário Administrador padrão para acesso ao Painel de Gestão.
     */
    private void seedAdminUser() {
        String adminEmail = "admin@activeage.com";

        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User();
            admin.setFullName("Administrador do Sistema");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("AdminPassword2026!"));
            admin.setCpf("000.000.000-00");
            admin.setPhone("(11) 99999-9999");
            admin.setBirthDate("1980-01-01");
            admin.setRole(Role.ROLE_ADMIN);
            admin.setTermsAccepted(true);
            admin.setActive(true);
            admin.setCreatedAt(LocalDateTime.now());

            userRepository.save(admin);
            logger.info(">>> [SEED] Usuário administrador padrão criado com sucesso: {}", adminEmail);
        } else {
            logger.info(">>> [SEED] Usuário administrador padrão já existente: {}", adminEmail);
        }
    }

    /**
     * Semeia médicos pioneiros já homologados em homenagem aos grandes nomes da tecnologia.
     * Facilita testes do consultório virtual e compõe a massa inicial para a vitrine de agendamentos.
     */
    private void seedPioneerDoctors() {
        String defaultDoctorPassword = "ActiveAge2026!";

        // 1. Dra. Ada Lovelace (Primeira programadora da história - 1842)
        seedApprovedDoctor(
                "Dra. Augusta Ada King-Noel (Ada Lovelace)",
                "ada.lovelace@activeage.com",
                defaultDoctorPassword,
                "184201",
                "SP",
                "111.222.333-44",
                "(11) 98142-1852",
                "1970-12-10",
                "341 - Itaú Unibanco S.A.",
                "1842",
                "18420-1",
                "ada.lovelace@activeage.com"
        );

        // 2. Dr. Alan Turing (Pai da computação moderna e criptografia - 1936)
        seedApprovedDoctor(
                "Dr. Alan Mathison Turing",
                "alan.turing@activeage.com",
                defaultDoctorPassword,
                "193602",
                "SP",
                "222.333.444-55",
                "(11) 91912-1954",
                "1968-06-23",
                "001 - Banco do Brasil S.A.",
                "1936",
                "19360-2",
                "alan.turing@activeage.com"
        );

        // 3. Dra. Grace Hopper (Criadora do primeiro compilador e pioneira do COBOL - 1952)
        seedApprovedDoctor(
                "Dra. Grace Brewster Murray Hopper",
                "grace.hopper@activeage.com",
                defaultDoctorPassword,
                "195203",
                "SP",
                "333.444.555-66",
                "(11) 91906-1992",
                "1966-12-09",
                "260 - Nu Pagamentos S.A. (Nubank)",
                "0001",
                "19520-3",
                "grace.hopper@activeage.com"
        );

        // 4. Dra. Margaret Hamilton (Diretora do software da missão Apollo 11 à Lua - 1969)
        seedApprovedDoctor(
                "Dra. Margaret Heafield Hamilton",
                "margaret.hamilton@activeage.com",
                defaultDoctorPassword,
                "196904",
                "SP",
                "444.555.666-77",
                "(11) 91936-2026",
                "1972-08-17",
                "077 - Banco Inter S.A.",
                "0077",
                "19690-4",
                "margaret.hamilton@activeage.com"
        );

        // 5. Dr. Tim Berners-Lee (Inventor da World Wide Web - 1989)
        seedApprovedDoctor(
                "Dr. Timothy John Berners-Lee",
                "tim.bernerslee@activeage.com",
                defaultDoctorPassword,
                "198905",
                "SP",
                "555.666.777-88",
                "(11) 91955-2026",
                "1974-06-08",
                "237 - Banco Bradesco S.A.",
                "1989",
                "19890-5",
                "tim.bernerslee@activeage.com"
        );
    }

    /**
     * Persiste de forma idempotente um médico com status aprovado e dados financeiros completos.
     */
    private void seedApprovedDoctor(
            String fullName,
            String email,
            String rawPassword,
            String crm,
            String ufCrm,
            String cpf,
            String phone,
            String birthDate,
            String bankName,
            String agency,
            String accountNumber,
            String pixKey
    ) {
        if (!userRepository.existsByEmail(email)) {
            User doctor = new User();
            doctor.setFullName(fullName);
            doctor.setEmail(email);
            doctor.setPassword(passwordEncoder.encode(rawPassword));
            doctor.setCpf(cpf);
            doctor.setPhone(phone);
            doctor.setBirthDate(birthDate);
            doctor.setRole(Role.ROLE_MEDICO);
            doctor.setCrm(crm);
            doctor.setUfCrm(ufCrm);
            doctor.setTermsAccepted(true);
            doctor.setActive(true);
            doctor.setCreatedAt(LocalDateTime.now().minusDays(15));

            // Dossiê homologado perante o CFM (Res. 2.314/2022)
            doctor.setDossierStatus(DoctorDossierStatus.APPROVED);
            doctor.setSubmittedAt(LocalDateTime.now().minusDays(12));
            doctor.setApprovedAt(LocalDateTime.now().minusDays(10));
            doctor.setTrialExpiresAt(LocalDateTime.now().plusDays(15));
            doctor.setDocuments(new HashMap<>());

            // Dados Bancários para Split Direto
            DoctorFinancialInfo financial = new DoctorFinancialInfo();
            financial.setBankName(bankName);
            financial.setAgency(agency);
            financial.setAccountNumber(accountNumber);
            financial.setAccountType("CORRENTE");
            financial.setPixKey(pixKey);
            financial.setPixKeyType("EMAIL");
            financial.setUpdatedAt(LocalDateTime.now().minusDays(10));
            doctor.setFinancialInfo(financial);

            // Perfil Profissional e Atendimento (RF014 / UC18)
            doctor.setRqe("RQE " + crm.substring(0, 4));
            doctor.setBio("Médico(a) especialista em Geriatria e Gerontologia, dedicado(a) ao cuidado integral da pessoa idosa, longevidade saudável e avaliação ampla.");
            doctor.setClinicalFocus(Arrays.asList("Avaliação Geriátrica Ampla (AGA)", "Memória e Demências", "Longevidade Ativa", "Prevenção de Quedas"));
            doctor.setConsultationFee(BigDecimal.valueOf(350.00));
            doctor.setConsultationDurationMinutes(50);
            doctor.setLattesUrl("https://lattes.cnpq.br");

            userRepository.save(doctor);
            logger.info(">>> [SEED] Médico pioneiro homologado com sucesso: {} (CRM {}/{})", fullName, crm, ufCrm);
        } else {
            userRepository.findByEmail(email).ifPresent(doc -> {
                if (doc.getRqe() == null || doc.getBio() == null) {
                    doc.setRqe("RQE " + crm.substring(0, 4));
                    doc.setBio("Médico(a) especialista em Geriatria e Gerontologia, dedicado(a) ao cuidado integral da pessoa idosa, longevidade saudável e avaliação ampla.");
                    doc.setClinicalFocus(Arrays.asList("Avaliação Geriátrica Ampla (AGA)", "Memória e Demências", "Longevidade Ativa", "Prevenção de Quedas"));
                    doc.setConsultationFee(BigDecimal.valueOf(350.00));
                    doc.setConsultationDurationMinutes(50);
                    doc.setLattesUrl("https://lattes.cnpq.br");
                    userRepository.save(doc);
                    logger.info(">>> [SEED] Perfil enriquecido para médico existente: {}", email);
                }
            });
            logger.info(">>> [SEED] Médico já existente: {}", email);
        }
    }
}
