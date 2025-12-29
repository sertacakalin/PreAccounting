package preaccountingsystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import preaccountingsystem.entity.Payment;
import preaccountingsystem.entity.PaymentType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Tenant-aware queries
    List<Payment> findByCompanyId(Long companyId);

    Optional<Payment> findByIdAndCompanyId(Long id, Long companyId);

    // Filter by type
    List<Payment> findByCompanyIdAndType(Long companyId, PaymentType type);

    // Filter by date range
    List<Payment> findByCompanyIdAndPaymentDateBetween(Long companyId, LocalDate startDate, LocalDate endDate);

    // Filter by customer/supplier
    List<Payment> findByCompanyIdAndCustomerSupplierId(Long companyId, Long customerSupplierId);

    // Get payments for a specific invoice
    List<Payment> findByInvoiceId(Long invoiceId);

    // Calculate total payments for an invoice
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.invoice.id = :invoiceId")
    BigDecimal getTotalPaymentsByInvoiceId(Long invoiceId);
}
