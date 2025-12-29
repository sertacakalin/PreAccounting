package preaccountingsystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import preaccountingsystem.entity.Invoice;
import preaccountingsystem.entity.InvoiceStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    // Tenant-aware queries
    List<Invoice> findByCompanyId(Long companyId);

    Optional<Invoice> findByIdAndCompanyId(Long id, Long companyId);

    // Find by invoice number (for uniqueness check)
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    // Filter by status
    List<Invoice> findByCompanyIdAndStatus(Long companyId, InvoiceStatus status);

    // Find unpaid invoices
    List<Invoice> findByCompanyIdAndStatusIn(Long companyId, List<InvoiceStatus> statuses);

    // Get the last invoice number for auto-generation
    @Query("SELECT i FROM Invoice i WHERE i.company.id = :companyId ORDER BY i.createdAt DESC")
    List<Invoice> findLatestByCompanyId(Long companyId);
}
