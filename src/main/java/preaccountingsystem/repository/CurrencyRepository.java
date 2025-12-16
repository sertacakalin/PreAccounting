package preaccountingsystem.repository;

import preaccountingsystem.entity.Currency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CurrencyRepository extends JpaRepository<Currency, Long> {

    Optional<Currency> findByCode(String code);

    List<Currency> findByActive(Boolean active);

    Optional<Currency> findByIsDefault(Boolean isDefault);

    boolean existsByCode(String code);
}
