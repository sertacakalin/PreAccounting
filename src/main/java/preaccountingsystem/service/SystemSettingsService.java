package preaccountingsystem.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import preaccountingsystem.dto.SystemSettingsDto;
import preaccountingsystem.dto.UpdateSystemSettingsRequest;
import preaccountingsystem.entity.SystemSettings;
import preaccountingsystem.exception.ResourceNotFoundException;
import preaccountingsystem.repository.SystemSettingsRepository;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SystemSettingsService {

    private final SystemSettingsRepository systemSettingsRepository;

    private static final Long SETTINGS_ID = 1L;

    @Transactional(readOnly = true)
    public SystemSettingsDto getSettings() {
        SystemSettings settings = systemSettingsRepository.findById(SETTINGS_ID)
                .orElseGet(this::createDefaultSettings);

        return convertToDto(settings);
    }

    @Transactional
    public SystemSettingsDto updateSettings(UpdateSystemSettingsRequest request) {
        SystemSettings settings = systemSettingsRepository.findById(SETTINGS_ID)
                .orElseGet(this::createDefaultSettings);

        // Update settings
        settings.setDefaultCurrency(request.getDefaultCurrency());
        settings.setVatRates(request.getVatRates());
        settings.setInvoiceNumberFormat(request.getInvoiceNumberFormat());
        settings.setAiDailyLimit(request.getAiDailyLimit());
        settings.setAiMonthlyLimit(request.getAiMonthlyLimit());

        SystemSettings updatedSettings = systemSettingsRepository.save(settings);
        return convertToDto(updatedSettings);
    }

    @Transactional
    public SystemSettings initializeDefaultSettings() {
        return systemSettingsRepository.findById(SETTINGS_ID)
                .orElseGet(this::createDefaultSettings);
    }

    private SystemSettings createDefaultSettings() {
        SystemSettings defaultSettings = SystemSettings.builder()
                .id(SETTINGS_ID)
                .defaultCurrency("USD")
                .vatRates(Arrays.asList(0, 1, 8, 18))
                .invoiceNumberFormat("INV-{YYYY}-{####}")
                .aiDailyLimit(100)
                .aiMonthlyLimit(3000)
                .build();

        return systemSettingsRepository.save(defaultSettings);
    }

    private SystemSettingsDto convertToDto(SystemSettings settings) {
        return SystemSettingsDto.builder()
                .defaultCurrency(settings.getDefaultCurrency())
                .vatRates(settings.getVatRates())
                .invoiceNumberFormat(settings.getInvoiceNumberFormat())
                .aiDailyLimit(settings.getAiDailyLimit())
                .aiMonthlyLimit(settings.getAiMonthlyLimit())
                .build();
    }
}
