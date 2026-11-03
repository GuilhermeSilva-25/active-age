package com.activeage.core.controllers;

import com.activeage.core.domain.enums.Role;
import com.activeage.core.dtos.requests.UpdateDoctorProfileRequest;
import com.activeage.core.dtos.requests.UpdatePatientProfileRequest;
import com.activeage.core.dtos.responses.UserProfileResponse;
import com.activeage.core.exceptions.GlobalExceptionHandler;
import com.activeage.core.services.UserProfileService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class UserProfileControllerTest {

    @Mock
    private UserProfileService userProfileService;

    @InjectMocks
    private UserProfileController userProfileController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(userProfileController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn("usuario@teste.com");
        when(auth.getName()).thenReturn("usuario@teste.com");

        SecurityContext secCtx = mock(SecurityContext.class);
        when(secCtx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(secCtx);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("GET /api/users/profile/me - Deve retornar perfil do usuário autenticado")
    void shouldGetMyProfile() throws Exception {
        UserProfileResponse profile = UserProfileResponse.builder()
                .id("u-1")
                .fullName("Dona Maria")
                .email("usuario@teste.com")
                .role(Role.ROLE_PACIENTE)
                .build();

        when(userProfileService.getUserProfile("usuario@teste.com")).thenReturn(profile);

        mockMvc.perform(get("/api/users/profile/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("u-1"))
                .andExpect(jsonPath("$.fullName").value("Dona Maria"));
    }

    @Test
    @DisplayName("PUT /api/users/profile/doctor - Deve atualizar dados do perfil médico")
    void shouldUpdateDoctorProfile() throws Exception {
        UpdateDoctorProfileRequest req = UpdateDoctorProfileRequest.builder()
                .phone("(11) 98765-4321")
                .bio("Especialista em geriatria preventiva")
                .build();

        UserProfileResponse resp = UserProfileResponse.builder()
                .id("doc-1")
                .fullName("Dr. Turing")
                .bio("Especialista em geriatria preventiva")
                .build();

        when(userProfileService.updateDoctorProfile(eq("usuario@teste.com"), any(UpdateDoctorProfileRequest.class)))
                .thenReturn(resp);

        mockMvc.perform(put("/api/users/profile/doctor")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bio").value("Especialista em geriatria preventiva"));
    }

    @Test
    @DisplayName("PUT /api/users/profile/patient - Deve atualizar dados do perfil do paciente")
    void shouldUpdatePatientProfile() throws Exception {
        UpdatePatientProfileRequest req = new UpdatePatientProfileRequest();
        req.setPhone("(11) 91234-5678");

        UserProfileResponse resp = UserProfileResponse.builder()
                .id("pat-1")
                .phone("(11) 91234-5678")
                .build();

        when(userProfileService.updatePatientProfile(eq("usuario@teste.com"), any(UpdatePatientProfileRequest.class)))
                .thenReturn(resp);

        mockMvc.perform(put("/api/users/profile/patient")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.phone").value("(11) 91234-5678"));
    }

    @Test
    @DisplayName("POST /api/users/profile/avatar - Deve fazer upload de foto de perfil")
    void shouldUploadAvatar() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "avatar.jpg", "image/jpeg", "IMG_BYTES".getBytes());

        when(userProfileService.uploadAvatar(eq("usuario@teste.com"), any())).thenReturn("/api/users/profile/avatar/file-123.jpg");

        mockMvc.perform(multipart("/api/users/profile/avatar").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Foto de perfil atualizada com sucesso!"))
                .andExpect(jsonPath("$.avatarUrl").value("/api/users/profile/avatar/file-123.jpg"));
    }

    @Test
    @DisplayName("GET /api/users/profile/avatar/{filename} - Deve carregar arquivo de avatar com content types apropriados")
    void shouldGetAvatarResource() throws Exception {
        ByteArrayResource pngResource = new ByteArrayResource("PNG_BYTES".getBytes());
        when(userProfileService.loadAvatarResource("foto.png")).thenReturn(pngResource);

        mockMvc.perform(get("/api/users/profile/avatar/foto.png"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "image/png"))
                .andExpect(content().bytes("PNG_BYTES".getBytes()));

        ByteArrayResource webpResource = new ByteArrayResource("WEBP_BYTES".getBytes());
        when(userProfileService.loadAvatarResource("foto.webp")).thenReturn(webpResource);

        mockMvc.perform(get("/api/users/profile/avatar/foto.webp"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "image/webp"));
    }
}
