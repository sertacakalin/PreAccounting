package preaccountingsystem.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import preaccountingsystem.service.CurrencyService;

@Component
@RequiredArgsConstructor
@Slf4j
public class CurrencyInitializer implements CommandLineRunner {

    private final CurrencyService currencyService;

    @Override
    public void run(String... args) {
        try {
            log.info("Initializing currency data...");
            currencyService.initializeDefaultCurrencies();
            log.info("Currency initialization completed");
        } catch (Exception e) {
            log.error("Error initializing currencies: {}", e.getMessage());
        }
    }
}
