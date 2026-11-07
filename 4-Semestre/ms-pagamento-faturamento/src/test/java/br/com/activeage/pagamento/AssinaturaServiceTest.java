package br.com.activeage.pagamento;

import br.com.activeage.pagamento.model.dto.AssinaturaResponse;
import br.com.activeage.pagamento.model.entity.AssinaturaMedico;
import br.com.activeage.pagamento.model.enums.StatusAssinatura;
import br.com.activeage.pagamento.repository.IAssinaturaRepository;
import br.com.activeage.pagamento.service.impl.AssinaturaServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AssinaturaServiceTest {

    @Mock
    private IAssinaturaRepository assinaturaRepository;

    @InjectMocks
    private AssinaturaServiceImpl assinaturaService;

    @Test
    @DisplayName("PCE: Deve retornar assinatura ativa existente do médico")
    void shouldReturnExistingActiveSubscription() {
        AssinaturaMedico assinatura = AssinaturaMedico.builder()
                .id(1L)
                .doctorId("DOC-1")
                .doctorEmail("medico@activeage.com")
                .doctorNome("Dr. Alan Turing")
                .planoNome("Consultorio Digital Ativo")
                .valorMensal(BigDecimal.valueOf(149.90))
                .status(StatusAssinatura.ATIVA)
                .inicioCiclo(LocalDateTime.now())
                .fimCiclo(LocalDateTime.now().plusMonths(1))
                .build();

        when(assinaturaRepository.findByDoctorId("DOC-1")).thenReturn(Optional.of(assinatura));

        AssinaturaResponse response = assinaturaService.buscarPorMedico("DOC-1");

        assertNotNull(response);
        assertEquals(StatusAssinatura.ATIVA, response.getStatus());
        assertEquals("DOC-1", response.getDoctorId());
    }

    @Test
    @DisplayName("PCE: Deve retornar status TRIAL padrão quando o médico não possuir contrato formalizado")
    void shouldReturnTrialStatusWhenNoSubscriptionRecordExists() {
        when(assinaturaRepository.findByDoctorId("DOC-NEW")).thenReturn(Optional.empty());

        AssinaturaResponse response = assinaturaService.buscarPorMedico("DOC-NEW");

        assertNotNull(response);
        assertEquals(StatusAssinatura.TRIAL, response.getStatus());
        assertEquals("DOC-NEW", response.getDoctorId());
    }

    @Test
    @DisplayName("TFS: Deve ativar assinatura do médico por 1 mês")
    void shouldActivateSubscriptionForOneMonth() {
        when(assinaturaRepository.findByDoctorId("DOC-1")).thenReturn(Optional.empty());
        when(assinaturaRepository.save(any(AssinaturaMedico.class))).thenAnswer(inv -> inv.getArgument(0));

        AssinaturaResponse response = assinaturaService.ativarAssinatura("DOC-1", "doc@teste.com", "Dr. Turing", 1);

        assertNotNull(response);
        assertEquals(StatusAssinatura.ATIVA, response.getStatus());
        assertNotNull(response.getFimCiclo());
        verify(assinaturaRepository).save(any(AssinaturaMedico.class));
    }

    @Test
    @DisplayName("TFS: Deve cancelar assinatura do médico")
    void shouldCancelSubscription() {
        AssinaturaMedico ativa = AssinaturaMedico.builder()
                .id(1L)
                .doctorId("DOC-1")
                .status(StatusAssinatura.ATIVA)
                .build();

        when(assinaturaRepository.findByDoctorId("DOC-1")).thenReturn(Optional.of(ativa));
        when(assinaturaRepository.save(any(AssinaturaMedico.class))).thenAnswer(inv -> inv.getArgument(0));

        AssinaturaResponse response = assinaturaService.cancelarAssinatura("DOC-1");

        assertEquals(StatusAssinatura.CANCELADA, response.getStatus());
        verify(assinaturaRepository).save(ativa);
    }
}
