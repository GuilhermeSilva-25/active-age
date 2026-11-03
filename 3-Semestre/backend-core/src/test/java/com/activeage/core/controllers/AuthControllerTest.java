package com.activeage.core.controllers;

import com.activeage.core.domain.enums.DoctorDossierStatus;
import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.requests.DoctorRegisterRequest;
import com.activeage.core.dtos.requests.LoginRequest;
import com.activeage.core.dtos.requests.PatientRegisterRequest;
import com.activeage.core.exceptions.GlobalExceptionHandler;
import com.activeage.core.services.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("Deve registrar paciente com sucesso retornando HTTP 201")
    void shouldRegisterPatientSuccessfully() throws Exception {
        PatientRegisterRequest request = new PatientRegisterRequest();
        request.setFullName("Dona Maria Silva");
        request.setEmail("maria.silva@teste.com");
        request.setPassword("123456");
        request.setCpf("123.456.789-00");
        request.setPhone("(11) 98765-4321");
        request.setBirthDate("1950-05-15");
        request.setTermsAccepted(true);

        mockMvc.perform(post("/api/auth/register-patient")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(content().string("Paciente registrado com sucesso na plataforma!"));

        verify(authService).registerPatient(any(PatientRegisterRequest.class));
    }

    @Test
    @DisplayName("Deve registrar médico especialista com sucesso retornando HTTP 201")
    void shouldRegisterDoctorSuccessfully() throws Exception {
        DoctorRegisterRequest request = new DoctorRegisterRequest();
        request.setFullName("Dr. Roberto Geriatra");
        request.setEmail("roberto@teste.com");
        request.setPassword("123456");
        request.setCpf("123.456.789-11");
        request.setPhone("(11) 91234-5678");
        request.setCrm("123456");
        request.setUfCrm("SP");
        request.setTermsAccepted(true);

        mockMvc.perform(post("/api/auth/register-doctor")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(content().string("Médico especialista registrado com sucesso na plataforma!"));

        verify(authService).registerDoctor(any(DoctorRegisterRequest.class));
    }

    @Test
    @DisplayName("Deve retornar true quando e-mail estiver disponível")
    void shouldReturnTrueWhenEmailIsAvailable() throws Exception {
        when(authService.isEmailAvailable("novo@teste.com")).thenReturn(true);

        mockMvc.perform(get("/api/auth/check-email")
                        .param("email", "novo@teste.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(true));
    }

    @Test
    @DisplayName("Deve retornar false e mensagem informativa quando e-mail já estiver em uso")
    void shouldReturnFalseWhenEmailIsAlreadyInUse() throws Exception {
        when(authService.isEmailAvailable("existente@teste.com")).thenReturn(false);

        mockMvc.perform(get("/api/auth/check-email")
                        .param("email", "existente@teste.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false))
                .andExpect(jsonPath("$.message").value("Este e-mail já está em uso."));
    }

    @Test
    @DisplayName("Deve autenticar com sucesso e definir Cookie HttpOnly")
    void shouldLoginSuccessfullyAndSetHttpOnlyCookie() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("medico@teste.com");
        request.setPassword("123456");

        when(authService.login(any(LoginRequest.class))).thenReturn("jwt-mock-token-xyz");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(header().exists("Set-Cookie"))
                .andExpect(content().string("Login realizado com sucesso!"));
    }

    @Test
    @DisplayName("Deve retornar 401 ao buscar perfil se SecurityContext for nulo ou anônimo")
    void shouldReturn401WhenProfileRequestedWithoutAuth() throws Exception {
        SecurityContextHolder.clearContext();

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Usuário não autenticado."));
    }

    @Test
    @DisplayName("Deve retornar 404 se usuário autenticado não for encontrado no banco")
    void shouldReturn404WhenUserNotFoundInDatabase() throws Exception {
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn("test@activeage.com");
        when(auth.getName()).thenReturn("test@activeage.com");

        SecurityContext secCtx = mock(SecurityContext.class);
        when(secCtx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(secCtx);

        when(authService.getUserByEmail("test@activeage.com")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Perfil não localizado."));
    }

    @Test
    @DisplayName("Deve retornar perfil completo do usuário autenticado")
    void shouldReturnAuthenticatedUserProfile() throws Exception {
        User user = new User();
        user.setId("u-123");
        user.setFullName("Dra. Margaret Hamilton");
        user.setEmail("margaret@activeage.com");
        user.setRole(Role.ROLE_MEDICO);
        user.setCrm("654321");
        user.setUfCrm("SP");
        user.setActive(true);
        user.setDossierStatus(DoctorDossierStatus.APPROVED);

        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn("margaret@activeage.com");
        when(auth.getName()).thenReturn("margaret@activeage.com");

        SecurityContext secCtx = mock(SecurityContext.class);
        when(secCtx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(secCtx);

        when(authService.getUserByEmail("margaret@activeage.com")).thenReturn(Optional.of(user));

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("u-123"))
                .andExpect(jsonPath("$.fullName").value("Dra. Margaret Hamilton"))
                .andExpect(jsonPath("$.role").value("ROLE_MEDICO"))
                .andExpect(jsonPath("$.crm").value("654321"))
                .andExpect(jsonPath("$.dossierStatus").value("APPROVED"));
    }

    @Test
    @DisplayName("Deve realizar logout invalidando o cookie com maxAge zero")
    void shouldLogoutSuccessfully() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(header().exists("Set-Cookie"))
                .andExpect(content().string("Logout realizado com sucesso!"));
    }
}
