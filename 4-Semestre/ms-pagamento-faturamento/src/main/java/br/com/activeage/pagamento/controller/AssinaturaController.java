package br.com.activeage.pagamento.controller;

import br.com.activeage.pagamento.model.dto.ApiResponseWrapper;
import br.com.activeage.pagamento.model.dto.AssinaturaResponse;
import br.com.activeage.pagamento.service.IAssinaturaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador RESTful Magro para consulta e gestão de assinaturas SaaS dos médicos geriatras.
 */
@RestController
@RequestMapping("/api/v1/assinaturas")
@RequiredArgsConstructor
@Tag(name = "Assinaturas SaaS", description = "Gestão de assinaturas mensais de consultório virtual para médicos")
public class AssinaturaController {

    private final IAssinaturaService assinaturaService;

    @GetMapping("/medico/{doctorId}")
    @Operation(summary = "Consulta o status da assinatura SaaS e degustação do médico")
    public ResponseEntity<ApiResponseWrapper<AssinaturaResponse>> buscarPorMedico(@PathVariable String doctorId) {
        AssinaturaResponse response = assinaturaService.buscarPorMedico(doctorId);
        return ResponseEntity.ok(ApiResponseWrapper.success("Dados de assinatura localizados com sucesso.", response));
    }

    @PostMapping("/medico/{doctorId}/cancelar")
    @Operation(summary = "Cancela a renovação da assinatura SaaS do médico")
    public ResponseEntity<ApiResponseWrapper<AssinaturaResponse>> cancelarAssinatura(@PathVariable String doctorId) {
        AssinaturaResponse response = assinaturaService.cancelarAssinatura(doctorId);
        return ResponseEntity.ok(ApiResponseWrapper.success("Assinatura cancelada com sucesso.", response));
    }
}
