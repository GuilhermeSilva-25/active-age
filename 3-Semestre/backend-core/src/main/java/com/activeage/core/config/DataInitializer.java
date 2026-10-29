package com.activeage.core.config;

import com.activeage.core.domain.enums.DoctorDossierStatus;
import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.models.DoctorFinancialInfo;
import com.activeage.core.domain.models.User;
import com.activeage.core.repositories.UserRepository;
import com.activeage.core.services.DoctorScheduleAutomationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

/**
 * Inicializador de dados essenciais para o sistema Active Age.
 * Garante que exista ao menos uma conta administrativa inicial (ROLE_ADMIN),
 * o médico de teste (medico@teste.com / 123456) com horários dinâmicos atualizados,
 * e semeia médicos geriatras homologados homenageando os pioneiros da tecnologia
 * para compor uma vitrine rica e representativa no dia da apresentação.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DoctorScheduleAutomationService doctorScheduleAutomationService;

    public DataInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            DoctorScheduleAutomationService doctorScheduleAutomationService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.doctorScheduleAutomationService = doctorScheduleAutomationService;
    }

    @Override
    public void run(String... args) {
        seedAdminUser();
        seedTestDoctor();
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
     * Semeia o Médico Teste (medico@teste.com / 123456) e gera sua grade de horários
     * para o dia atual e próximo dia via automação de agenda.
     */
    private void seedTestDoctor() {
        String email = "medico@teste.com";
        String rawPassword = "123456";

        seedApprovedDoctor(
                "Dr. Marcos Silveira (Médico Teste)",
                email,
                rawPassword,
                "999999",
                "SP",
                "999.888.777-66",
                "(11) 98765-4321",
                "1975-05-15",
                "341 - Itaú Unibanco S.A.",
                "0001",
                "99999-9",
                email,
                "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80",
                "RQE 99999",
                "Médico Geriatra credenciado e homologado para testes e demonstrações práticas da plataforma Active Age. Especialista em saúde preventiva, longevidade saudável e acolhimento humanizado do paciente idoso.",
                Arrays.asList("Avaliação Geriátrica Ampla (AGA)", "Memória e Demências", "Prevenção de Quedas", "Polifarmácia e Desprescrição", "Longevidade Ativa"),
                BigDecimal.valueOf(250.00),
                50,
                "https://lattes.cnpq.br/99999999"
        );

        // Dispara a automação para assegurar horários livres hoje e amanhã
        doctorScheduleAutomationService.ensureTestDoctorSchedule();
        logger.info(">>> [SEED] Médico de teste configurado com sucesso e agenda sincronizada: {}", email);
    }

    /**
     * Semeia médicos pioneiros já homologados em homenagem aos grandes nomes da tecnologia e ciência.
     * Esses médicos não possuem agendamentos prévios, compondo uma vitrine nacional ampla para a apresentação.
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
                "https://upload.wikimedia.org/wikipedia/commons/a/a4/Ada_Lovelace_portrait.jpg",
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
                "https://upload.wikimedia.org/wikipedia/commons/7/79/Alan_Turing_az_1930-as_%C3%A9vekben.jpg",
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
                "https://upload.wikimedia.org/wikipedia/commons/a/ad/Commodore_Grace_M._Hopper%2C_USN_%28covered%29.jpg",
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
                "https://upload.wikimedia.org/wikipedia/commons/d/db/Margaret_Hamilton_-_restoration.jpg",
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
                "https://upload.wikimedia.org/wikipedia/commons/4/4e/Sir_Tim_Berners-Lee_%28cropped%29.jpg",
                "RQE 19890",
                "Inventor da World Wide Web e defensor do acesso universal. Atua na geriatria comunitária, telemedicina preventiva, envelhecimento ativo e integração harmoniosa entre saúde, apoio familiar e bem-estar do idoso.",
                Arrays.asList("Longevidade Ativa", "Saúde Cardiovascular", "Avaliação Geriátrica Ampla (AGA)", "Reabilitação Cognitiva"),
                BigDecimal.valueOf(350.00),
                50,
                "https://lattes.cnpq.br/19892026"
        );

        // 6. Dr. Dennis Ritchie (Criador da Linguagem C e Unix - 1972)
        seedApprovedDoctor(
                "Dr. Dennis MacAlistair Ritchie",
                "dennis.ritchie@activeage.com",
                defaultDoctorPassword,
                "197206",
                "SP",
                "666.777.888-99",
                "(11) 91972-2026",
                "1971-09-09",
                "341 - Itaú Unibanco S.A.",
                "1972",
                "19720-6",
                "dennis.ritchie@activeage.com",
                "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80",
                "RQE 19720",
                "Criador da linguagem C e co-criador do Unix. Atua na geriatria clínica estruturada, com foco em estabilidade metabólica, prevenção cardiovascular e gestão precisa de planos terapêuticos complexos.",
                Arrays.asList("Avaliação Geriátrica Ampla (AGA)", "Saúde Cardiovascular", "Polifarmácia e Desprescrição"),
                BigDecimal.valueOf(370.00),
                50,
                "https://lattes.cnpq.br/19722026"
        );

        // 7. Dr. Claude Shannon (Pai da Teoria da Informação - 1948)
        seedApprovedDoctor(
                "Dr. Claude Elwood Shannon",
                "claude.shannon@activeage.com",
                defaultDoctorPassword,
                "194807",
                "RJ",
                "777.888.999-00",
                "(21) 91948-2026",
                "1969-04-30",
                "001 - Banco do Brasil S.A.",
                "1948",
                "19480-7",
                "claude.shannon@activeage.com",
                "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80",
                "RQE 19480",
                "Pioneiro da Teoria da Informação. Dedica-se à reabilitação neurocognitiva geriátrica, prevenção de demências e preservação das faculdades comunicativas e relacionais do idoso.",
                Arrays.asList("Memória e Demências", "Reabilitação Cognitiva", "Longevidade Ativa"),
                BigDecimal.valueOf(390.00),
                60,
                "https://lattes.cnpq.br/19482026"
        );

        // 8. Dra. Katherine Johnson (Física e Matemática da NASA - 1961)
        seedApprovedDoctor(
                "Dra. Katherine Coleman Goble Johnson",
                "katherine.johnson@activeage.com",
                defaultDoctorPassword,
                "196108",
                "MG",
                "888.999.000-11",
                "(31) 91961-2026",
                "1968-08-26",
                "104 - Caixa Econômica Federal",
                "1961",
                "19610-8",
                "katherine.johnson@activeage.com",
                "https://images.unsplash.com/photo-1594824813589-9a706b49eb12?w=400&auto=format&fit=crop&q=80",
                "RQE 19610",
                "Cientista da NASA e defensora do cálculo e precisão na saúde humana. Atua no rastreio da osteopenia, reabilitação física contra sarcopenia e estímulo ao envelhecimento ativo e resiliente.",
                Arrays.asList("Longevidade Ativa", "Osteoporose e Sarcopenia", "Prevenção de Quedas"),
                BigDecimal.valueOf(360.00),
                50,
                "https://lattes.cnpq.br/19612026"
        );

        // 9. Dr. John von Neumann (Pioneiro da Arquitetura Computacional - 1945)
        seedApprovedDoctor(
                "Dr. John von Neumann",
                "john.vonneumann@activeage.com",
                defaultDoctorPassword,
                "194509",
                "SP",
                "999.000.111-22",
                "(11) 91945-2026",
                "1963-12-28",
                "033 - Banco Santander (Brasil) S.A.",
                "1945",
                "19450-9",
                "john.vonneumann@activeage.com",
                "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80",
                "RQE 19450",
                "Polímata e formulador da arquitetura computacional moderna. Foco em polifarmácia complexa, desprescrição segura de medicamentos inadequados e cuidados de conforto em pacientes geriátricos avançados.",
                Arrays.asList("Avaliação Geriátrica Ampla (AGA)", "Polifarmácia e Desprescrição", "Cuidados Paliativos"),
                BigDecimal.valueOf(420.00),
                60,
                "https://lattes.cnpq.br/19452026"
        );

        // 10. Dra. Barbara Liskov (Pioneira de POO e Princípio da Substituição - 1974)
        seedApprovedDoctor(
                "Dra. Barbara Jane Liskov",
                "barbara.liskov@activeage.com",
                defaultDoctorPassword,
                "197410",
                "RS",
                "000.111.222-33",
                "(51) 91974-2026",
                "1969-11-07",
                "041 - Banco do Estado do Rio Grande do Sul S.A. (Banrisul)",
                "1974",
                "19740-0",
                "barbara.liskov@activeage.com",
                "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80",
                "RQE 19740",
                "Primeira mulher a obter doutorado em Ciência da Computação nos EUA. Especialista em geriatria preventiva, nutrição balanceada na maturidade e preservação da autonomia do paciente com demência inicial.",
                Arrays.asList("Memória e Demências", "Nutrição do Idoso", "Longevidade Ativa"),
                BigDecimal.valueOf(340.00),
                45,
                "https://lattes.cnpq.br/19742026"
        );

        // 11. Dr. Donald Knuth (Autor de The Art of Computer Programming - 1968)
        seedApprovedDoctor(
                "Dr. Donald Ervin Knuth",
                "donald.knuth@activeage.com",
                defaultDoctorPassword,
                "196811",
                "PR",
                "111.333.555-77",
                "(41) 91968-2026",
                "1968-01-10",
                "001 - Banco do Brasil S.A.",
                "1968",
                "19681-1",
                "donald.knuth@activeage.com",
                "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80",
                "RQE 19680",
                "Autor seminal da computação algorítmica. Atua na geriatria sistemática, avaliação funcional minuciosa, equilíbrio postural e reabilitação cognitiva do paciente da terceira idade.",
                Arrays.asList("Avaliação Geriátrica Ampla (AGA)", "Prevenção de Quedas", "Reabilitação Cognitiva"),
                BigDecimal.valueOf(350.00),
                50,
                "https://lattes.cnpq.br/19682026"
        );

        // 12. Dra. Hedy Lamarr (Inventora do Salto de Frequência / Base do Wi-Fi - 1942)
        seedApprovedDoctor(
                "Dra. Hedy Lamarr",
                "hedy.lamarr@activeage.com",
                defaultDoctorPassword,
                "194212",
                "BA",
                "222.444.666-88",
                "(71) 91942-2026",
                "1964-11-09",
                "237 - Banco Bradesco S.A.",
                "1942",
                "19421-2",
                "hedy.lamarr@activeage.com",
                "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&auto=format&fit=crop&q=80",
                "RQE 19420",
                "Pioneira do espalhamento espectral e das telecomunicações sem fio. Especialista em saúde cardiovascular preventiva, vitalidade física e terapias integradas para manutenção da densidade óssea.",
                Arrays.asList("Longevidade Ativa", "Saúde Cardiovascular", "Osteoporose e Sarcopenia"),
                BigDecimal.valueOf(380.00),
                50,
                "https://lattes.cnpq.br/19422026"
        );

        // 13. Dr. Linus Torvalds (Criador do Linux e Git - 1991)
        seedApprovedDoctor(
                "Dr. Linus Benedict Torvalds",
                "linus.torvalds@activeage.com",
                defaultDoctorPassword,
                "199113",
                "SC",
                "333.555.777-99",
                "(48) 91991-2026",
                "1969-12-28",
                "260 - Nu Pagamentos S.A. (Nubank)",
                "0001",
                "19911-3",
                "linus.torvalds@activeage.com",
                "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=400&auto=format&fit=crop&q=80",
                "RQE 19910",
                "Criador do núcleo Linux e do Git. Especialista em gestão pragmática de comorbidades do idoso, segurança e redução de riscos na polifarmácia e prevenção eficaz de quedas domésticas.",
                Arrays.asList("Polifarmácia e Desprescrição", "Prevenção de Quedas", "Avaliação Geriátrica Ampla (AGA)"),
                BigDecimal.valueOf(320.00),
                45,
                "https://lattes.cnpq.br/19912026"
        );

        // 14. Dra. Radia Perlman (Mãe da Internet, criadora do Spanning Tree - 1985)
        seedApprovedDoctor(
                "Dra. Radia Joy Perlman",
                "radia.perlman@activeage.com",
                defaultDoctorPassword,
                "198514",
                "DF",
                "444.666.888-00",
                "(61) 91985-2026",
                "1961-01-01",
                "077 - Banco Inter S.A.",
                "0077",
                "19851-4",
                "radia.perlman@activeage.com",
                "https://images.unsplash.com/photo-1594824813689-9a706b49eb12?w=400&auto=format&fit=crop&q=80",
                "RQE 19850",
                "Criadora do protocolo STP fundamental para redes globais. Dedicada a cuidados paliativos humanizados, apoio e suporte familiar no cuidado do idoso frágil e tratamento das demências em fases intermediárias.",
                Arrays.asList("Cuidados Paliativos", "Memória e Demências", "Nutrição do Idoso"),
                BigDecimal.valueOf(360.00),
                50,
                "https://lattes.cnpq.br/19852026"
        );

        // 15. Dr. Leslie Lamport (Pioneiro de Sistemas Distribuídos e LaTeX - 1978)
        seedApprovedDoctor(
                "Dr. Leslie Lamport",
                "leslie.lamport@activeage.com",
                defaultDoctorPassword,
                "197815",
                "PE",
                "555.777.999-11",
                "(81) 91978-2026",
                "1961-02-07",
                "001 - Banco do Brasil S.A.",
                "1978",
                "19781-5",
                "leslie.lamport@activeage.com",
                "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80",
                "RQE 19780",
                "Prêmio Turing por sistemas concorrentes e distribuídos. Especialista em medicina preventiva geriátrica, equilíbrio postural, redução do risco de fraturas e manejo de hipertensão no idoso.",
                Arrays.asList("Saúde Cardiovascular", "Longevidade Ativa", "Prevenção de Quedas"),
                BigDecimal.valueOf(340.00),
                50,
                "https://lattes.cnpq.br/19782026"
        );

        // 16. Dra. Frances Allen (Pioneira de Compiladores e Otimização - 1971)
        seedApprovedDoctor(
                "Dra. Frances Elizabeth Allen",
                "frances.allen@activeage.com",
                defaultDoctorPassword,
                "197116",
                "CE",
                "666.888.000-22",
                "(85) 91971-2026",
                "1962-08-04",
                "104 - Caixa Econômica Federal",
                "1971",
                "19711-6",
                "frances.allen@activeage.com",
                "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80",
                "RQE 19710",
                "Primeira mulher a receber o Prêmio Turing da ACM. Atua na avaliação geriátrica preventiva, preservação da capacidade executiva e autonomia em tarefas cotidianas da terceira idade.",
                Arrays.asList("Avaliação Geriátrica Ampla (AGA)", "Memória e Demências", "Longevidade Ativa"),
                BigDecimal.valueOf(350.00),
                50,
                "https://lattes.cnpq.br/19712026"
        );

        // 17. Dr. Edgar Codd (Criador do Modelo Relacional de Dados - 1970)
        seedApprovedDoctor(
                "Dr. Edgar Frank Codd",
                "edgar.codd@activeage.com",
                defaultDoctorPassword,
                "197017",
                "GO",
                "777.999.111-33",
                "(62) 91970-2026",
                "1963-08-19",
                "341 - Itaú Unibanco S.A.",
                "1970",
                "19701-7",
                "edgar.codd@activeage.com",
                "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80",
                "RQE 19700",
                "Pioneiro das doze regras do modelo relacional. Atua no controle rigoroso de polifarmácia em pacientes geriátricos, prevenção de interações medicamentosas adversas e cuidados paliativos.",
                Arrays.asList("Polifarmácia e Desprescrição", "Cuidados Paliativos", "Osteoporose e Sarcopenia"),
                BigDecimal.valueOf(330.00),
                45,
                "https://lattes.cnpq.br/19702026"
        );
    }

    /**
     * Persiste de forma idempotente um médico com status aprovado, dados financeiros e perfil com foto.
     * Atualiza a senha e dados cadastrais caso o registro já exista.
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
            List<String> clinicalFocus,
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

            // Perfil Profissional, Foto e Atendimento
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
                doc.setFullName(fullName);
                doc.setPassword(passwordEncoder.encode(rawPassword)); // Garante a senha sempre atualizada
                doc.setCrm(crm);
                doc.setUfCrm(ufCrm);
                doc.setRole(Role.ROLE_MEDICO);
                doc.setActive(true);
                doc.setDossierStatus(DoctorDossierStatus.APPROVED);
                doc.setAvatarUrl(avatarUrl);
                doc.setRqe(rqe);
                doc.setBio(bio);
                doc.setClinicalFocus(clinicalFocus);
                doc.setConsultationFee(consultationFee);
                doc.setConsultationDurationMinutes(consultationDurationMinutes);
                doc.setLattesUrl(lattesUrl);
                userRepository.save(doc);
                logger.info(">>> [SEED] Perfil, foto e credenciais atualizados para: {}", email);
            });
            logger.info(">>> [SEED] Médico já existente verificado: {}", email);
        }
    }
}
