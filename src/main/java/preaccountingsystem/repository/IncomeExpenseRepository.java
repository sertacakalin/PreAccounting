package preaccountingsystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import preaccountingsystem.entity.IncomeExpense;

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
}
