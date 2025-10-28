package preaccountingsystem.repository;

import preaccountingsystem.entity.Invoice;
import preaccountingsystem.entity.InvoiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByCustomerId(Long customerId);
    
    List<Invoice> findByDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<Invoice> findByCustomerIdAndDateBetween(Long customerId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT SUM(i.amount) FROM Invoice i WHERE i.type = :type AND i.date BETWEEN :startDate AND :endDate")
    BigDecimal getSumOfAmountByTypeAndDateBetween(
            @Param("type") InvoiceType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.date BETWEEN :startDate AND :endDate")
    long countInvoicesByDateBetween(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
