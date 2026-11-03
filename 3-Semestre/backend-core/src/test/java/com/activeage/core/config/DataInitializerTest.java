package com.activeage.core.config;

import com.activeage.core.domain.models.User;
import com.activeage.core.repositories.UserRepository;
import com.activeage.core.services.DoctorScheduleAutomationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataInitializerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private DoctorScheduleAutomationService doctorScheduleAutomationService;

    @InjectMocks
    private DataInitializer dataInitializer;

    @Test
    @DisplayName("Deve semear admin, médico teste e médicos pioneiros quando banco estiver vazio")
    void run_whenEmpty_shouldSeedAll() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed-pwd");
        doNothing().when(doctorScheduleAutomationService).ensureTestDoctorSchedule();

        dataInitializer.run();

        verify(userRepository, atLeast(15)).save(any(User.class));
        verify(doctorScheduleAutomationService).ensureTestDoctorSchedule();
    }

    @Test
    @DisplayName("Não deve recriar médicos pioneiros quando já existirem")
    void run_whenAlreadyExists_shouldNotRecreate() {
        when(userRepository.existsByEmail(anyString())).thenReturn(true);
        doNothing().when(doctorScheduleAutomationService).ensureTestDoctorSchedule();

        dataInitializer.run();

        verify(userRepository, never()).save(any(User.class));
        verify(doctorScheduleAutomationService).ensureTestDoctorSchedule();
    }
}
