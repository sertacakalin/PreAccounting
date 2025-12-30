package preaccountingsystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import preaccountingsystem.entity.CategoryType;
import preaccountingsystem.entity.IncomeExpense;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface IncomeExpenseRepository extends JpaRepository<IncomeExpense, Long> {

    // Tenant-aware queries
    List<IncomeExpense> findByCompanyId(Long companyId);

    Optional<IncomeExpense> findByIdAndCompanyId(Long id, Long companyId);

    // Filter by category
    List<IncomeExpense> findByCompanyIdAndCategoryId(Long companyId, Long categoryId);

    // Filter by date range
    List<IncomeExpense> findByCompanyIdAndDateBetween(Long companyId, LocalDate startDate, LocalDate endDate);

    // Filter by category and date range
    List<IncomeExpense> findByCompanyIdAndCategoryIdAndDateBetween(
            Long companyId, Long categoryId, LocalDate startDate, LocalDate endDate);

    // Dashboard queries - optimized aggregations
    @Query("SELECT COALESCE(SUM(ie.amount), 0) FROM IncomeExpense ie " +
           "WHERE ie.company.id = :companyId " +
           "AND ie.category.type = :categoryType " +
           "AND ie.date BETWEEN :startDate AND :endDate")
    BigDecimal sumByCompanyIdAndCategoryTypeAndDateBetween(
            @Param("companyId") Long companyId,
            @Param("categoryType") CategoryType categoryType,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT ie.category.id, ie.category.name, SUM(ie.amount) " +
           "FROM IncomeExpense ie " +
           "WHERE ie.company.id = :companyId " +
           "AND ie.category.type = 'EXPENSE' " +
           "AND ie.date BETWEEN :startDate AND :endDate " +
           "GROUP BY ie.category.id, ie.category.name " +
           "ORDER BY SUM(ie.amount) DESC")
    List<Object[]> getExpenseDistribution(
            @Param("companyId") Long companyId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
