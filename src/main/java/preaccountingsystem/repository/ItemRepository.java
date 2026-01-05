package preaccountingsystem.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import preaccountingsystem.entity.Item;
import preaccountingsystem.entity.ItemStatus;
import preaccountingsystem.entity.ItemType;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Item entity with custom query methods.
 * Supports filtering, searching, and pagination.
 */
@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {

    /**
     * Find all items belonging to a specific company
     */
    List<Item> findByCompanyId(Long companyId);

    /**
     * Find all items belonging to a specific company with pagination
     */
    Page<Item> findByCompanyId(Long companyId, Pageable pageable);

    /**
     * Find item by ID and company (for security - ensures user can only access their company's items)
     */
    Optional<Item> findByIdAndCompanyId(Long id, Long companyId);

    /**
     * Find all active items for a company (for dropdown selections in forms)
     */
    List<Item> findByCompanyIdAndStatus(Long companyId, ItemStatus status);

    /**
     * Search items by name or description with company filter
     */
    @Query("SELECT i FROM Item i WHERE i.company.id = :companyId " +
            "AND (LOWER(i.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Item> searchByCompany(@Param("companyId") Long companyId,
                                @Param("search") String search,
                                Pageable pageable);

    /**
     * Advanced filter: search + type + status + category
     */
    @Query("SELECT i FROM Item i WHERE i.company.id = :companyId " +
            "AND (:search IS NULL OR LOWER(i.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND (:type IS NULL OR i.type = :type) " +
            "AND (:status IS NULL OR i.status = :status) " +
            "AND (:category IS NULL OR i.category = :category)")
    Page<Item> findByFilters(@Param("companyId") Long companyId,
                              @Param("search") String search,
                              @Param("type") ItemType type,
                              @Param("status") ItemStatus status,
                              @Param("category") String category,
                              Pageable pageable);

    /**
     * Get all unique categories for a company (for filter dropdown)
     */
    @Query("SELECT DISTINCT i.category FROM Item i WHERE i.company.id = :companyId ORDER BY i.category")
    List<String> findDistinctCategoriesByCompanyId(@Param("companyId") Long companyId);

    /**
     * Count items by company
     */
    long countByCompanyId(Long companyId);

    /**
     * Count items by company and status
     */
    long countByCompanyIdAndStatus(Long companyId, ItemStatus status);

    /**
     * Count items by company and type
     */
    long countByCompanyIdAndType(Long companyId, ItemType type);
}
