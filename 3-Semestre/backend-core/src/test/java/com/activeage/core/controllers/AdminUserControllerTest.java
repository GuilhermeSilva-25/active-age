package com.activeage.core.controllers;

import com.activeage.core.domain.enums.Role;
import com.activeage.core.dtos.requests.UserStatusUpdateRequest;
import com.activeage.core.dtos.responses.UserItemResponse;
import com.activeage.core.exceptions.GlobalExceptionHandler;
import com.activeage.core.services.AdminUserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AdminUserControllerTest {

    @Mock
    private AdminUserService adminUserService;

    @InjectMocks
    private AdminUserController adminUserController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        // Resolver para injetar adminEmail no @AuthenticationPrincipal String adminEmail
        HandlerMethodArgumentResolver authPrincipalResolver = new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
            }

            @Override
            public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                          NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
                return "admin@activeage.com";
            }
        };

        mockMvc = MockMvcBuilders.standaloneSetup(adminUserController)
                .setCustomArgumentResolvers(authPrincipalResolver)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/admin/users - Deve listar usuários com filtros")
    void shouldGetUsersWithFilters() throws Exception {
        UserItemResponse user = UserItemResponse.builder()
                .id("u-1")
                .fullName("Dona Maria")
                .role(Role.ROLE_PACIENTE)
                .active(true)
                .build();

        when(adminUserService.getUsers(Role.ROLE_PACIENTE, true, "Maria"))
                .thenReturn(List.of(user));

        mockMvc.perform(get("/api/admin/users")
                        .param("role", "ROLE_PACIENTE")
                        .param("active", "true")
                        .param("search", "Maria"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].fullName").value("Dona Maria"));
    }

    @Test
    @DisplayName("GET /api/admin/users/{id} - Deve retornar usuário pelo ID")
    void shouldGetUserById() throws Exception {
        UserItemResponse user = UserItemResponse.builder()
                .id("u-1")
                .fullName("Dr. Alan")
                .build();

        when(adminUserService.getUserById("u-1")).thenReturn(user);

        mockMvc.perform(get("/api/admin/users/u-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("u-1"))
                .andExpect(jsonPath("$.fullName").value("Dr. Alan"));
    }

    @Test
    @DisplayName("PATCH /api/admin/users/{id}/status - Deve alterar status do usuário")
    void shouldUpdateUserStatus() throws Exception {
        UserStatusUpdateRequest req = new UserStatusUpdateRequest(false, "Desativação preventiva");
        UserItemResponse res = UserItemResponse.builder()
                .id("u-1")
                .active(false)
                .build();

        when(adminUserService.updateUserStatus(eq("u-1"), any(UserStatusUpdateRequest.class), eq("admin@activeage.com"), anyString()))
                .thenReturn(res);

        mockMvc.perform(patch("/api/admin/users/u-1/status")
                        .header("X-Forwarded-For", "192.168.1.1, 10.0.0.1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));
    }
}
