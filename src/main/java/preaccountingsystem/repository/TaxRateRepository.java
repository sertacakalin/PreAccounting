package preaccountingsystem.repository;

import preaccountingsystem.entity.TaxRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaxRateRepository extends JpaRepository<TaxRate, Long> {

    Optional<TaxRate> findByCode(String code);

    List<TaxRate> findByActive(Boolean active);

    boolean existsByCode(String code);
}
