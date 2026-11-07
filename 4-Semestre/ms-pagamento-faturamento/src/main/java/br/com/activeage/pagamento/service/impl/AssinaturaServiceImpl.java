package br.com.activeage.pagamento.service.impl;

import br.com.activeage.pagamento.exception.PagamentoException;
import br.com.activeage.pagamento.model.dto.AssinaturaResponse;
import br.com.activeage.pagamento.model.entity.AssinaturaMedico;
import br.com.activeage.pagamento.model.enums.StatusAssinatura;
import br.com.activeage.pagamento.repository.IAssinaturaRepository;
import br.com.activeage.pagamento.service.IAssinaturaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Implementação do Serviço de Assinaturas SaaS de Consultório Virtual (DIP / Thomas Erl).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AssinaturaServiceImpl implements IAssinaturaService {

    private final IAssinaturaRepository assinaturaRepository;

    @Value("${activeage.saas.plano-mensal-valor:149.90}")
    private BigDecimal valorPlanoPadrao;

    @Value("${activeage.saas.plano-nome:Consultorio Digital Ativo}")
    private String nomePlanoPadrao;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "assinaturasMedicas", key = "#doctorId")
    public AssinaturaResponse buscarPorMedico(String doctorId) {
        log.info("Buscando dados de assinatura para o médico ID: {}", doctorId);
        return assinaturaRepository.findByDoctorId(doctorId)
                .map(this::mapToResponse)
                .orElseGet(() -> AssinaturaResponse.builder()
                        .doctorId(doctorId)
                        .planoNome(nomePlanoPadrao)
                        .valorMensal(valorPlanoPadrao)
                        .status(StatusAssinatura.TRIAL)
                        .build());
    }

    @Override
    @Transactional
    @CacheEvict(value = "assinaturasMedicas", key = "#doctorId")
    public AssinaturaResponse ativarAssinatura(String doctorId, String doctorEmail, String doctorNome, int mesesValidade) {
        log.info("Ativando assinatura do médico ID: {} por {} meses", doctorId, mesesValidade);

        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime fimCiclo = agora.plusMonths(mesesValidade);

        AssinaturaMedico assinatura = assinaturaRepository.findByDoctorId(doctorId)
                .orElseGet(() -> AssinaturaMedico.builder()
                        .doctorId(doctorId)
                        .doctorEmail(doctorEmail != null ? doctorEmail : "medico@activeage.com")
                        .doctorNome(doctorNome != null ? doctorNome : "Médico Geriatra")
                        .planoNome(nomePlanoPadrao)
                        .valorMensal(valorPlanoPadrao)
                        .createdAt(agora)
                        .build());

        assinatura.setStatus(StatusAssinatura.ATIVA);
        assinatura.setInicioCiclo(agora);
        assinatura.setFimCiclo(fimCiclo);
        assinatura.setDataProximaCobranca(fimCiclo);
        assinatura.setUpdatedAt(agora);

        AssinaturaMedico salva = assinaturaRepository.save(assinatura);
        log.info("Assinatura do médico {} ativada com sucesso até {}", doctorId, fimCiclo);
        return mapToResponse(salva);
    }

    @Override
    @Transactional
    @CacheEvict(value = "assinaturasMedicas", key = "#doctorId")
    public AssinaturaResponse cancelarAssinatura(String doctorId) {
        log.info("Cancelando assinatura do médico ID: {}", doctorId);

        AssinaturaMedico assinatura = assinaturaRepository.findByDoctorId(doctorId)
                .orElseThrow(() -> new PagamentoException("Assinatura não encontrada para o médico: " + doctorId, HttpStatus.NOT_FOUND));

        assinatura.setStatus(StatusAssinatura.CANCELADA);
        assinatura.setUpdatedAt(LocalDateTime.now());
        AssinaturaMedico salva = assinaturaRepository.save(assinatura);
        return mapToResponse(salva);
    }

    private AssinaturaResponse mapToResponse(AssinaturaMedico a) {
        return AssinaturaResponse.builder()
                .id(a.getId())
                .doctorId(a.getDoctorId())
                .doctorEmail(a.getDoctorEmail())
                .doctorNome(a.getDoctorNome())
                .planoNome(a.getPlanoNome())
                .valorMensal(a.getValorMensal())
                .status(a.getStatus())
                .mpPreapprovalId(a.getMpPreapprovalId())
                .inicioCiclo(a.getInicioCiclo())
                .fimCiclo(a.getFimCiclo())
                .dataProximaCobranca(a.getDataProximaCobranca())
                .build();
    }
}
