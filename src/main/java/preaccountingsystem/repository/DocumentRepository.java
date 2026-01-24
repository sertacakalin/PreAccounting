package preaccountingsystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import preaccountingsystem.entity.Document;
import preaccountingsystem.entity.DocumentStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Document entity
 */
@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    /**
     * Find document by ID and company ID (for tenant isolation)
     */
    Optional<Document> findByIdAndCompanyId(Long id, Long companyId);

    /**
     * Find all documents for a company
     */
    List<Document> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

    /**
     * Find documents by status
     */
    List<Document> findByCompanyIdAndStatus(Long companyId, DocumentStatus status);

    /**
     * Find documents by status and company
     */
    List<Document> findByCompanyIdAndStatusOrderByCreatedAtDesc(Long companyId, DocumentStatus status);

    /**
     * Count documents by company and status
     */
    long countByCompanyIdAndStatus(Long companyId, DocumentStatus status);

    /**
     * Find documents uploaded in date range
     */
    @Query("SELECT d FROM Document d WHERE d.company.id = :companyId " +
           "AND d.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY d.createdAt DESC")
    List<Document> findByCompanyIdAndDateRange(
        @Param("companyId") Long companyId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    /**
     * Get documents needing processing
     */
    List<Document> findByStatusIn(List<DocumentStatus> statuses);
}
