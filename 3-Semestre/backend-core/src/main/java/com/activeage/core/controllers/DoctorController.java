package com.activeage.core.controllers;

import com.activeage.core.dtos.responses.DoctorPublicProfileResponse;
import com.activeage.core.services.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Controller REST para a Vitrine Informativa Neutra e Busca de Especialistas Geriátricos (UC08 / RF005).
 * Resolução CFM nº 2.336/2023: Acesso transparente e informativo sem mercantilização ou rankings de estrelas.
 */
@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    /**
     * Pesquisa médicos geriatras homologados com filtros opcionais objetivos.
     *
     * @param q      Termo de busca textual (nome, bio ou RQE).
     * @param uf     Filtro por Unidade Federativa do CRM.
     * @param focus  Filtro por foco clínico geriátrico.
     * @param maxFee Teto máximo de honorários.
     * @param sort   Ordenação objetiva (name_asc, name_desc, fee_asc, fee_desc).
     * @return Lista de perfis públicos de médicos homologados.
     */
    @GetMapping("/search")
    public ResponseEntity<List<DoctorPublicProfileResponse>> searchDoctors(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String uf,
            @RequestParam(required = false) String focus,
            @RequestParam(required = false) BigDecimal maxFee,
            @RequestParam(required = false, defaultValue = "name_asc") String sort
    ) {
        List<DoctorPublicProfileResponse> doctors = doctorService.searchApprovedDoctors(q, uf, focus, maxFee, sort);
        return ResponseEntity.ok(doctors);
    }

    /**
     * Obtém os detalhes públicos de um médico específico para exibição no perfil detalhado.
     *
     * @param id Identificador único do médico.
     * @return Perfil público do médico homologado.
     */
    @GetMapping("/{id}")
    public ResponseEntity<DoctorPublicProfileResponse> getDoctorById(@PathVariable String id) {
        DoctorPublicProfileResponse doctor = doctorService.getApprovedDoctorById(id);
        return ResponseEntity.ok(doctor);
    }
}
