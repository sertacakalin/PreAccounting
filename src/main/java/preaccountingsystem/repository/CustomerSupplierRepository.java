package preaccountingsystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import preaccountingsystem.entity.CustomerSupplier;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerSupplierRepository extends JpaRepository<CustomerSupplier, Long> {

    // Tenant isolation - only get records for specific company
    List<CustomerSupplier> findByCompanyId(Long companyId);

    Optional<CustomerSupplier> findByIdAndCompanyId(Long id, Long companyId);

    List<CustomerSupplier> findByCompanyIdAndIsCustomerTrue(Long companyId);

    List<CustomerSupplier> findByCompanyIdAndIsCustomerFalse(Long companyId);
}
