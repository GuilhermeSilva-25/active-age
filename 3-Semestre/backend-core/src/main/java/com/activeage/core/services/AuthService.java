package com.activeage.core.services;

import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.requests.LoginRequest;
import com.activeage.core.dtos.requests.PatientRegisterRequest;
import com.activeage.core.repositories.UserRepository;
import com.activeage.core.utils.JwtUtil;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Serviço que concentra as regras de negócio de Autenticação.
 * Implementa Proteção Contra Força Bruta (Rate Limiting) conforme exigido no RF001.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    private final Map<String, Bucket> loginBuckets = new ConcurrentHashMap<>();

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Cria ou resgata um balde (Bucket) de tentativas para um e-mail específico.
     * Limite: 5 tentativas, que se regeneram a cada 15 minutos.
     */
    private Bucket resolveBucket(String email) {
        return loginBuckets.computeIfAbsent(email, k -> {
            Bandwidth limit = Bandwidth.classic(5, Refill.greedy(5, Duration.ofMinutes(15)));
            return Bucket.builder().addLimit(limit).build();
        });
    }

    /**
     * Registra um novo paciente verificando se o email já existe, criptografando a senha
     * e configurando a permissão base padrão (ROLE_PACIENTE).
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
     * Aplica Rate Limiting para bloquear Força Bruta.
     *
     * @param request DTO contendo e-mail e senha.
     * @return O Token JWT gerado para a sessão do usuário contendo suas permissões (Role).
     */
    public String login(LoginRequest request) {
        Bucket bucket = resolveBucket(request.getEmail());
        if (!bucket.tryConsume(1)) {
            throw new IllegalArgumentException("Muitas tentativas fracassadas. Sua conta está travada, tente novamente em 15 minutos.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Credenciais inválidas."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Credenciais inválidas.");
        }

        return jwtUtil.generateToken(user.getEmail(), user.getRole().name());
    }
}