package preaccountingsystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import preaccountingsystem.entity.AIAuditLog;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AIAuditLogRepository extends JpaRepository<AIAuditLog, Long> {

    // Get all logs for a company
    List<AIAuditLog> findByCompanyIdOrderByTimestampDesc(Long companyId);

    // Get logs for a specific user
    List<AIAuditLog> findByUserIdOrderByTimestampDesc(Long userId);

    // Count queries by company in a time range (for daily/monthly limits)
    @Query("SELECT COUNT(a) FROM AIAuditLog a WHERE a.company.id = :companyId AND a.timestamp >= :startTime")
    Long countByCompanyIdAndTimestampAfter(
            @Param("companyId") Long companyId,
            @Param("startTime") LocalDateTime startTime);

    // Get recent logs for context building
    @Query("SELECT a FROM AIAuditLog a WHERE a.company.id = :companyId " +
           "ORDER BY a.timestamp DESC")
    List<AIAuditLog> findRecentByCompanyId(@Param("companyId") Long companyId);
}
