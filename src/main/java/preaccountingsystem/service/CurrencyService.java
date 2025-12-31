package preaccountingsystem.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import preaccountingsystem.dto.CurrencyConversionDto;
import preaccountingsystem.dto.CurrencyDto;
import preaccountingsystem.dto.ExchangeRateDto;
import preaccountingsystem.entity.Currency;
import preaccountingsystem.entity.ExchangeRate;
import preaccountingsystem.repository.CurrencyRepository;
import preaccountingsystem.repository.ExchangeRateRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CurrencyService {

    private final CurrencyRepository currencyRepository;
    private final ExchangeRateRepository exchangeRateRepository;
    private final ExchangeRateApiService exchangeRateApiService;

    /**
     * Initialize default currencies in the database
     */
    @Transactional
    public void initializeDefaultCurrencies() {
        if (currencyRepository.count() == 0) {
            log.info("Initializing default currencies");

            Currency usd = new Currency(null, "USD", "US Dollar", "$", true, null, null);
            Currency eur = new Currency(null, "EUR", "Euro", "€", true, null, null);
            Currency gbp = new Currency(null, "GBP", "British Pound", "£", true, null, null);
            Currency try_ = new Currency(null, "TRY", "Turkish Lira", "₺", true, null, null);
            Currency jpy = new Currency(null, "JPY", "Japanese Yen", "¥", true, null, null);
            Currency chf = new Currency(null, "CHF", "Swiss Franc", "CHF", true, null, null);
            Currency cad = new Currency(null, "CAD", "Canadian Dollar", "C$", true, null, null);
            Currency aud = new Currency(null, "AUD", "Australian Dollar", "A$", true, null, null);

            currencyRepository.saveAll(List.of(usd, eur, gbp, try_, jpy, chf, cad, aud));
            log.info("Default currencies initialized");
        }
    }

    /**
     * Get all active currencies
     */
    public List<CurrencyDto> getAllActiveCurrencies() {
        return currencyRepository.findByIsActiveTrue().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all currencies
     */
    public List<CurrencyDto> getAllCurrencies() {
        return currencyRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Create a new currency
     */
    @Transactional
    public CurrencyDto createCurrency(CurrencyDto currencyDto) {
        if (currencyRepository.existsByCode(currencyDto.getCode())) {
            throw new RuntimeException("Currency with code " + currencyDto.getCode() + " already exists");
        }

        Currency currency = new Currency();
        currency.setCode(currencyDto.getCode().toUpperCase());
        currency.setName(currencyDto.getName());
        currency.setSymbol(currencyDto.getSymbol());
        currency.setIsActive(currencyDto.getIsActive() != null ? currencyDto.getIsActive() : true);

        return convertToDto(currencyRepository.save(currency));
    }

    /**
     * Update currency status
     */
    @Transactional
    public CurrencyDto updateCurrencyStatus(Long id, Boolean isActive) {
        Currency currency = currencyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Currency not found"));

        currency.setIsActive(isActive);
        return convertToDto(currencyRepository.save(currency));
    }

    /**
     * Fetch and save latest exchange rates from API
     */
    @Transactional
    public void updateExchangeRates(String baseCurrency) {
        log.info("Updating exchange rates for base currency: {}", baseCurrency);

        Map<String, BigDecimal> rates = exchangeRateApiService.fetchLatestRates(baseCurrency);
        LocalDate today = LocalDate.now();

        for (Map.Entry<String, BigDecimal> entry : rates.entrySet()) {
            String targetCurrency = entry.getKey();
            BigDecimal rate = entry.getValue();

            // Check if rate already exists for today
            var existing = exchangeRateRepository.findByFromCurrencyAndToCurrencyAndRateDate(
                    baseCurrency, targetCurrency, today);

            if (existing.isPresent()) {
                // Update existing rate
                ExchangeRate exchangeRate = existing.get();
                exchangeRate.setRate(rate);
                exchangeRate.setSource("ExchangeRate-API");
                exchangeRateRepository.save(exchangeRate);
            } else {
                // Create new rate
                ExchangeRate exchangeRate = new ExchangeRate();
                exchangeRate.setFromCurrency(baseCurrency);
                exchangeRate.setToCurrency(targetCurrency);
                exchangeRate.setRate(rate);
                exchangeRate.setRateDate(today);
                exchangeRate.setSource("ExchangeRate-API");
                exchangeRateRepository.save(exchangeRate);
            }
        }

        log.info("Updated {} exchange rates for {}", rates.size(), baseCurrency);
    }

    /**
     * Update exchange rates for all active currencies
     */
    @Transactional
    public void updateAllExchangeRates() {
        List<Currency> activeCurrencies = currencyRepository.findByIsActiveTrue();

        // Update rates for USD as base (most common)
        updateExchangeRates("USD");

        log.info("Exchange rates updated for all currencies");
    }

    /**
     * Get exchange rate between two currencies
     */
    public BigDecimal getExchangeRate(String fromCurrency, String toCurrency, LocalDate date) {
        if (fromCurrency.equals(toCurrency)) {
            return BigDecimal.ONE;
        }

        // Try to get from database first
        var rate = exchangeRateRepository.findLatestRate(fromCurrency, toCurrency, date);

        if (rate.isPresent()) {
            return rate.get().getRate();
        }

        // If not found in database, fetch from API
        log.info("Exchange rate not found in database, fetching from API");
        BigDecimal apiRate = exchangeRateApiService.getExchangeRate(fromCurrency, toCurrency);

        if (apiRate != null) {
            // Save to database for future use
            ExchangeRate exchangeRate = new ExchangeRate();
            exchangeRate.setFromCurrency(fromCurrency);
            exchangeRate.setToCurrency(toCurrency);
            exchangeRate.setRate(apiRate);
            exchangeRate.setRateDate(date);
            exchangeRate.setSource("ExchangeRate-API");
            exchangeRateRepository.save(exchangeRate);

            return apiRate;
        }

        throw new RuntimeException("Exchange rate not found for " + fromCurrency + " to " + toCurrency);
    }

    /**
     * Convert amount from one currency to another
     */
    public CurrencyConversionDto convertCurrency(String fromCurrency, String toCurrency,
                                                  BigDecimal amount, LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }

        BigDecimal rate = getExchangeRate(fromCurrency, toCurrency, date);
        BigDecimal convertedAmount = amount.multiply(rate).setScale(2, RoundingMode.HALF_UP);

        CurrencyConversionDto dto = new CurrencyConversionDto();
        dto.setFromCurrency(fromCurrency);
        dto.setToCurrency(toCurrency);
        dto.setAmount(amount);
        dto.setConvertedAmount(convertedAmount);
        dto.setExchangeRate(rate);
        dto.setRateDate(date.toString());

        return dto;
    }

    /**
     * Get historical exchange rates for a currency pair
     */
    public List<ExchangeRateDto> getHistoricalRates(String fromCurrency, String toCurrency,
                                                     LocalDate startDate, LocalDate endDate) {
        // For now, return empty list as historical data requires premium API
        // This can be enhanced later
        return List.of();
    }

    private CurrencyDto convertToDto(Currency currency) {
        CurrencyDto dto = new CurrencyDto();
        dto.setId(currency.getId());
        dto.setCode(currency.getCode());
        dto.setName(currency.getName());
        dto.setSymbol(currency.getSymbol());
        dto.setIsActive(currency.getIsActive());
        return dto;
    }

    private ExchangeRateDto convertToDto(ExchangeRate exchangeRate) {
        ExchangeRateDto dto = new ExchangeRateDto();
        dto.setId(exchangeRate.getId());
        dto.setFromCurrency(exchangeRate.getFromCurrency());
        dto.setToCurrency(exchangeRate.getToCurrency());
        dto.setRate(exchangeRate.getRate());
        dto.setRateDate(exchangeRate.getRateDate());
        dto.setSource(exchangeRate.getSource());
        return dto;
    }
}
