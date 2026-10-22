package com.activeage.core.repositories;

import com.activeage.core.domain.models.AuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositório para persistência e consulta da Trilha de Auditoria (audit_logs).
 */
@Repository
public interface AuditLogRepository extends MongoRepository<AuditLog, String> {

    List<AuditLog> findByTargetUserIdOrderByTimestampDesc(String targetUserId);

    List<AuditLog> findTop50ByOrderByTimestampDesc();
}
