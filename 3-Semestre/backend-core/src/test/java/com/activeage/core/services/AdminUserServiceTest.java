package com.activeage.core.services;

import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.requests.UserStatusUpdateRequest;
import com.activeage.core.dtos.responses.UserItemResponse;
import com.activeage.core.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AdminUserService adminUserService;

    private User patient;
    private User admin;

    @BeforeEach
    void setUp() {
        patient = new User();
        patient.setId("pac-1");
        patient.setFullName("Dona Maria de Lourdes");
        patient.setEmail("maria@teste.com");
        patient.setCpf("123.456.789-00");
        patient.setRole(Role.ROLE_PACIENTE);
        patient.setActive(true);
        patient.setCreatedAt(LocalDateTime.now().minusDays(10));

        admin = new User();
        admin.setId("admin-1");
        admin.setEmail("admin@activeage.com");
        admin.setFullName("Administrador Chefe");
        admin.setRole(Role.ROLE_ADMIN);
        admin.setActive(true);
    }

    @Test
    @DisplayName("Deve listar usuários com filtros aplicados")
    void getUsers_withFilters() {
        User doctor = new User();
        doctor.setId("doc-1");
        doctor.setFullName("Dr. Alan Turing");
        doctor.setEmail("alan.turing@activeage.com");
        doctor.setCrm("193602");
        doctor.setRole(Role.ROLE_MEDICO);
        doctor.setActive(true);

        when(userRepository.findAll()).thenReturn(List.of(patient, doctor, admin));

        List<UserItemResponse> resultRole = adminUserService.getUsers(Role.ROLE_PACIENTE, null, null);
        assertEquals(1, resultRole.size());
        assertEquals("Dona Maria de Lourdes", resultRole.get(0).getFullName());

        List<UserItemResponse> resultSearch = adminUserService.getUsers(null, null, "193602");
        assertEquals(1, resultSearch.size());
        assertEquals("Dr. Alan Turing", resultSearch.get(0).getFullName());
    }

    @Test
    @DisplayName("Deve buscar usuário por ID com sucesso")
    void getUserById_success() {
        when(userRepository.findById("pac-1")).thenReturn(Optional.of(patient));

        UserItemResponse res = adminUserService.getUserById("pac-1");

        assertNotNull(res);
        assertEquals("maria@teste.com", res.getEmail());
    }

    @Test
    @DisplayName("Deve lançar exceção ao buscar usuário inexistente por ID")
    void getUserById_notFound() {
        when(userRepository.findById("inexistente")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> adminUserService.getUserById("inexistente"));
    }

    @Test
    @DisplayName("Deve inativar conta de usuário e auditar")
    void updateUserStatus_deactivate() {
        when(userRepository.findById("pac-1")).thenReturn(Optional.of(patient));
        when(userRepository.findByEmail("admin@activeage.com")).thenReturn(Optional.of(admin));

        UserStatusUpdateRequest req = new UserStatusUpdateRequest();
        req.setActive(false);
        req.setReason("Inadimplência de cadastro");

        UserItemResponse res = adminUserService.updateUserStatus("pac-1", req, "admin@activeage.com", "127.0.0.1");

        assertNotNull(res);
        assertFalse(res.isActive());
        assertFalse(patient.isActive());
        verify(userRepository).save(patient);
        verify(auditService).log(any(), any(), any(), eq("DEACTIVATE_USER"), eq("pac-1"), any(), eq("127.0.0.1"));
    }

    @Test
    @DisplayName("Deve ativar conta de usuário previamente inativada")
    void updateUserStatus_activate() {
        patient.setActive(false);
        when(userRepository.findById("pac-1")).thenReturn(Optional.of(patient));
        when(userRepository.findByEmail("admin@activeage.com")).thenReturn(Optional.of(admin));

        UserStatusUpdateRequest req = new UserStatusUpdateRequest();
        req.setActive(true);

        UserItemResponse res = adminUserService.updateUserStatus("pac-1", req, "admin@activeage.com", "127.0.0.1");

        assertTrue(res.isActive());
        assertTrue(patient.isActive());
        verify(auditService).log(any(), any(), any(), eq("ACTIVATE_USER"), eq("pac-1"), any(), any());
    }

    @Test
    @DisplayName("Deve impedir que o administrador inative sua própria conta")
    void updateUserStatus_preventSelfDeactivation() {
        when(userRepository.findById("admin-1")).thenReturn(Optional.of(admin));
        when(userRepository.findByEmail("admin@activeage.com")).thenReturn(Optional.of(admin));

        UserStatusUpdateRequest req = new UserStatusUpdateRequest();
        req.setActive(false);

        assertThrows(IllegalArgumentException.class, () ->
                adminUserService.updateUserStatus("admin-1", req, "admin@activeage.com", "127.0.0.1"));

        verify(userRepository, never()).save(any());
    }
}
