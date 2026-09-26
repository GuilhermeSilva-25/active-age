package com.activeage.core.services;

import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.requests.PatientRegisterRequest;
import com.activeage.core.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Serviço responsável pela lógica de negócio de Autenticação e Cadastro.
 * Intermedia a comunicação entre os Controladores (APIs) e o Banco de Dados,
 * aplicando regras como verificação de duplicidade e criptografia.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Registra um novo paciente na plataforma.
     * Verifica se o e-mail já existe, aplica o hash na senha e salva no MongoDB.
     *
     * @param request DTO contendo os dados previamente validados vindos do frontend.
     * @return O usuário recém-criado e persistido no banco.
     * @throws IllegalArgumentException se o e-mail já estiver em uso no sistema.
     */
    public User registerPatient(PatientRegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Este e-mail já está em uso na plataforma.");
        }

        User newUser = new User();
        newUser.setEmail(request.getEmail());

        newUser.setPassword(passwordEncoder.encode(request.getPassword()));

        newUser.setRole(Role.ROLE_PACIENTE);
        newUser.setTermsAccepted(request.isTermsAccepted());
        newUser.setCreatedAt(LocalDateTime.now());
        newUser.setActive(true);

        return userRepository.save(newUser);
    }
}