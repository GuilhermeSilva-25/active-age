package com.activeage.core.services;

import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.models.CaregiverInfo;
import com.activeage.core.domain.models.PatientHealthSummary;
import com.activeage.core.domain.models.User;
import com.activeage.core.domain.models.UserAddress;
import com.activeage.core.dtos.requests.UpdateDoctorProfileRequest;
import com.activeage.core.dtos.requests.UpdatePatientProfileRequest;
import com.activeage.core.dtos.responses.UserProfileResponse;
import com.activeage.core.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserProfileServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private UserProfileService userProfileService;

    private User doctor;
    private User patient;

    @BeforeEach
    void setUp() {
        doctor = new User();
        doctor.setId("doc-1");
        doctor.setEmail("medico@teste.com");
        doctor.setFullName("Dr. Alan Turing");
        doctor.setRole(Role.ROLE_MEDICO);

        patient = new User();
        patient.setId("pac-1");
        patient.setEmail("paciente@teste.com");
        patient.setFullName("Dona Maria de Lourdes");
        patient.setRole(Role.ROLE_PACIENTE);
    }

    @Test
    @DisplayName("Deve retornar perfil do usuário")
    void getUserProfile_success() {
        when(userRepository.findByEmail("medico@teste.com")).thenReturn(Optional.of(doctor));

        UserProfileResponse res = userProfileService.getUserProfile("medico@teste.com");

        assertNotNull(res);
        assertEquals("Dr. Alan Turing", res.getFullName());
    }

    @Test
    @DisplayName("Deve atualizar perfil do médico com sucesso")
    void updateDoctorProfile_success() {
        when(userRepository.findByEmail("medico@teste.com")).thenReturn(Optional.of(doctor));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        UpdateDoctorProfileRequest req = new UpdateDoctorProfileRequest();
        req.setPhone("(11) 98888-7777");
        req.setRqe("19360");
        req.setBio("Especialista em Avaliação Geriátrica Ampla");
        req.setClinicalFocus(List.of("Memória", "Demências"));
        req.setConsultationFee(BigDecimal.valueOf(350.00));
        req.setConsultationDurationMinutes(50);
        req.setLattesUrl("https://lattes.cnpq.br/1234");

        UserProfileResponse res = userProfileService.updateDoctorProfile("medico@teste.com", req);

        assertNotNull(res);
        assertEquals("(11) 98888-7777", doctor.getPhone());
        assertEquals("19360", doctor.getRqe());
        verify(userRepository).save(doctor);
    }

    @Test
    @DisplayName("Deve impedir atualização de perfil médico por usuário paciente")
    void updateDoctorProfile_invalidRole() {
        when(userRepository.findByEmail("paciente@teste.com")).thenReturn(Optional.of(patient));

        UpdateDoctorProfileRequest req = new UpdateDoctorProfileRequest();

        assertThrows(IllegalArgumentException.class, () ->
                userProfileService.updateDoctorProfile("paciente@teste.com", req));
    }

    @Test
    @DisplayName("Deve atualizar perfil do paciente e cuidador com sucesso")
    void updatePatientProfile_success() {
        when(userRepository.findByEmail("paciente@teste.com")).thenReturn(Optional.of(patient));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        UpdatePatientProfileRequest req = new UpdatePatientProfileRequest();
        req.setPhone("(11) 97777-6666");
        req.setAddress(new UserAddress());
        CaregiverInfo caregiver = new CaregiverInfo();
        caregiver.setCaregiverName("João da Silva (Filho)");
        req.setCaregiver(caregiver);
        PatientHealthSummary summary = PatientHealthSummary.builder().bloodType("O+").chronicConditions("Hipertensa controlada.").build();
        req.setHealthSummary(summary);

        UserProfileResponse res = userProfileService.updatePatientProfile("paciente@teste.com", req);

        assertNotNull(res);
        assertEquals("(11) 97777-6666", patient.getPhone());
        assertEquals("Hipertensa controlada.", patient.getHealthSummary().getChronicConditions());
        verify(userRepository).save(patient);
    }

    @Test
    @DisplayName("Deve impedir atualização de perfil de paciente por usuário médico")
    void updatePatientProfile_invalidRole() {
        when(userRepository.findByEmail("medico@teste.com")).thenReturn(Optional.of(doctor));

        UpdatePatientProfileRequest req = new UpdatePatientProfileRequest();

        assertThrows(IllegalArgumentException.class, () ->
                userProfileService.updatePatientProfile("medico@teste.com", req));
    }

    @Test
    @DisplayName("Deve fazer upload de avatar e remover o anterior se for relativo")
    void uploadAvatar_success() {
        patient.setAvatarUrl("/api/users/profile/avatar/antigo.jpg");
        when(userRepository.findByEmail("paciente@teste.com")).thenReturn(Optional.of(patient));
        when(fileStorageService.storeAvatar(eq("pac-1"), any())).thenReturn("novo.jpg");

        MockMultipartFile file = new MockMultipartFile("file", "avatar.jpg", "image/jpeg", new byte[]{1, 2});
        String url = userProfileService.uploadAvatar("paciente@teste.com", file);

        assertEquals("/api/users/profile/avatar/novo.jpg", url);
        verify(fileStorageService).deleteAvatar("antigo.jpg");
        verify(userRepository).save(patient);
    }
}
