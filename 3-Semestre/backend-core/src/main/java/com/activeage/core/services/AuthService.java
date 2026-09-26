package com.activeage.core.services;

import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.requests.LoginRequest;
import com.activeage.core.dtos.requests.PatientRegisterRequest;
import com.activeage.core.repositories.UserRepository;
import com.activeage.core.utils.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Serviço que concentra as regras de negócio de Autenticação.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Registra um novo paciente verificando se o email já existe, criptografando a senha
     * e configurando a permissão base padrão (PATIENT).
     *
     * @param request DTO com os dados do paciente oriundos do front-end.
     * @return O objeto User salvo no banco de dados.
     */
    public User registerPatient(PatientRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Este e-mail já está em uso.");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setCpf(request.getCpf());
        user.setPhone(request.getPhone());
        user.setBirthDate(request.getBirthDate());
        user.setTermsAccepted(request.isTermsAccepted());
        user.setRole(Role.ROLE_PACIENTE);

        return userRepository.save(user);
    }

    /**
     * Efetua o login do usuário validando as credenciais.
     * Caso o e-mail não exista ou a senha não bata, retorna uma exceção genérica
     * para proteger contra ataques de força bruta ou enumeração (RF001).
     *
     * @param request DTO contendo e-mail e senha.
     * @return O Token JWT gerado para a sessão do usuário.
     */
    public String login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Credenciais inválidas."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Credenciais inválidas.");
        }

        return jwtUtil.generateToken(user.getEmail());
    }
}