package com.activeage.core.controllers;

import com.activeage.core.domain.enums.DoctorSubscriptionStatus;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.responses.AppointmentResponse;
import com.activeage.core.repositories.UserRepository;
import com.activeage.core.services.AppointmentService;
import com.activeage.core.services.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Endpoints internos para callbacks entre microsserviços (ms-pagamento -> backend-core) (SPEC-17).
 */
@Slf4j
@RestController
@RequestMapping("/api/internal")
@RequiredArgsConstructor
@Tag(name = "Internal Callback", description = "Endpoints perimetrais para integração entre microsserviços")
public class InternalCallbackController {

    private final AppointmentService appointmentService;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @PatchMapping("/appointments/{appointmentId}/confirm-payment")
    @Operation(summary = "Confirmação de pagamento de consulta recebida do ms-pagamento")
    public ResponseEntity<AppointmentResponse> confirmPayment(@PathVariable String appointmentId) {
        log.info("Callback interno recebido: confirmPayment para consulta {}", appointmentId);
        AppointmentResponse response = appointmentService.confirmPayment(appointmentId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/appointments/{appointmentId}/cancel-expired")
    @Operation(summary = "Cancelamento de consulta por expiração de pagamento")
    public ResponseEntity<AppointmentResponse> cancelExpiredPayment(@PathVariable String appointmentId) {
        log.info("Callback interno recebido: cancelExpiredPayment para consulta {}", appointmentId);
        AppointmentResponse response = appointmentService.cancelExpiredPayment(appointmentId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/doctors/{doctorId}/activate-subscription")
    @Operation(summary = "Ativação de assinatura SaaS do médico após liquidação")
    public ResponseEntity<Map<String, Object>> activateDoctorSubscription(@PathVariable String doctorId) {
        log.info("Callback interno recebido: activateDoctorSubscription para médico {}", doctorId);

        User doctor = userRepository.findById(doctorId)
                .or(() -> userRepository.findByEmail(doctorId))
                .orElseThrow(() -> new IllegalArgumentException("Médico não encontrado com ID: " + doctorId));

        LocalDateTime agora = LocalDateTime.now();
        doctor.setSubscriptionStatus(DoctorSubscriptionStatus.ASSINATURA_ATIVA);
        doctor.setSubscriptionExpiresAt(agora.plusMonths(1));
        userRepository.save(doctor);

        auditService.log(
                doctor.getId(),
                doctor.getEmail(),
                "ROLE_MEDICO",
                "SUBSCRIPTION_RENEWED",
                doctor.getId(),
                "Assinatura SaaS mensal ativada via gateway de pagamento com sucesso.",
                "INTERNAL_SERVICE"
        );

        return ResponseEntity.ok(Map.of(
                "status", "ACTIVE",
                "doctorId", doctorId,
                "subscriptionExpiresAt", doctor.getSubscriptionExpiresAt()
        ));
    }
}
