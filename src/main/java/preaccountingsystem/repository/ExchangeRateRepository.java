package preaccountingsystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import preaccountingsystem.entity.ExchangeRate;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExchangeRateRepository extends JpaRepository<ExchangeRate, Long> {

    Optional<ExchangeRate> findByFromCurrencyAndToCurrencyAndRateDate(
            String fromCurrency, String toCurrency, LocalDate rateDate);

    @Query("SELECT e FROM ExchangeRate e WHERE e.fromCurrency = :fromCurrency " +
           "AND e.toCurrency = :toCurrency AND e.rateDate <= :date " +
           "ORDER BY e.rateDate DESC LIMIT 1")
    Optional<ExchangeRate> findLatestRate(String fromCurrency, String toCurrency, LocalDate date);

    List<ExchangeRate> findByFromCurrencyAndRateDate(String fromCurrency, LocalDate rateDate);

    @Query("SELECT DISTINCT e.fromCurrency FROM ExchangeRate e WHERE e.rateDate = :date")
    List<String> findDistinctBaseCurrenciesByDate(LocalDate date);
}
