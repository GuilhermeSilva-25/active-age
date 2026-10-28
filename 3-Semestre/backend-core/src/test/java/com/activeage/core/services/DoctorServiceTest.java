package com.activeage.core.services;

import com.activeage.core.domain.enums.DoctorDossierStatus;
import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.responses.DoctorPublicProfileResponse;
import com.activeage.core.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoctorServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DoctorService doctorService;

    private User doctorAda;
    private User doctorAlan;
    private User doctorGrace;

    @BeforeEach
    void setUp() {
        doctorAda = new User();
        doctorAda.setId("doc-1");
        doctorAda.setFullName("Dra. Ada Lovelace");
        doctorAda.setRole(Role.ROLE_MEDICO);
        doctorAda.setActive(true);
        doctorAda.setDossierStatus(DoctorDossierStatus.APPROVED);
        doctorAda.setCrm("123456");
        doctorAda.setUfCrm("SP");
        doctorAda.setRqe("45892");
        doctorAda.setBio("Pioneira no desenvolvimento de algoritmos de avaliação geriátrica ampla.");
        doctorAda.setClinicalFocus(List.of("Avaliação Geriátrica Ampla (AGA)", "Longevidade Ativa"));
        doctorAda.setConsultationFee(new BigDecimal("250.00"));
        doctorAda.setConsultationDurationMinutes(60);

        doctorAlan = new User();
        doctorAlan.setId("doc-2");
        doctorAlan.setFullName("Dr. Alan Turing");
        doctorAlan.setRole(Role.ROLE_MEDICO);
        doctorAlan.setActive(true);
        doctorAlan.setDossierStatus(DoctorDossierStatus.APPROVED);
        doctorAlan.setCrm("654321");
        doctorAlan.setUfCrm("SP");
        doctorAlan.setRqe("78910");
        doctorAlan.setBio("Especialista em neurociências cognitivas e rastreamento de demências.");
        doctorAlan.setClinicalFocus(List.of("Memória e Demências", "Polifarmácia & Desprescrição"));
        doctorAlan.setConsultationFee(new BigDecimal("220.00"));
        doctorAlan.setConsultationDurationMinutes(50);

        doctorGrace = new User();
        doctorGrace.setId("doc-3");
        doctorGrace.setFullName("Dra. Grace Hopper");
        doctorGrace.setRole(Role.ROLE_MEDICO);
        doctorGrace.setActive(true);
        doctorGrace.setDossierStatus(DoctorDossierStatus.APPROVED);
        doctorGrace.setCrm("112233");
        doctorGrace.setUfCrm("RJ");
        doctorGrace.setRqe("33211");
        doctorGrace.setBio("Referência na prevenção de quedas e mobilidade segura.");
        doctorGrace.setClinicalFocus(List.of("Prevenção de Quedas", "Cuidados Paliativos"));
        doctorGrace.setConsultationFee(new BigDecimal("280.00"));
        doctorGrace.setConsultationDurationMinutes(60);
    }

    @Test
    @DisplayName("Deve retornar todos os médicos homologados sem filtros ativos")
    void testSearchAllApprovedDoctors() {
        when(userRepository.findByRoleAndActiveAndDossierStatus(Role.ROLE_MEDICO, true, DoctorDossierStatus.APPROVED))
                .thenReturn(List.of(doctorAda, doctorAlan, doctorGrace));

        List<DoctorPublicProfileResponse> results = doctorService.searchApprovedDoctors(null, null, null, null, "name_asc");

        assertEquals(3, results.size());
        assertEquals("Dr. Alan Turing", results.get(0).getFullName());
        assertEquals("Dra. Ada Lovelace", results.get(1).getFullName());
        assertEquals("Dra. Grace Hopper", results.get(2).getFullName());
    }

    @Test
    @DisplayName("Deve filtrar médicos por Unidade Federativa (UF)")
    void testFilterByUf() {
        when(userRepository.findByRoleAndActiveAndDossierStatus(Role.ROLE_MEDICO, true, DoctorDossierStatus.APPROVED))
                .thenReturn(List.of(doctorAda, doctorAlan, doctorGrace));

        List<DoctorPublicProfileResponse> results = doctorService.searchApprovedDoctors(null, "RJ", null, null, "name_asc");

        assertEquals(1, results.size());
        assertEquals("Dra. Grace Hopper", results.get(0).getFullName());
        assertEquals("RJ", results.get(0).getUfCrm());
    }

    @Test
    @DisplayName("Deve filtrar médicos por Área de Foco Clínico")
    void testFilterByClinicalFocus() {
        when(userRepository.findByRoleAndActiveAndDossierStatus(Role.ROLE_MEDICO, true, DoctorDossierStatus.APPROVED))
                .thenReturn(List.of(doctorAda, doctorAlan, doctorGrace));

        List<DoctorPublicProfileResponse> results = doctorService.searchApprovedDoctors(null, null, "Memória", null, "name_asc");

        assertEquals(1, results.size());
        assertEquals("Dr. Alan Turing", results.get(0).getFullName());
    }

    @Test
    @DisplayName("Deve filtrar médicos por termo textual de busca (q)")
    void testSearchByQueryTerm() {
        when(userRepository.findByRoleAndActiveAndDossierStatus(Role.ROLE_MEDICO, true, DoctorDossierStatus.APPROVED))
                .thenReturn(List.of(doctorAda, doctorAlan, doctorGrace));

        List<DoctorPublicProfileResponse> results = doctorService.searchApprovedDoctors("Lovelace", null, null, null, "name_asc");

        assertEquals(1, results.size());
        assertEquals("Dra. Ada Lovelace", results.get(0).getFullName());
    }

    @Test
    @DisplayName("Deve ordenar médicos por Menor Valor de Consulta (fee_asc)")
    void testSortByFeeAscending() {
        when(userRepository.findByRoleAndActiveAndDossierStatus(Role.ROLE_MEDICO, true, DoctorDossierStatus.APPROVED))
                .thenReturn(List.of(doctorAda, doctorAlan, doctorGrace));

        List<DoctorPublicProfileResponse> results = doctorService.searchApprovedDoctors(null, null, null, null, "fee_asc");

        assertEquals(3, results.size());
        assertEquals("Dr. Alan Turing", results.get(0).getFullName()); // 220.00
        assertEquals("Dra. Ada Lovelace", results.get(1).getFullName()); // 250.00
        assertEquals("Dra. Grace Hopper", results.get(2).getFullName()); // 280.00
    }

    @Test
    @DisplayName("Deve retornar perfil público por ID quando homologado e ativo")
    void testGetApprovedDoctorByIdSuccess() {
        when(userRepository.findById("doc-1")).thenReturn(Optional.of(doctorAda));

        DoctorPublicProfileResponse response = doctorService.getApprovedDoctorById("doc-1");

        assertNotNull(response);
        assertEquals("Dra. Ada Lovelace", response.getFullName());
        assertEquals("123456", response.getCrm());
    }

    @Test
    @DisplayName("Deve lançar exceção ao buscar médico não homologado ou inativo por ID")
    void testGetApprovedDoctorByIdThrowsWhenInactive() {
        doctorAda.setActive(false);
        when(userRepository.findById("doc-1")).thenReturn(Optional.of(doctorAda));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> doctorService.getApprovedDoctorById("doc-1"));

        assertTrue(ex.getMessage().contains("não está disponível para consultas públicas"));
    }
}
