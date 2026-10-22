package com.activeage.core.config;

import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.models.User;
import com.activeage.core.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Inicializador de dados essenciais para o sistema Active Age.
 * Garante que exista ao menos uma conta administrativa inicial (ROLE_ADMIN)
 * para viabilizar os testes e operação do Painel de Administração.
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
}
