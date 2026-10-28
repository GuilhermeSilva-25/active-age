package com.activeage.core.services;

import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.requests.LoginRequest;
import com.activeage.core.repositories.UserRepository;
import com.activeage.core.utils.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private User activeUser;
    private User inactiveUser;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        loginRequest = new LoginRequest();
        loginRequest.setEmail("paciente@teste.com");
        loginRequest.setPassword("Senha123!");

        activeUser = new User();
        activeUser.setEmail("paciente@teste.com");
        activeUser.setPassword("encodedPassword");
        activeUser.setRole(Role.ROLE_PACIENTE);
        activeUser.setActive(true);

        inactiveUser = new User();
        inactiveUser.setEmail("paciente@teste.com");
        inactiveUser.setPassword("encodedPassword");
        inactiveUser.setRole(Role.ROLE_PACIENTE);
        inactiveUser.setActive(false);
    }

    @Test
    @DisplayName("Deve permitir login e retornar token JWT quando usuário estiver ativo e credenciais válidas")
    void shouldAllowLoginWhenUserIsActive() {
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), activeUser.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(activeUser.getEmail(), activeUser.getRole().name())).thenReturn("mocked-jwt-token");

        String token = authService.login(loginRequest);

        assertNotNull(token);
        assertEquals("mocked-jwt-token", token);
        verify(jwtUtil, times(1)).generateToken(activeUser.getEmail(), activeUser.getRole().name());
    }

    @Test
    @DisplayName("Deve bloquear login e lançar exceção informativa quando usuário estiver inativado/suspenso (UC05)")
    void shouldBlockLoginWhenUserIsInactive() {
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(inactiveUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), inactiveUser.getPassword())).thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.login(loginRequest);
        });

        assertTrue(exception.getMessage().contains("suspensa ou desativada"));
        verify(jwtUtil, never()).generateToken(anyString(), anyString());
    }
}
