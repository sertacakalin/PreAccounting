package preaccountingsystem.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import preaccountingsystem.dto.CurrencyConversionDto;
import preaccountingsystem.dto.CurrencyDto;
import preaccountingsystem.service.CurrencyService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/currencies")
@RequiredArgsConstructor
public class CurrencyController {

    private final CurrencyService currencyService;

    /**
     * Get all active currencies
     */
    @GetMapping
    public ResponseEntity<List<CurrencyDto>> getAllActiveCurrencies() {
        return ResponseEntity.ok(currencyService.getAllActiveCurrencies());
    }

    /**
     * Get all currencies (including inactive) - Admin only
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CurrencyDto>> getAllCurrencies() {
        return ResponseEntity.ok(currencyService.getAllCurrencies());
    }

    /**
     * Create new currency - Admin only
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CurrencyDto> createCurrency(@RequestBody CurrencyDto currencyDto) {
        return ResponseEntity.ok(currencyService.createCurrency(currencyDto));
    }

    /**
     * Update currency status - Admin only
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CurrencyDto> updateCurrencyStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request) {
        Boolean isActive = request.get("isActive");
        return ResponseEntity.ok(currencyService.updateCurrencyStatus(id, isActive));
    }

    /**
     * Update exchange rates for a base currency - Admin only
     */
    @PostMapping("/rates/update/{baseCurrency}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateExchangeRates(@PathVariable String baseCurrency) {
        currencyService.updateExchangeRates(baseCurrency);
        return ResponseEntity.ok(Map.of("message", "Exchange rates updated for " + baseCurrency));
    }

    /**
     * Update all exchange rates - Admin only
     */
    @PostMapping("/rates/update-all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateAllExchangeRates() {
        currencyService.updateAllExchangeRates();
        return ResponseEntity.ok(Map.of("message", "All exchange rates updated"));
    }

    /**
     * Convert currency amount
     */
    @GetMapping("/convert")
    public ResponseEntity<CurrencyConversionDto> convertCurrency(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam BigDecimal amount,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(currencyService.convertCurrency(from, to, amount, date));
    }

    /**
     * Get exchange rate between two currencies
     */
    @GetMapping("/rate")
    public ResponseEntity<Map<String, Object>> getExchangeRate(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }
        BigDecimal rate = currencyService.getExchangeRate(from, to, date);
        return ResponseEntity.ok(Map.of(
                "fromCurrency", from,
                "toCurrency", to,
                "rate", rate,
                "date", date.toString()
        ));
    }
}
