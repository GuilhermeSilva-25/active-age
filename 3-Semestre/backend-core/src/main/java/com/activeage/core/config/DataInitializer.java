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
                "ada.lovelace@activeage.com",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Ada_Lovelace_portrait.jpg/600px-Ada_Lovelace_portrait.jpg",
                "RQE 18420",
                "Pioneira da matemática e programação, especialista em avaliação cognitiva geriátrica e raciocínio analítico no envelhecimento saudável. Foco em longevidade ativa, preservação da memória e acolhimento humanizado da pessoa idosa.",
                Arrays.asList("Avaliação Geriátrica Ampla (AGA)", "Memória e Demências", "Longevidade Ativa", "Reabilitação Cognitiva"),
                BigDecimal.valueOf(380.00),
                50,
                "https://lattes.cnpq.br/18421852"
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
                "alan.turing@activeage.com",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Alan_Turing_az_1930-as_%C3%A9vekben.jpg/600px-Alan_Turing_az_1930-as_%C3%A9vekben.jpg",
                "RQE 19360",
                "Pai da computação teórica e criptoanálise. Atua com rigor e empatia no diagnóstico precoce de distúrbios neurocognitivos, proteção contra declínio funcional e readequação de polifarmácia no paciente idoso.",
                Arrays.asList("Memória e Demências", "Polifarmácia e Desprescrição", "Avaliação Geriátrica Ampla (AGA)", "Saúde Cardiovascular"),
                BigDecimal.valueOf(400.00),
                60,
                "https://lattes.cnpq.br/19361954"
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
                "grace.hopper@activeage.com",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Commodore_Grace_M._Hopper%2C_USN_%28covered%29.jpg/600px-Commodore_Grace_M._Hopper%2C_USN_%28covered%29.jpg",
                "RQE 19520",
                "Contra-almirante da Marinha e criadora do primeiro compilador da história. Dedicada à geriatria preventiva, fortalecimento musculoesquelético na terceira idade, prevenção de quedas e promoção da independência funcional de idosos longevos.",
                Arrays.asList("Prevenção de Quedas", "Osteoporose e Sarcopenia", "Longevidade Ativa", "Nutrição do Idoso"),
                BigDecimal.valueOf(350.00),
                45,
                "https://lattes.cnpq.br/19521992"
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
                "margaret.hamilton@activeage.com",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Margaret_Hamilton_-_restoration.jpg/600px-Margaret_Hamilton_-_restoration.jpg",
                "RQE 19690",
                "Diretora de Engenharia de Software da Missão Apollo 11. Especialista em gestão de cuidados complexos geriátricos, segurança do paciente idoso em polifarmácia, cuidados paliativos e transições seguras de cuidados.",
                Arrays.asList("Polifarmácia e Desprescrição", "Cuidados Paliativos", "Avaliação Geriátrica Ampla (AGA)", "Prevenção de Quedas"),
                BigDecimal.valueOf(360.00),
                50,
                "https://lattes.cnpq.br/19692026"
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
                "tim.bernerslee@activeage.com",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Sir_Tim_Berners-Lee_%28cropped%29.jpg/600px-Sir_Tim_Berners-Lee_%28cropped%29.jpg",
                "RQE 19890",
                "Inventor da World Wide Web e defensor do acesso universal. Atua na geriatria comunitária, telemedicina preventiva, envelhecimento ativo e integração harmoniosa entre saúde, apoio familiar e bem-estar do idoso.",
                Arrays.asList("Longevidade Ativa", "Saúde Cardiovascular", "Avaliação Geriátrica Ampla (AGA)", "Reabilitação Cognitiva"),
                BigDecimal.valueOf(350.00),
                50,
                "https://lattes.cnpq.br/19892026"
        );
    }

    /**
     * Persiste de forma idempotente um médico com status aprovado, dados financeiros e perfil com foto.
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
            String pixKey,
            String avatarUrl,
            String rqe,
            String bio,
            java.util.List<String> clinicalFocus,
            BigDecimal consultationFee,
            Integer consultationDurationMinutes,
            String lattesUrl
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

            // Perfil Profissional, Foto e Atendimento (RF014 / UC18)
            doctor.setAvatarUrl(avatarUrl);
            doctor.setRqe(rqe);
            doctor.setBio(bio);
            doctor.setClinicalFocus(clinicalFocus);
            doctor.setConsultationFee(consultationFee);
            doctor.setConsultationDurationMinutes(consultationDurationMinutes);
            doctor.setLattesUrl(lattesUrl);

            userRepository.save(doctor);
            logger.info(">>> [SEED] Médico pioneiro homologado com sucesso: {} (CRM {}/{})", fullName, crm, ufCrm);
        } else {
            userRepository.findByEmail(email).ifPresent(doc -> {
                doc.setAvatarUrl(avatarUrl);
                doc.setRqe(rqe);
                doc.setBio(bio);
                doc.setClinicalFocus(clinicalFocus);
                doc.setConsultationFee(consultationFee);
                doc.setConsultationDurationMinutes(consultationDurationMinutes);
                doc.setLattesUrl(lattesUrl);
                userRepository.save(doc);
                logger.info(">>> [SEED] Perfil e foto atualizados para médico pioneiro: {}", email);
            });
            logger.info(">>> [SEED] Médico já existente verificado: {}", email);
        }
    }
}
