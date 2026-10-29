package com.activeage.core.services;

import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.models.Appointment;
import com.activeage.core.domain.models.MedicalRecord;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.MedicalRecordRequest;
import com.activeage.core.dtos.MedicalRecordResponse;
import com.activeage.core.repositories.AppointmentRepository;
import com.activeage.core.repositories.MedicalRecordRepository;
import com.activeage.core.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MedicalRecordServiceTest {

    @Mock
    private MedicalRecordRepository medicalRecordRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private MedicalRecordService medicalRecordService;

    private User doctorUser;
    private Appointment appointment;
    private MedicalRecord draftRecord;

    @BeforeEach
    void setUp() {
        doctorUser = new User();
        doctorUser.setId("doctor-123");
        doctorUser.setEmail("medico@activeage.com");
        doctorUser.setFullName("Dr. Carlos Silva");
        doctorUser.setCrm("123456");
        doctorUser.setUfCrm("SP");
        doctorUser.setRole(Role.ROLE_MEDICO);

        appointment = Appointment.builder()
                .id("appt-999")
                .doctorId("doctor-123")
                .doctorName("Dr. Carlos Silva")
                .doctorCrm("123456")
                .doctorUfCrm("SP")
                .patientId("patient-456")
                .patientName("Dona Maria de Lourdes")
                .build();

        draftRecord = MedicalRecord.builder()
                .id("rec-001")
                .appointmentId("appt-999")
                .doctorId("doctor-123")
                .patientId("patient-456")
                .status("DRAFT")
                .build();
    }

    @Test
    @DisplayName("Deve inicializar rascunho de prontuário quando não existir registro prévio")
    void shouldInitDraftRecordWhenNotFound() {
        when(userRepository.findByEmail(doctorUser.getEmail())).thenReturn(Optional.of(doctorUser));
        when(appointmentRepository.findById(appointment.getId())).thenReturn(Optional.of(appointment));
        when(medicalRecordRepository.findByAppointmentId(appointment.getId())).thenReturn(Optional.empty());
        when(medicalRecordRepository.save(any(MedicalRecord.class))).thenAnswer(i -> i.getArgument(0));

        MedicalRecordResponse response = medicalRecordService.getOrInitRecord(doctorUser.getEmail(), appointment.getId());

        assertNotNull(response);
        assertEquals("DRAFT", response.getStatus());
        assertEquals(appointment.getId(), response.getAppointmentId());
        assertEquals(doctorUser.getFullName(), response.getDoctorName());
        verify(medicalRecordRepository, times(1)).save(any(MedicalRecord.class));
    }

    @Test
    @DisplayName("Deve salvar dados de Anamnese, AGA e CID-11 em modo rascunho com sucesso")
    void shouldSaveDraftSuccessfully() {
        MedicalRecordRequest request = MedicalRecordRequest.builder()
                .appointmentId(appointment.getId())
                .chiefComplaint("Tonturas esporádicas ao levantar-se da cama")
                .cognitiveStatus("Preservado")
                .mobilityRisk("Risco Moderado de Quedas")
                .cid11Code("MB40")
                .cid11Description("Sintomas e sinais relativos à cognição e percepção")
                .clinicalConduct("Adequação da dose de anti-hipertensivo e orientação de hidratação")
                .build();

        when(userRepository.findByEmail(doctorUser.getEmail())).thenReturn(Optional.of(doctorUser));
        when(appointmentRepository.findById(appointment.getId())).thenReturn(Optional.of(appointment));
        when(medicalRecordRepository.findByAppointmentId(appointment.getId())).thenReturn(Optional.of(draftRecord));
        when(medicalRecordRepository.save(any(MedicalRecord.class))).thenAnswer(i -> i.getArgument(0));

        MedicalRecordResponse response = medicalRecordService.saveDraft(doctorUser.getEmail(), request);

        assertNotNull(response);
        assertEquals("Tonturas esporádicas ao levantar-se da cama", response.getChiefComplaint());
        assertEquals("MB40", response.getCid11Code());
        assertEquals("DRAFT", response.getStatus());
        verify(medicalRecordRepository, times(1)).save(draftRecord);
    }

    @Test
    @DisplayName("Deve lançar IllegalStateException ao tentar alterar prontuário já FINALIZADO (Imutabilidade RN003)")
    void shouldThrowExceptionWhenModifyingFinalizedRecord() {
        draftRecord.setStatus("FINALIZED");

        MedicalRecordRequest request = MedicalRecordRequest.builder()
                .appointmentId(appointment.getId())
                .chiefComplaint("Tentativa de alteração pós-assinatura")
                .build();

        when(userRepository.findByEmail(doctorUser.getEmail())).thenReturn(Optional.of(doctorUser));
        when(appointmentRepository.findById(appointment.getId())).thenReturn(Optional.of(appointment));
        when(medicalRecordRepository.findByAppointmentId(appointment.getId())).thenReturn(Optional.of(draftRecord));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                medicalRecordService.saveDraft(doctorUser.getEmail(), request));

        assertTrue(ex.getMessage().contains("imutável"));
        verify(medicalRecordRepository, never()).save(any(MedicalRecord.class));
    }

    @Test
    @DisplayName("Deve finalizar e assinar prontuário com sucesso, gerando hash SHA-256 e gravando em audit_logs")
    void shouldFinalizeRecordSuccessfully() {
        when(userRepository.findByEmail(doctorUser.getEmail())).thenReturn(Optional.of(doctorUser));
        when(medicalRecordRepository.findById(draftRecord.getId())).thenReturn(Optional.of(draftRecord));
        when(medicalRecordRepository.save(any(MedicalRecord.class))).thenAnswer(i -> i.getArgument(0));

        MedicalRecordResponse response = medicalRecordService.finalizeRecord(doctorUser.getEmail(), draftRecord.getId());

        assertNotNull(response);
        assertEquals("FINALIZED", response.getStatus());
        assertNotNull(response.getFinalizedAt());
        assertNotNull(response.getHashSignature());
        assertTrue(response.getHashSignature().length() >= 32);

        verify(auditService, times(1)).log(
                eq(doctorUser.getId()),
                eq(doctorUser.getEmail()),
                eq("MEDICO"),
                eq("MEDICAL_RECORD_FINALIZED"),
                eq(draftRecord.getPatientId()),
                anyString(),
                anyString()
        );
    }
}
