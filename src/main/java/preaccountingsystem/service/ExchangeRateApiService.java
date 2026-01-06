package preaccountingsystem.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

/**
 * Service to fetch exchange rates from external API
 * Using ExchangeRate-API (https://www.exchangerate-api.com/)
 * Free tier: 1500 requests/month
 */
@Service
@Slf4j
public class ExchangeRateApiService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${currency.api.key:}")
    private String apiKey;

    @Value("${currency.api.base-url:https://v6.exchangerate-api.com/v6}")
    private String baseUrl;

    public ExchangeRateApiService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Fetch latest exchange rates for a base currency
     * @param baseCurrency ISO 4217 currency code (e.g., USD, EUR, TRY)
     * @return Map of currency codes to exchange rates
     */
    public Map<String, BigDecimal> fetchLatestRates(String baseCurrency) {
        try {
            String url;
            if (apiKey != null && !apiKey.isEmpty()) {
                // Use authenticated API with your key
                url = String.format("%s/%s/latest/%s", baseUrl, apiKey, baseCurrency);
            } else {
                // Fallback to free public API (limited features)
                url = String.format("https://api.exchangerate-api.com/v4/latest/%s", baseCurrency);
            }

            log.info("Fetching exchange rates for {} from API", baseCurrency);
            String response = restTemplate.getForObject(url, String.class);

            if (response == null) {
                log.error("Empty response from exchange rate API");
                return new HashMap<>();
            }

            JsonNode root = objectMapper.readTree(response);
            JsonNode ratesNode = root.path("rates");

            if (ratesNode.isMissingNode()) {
                ratesNode = root.path("conversion_rates");
            }

            if (ratesNode.isMissingNode()) {
                log.error("No rates found in API response");
                return new HashMap<>();
            }

            Map<String, BigDecimal> rates = new HashMap<>();
            ratesNode.fields().forEachRemaining(entry -> {
                String currency = entry.getKey();
                BigDecimal rate = new BigDecimal(entry.getValue().asText());
                rates.put(currency, rate);
            });

            log.info("Successfully fetched {} exchange rates for {}", rates.size(), baseCurrency);
            return rates;

        } catch (Exception e) {
            log.error("Error fetching exchange rates for {}: {}", baseCurrency, e.getMessage());
            return new HashMap<>();
        }
    }

    /**
     * Convert amount from one currency to another using live rates
     * @param amount Amount to convert
     * @param fromCurrency Source currency code
     * @param toCurrency Target currency code
     * @return Converted amount or null if conversion fails
     */
    public BigDecimal convert(BigDecimal amount, String fromCurrency, String toCurrency) {
        if (fromCurrency.equals(toCurrency)) {
            return amount;
        }

        try {
            Map<String, BigDecimal> rates = fetchLatestRates(fromCurrency);
            BigDecimal rate = rates.get(toCurrency);

            if (rate == null) {
                log.error("Exchange rate not found for {} to {}", fromCurrency, toCurrency);
                return null;
            }

            return amount.multiply(rate);
        } catch (Exception e) {
            log.error("Error converting {} {} to {}: {}", amount, fromCurrency, toCurrency, e.getMessage());
            return null;
        }
    }

    /**
     * Get specific exchange rate between two currencies
     * @param fromCurrency Source currency code
     * @param toCurrency Target currency code
     * @return Exchange rate or null if not found
     */
    public BigDecimal getExchangeRate(String fromCurrency, String toCurrency) {
        if (fromCurrency.equals(toCurrency)) {
            return BigDecimal.ONE;
        }

        try {
            String url;
            if (apiKey != null && !apiKey.isEmpty()) {
                url = String.format("%s/%s/pair/%s/%s", baseUrl, apiKey, fromCurrency, toCurrency);
                String response = restTemplate.getForObject(url, String.class);

                if (response != null) {
                    JsonNode root = objectMapper.readTree(response);
                    JsonNode rateNode = root.path("conversion_rate");

                    if (!rateNode.isMissingNode()) {
                        return new BigDecimal(rateNode.asText());
                    }
                }
            }

            Map<String, BigDecimal> rates = fetchLatestRates(fromCurrency);
            return rates.get(toCurrency);

        } catch (Exception e) {
            log.error("Error getting exchange rate from {} to {}: {}", fromCurrency, toCurrency, e.getMessage());
            return null;
        }
    }
}
