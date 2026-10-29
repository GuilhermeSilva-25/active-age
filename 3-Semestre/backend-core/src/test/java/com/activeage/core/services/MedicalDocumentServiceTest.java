package com.activeage.core.services;

import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.models.Appointment;
import com.activeage.core.domain.models.MedicalDocument;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.CreateMedicalDocumentRequest;
import com.activeage.core.dtos.DocumentValidationResponse;
import com.activeage.core.dtos.MedicalDocumentResponse;
import com.activeage.core.repositories.AppointmentRepository;
import com.activeage.core.repositories.MedicalDocumentRepository;
import com.activeage.core.repositories.MedicalRecordRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MedicalDocumentServiceTest {

    @Mock
    private MedicalDocumentRepository medicalDocumentRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private MedicalRecordRepository medicalRecordRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private MedicalDocumentService medicalDocumentService;

    private User doctorUser;
    private Appointment appointment;

    @BeforeEach
    void setUp() {
        doctorUser = new User();
        doctorUser.setId("doctor-123");
        doctorUser.setEmail("medico@activeage.com");
        doctorUser.setFullName("Dr. Carlos Silva");
        doctorUser.setCrm("123456");
        doctorUser.setUfCrm("SP");
        doctorUser.setRqe("45678");
        doctorUser.setRole(Role.ROLE_MEDICO);

        appointment = Appointment.builder()
                .id("appt-999")
                .doctorId("doctor-123")
                .patientId("patient-456")
                .patientName("Dona Maria de Lourdes")
                .build();
    }

    @Test
    @DisplayName("Deve emitir documento médico com código verificador único e registrar em audit_logs")
    void shouldCreateMedicalDocumentSuccessfully() {
        CreateMedicalDocumentRequest request = CreateMedicalDocumentRequest.builder()
                .appointmentId("appt-999")
                .documentType("RECEITA_MEDICA")
                .title("Prescrição Médica Geriátrica")
                .content("1. Losartana Potássica 50mg - 1 comp pela manhã\n2. Vitamina D 2000UI - 1 gota ao dia")
                .recommendations("Manter aferição diária de pressão arterial")
                .build();

        when(userRepository.findByEmail(doctorUser.getEmail())).thenReturn(Optional.of(doctorUser));
        when(appointmentRepository.findById(appointment.getId())).thenReturn(Optional.of(appointment));
        User patientUser = new User();
        patientUser.setCpf("123.456.789-00");
        when(userRepository.findById(appointment.getPatientId())).thenReturn(Optional.of(patientUser));
        when(medicalRecordRepository.findByAppointmentId(appointment.getId())).thenReturn(Optional.empty());
        when(medicalDocumentRepository.existsByValidationCode(anyString())).thenReturn(false);
        when(medicalDocumentRepository.save(any(MedicalDocument.class))).thenAnswer(i -> i.getArgument(0));

        MedicalDocumentResponse response = medicalDocumentService.createDocument(doctorUser.getEmail(), request);

        assertNotNull(response);
        assertEquals("RECEITA_MEDICA", response.getDocumentType());
        assertEquals("Prescrição Médica Geriátrica", response.getTitle());
        assertNotNull(response.getValidationCode());
        assertTrue(response.getValidationCode().startsWith("AA-2026-"));

        verify(auditService, times(1)).log(
                eq(doctorUser.getId()),
                eq(doctorUser.getEmail()),
                eq("MEDICO"),
                eq("MEDICAL_DOCUMENT_ISSUED"),
                eq(appointment.getPatientId()),
                anyString(),
                anyString()
        );
    }

    @Test
    @DisplayName("Deve validar autenticidade do documento médico quando código existir")
    void shouldValidateDocumentSuccessfully() {
        MedicalDocument doc = MedicalDocument.builder()
                .validationCode("AA-2026-ABC123")
                .documentType("RECEITA_MEDICA")
                .title("Receita Digital")
                .doctorName("Dr. Carlos Silva")
                .doctorCrm("123456")
                .doctorUfCrm("SP")
                .patientName("Dona Maria")
                .issuedAt(LocalDateTime.now())
                .build();

        when(medicalDocumentRepository.findByValidationCode("AA-2026-ABC123")).thenReturn(Optional.of(doc));

        DocumentValidationResponse response = medicalDocumentService.validateDocument("AA-2026-ABC123");

        assertTrue(response.isValid());
        assertEquals("AA-2026-ABC123", response.getValidationCode());
        assertEquals("Dr. Carlos Silva", response.getDoctorName());
        assertTrue(response.getMessage().contains("autêntico"));
    }

    @Test
    @DisplayName("Deve retornar inválido quando código verificador não for localizado")
    void shouldReturnInvalidWhenCodeNotFound() {
        when(medicalDocumentRepository.findByValidationCode("INVALIDO")).thenReturn(Optional.empty());

        DocumentValidationResponse response = medicalDocumentService.validateDocument("INVALIDO");

        assertFalse(response.isValid());
        assertTrue(response.getMessage().contains("não localizado"));
    }
}
